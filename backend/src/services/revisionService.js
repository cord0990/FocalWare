// Lógica de revisiones (versión CommonJS para el runtime de Express).
const { prisma } = require('../../dist/db/index.js');

const obtenerColaDeReportes = async () => {
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

const ESTADOS_VALIDOS = ['Aprobado', 'Rechazado', 'En atención', 'Controlado'];

const procesarRevision = async (datos) => {
    // El estado llega del cuerpo y puede venir con espacios o en otro tipo de dato.
    // Se normaliza a texto y se recorta antes de comparar, así un " Aprobado "
    // no se rechaza con un error que no explica la causa real.
    const estado = typeof datos.estado === 'string' ? datos.estado.trim() : '';

    if (!estado) {
        const error = new Error('El estado de la revisión es obligatorio');
        error.estado = 400;
        throw error;
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
        const error = new Error('El estado de la revisión no es válido');
        error.estado = 400;
        throw error;
    }

    const reporte = await prisma.reporte.findUnique({
        where: { idReporte: datos.idReporte },
    });

    if (!reporte) {
        const error = new Error('El reporte a revisar no existe');
        error.estado = 404;
        throw error;
    }

    if (reporte.idRevision !== null) {
        const error = new Error('El reporte existe y ya ha sido revisado');
        error.estado = 409;
        throw error;
    }

    if (estado === 'Rechazado' && (!datos.motivo || String(datos.motivo).trim() === '')) {
        const error = new Error('Si se rechaza el reporte, es obligatorio especificar un motivo.');
        error.estado = 400;
        throw error;
    }

    // Acepta el id de la cuadrilla o su nombre (lo busca en la base).
    // El id se valida antes de tocar la base: un id con otro tipo de dato o un
    // número que no corresponde a ninguna cuadrilla es un 400, no un 500 por
    // error de Prisma.
    let idCuadrilla = null;

    if (datos.idCuadrilla !== undefined && datos.idCuadrilla !== null) {
        const posibleId = Number(datos.idCuadrilla);

        if (!Number.isInteger(posibleId)) {
            const error = new Error('El número de cuadrilla no es válido');
            error.estado = 400;
            throw error;
        }

        const cuadrilla = await prisma.cuadrilla.findUnique({ where: { idCuadrilla: posibleId } });
        if (!cuadrilla) {
            const error = new Error('La cuadrilla indicada no existe');
            error.estado = 400;
            throw error;
        }

        idCuadrilla = cuadrilla.idCuadrilla;
    } else if (datos.cuadrilla) {
        const nombreCuadrilla = String(datos.cuadrilla).trim();
        const cuadrilla = await prisma.cuadrilla.findUnique({ where: { nombre: nombreCuadrilla } });
        if (!cuadrilla) {
            const error = new Error('La cuadrilla indicada no existe');
            error.estado = 400;
            throw error;
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
            : (detalle !== null && detalle !== undefined ? String(detalle).trim() : null);

    const fechaAtencion = datos.fechaAtencion ? new Date(datos.fechaAtencion) : undefined;
    if (fechaAtencion && Number.isNaN(fechaAtencion.getTime())) {
        const error = new Error('La fecha de atención no es válida');
        error.estado = 400;
        throw error;
    }

    const resultado = await prisma.$transaction(async (tx) => {
        const revision = await tx.revision.create({
            data: {
                estado,
                descripcion,
                idFuncionario: datos.idFuncionario,
                idCuadrilla,
                ...(fechaAtencion && { fechaAtencion }),
            }
        });

        await tx.reporte.update({
            where: { idReporte: datos.idReporte },
            data: {
                idRevision: revision.idRevision,
            }
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

    return resultado;
};

// Estados desde los que se puede cerrar el trabajo con un reporte de control.
const ESTADOS_CONTROLABLES = ['Aprobado', 'En atención'];

const MINIMO_IMAGENES_CONTROL = 1;

// Registra el control de una revisión (RF-16): la pasa a "Controlado" y guarda
// el reporte de control con sus fotos de evidencia.
// El middleware perteneceACuadrilla ya revisó que el funcionario es parte de
// la cuadrilla, así que acá solo falta la lógica y las reglas del dato.
const registrarControl = async (datos) => {
    const revision = await prisma.revision.findUnique({
        where: { idRevision: datos.idRevision },
        include: { reportes: true },
    });

    if (!revision) {
        const error = new Error('La revisión no existe');
        error.estado = 404;
        throw error;
    }

    if (!ESTADOS_CONTROLABLES.includes(revision.estado)) {
        const error = new Error('Solo se puede controlar una revisión aprobada o en atención');
        error.estado = 409;
        throw error;
    }

    if (revision.idCuadrilla === null) {
        const error = new Error('La revisión no tiene cuadrilla asignada');
        error.estado = 409;
        throw error;
    }

    // La evidencia es obligatoria: un control sin fotos no demuestra nada.
    const fotos = datos.fotos ?? [];
    if (fotos.length < MINIMO_IMAGENES_CONTROL) {
        const error = new Error('El control necesita al menos una foto de evidencia');
        error.estado = 400;
        throw error;
    }

    const detalle = datos.detalle ?? datos.descripcion ?? null;
    const descripcion =
        detalle !== null && detalle !== undefined ? String(detalle).trim() : null;

    // Se guardan los nombres que dejó multer, con la carpeta controles delante.
    const rutas = fotos.map((foto) => `controles/${foto.filename}`);

    const resultado = await prisma.$transaction(async (tx) => {
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

    return resultado;
};

// Lista los controles de una revisión, del más reciente al más antiguo.
// Cada control viene con sus fotos para que la pantalla pueda mostrar la
// evidencia del cierre.
const listarControlesDeRevision = async (idRevision) => {
    const revision = await prisma.revision.findUnique({
        where: { idRevision },
        select: { idRevision: true },
    });

    if (!revision) {
        const error = new Error('La revisión no existe');
        error.estado = 404;
        throw error;
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

module.exports = { obtenerColaDeReportes, procesarRevision, registrarControl, listarControlesDeRevision };