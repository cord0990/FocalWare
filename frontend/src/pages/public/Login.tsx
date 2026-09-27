import { useState } from 'react';
import {
  IonButton,
  IonInputPasswordToggle,
  IonRouterLink,
  IonSpinner,
} from '@ionic/react';
import AuthLayout from '../../components/layout/AuthLayout';
import CampoFormulario from '../../components/CampoFormulario';
import { useCamposTocados } from '../../hooks/useCamposTocados';
import { useSesion } from '../../hooks/useSesion';
import { iniciarSesion } from '../../services/authService';
import { RUTAS } from '../../routes/rutas';
import { esCorreoValido } from '../../utils/validaciones';

const Login: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { tocar, claseCampo } = useCamposTocados();
  const sesion = useSesion();

  const errores = {
    correo: !correo
      ? 'Ingresa tu correo.'
      : !esCorreoValido(correo)
        ? 'El correo no tiene un formato válido.'
        : '',
    contrasena: !contrasena ? 'Ingresa tu contraseña.' : '',
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    tocar('correo', 'contrasena');
    if (errores.correo || errores.contrasena) return;

    setEnviando(true);
    const usuario = await iniciarSesion({ correo, contrasena });
    setEnviando(false);
    // Con la sesión iniciada, RutaPublica lleva al mapa o a la página que se quería abrir.
    sesion.iniciarSesion(usuario);
  };

  return (
    <AuthLayout titulo="Iniciar Sesión">
      <form onSubmit={enviar} noValidate>
        <h2>Bienvenido de vuelta</h2>
        <p>Ingresa con tu correo y contraseña.</p>

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

        <CampoFormulario
          etiqueta="Contraseña"
          obligatorio
          type="password"
          placeholder="Tu contraseña"
          errorText={errores.contrasena}
          value={contrasena}
          className={claseCampo('contrasena', errores.contrasena)}
          onIonInput={(e) => setContrasena(e.detail.value ?? '')}
          onIonBlur={() => tocar('contrasena')}
        >
          <IonInputPasswordToggle slot="end" color="medium" />
        </CampoFormulario>

        <IonButton type="submit" expand="block" className="btn-principal" disabled={enviando}>
          {enviando ? <IonSpinner name="crescent" /> : 'Iniciar sesión'}
        </IonButton>

        <div className="auth-enlaces">
          <IonRouterLink routerLink={RUTAS.recuperar} className="auth-enlace">
            ¿Olvidaste tu contraseña?
          </IonRouterLink>
          <IonRouterLink routerLink={RUTAS.registro} className="auth-enlace">
            Crear cuenta
          </IonRouterLink>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;