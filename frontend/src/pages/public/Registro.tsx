import { useState } from 'react';
import {
  IonButton,
  IonCheckbox,
  IonInputPasswordToggle,
  IonRouterLink,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import AuthLayout from '../../components/layout/AuthLayout';
import CampoFormulario from '../../components/CampoFormulario';
import RequisitosContrasena from '../../components/RequisitosContrasena';
import { useCamposTocados } from '../../hooks/useCamposTocados';
import { registrarUsuario } from '../../services/authService';
import { RUTAS } from '../../routes/rutas';
import { esContrasenaSegura, esCorreoValido } from '../../utils/validaciones';

const Registro: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const { tocar, claseCampo } = useCamposTocados();

  const errores = {
    nombre: nombre.trim().length < 3 ? 'Ingresa tu nombre completo.' : '',
    correo: !correo
      ? 'Ingresa tu correo.'
      : !esCorreoValido(correo)
        ? 'El correo no tiene un formato válido.'
        : '',
    telefono:
      telefono && !/^\+?\d{8,12}$/.test(telefono)
        ? 'Usa solo números, por ejemplo +56912345678.'
        : '',
    contrasena: !esContrasenaSegura(contrasena) ? 'La contraseña no cumple los requisitos.' : '',
    confirmacion:
      !confirmacion || confirmacion !== contrasena ? 'Las contraseñas no coinciden.' : '',
    terminos: !aceptaTerminos ? 'Debes aceptar los términos y condiciones.' : '',
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    tocar('nombre', 'correo', 'telefono', 'contrasena', 'confirmacion');
    setIntentoEnviar(true);
    if (Object.values(errores).some(Boolean)) return;

    setEnviando(true);
    await registrarUsuario({ nombre, correo, telefono, contrasena });
    setEnviando(false);
    setMensaje('Cuenta creada correctamente.');
  };

  return (
    <AuthLayout titulo="Crear Cuenta" panelAmplio>
      <form onSubmit={enviar} noValidate>
        <h2>Regístrate</h2>
        <p>Completa tus datos para crear tu cuenta.</p>

        <div className="campos-grilla">
          <CampoFormulario
            etiqueta="Nombre completo"
            obligatorio
            placeholder="Nombre y apellido"
            errorText={errores.nombre}
            value={nombre}
            className={claseCampo('nombre', errores.nombre)}
            onIonInput={(e) => setNombre(e.detail.value ?? '')}
            onIonBlur={() => tocar('nombre')}
          />

          <CampoFormulario
            etiqueta="Correo"
            obligatorio
            type="email"
            placeholder="nombre@correo.cl"
            helperText="Formato: nombre@dominio.cl"
            errorText={errores.correo}
            value={correo}
            className={claseCampo('correo', errores.correo)}
            onIonInput={(e) => setCorreo(e.detail.value ?? '')}
            onIonBlur={() => tocar('correo')}
          />

          <div>
            <CampoFormulario
              etiqueta="Contraseña"
              obligatorio
              type="password"
              placeholder="Crea una contraseña"
              errorText={errores.contrasena}
              value={contrasena}
              className={claseCampo('contrasena', errores.contrasena)}
              onIonInput={(e) => setContrasena(e.detail.value ?? '')}
              onIonBlur={() => tocar('contrasena')}
            >
              <IonInputPasswordToggle slot="end" color="medium" />
            </CampoFormulario>
            <RequisitosContrasena contrasena={contrasena} />
          </div>

          <CampoFormulario
            etiqueta="Confirmar contraseña"
            obligatorio
            type="password"
            placeholder="Repite la contraseña"
            errorText={errores.confirmacion}
            value={confirmacion}
            className={claseCampo('confirmacion', errores.confirmacion)}
            onIonInput={(e) => setConfirmacion(e.detail.value ?? '')}
            onIonBlur={() => tocar('confirmacion')}
          >
            <IonInputPasswordToggle slot="end" color="medium" />
          </CampoFormulario>

          <CampoFormulario
            etiqueta="Teléfono"
            type="tel"
            placeholder="+56912345678"
            helperText="Formato: +569 seguido de 8 dígitos"
            errorText={errores.telefono}
            value={telefono}
            className={claseCampo('telefono', errores.telefono)}
            onIonInput={(e) => setTelefono(e.detail.value ?? '')}
            onIonBlur={() => tocar('telefono')}
          />
        </div>

        <IonCheckbox
          labelPlacement="end"
          checked={aceptaTerminos}
          onIonChange={(e) => setAceptaTerminos(e.detail.checked)}
        >
          Acepto los términos y condiciones
        </IonCheckbox>
        {intentoEnviar && errores.terminos && <p className="mensaje-error">{errores.terminos}</p>}

        <IonButton type="submit" expand="block" className="btn-principal" disabled={enviando}>
          {enviando ? <IonSpinner name="crescent" /> : 'Crear cuenta'}
        </IonButton>

        <IonRouterLink routerLink={RUTAS.login} className="auth-enlace">
          ← Ya tengo cuenta, iniciar sesión
        </IonRouterLink>
      </form>

      <IonToast
        isOpen={!!mensaje}
        message={mensaje}
        duration={2500}
        color="success"
        position="top"
        onDidDismiss={() => setMensaje('')}
      />
    </AuthLayout>
  );
};

export default Registro;