const { obtenerColaDeReportes, procesarRevision, registrarControl, listarControlesDeRevision } = require('../services/revisionService');

const getColaReportes = async (req, res, next) => {
    try {
        const reportes = await obtenerColaDeReportes();
        res.status(200).json({
            ok: true,
            data: reportes,
        });
    } catch (error) {
        next(error);
    }
};

const postRevisionReporte = async (req, res, next) => {
    try {
        const idReporte = Number(req.params.id);
        if (!Number.isInteger(idReporte)) {
            const error = new Error('El número de reporte no es válido');
            error.estado = 400;
            throw error;
        }

        const idFuncionario = req.usuario.id;
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
    } catch (error) {
        next(error);
    }
};

// Registra el control de una revisión (RF-16). Las fotos llegan por multipart
// en req.files porque el middleware de subida las dejó en uploads/controles.
const putRevisionControl = async (req, res, next) => {
    try {
        const idRevision = Number(req.params.id);
        if (!Number.isInteger(idRevision)) {
            const error = new Error('El número de revisión no es válido');
            error.estado = 400;
            throw error;
        }

        const { detalle, descripcion, fechaControl } = req.body;

        const resultado = await registrarControl({
            idRevision,
            idFuncionario: req.usuario.id,
            detalle,
            descripcion,
            fechaControl,
            fotos: req.files ?? [],
        });

        res.status(201).json({
            ok: true,
            mensaje: 'Control registrado correctamente.',
            data: resultado,
        });
    } catch (error) {
        next(error);
    }
};

// Lista los controles registrados en una revisión, con sus fotos de evidencia.
const getControlesDeRevision = async (req, res, next) => {
    try {
        const idRevision = Number(req.params.id);
        if (!Number.isInteger(idRevision)) {
            const error = new Error('El número de revisión no es válido');
            error.estado = 400;
            throw error;
        }

        const controles = await listarControlesDeRevision(idRevision);

        res.json({
            ok: true,
            data: { controles },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getColaReportes, postRevisionReporte, putRevisionControl, getControlesDeRevision };