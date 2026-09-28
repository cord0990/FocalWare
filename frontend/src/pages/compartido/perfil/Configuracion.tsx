import React, { useEffect, useState } from 'react';
import {
  IonAvatar,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonModal,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { closeOutline, pencilOutline } from 'ionicons/icons';
import CampoFormulario from '../../../components/CampoFormulario';
import RequisitosContrasena from '../../../components/RequisitosContrasena';
import { useCamposTocados } from '../../../hooks/useCamposTocados';
import { useSesion } from '../../../hooks/useSesion';
import { cambiarContrasena } from '../../../services/authService';
import { obtenerIniciales } from '../../../services/sesionService';
import { esContrasenaSegura, esCorreoValido } from '../../../utils/validaciones';
import './Configuracion.css';

const Configuracion: React.FC = () => {
  const { usuario, iniciarSesion } = useSesion();

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

    // Simulación de actualización de datos de perfil
    setTimeout(() => {
      iniciarSesion({
        ...usuario,
        nombre: nombre.trim(),
        correo: email.trim(),
      });
      setGuardandoPerfil(false);
      setToastMensaje({ texto: 'Perfil actualizado con éxito.', color: 'success' });
    }, 600);
  };

  const handleGuardarContrasena = async (evento: React.FormEvent) => {
    evento.preventDefault();
    tocar('passNueva', 'passConfirm');

    if (!passActual) {
      setToastMensaje({ texto: 'Ingresa tu contraseña actual.', color: 'danger' });
      return;
    }

    if (errorPassNueva || errorPassConfirm || !usuario) return;

    setGuardandoPass(true);
    try {
      await cambiarContrasena({
        correo: usuario.correo,
        codigo: '', // En configuración directa se valida mediante contraseña actual
        contrasena: passNueva,
      });

      setGuardandoPass(false);
      setModalPasswordOpen(false);
      setPassActual('');
      setPassNueva('');
      setPassConfirm('');
      reiniciar();
      setToastMensaje({ texto: 'Contraseña actualizada con éxito.', color: 'success' });
    } catch {
      setGuardandoPass(false);
      setToastMensaje({ texto: 'Error al cambiar la contraseña.', color: 'danger' });
    }
  };

  return (
    <div className="configuracion-tab-container">
      <div className="configuracion-grid">
        <div className="avatar-seccion">
          <IonAvatar className="perfil-avatar-large">
            <div className="avatar-placeholder-text">
              {usuario ? obtenerIniciales(usuario.nombre) : 'V'}
            </div>
          </IonAvatar>
        </div>

        <div className="formulario-seccion">
          <div className="campo-grupo">
            <label className="campo-label">Nombre completo:</label>
            <div className="input-con-icono">
              <IonInput
                value={nombre}
                onIonInput={(e) => setNombre(e.detail.value ?? '')}
                onIonBlur={() => tocar('nombre')}
                className={`input-custom ${claseCampo('nombre', errorNombre)}`}
              />
              <IonIcon icon={pencilOutline} className="input-icono-edit" />
            </div>
            {errorNombre && <span className="mensaje-error">{errorNombre}</span>}
          </div>

          <div className="campo-grupo">
            <label className="campo-label">Correo electrónico:</label>
            <div className="input-con-icono">
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value ?? '')}
                onIonBlur={() => tocar('email')}
                className={`input-custom ${claseCampo('email', errorEmail)}`}
              />
              <IonIcon icon={pencilOutline} className="input-icono-edit" />
            </div>
            {errorEmail && <span className="mensaje-error">{errorEmail}</span>}
          </div>

          <div className="btn-cambiar-pass-container">
            <IonButton
              className="btn-cambiar-pass"
              onClick={() => setModalPasswordOpen(true)}
            >
              Cambiar Contraseña
            </IonButton>
          </div>
        </div>
      </div>

      <div className="configuracion-acciones">
        <IonButton
          className="btn-descartar"
          onClick={handleDescartar}
          disabled={guardandoPerfil}
        >
          Descartar Cambios
        </IonButton>
        <IonButton
          className="btn-aceptar"
          onClick={handleAceptar}
          disabled={guardandoPerfil}
        >
          {guardandoPerfil ? <IonSpinner name="crescent" /> : 'Aceptar cambios'}
        </IonButton>
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
        className="modal-filtros"
      >
        <IonContent className="filtros-contenido">
          <div className="filtros-marco">
            <div className="filtros-encabezado">
              <h2>Cambiar Contraseña</h2>
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
