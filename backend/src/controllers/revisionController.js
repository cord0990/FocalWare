import { obtenerColaDeReportes } from '../services/revisionService.js';
import { procesarRevision } from '../services/revisionService.js';
export const getColaReportes = async (req, res, next) => {
    try {
        // Llamamos al servicio que obtiene la cola de reportes pendientes de revisión
        const reportes = await obtenerColaDeReportes();
        res.status(200).json({
            ok: true,
            data: reportes,
        });
    }
    catch (error) {
        next(error);
    }
};
/*
========================================================================
LO QUE ENVIARÍA EL SERVIDOR (BACKEND) EN CASO DE ERROR (Ej: Cola vacía):
- Status: 404 (Not Found) o 400 (Bad Request)
========================================================================
*/
/* =========================================================================
* DATOS QUE DEBE ENVIAR EL USUARIO (FRONTEND -> BACKEND)
*
* PARÁMETROS EN LA URL (Params):
* - id: El ID del reporte que se está revisando (ej: /api/reportes/3/revision)
*
* CUERPO DE LA PETICIÓN (Body JSON):
* {
*   "estado": "Aceptado" | "Rechazado", // (Obligatorio) El veredicto del funcionario
*   "motivo": "La foto está muy borrosa", // (Obligatorio SOLO SI estado es 'Rechazado')
*   "idCuadrilla": 5,                     // (Ejemplo) Si en la imagen se asigna a alguien
*   "prioridad": "Alta"                   // (Ejemplo) Si el funcionario define la prioridad
* }
*
* HEADERS:
* - Authorization: Bearer <token> (Necesario para que req.usuario exista)
* =========================================================================
*
* DATOS QUE DEBE ENVIAR EL BACKEND (BACKEND -> FRONTEND)
*
* CASO DE ÉXITO (Status 201):
* {
*   "ok": true,
*   "mensaje": "Revisión guardada correctamente.",
*   "data": { ... objeto de la revisión recién creada en Prisma ... }
* }
*
* CASO DE ERROR DE VALIDACIÓN O REGLA DE NEGOCIO (Status 400 u otro):
* {
*   "ok": false,
*   "error": "Si se rechaza el reporte, es obligatorio especificar un motivo."
* }
* ========================================================================= */
export const postRevisionReporte = async (req, res, next) => {
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
        // Respuesta exitosa al frontend
        res.status(201).json({
            ok: true,
            mensaje: 'Revisión guardada correctamente.',
            data: nuevaRevision
        });
    }
    catch (error) {
        // Si lanzamos un error en el servicio, tu middleware central lo atrapará aquí
        // Para que muestre tu texto personalizado y no un genérico "Error interno", 
        // puedes mandarle el status 400 directo si es un error controlado:
        //LO VOY A CAMBIAR DIRECTO AL MIDDLEWARE DESPUES NO :C
        if (error.message.includes('obligatorio')) {
            return res.status(400).json({ ok: false, error: error.message });
        }
        next(error);
    }
};
