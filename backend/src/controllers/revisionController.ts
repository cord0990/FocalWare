import { Request, Response, NextFunction } from 'express';
import { obtenerColaDeReportes } from '../services/revisionService.js';
import { procesarRevision } from '../services/revisionService.js';

export const getColaReportes = async (req: Request, res: Response, next: NextFunction) => {   
  try {
    // Llamamos al servicio que obtiene la cola de reportes pendientes de revisión
    const reportes = await obtenerColaDeReportes();

    res.status(200).json({
      ok: true,
      data: reportes,
    });

  } catch (error: any) {
        next(error); 
  }
}

export const postRevisionReporte = async (req: any, res: any, next: any) => {
    const idFuncionario = 1; // Hardcodeamos un ID para testear, DESPUÉS QUITARLO CUANDO AVERIGUA COMO OBTENER EL TOKEN
    try {
        const idReporte = parseInt(req.params.id);
        const { estado, motivo, ...otrosDatos } = req.body;
        
        // Asumo que el middleware de autenticación previo ya decodificó el token 
        // y guardó los datos del funcionario aquí
    //const idFuncionario = req.usuario.id;  <--- CUANDO VALIDE EL TOKEN, DESCOMENTAR ESTA LÍNEA Y QUITAR LA DE ARRIBA
        
        // Llamamos al servicio pasando toda la información
        const nuevaRevision = await procesarRevision({
            idReporte,
            idFuncionario,
            estado,
            motivo,
            ...otrosDatos
        });
        //DEBO PONER QUE PASA SI EL REPORTE EXISTE Y YA A SIDO REVISADO, PARA QUE NO SE VEA EL ERROR INTERNO, SINO EL MENSAJE PERSONALIZADO
        //DEBO PONER QUE PASA SI EL REPORTE A REVISAR NO EXISTE, PARA QUE NO SE VEA EL ERROR INTERNO, SINO EL MENSAJE PERSONALIZADO
        //DEBO PONER LO DEL MIDDLEWARE DE ERRORES PARA QUE NO SE VEA EL ERROR INTERNO, SINO EL MENSAJE PERSONALIZADO
        // Respuesta exitosa al frontend
        res.status(201).json({
            ok: true,
            mensaje: 'Revisión guardada correctamente.',
            data: nuevaRevision
        });

    } catch (error: any) {
        // Si lanzamos un error en el servicio, tu middleware central lo atrapará aquí
        // Para que muestre tu texto personalizado y no un genérico "Error interno", 
        // puedes mandarle el status 400 directo si es un error controlado:
        //LO VOY A CAMBIAR DIRECTO AL MIDDLEWARE DESPUES AAAAAA
        if (error.message.includes('obligatorio')) {
            return res.status(400).json({ ok: false, error: error.message });
        }
        next(error);
        }
};

