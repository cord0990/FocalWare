// Revisa que el funcionario de la sesión pertenezca a la cuadrilla que lleva
// la revisión. Solo se usa en las rutas de gestión municipal, después de
// verificarToken y permitirRoles('funcionario').
const { prisma } = require('../../dist/db/index.js');

// La revisión debe ser un número entero antes de buscar nada en la base.
const idRevisionDeLaPeticion = (req) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) ? id : null;
};

// QUÉ HACE ESTE MIDDLEWARE
//
// Es el filtro que separa al funcionario correcto del equivocado en la gestión
// municipal. verificarToken solo comprueba que haya sesión y permitirRoles solo
// que el rol sea 'funcionario': con los dos, cualquier funcionario podría
// registrar el control de un reporte asignado a otra cuadrilla, y el control
// es la evidencia de que un trabajo se hizo, así que no puede aceptarlo alguien
// que no tenía el trabajo.
//
// Se usa después de esos dos, y antes de multer, para que un funcionario ajeno no
//logue ni siquiera subir las fotos.
//
// El chequeo son dos consultas:
//   1. La revisión, para saber a qué cuadrilla pertenece.
//   2. La tabla puede_pertenecer, que es la relación entre funcionario y
//      cuadrilla. Se busca por la clave compuesta idFuncionario_idCuadrilla, así
//      que es un solo findUnique que ya devuelve el registro si la combinación
//      existe. No hace falta cargar al funcionario entero.
//
// Códigos que devuelve:
//   400  el id de la URL no es un número entero
//   404  no existe una revisión con ese id
//   409  la revisión existe pero todavía no tiene cuadrilla asignada
//   403  el funcionario no pertenece a la cuadrilla de esa revisión
//
// Si pasa todo, llama a next() y la petición sigue hacia el controller.
//
// Uso en las rutas:
//   router.put('/:id', verificarToken, permitirRoles('funcionario'),
//     perteneceACuadrilla, subirFotosControl, revisionController.putRevisionControl);
//
// Nota: la regla de negocio vive en dos capas. Este middleware dice QUIÉN puede
// actuar sobre la revisión; el service dice QUÉ se guarda. Si en algún momento
// se centraliza, debe subirse al service, porque este middleware no tiene forma
// de saber si la operación es un control o un simple cambio de estado.
const perteneceACuadrilla = async (req, res, next) => {
  try {
    const idRevision = idRevisionDeLaPeticion(req);

    if (idRevision === null) {
      return res.status(400).json({ ok: false, error: 'El número de revisión no es válido' });
    }

    const revision = await prisma.revision.findUnique({
      where: { idRevision },
      select: { idCuadrilla: true },
    });

    if (!revision) {
      return res.status(404).json({ ok: false, error: 'La revisión no existe' });
    }

    // Sin cuadrilla no hay nada que comprobar: la revisión todavía no fue
    // asignada a ninguna cuadrilla, así que no se puede cerrar un trabajo.
    if (revision.idCuadrilla === null) {
      return res.status(409).json({
        ok: false,
        error: 'La revisión no tiene cuadrilla asignada',
      });
    }

    const pertenencia = await prisma.puedePertenecer.findUnique({
      where: {
        idFuncionario_idCuadrilla: {
          idFuncionario: req.usuario.id,
          idCuadrilla: revision.idCuadrilla,
        },
      },
      select: { idFuncionario: true },
    });

    if (!pertenencia) {
      return res.status(403).json({
        ok: false,
        error: 'No perteneces a la cuadrilla de esta revisión',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { perteneceACuadrilla };