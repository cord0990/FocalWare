// Controllers de revisión (versión TypeScript).
//
// IMPORTANTE: este archivo no se ejecuta en runtime. El servidor carga el
// .js de la misma carpeta (revisionController.js) porque app.js es CommonJS y
// require() resuelve primero el .js. Este .ts solo se compila y se typechequea
// con tsc.
//
// Para que no quede una copia desactualizada que aparente lo contrario, este
// archivo se mantiene en paralelo con el .js: cualquier cambio en la lógica
// debe replicarse en ambos.
import { Request, Response, NextFunction } from 'express';
import {
  obtenerColaDeReportes,
  procesarRevision,
  registrarControl,
  listarControlesDeRevision,
} from '../services/revisionService.js';

// Lanza un error con el código HTTP que maneja manejoErrores.js centralmente.
const httpError = (estado: number, mensaje: string) => {
  const error: any = new Error(mensaje);
  error.estado = estado;
  return error;
};

export const getColaReportes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportes = await obtenerColaDeReportes();
    res.status(200).json({
      ok: true,
      data: reportes,
    });
  } catch (error: any) {
    next(error);
  }
};

export const postRevisionReporte = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReporte = Number(req.params.id);
    if (!Number.isInteger(idReporte)) {
      throw httpError(400, 'El número de reporte no es válido');
    }

    // El id del funcionario proviene del token decodificado por el middleware
    const idFuncionario = (req as any).usuario.id;

    const { estado, motivo, ...otrosDatos } = req.body;

    const nuevaRevision = await procesarRevision({
      idReporte,
      idFuncionario,
      estado,
      motivo,
      ...otrosDatos,
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Revisión guardada correctamente.',
      data: nuevaRevision,
    });
  } catch (error: any) {
    next(error);
  }
};

// Registra el control de una revisión (RF-16). Las fotos llegan por multipart
// en req.files porque el middleware de subida las dejó en uploads/controles.
export const putRevisionControl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idRevision = Number(req.params.id);
    if (!Number.isInteger(idRevision)) {
      throw httpError(400, 'El número de revisión no es válido');
    }

    const { detalle, descripcion, fechaControl } = req.body;

    const resultado = await registrarControl({
      idRevision,
      idFuncionario: (req as any).usuario.id,
      detalle,
      descripcion,
      fechaControl,
      fotos: (req as any).files ?? [],
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Control registrado correctamente.',
      data: resultado,
    });
  } catch (error: any) {
    next(error);
  }
};

// Lista los controles registrados en una revisión, con sus fotos de evidencia.
export const getControlesDeRevision = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idRevision = Number(req.params.id);
    if (!Number.isInteger(idRevision)) {
      throw httpError(400, 'El número de revisión no es válido');
    }

    const controles = await listarControlesDeRevision(idRevision);

    res.json({
      ok: true,
      data: { controles },
    });
  } catch (error: any) {
    next(error);
  }
};