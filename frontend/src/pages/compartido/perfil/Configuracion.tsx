import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonModal,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { closeOutline, logOutOutline, lockClosedOutline } from 'ionicons/icons';
import CampoFormulario from '../../../components/CampoFormulario';
import RequisitosContrasena from '../../../components/RequisitosContrasena';
import { useCamposTocados } from '../../../hooks/useCamposTocados';
import { useSesion } from '../../../hooks/useSesion';
import { useMiActividad } from '../../../hooks/useMiActividad';
import { actualizarPerfil, cambiarContrasena } from '../../../services/authService';
import { NOMBRE_ROL, obtenerIniciales } from '../../../services/sesionService';
import { esContrasenaSegura, esCorreoValido } from '../../../utils/validaciones';
import './Configuracion.css';

interface ConfiguracionProps {
  onCerrarSesion: () => void;
}

const Configuracion: React.FC<ConfiguracionProps> = ({ onCerrarSesion }) => {
  const { usuario, iniciarSesion } = useSesion();
  const actividad = useMiActividad();
  const esVecino = usuario?.rol === 'vecino';

  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [email, setEmail] = useState(usuario?.correo ?? '');
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [guardandoPass, setGuardandoPass] = useState(false);

  const [toastMensaje, setToastMensaje] = useState<{ texto: string; color: 'success' | 'danger' } | null>(null);

  const { tocar, claseCampo, reiniciar } = useCamposTocados();

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre);
      setEmail(usuario.correo);
    }
  }, [usuario]);

  const errorNombre = !nombre.trim() ? 'El nombre no puede estar vacío.' : '';
  const errorEmail = !email.trim()
    ? 'El correo es obligatorio.'
    : !esCorreoValido(email)
      ? 'El formato de correo no es válido.'
      : '';

  const errorPassNueva = !esContrasenaSegura(passNueva)
    ? 'La contraseña no cumple los requisitos mínimos.'
    : '';
  const errorPassConfirm =
    !passConfirm || passConfirm !== passNueva ? 'Las contraseñas no coinciden.' : '';

  // Guardar y Descartar solo se activan si cambió algo
  const hayCambios =
    !!usuario && (nombre.trim() !== usuario.nombre || email.trim() !== usuario.correo);

  const handleDescartar = () => {
    if (usuario) {
      setNombre(usuario.nombre);
      setEmail(usuario.correo);
      setToastMensaje({ texto: 'Cambios descartados.', color: 'danger' });
    }
  };

  const handleAceptar = async () => {
    tocar('nombre', 'email');
    if (errorNombre || errorEmail || !usuario) return;

    setGuardandoPerfil(true);

    try {
      const actualizado = await actualizarPerfil({
        nombre: nombre.trim(),
        email: email.trim(),
      });

      iniciarSesion(actualizado);
      setNombre(actualizado.nombre);
      setEmail(actualizado.correo);
      setToastMensaje({ texto: 'Perfil actualizado con éxito.', color: 'success' });
    } catch (error) {
      setToastMensaje({
        texto: error instanceof Error ? error.message : 'No se pudo actualizar el perfil.',
        color: 'danger',
      });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleGuardarContrasena = async (evento: React.FormEvent) => {
    evento.preventDefault();
    tocar('passActual', 'passNueva', 'passConfirm');

    if (!passActual) {
      setToastMensaje({ texto: 'Ingresa tu contraseña actual.', color: 'danger' });
      return;
    }

    if (errorPassNueva || errorPassConfirm || !usuario) return;

    setGuardandoPass(true);
    try {
      await cambiarContrasena({
        passwordActual: passActual,
        passwordNueva: passNueva,
      });

      setModalPasswordOpen(false);
      setPassActual('');
      setPassNueva('');
      setPassConfirm('');
      reiniciar();
      setToastMensaje({ texto: 'Contraseña actualizada con éxito.', color: 'success' });
    } catch (error) {
      setToastMensaje({
        texto: error instanceof Error ? error.message : 'Error al cambiar la contraseña.',
        color: 'danger',
      });
    } finally {
      setGuardandoPass(false);
    }
  };

  return (
    <div className="perfil-layout">
      {/* Tarjeta de identidad: quién es y, si es vecino, su aporte */}
      <aside className="perfil-tarjeta" aria-label="Resumen de la cuenta">
        <div className="perfil-avatar" aria-hidden="true">
          {usuario ? obtenerIniciales(usuario.nombre) : 'V'}
        </div>
        <h2 className="perfil-nombre">{usuario?.nombre}</h2>
        {usuario && <span className="perfil-rol">{NOMBRE_ROL[usuario.rol]}</span>}

        <dl className="perfil-datos">
          <div>
            <dt>Correo</dt>
            <dd>{usuario?.correo}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{usuario?.telefono || 'Sin teléfono registrado'}</dd>
          </div>
        </dl>

        {esVecino && (
          <div className="perfil-aporte">
            <h3>Tu aporte</h3>
            <ul>
              <li>
                <strong>{actividad.reportesCreados}</strong>
                <span>Reportes creados</span>
              </li>
              <li>
                <strong>{actividad.votosDados}</strong>
                <span>Votos dados</span>
              </li>
              <li>
                <strong>{actividad.apoyosRecibidos}</strong>
                <span>Apoyos recibidos</span>
              </li>
            </ul>
          </div>
        )}
      </aside>

      <div className="perfil-secciones">
        <section className="perfil-seccion" aria-labelledby="perfil-datos-titulo">
          <h3 id="perfil-datos-titulo">Datos personales</h3>
          <div className="campo-grupo">
            <label className="campo-label" htmlFor="perfil-nombre">
              Nombre completo
            </label>
            <IonInput
              id="perfil-nombre"
              value={nombre}
              onIonInput={(e) => setNombre(e.detail.value ?? '')}
              onIonBlur={() => tocar('nombre')}
              className={`input-custom ${claseCampo('nombre', errorNombre)}`}
            />
            {errorNombre && <span className="mensaje-error">{errorNombre}</span>}
          </div>

          <div className="campo-grupo">
            <label className="campo-label" htmlFor="perfil-correo">
              Correo electrónico
            </label>
            <IonInput
              id="perfil-correo"
              type="email"
              value={email}
              onIonInput={(e) => setEmail(e.detail.value ?? '')}
              onIonBlur={() => tocar('email')}
              className={`input-custom ${claseCampo('email', errorEmail)}`}
            />
            {errorEmail && <span className="mensaje-error">{errorEmail}</span>}
          </div>

          <div className="configuracion-acciones">
            <IonButton
              className="btn-descartar"
              onClick={handleDescartar}
              disabled={guardandoPerfil || !hayCambios}
            >
              Descartar cambios
            </IonButton>
            <IonButton
              className="btn-aceptar"
              onClick={handleAceptar}
              disabled={guardandoPerfil || !hayCambios}
            >
              {guardandoPerfil ? <IonSpinner name="crescent" /> : 'Guardar cambios'}
            </IonButton>
          </div>
        </section>

        <section className="perfil-seccion perfil-seccion-fila" aria-labelledby="perfil-seguridad-titulo">
          <div>
            <h3 id="perfil-seguridad-titulo">Seguridad</h3>
            <p>Cambia tu contraseña cuando quieras. Te pediremos la actual para confirmar.</p>
          </div>
          <IonButton className="btn-cambiar-pass" onClick={() => setModalPasswordOpen(true)}>
            <IonIcon slot="start" icon={lockClosedOutline} aria-hidden="true" />
            Cambiar contraseña
          </IonButton>
        </section>

        <section className="perfil-seccion perfil-seccion-fila" aria-labelledby="perfil-sesion-titulo">
          <div>
            <h3 id="perfil-sesion-titulo">Sesión</h3>
            <p>Cierra la sesión en este dispositivo.</p>
          </div>
          <IonButton className="btn-cerrar-sesion" onClick={onCerrarSesion}>
            <IonIcon slot="start" icon={logOutOutline} aria-hidden="true" />
            Cerrar sesión
          </IonButton>
        </section>
      </div>

      {/* Modal para Cambiar Contraseña */}
      <IonModal
        isOpen={modalPasswordOpen}
        onDidDismiss={() => {
          setModalPasswordOpen(false);
          setPassActual('');
          setPassNueva('');
          setPassConfirm('');
          reiniciar();
        }}
        className="modal-filtros modal-contrasena"
      >
        <IonContent className="filtros-contenido">
          <div className="filtros-marco">
            <div className="filtros-encabezado">
              <h2>Cambiar contraseña</h2>
              <IonButton
                fill="clear"
                className="filtros-cerrar"
                onClick={() => setModalPasswordOpen(false)}
                aria-label="Cerrar modal"
              >
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
            </div>

            <form onSubmit={handleGuardarContrasena} noValidate className="auth-panel">
              <CampoFormulario
                etiqueta="Contraseña actual"
                obligatorio
                type="password"
                placeholder="Ingresa tu contraseña actual"
                value={passActual}
                onIonInput={(e) => setPassActual(e.detail.value ?? '')}
              >
                <IonInputPasswordToggle slot="end" color="medium" />
              </CampoFormulario>

              <CampoFormulario
                etiqueta="Nueva contraseña"
                obligatorio
                type="password"
                placeholder="Crea tu nueva contraseña"
                errorText={errorPassNueva}
                value={passNueva}
                className={claseCampo('passNueva', errorPassNueva)}
                onIonInput={(e) => setPassNueva(e.detail.value ?? '')}
                onIonBlur={() => tocar('passNueva')}
              >
                <IonInputPasswordToggle slot="end" color="medium" />
              </CampoFormulario>
              <RequisitosContrasena contrasena={passNueva} />

              <CampoFormulario
                etiqueta="Confirmar nueva contraseña"
                obligatorio
                type="password"
                placeholder="Repite la nueva contraseña"
                errorText={errorPassConfirm}
                value={passConfirm}
                className={claseCampo('passConfirm', errorPassConfirm)}
                onIonInput={(e) => setPassConfirm(e.detail.value ?? '')}
                onIonBlur={() => tocar('passConfirm')}
              >
                <IonInputPasswordToggle slot="end" color="medium" />
              </CampoFormulario>

              <IonButton
                type="submit"
                expand="block"
                className="btn-principal"
                disabled={guardandoPass}
              >
                {guardandoPass ? <IonSpinner name="crescent" /> : 'Actualizar contraseña'}
              </IonButton>
            </form>
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={!!toastMensaje}
        message={toastMensaje?.texto}
        duration={2500}
        color={toastMensaje?.color}
        position="top"
        onDidDismiss={() => setToastMensaje(null)}
      />
    </div>
  );
};

export default Configuracion;
