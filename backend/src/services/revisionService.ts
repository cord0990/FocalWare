// Lógica de revisiones (versión TypeScript).
//
// IMPORTANTE: este archivo no se ejecuta en runtime. El servidor carga el
// .js de la misma carpeta (revisionService.js) porque app.js es CommonJS y
// require() resuelve primero el .js. Este .ts solo se compila y se typechequea
// con tsc.
//
// Para que no quede una copia desactualizada que aparente lo contrario, este
// archivo se mantiene en paralelo con el .js: cualquier cambio en la lógica
// debe replicarse en ambos.
import prisma from '../db/cliente.js';

export const obtenerColaDeReportes = async () => {
  const reportesPendientes = await prisma.reporte.findMany({
    where: {
      idRevision: null,
    },
    orderBy: {
      indiceRiesgo: 'desc',
    },
  });
  return reportesPendientes;
};

interface DatosNuevaRevision {
  idReporte: number;
  idFuncionario: number;
  estado: string;
  motivo?: string;
  idCuadrilla?: number | null;
  cuadrilla?: string;
  detalle?: string;
  descripcion?: string;
  fechaAtencion?: string;
  [key: string]: any;
}

// Lanza un error con el código HTTP que maneja manejoErrores.js centralmente.
const httpError = (estado: number, mensaje: string) => {
  const error: any = new Error(mensaje);
  error.estado = estado;
  return error;
};

const ESTADOS_VALIDOS = ['Aprobado', 'Rechazado', 'En atención', 'Controlado'];

export const procesarRevision = async (datos: DatosNuevaRevision) => {
  // El estado llega del cuerpo y puede venir con espacios o en otro tipo de dato.
  // Se normaliza a texto y se recorta antes de comparar, así un " Aprobado "
  // no se rechaza con un error que no explica la causa real.
  const estado = typeof datos.estado === 'string' ? datos.estado.trim() : '';

  if (!estado) {
    throw httpError(400, 'El estado de la revisión es obligatorio');
  }
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw httpError(400, 'El estado de la revisión no es válido');
  }

  const reporte = await prisma.reporte.findUnique({
    where: { idReporte: datos.idReporte },
  });

  if (!reporte) {
    throw httpError(404, 'El reporte a revisar no existe');
  }

  if (reporte.idRevision !== null) {
    throw httpError(409, 'El reporte existe y ya ha sido revisado');
  }

  if (estado === 'Rechazado' && (!datos.motivo || String(datos.motivo).trim() === '')) {
    throw httpError(400, 'Si se rechaza el reporte, es obligatorio especificar un motivo.');
  }

  // Acepta el id de la cuadrilla o su nombre (lo busca en la base).
  // El id se valida antes de tocar la base: un id con otro tipo de dato o un
  // número que no corresponde a ninguna cuadrilla es un 400, no un 500 por
  // error de Prisma.
  let idCuadrilla: number | null = null;

  if (datos.idCuadrilla !== undefined && datos.idCuadrilla !== null) {
    const posibleId = Number(datos.idCuadrilla);

    if (!Number.isInteger(posibleId)) {
      throw httpError(400, 'El número de cuadrilla no es válido');
    }

    const cuadrilla = await prisma.cuadrilla.findUnique({ where: { idCuadrilla: posibleId } });
    if (!cuadrilla) {
      throw httpError(400, 'La cuadrilla indicada no existe');
    }

    idCuadrilla = cuadrilla.idCuadrilla;
  } else if (datos.cuadrilla) {
    const nombreCuadrilla = String(datos.cuadrilla).trim();
    const cuadrilla = await prisma.cuadrilla.findUnique({ where: { nombre: nombreCuadrilla } });
    if (!cuadrilla) {
      throw httpError(400, 'La cuadrilla indicada no existe');
    }
    idCuadrilla = cuadrilla.idCuadrilla;
  }

  // La descripción guarda el motivo del rechazo o el detalle de la aprobación.
  // Se recorta en los dos casos: el texto con espacios sobrantes llega al
  // vecino en la notificación y en el seguimiento del reporte.
  const detalle = datos.detalle ?? datos.descripcion ?? null;
  const descripcion =
    estado === 'Rechazado'
      ? String(datos.motivo).trim()
      : detalle !== null && detalle !== undefined
        ? String(detalle).trim()
        : null;

  const fechaAtencion = datos.fechaAtencion ? new Date(datos.fechaAtencion) : undefined;
  if (fechaAtencion && Number.isNaN(fechaAtencion.getTime())) {
    throw httpError(400, 'La fecha de atención no es válida');
  }

  return prisma.$transaction(async (tx) => {
    const revision = await tx.revision.create({
      data: {
        estado,
        descripcion,
        idFuncionario: datos.idFuncionario,
        idCuadrilla,
        ...(fechaAtencion && { fechaAtencion }),
      },
    });

    await tx.reporte.update({
      where: { idReporte: datos.idReporte },
      data: {
        idRevision: revision.idRevision,
      },
    });

    await tx.log.create({
      data: {
        estadoLog: estado,
        comentario: descripcion,
        idFuncionario: datos.idFuncionario,
        idRevision: revision.idRevision,
      },
    });

    await tx.notificacion.create({
      data: {
        mensaje: `Tu reporte fue ${estado.toLowerCase()}.`,
        tipo: estado,
        idVecino: reporte.idVecino,
        idRevision: revision.idRevision,
      },
    });

    return revision;
  });
};

// Estados desde los que se puede cerrar el trabajo con un reporte de control.
const ESTADOS_CONTROLABLES = ['Aprobado', 'En atención'];

const MINIMO_IMAGENES_CONTROL = 1;

interface ArchivoSubido {
  filename: string;
}

interface DatosControl {
  idRevision: number;
  idFuncionario: number;
  detalle?: string;
  descripcion?: string;
  fechaControl?: string;
  fotos?: ArchivoSubido[];
}

// Registra el control de una revisión (RF-16): la pasa a "Controlado" y guarda
// el reporte de control con sus fotos de evidencia.
// El middleware perteneceACuadrilla ya revisó que el funcionario es parte de
// la cuadrilla, así que acá solo falta la lógica y las reglas del dato.
export const registrarControl = async (datos: DatosControl) => {
  const revision = await prisma.revision.findUnique({
    where: { idRevision: datos.idRevision },
    include: { reportes: true },
  });

  if (!revision) {
    throw httpError(404, 'La revisión no existe');
  }

  if (!ESTADOS_CONTROLABLES.includes(revision.estado)) {
    throw httpError(409, 'Solo se puede controlar una revisión aprobada o en atención');
  }

  if (revision.idCuadrilla === null) {
    throw httpError(409, 'La revisión no tiene cuadrilla asignada');
  }

  // La evidencia es obligatoria: un control sin fotos no demuestra nada.
  const fotos = datos.fotos ?? [];
  if (fotos.length < MINIMO_IMAGENES_CONTROL) {
    throw httpError(400, 'El control necesita al menos una foto de evidencia');
  }

  const detalle = datos.detalle ?? datos.descripcion ?? null;
  const descripcion =
    detalle !== null && detalle !== undefined ? String(detalle).trim() : null;

  // Se guardan los nombres que dejó multer, con la carpeta controles delante.
  const rutas = fotos.map((foto) => `controles/${foto.filename}`);

  return prisma.$transaction(async (tx) => {
    const control = await tx.reporteControl.create({
      data: {
        descripcion,
        idFuncionario: datos.idFuncionario,
        idRevision: revision.idRevision,
        ...(datos.fechaControl && { fechaControl: datos.fechaControl }),
      },
    });

    for (const ruta of rutas) {
      await tx.imagenControl.create({
        data: {
          rutaDirectorio: ruta,
          idReporteControl: control.idReporteControl,
        },
      });
    }

    const revisionActualizada = await tx.revision.update({
      where: { idRevision: revision.idRevision },
      data: { estado: 'Controlado' },
    });

    await tx.log.create({
      data: {
        estadoLog: 'Controlado',
        comentario: descripcion,
        idFuncionario: datos.idFuncionario,
        idRevision: revision.idRevision,
      },
    });

    // El vecino ve el cierre del trabajo en su bandeja.
    for (const reporte of revision.reportes) {
      await tx.notificacion.create({
        data: {
          mensaje: 'Tu reporte fue controlado: la cuadrilla terminó el trabajo.',
          tipo: 'Controlado',
          idVecino: reporte.idVecino,
          idRevision: revision.idRevision,
        },
      });
    }

    return { control: { ...control, imagenes: rutas }, revision: revisionActualizada };
  });
};

export interface ControlListado {
  id: string;
  idRevision: string;
  detalle: string;
  fechaControl: string;
  funcionario: string;
  idFuncionario: string | null;
  cuadrilla: string;
  imagenes: string[];
}

// Lista los controles de una revisión, del más reciente al más antiguo.
// Cada control viene con sus fotos para que la pantalla pueda mostrar la
// evidencia del cierre.
export const listarControlesDeRevision = async (idRevision: number): Promise<ControlListado[]> => {
  const revision = await prisma.revision.findUnique({
    where: { idRevision },
    select: { idRevision: true },
  });

  if (!revision) {
    throw httpError(404, 'La revisión no existe');
  }

  const controles = await prisma.reporteControl.findMany({
    where: { idRevision },
    include: {
      imagenes: { orderBy: { idImagenControl: 'asc' } },
      funcionario: { select: { idFuncionario: true, nombre: true } },
      // La cuadrilla vive en la revisión: reporte_control no la tiene.
      revision: { select: { cuadrilla: { select: { idCuadrilla: true, nombre: true } } } },
    },
    orderBy: { fechaControl: 'desc' },
  });

  return controles.map((control) => ({
    id: String(control.idReporteControl),
    idRevision: String(control.idRevision),
    detalle: control.descripcion ?? '',
    fechaControl: control.fechaControl?.toISOString() ?? '',
    funcionario: control.funcionario?.nombre ?? '',
    idFuncionario: control.funcionario ? String(control.funcionario.idFuncionario) : null,
    cuadrilla: control.revision?.cuadrilla?.nombre ?? '',
    imagenes: control.imagenes.map((imagen) => imagen.rutaDirectorio),
  }));
};