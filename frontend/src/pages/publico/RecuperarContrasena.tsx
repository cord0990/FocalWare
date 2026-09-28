import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  IonButton,
  IonInputOtp,
  IonInputPasswordToggle,
  IonRouterLink,
  IonSpinner,
  IonToast,
  useIonRouter,
  useIonViewDidLeave,
} from '@ionic/react';
import AuthLayout from '../../components/layout/AuthLayout';
import CampoFormulario from '../../components/CampoFormulario';
import RequisitosContrasena from '../../components/RequisitosContrasena';
import { useCamposTocados } from '../../hooks/useCamposTocados';
import {
  cambiarContrasena,
  enviarCodigoRecuperacion,
  verificarCodigoRecuperacion,
} from '../../services/authService';
import { RUTAS } from '../../routes/rutas';
import { esContrasenaSegura, esCorreoValido } from '../../utils/validaciones';
import './RecuperarContrasena.css';

const PASOS = ['Verificar correo', 'Ingresar código', 'Nueva contraseña'];
const PASO_COMPLETADO = PASOS.length + 1;

// Cada paso tiene su propia ruta (EP 1.4): /recuperar, /recuperar/codigo y /recuperar/nueva.
// El correo y el código pasan de un paso al siguiente en sessionStorage, no en la URL,
// para que no queden en el historial del navegador. Se borran al terminar.
const CLAVE_RECUPERACION = 'focalware-recuperacion';

interface DatosRecuperacion {
  correo: string;
  codigo?: string;
}

const leerRecuperacion = (): DatosRecuperacion | null => {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_RECUPERACION) ?? 'null');
  } catch {
    return null;
  }
};

const guardarRecuperacion = (datos: DatosRecuperacion | null) => {
  try {
    if (datos) sessionStorage.setItem(CLAVE_RECUPERACION, JSON.stringify(datos));
    else sessionStorage.removeItem(CLAVE_RECUPERACION);
  } catch {
    // Sin almacenamiento el flujo vuelve a empezar desde el correo.
  }
};

const RecuperarContrasena: React.FC<{ paso: 1 | 2 | 3 }> = ({ paso: pasoDeLaRuta }) => {
  const router = useIonRouter();
  const guardada = leerRecuperacion();
  const [completado, setCompletado] = useState(false);
  const paso = completado ? PASO_COMPLETADO : pasoDeLaRuta;
  const [correo, setCorreo] = useState(guardada?.correo ?? '');
  const [codigo, setCodigo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [intentoCodigo, setIntentoCodigo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const { tocar, claseCampo, reiniciar } = useCamposTocados();

  const errores = {
    correo: !correo
      ? 'Ingresa tu correo.'
      : !esCorreoValido(correo)
        ? 'El correo no tiene un formato válido.'
        : '',
    codigo: !/^\d{6}$/.test(codigo) ? 'Ingresa los 6 dígitos del código.' : '',
    contrasena: !esContrasenaSegura(contrasena) ? 'La contraseña no cumple los requisitos.' : '',
    confirmacion:
      !confirmacion || confirmacion !== contrasena ? 'Las contraseñas no coinciden.' : '',
  };

  // Al salir de la pantalla se borra lo ingresado, para no dejar el código ni la contraseña.
  useIonViewDidLeave(() => {
    setCompletado(false);
    setCodigo('');
    setContrasena('');
    setConfirmacion('');
    setIntentoCodigo(false);
    reiniciar();
  });

  const enviarCorreo = async (evento: React.FormEvent) => {
    evento.preventDefault();
    tocar('correo');
    if (errores.correo) return;

    setEnviando(true);
    await enviarCodigoRecuperacion(correo);
    setEnviando(false);
    guardarRecuperacion({ correo });
    router.push(RUTAS.recuperarCodigo, 'forward');
  };

  const reenviarCodigo = async () => {
    await enviarCodigoRecuperacion(correo);
    setMensaje(`Enviamos un nuevo código a ${correo}.`);
  };

  const verificarCodigo = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setIntentoCodigo(true);
    if (errores.codigo) return;

    setEnviando(true);
    await verificarCodigoRecuperacion(correo, codigo);
    setEnviando(false);
    guardarRecuperacion({ correo, codigo });
    router.push(RUTAS.recuperarNueva, 'forward');
  };

  const guardarContrasena = async (evento: React.FormEvent) => {
    evento.preventDefault();
    tocar('contrasena', 'confirmacion');
    if (errores.contrasena || errores.confirmacion) return;

    setEnviando(true);
    await cambiarContrasena({ correo, codigo: guardada?.codigo ?? '', contrasena });
    setEnviando(false);
    guardarRecuperacion(null);
    setCompletado(true);
  };

  // Sin haber pasado por los pasos anteriores (por ejemplo, abriendo el enlace directo),
  // se vuelve a empezar desde el correo.
  const faltanPasos =
    !completado && ((pasoDeLaRuta >= 2 && !guardada?.correo) || (pasoDeLaRuta === 3 && !guardada?.codigo));
  if (faltanPasos) return <Navigate to={RUTAS.recuperar} replace />;

  const botonEnviar = (texto: string) => (
    <IonButton type="submit" expand="block" className="btn-principal" disabled={enviando}>
      {enviando ? <IonSpinner name="crescent" /> : texto}
    </IonButton>
  );

  return (
    <AuthLayout titulo="Recuperar Contraseña">
      {paso < PASO_COMPLETADO && (
        <>
          <div className="pasos-encabezado">
            <strong>
              Paso {paso} de {PASOS.length}
            </strong>
            <strong>{PASOS[paso - 1]}</strong>
          </div>
          <div className="pasos-barra">
            {PASOS.map((nombre, i) => (
              <span key={nombre} className={i < paso ? 'activo' : ''} />
            ))}
          </div>
        </>
      )}

      {paso === 1 && (
        <form onSubmit={enviarCorreo} noValidate>
          <h2>Ingresa tu correo</h2>
          <p>
            Te enviaremos un <strong>código de 6 dígitos</strong> para confirmar que eres tú.
          </p>

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

          {botonEnviar('Enviar código')}

          <IonRouterLink routerLink={RUTAS.login} className="auth-enlace">
            ← Volver a iniciar sesión
          </IonRouterLink>
        </form>
      )}

      {paso === 2 && (
        <form onSubmit={verificarCodigo} noValidate>
          <h2>Ingresa el código</h2>
          <p>
            Escribe el código de 6 dígitos que enviamos a <strong>{correo}</strong>.
          </p>

          <IonInputOtp
            length={6}
            type="number"
            fill="outline"
            className="codigo-otp"
            value={codigo}
            onIonInput={(e) => setCodigo(String(e.detail.value ?? ''))}
          />
          {intentoCodigo && errores.codigo && <p className="mensaje-error">{errores.codigo}</p>}

          {botonEnviar('Verificar código')}

          <div className="auth-enlaces">
            <button
              type="button"
              className="auth-enlace enlace-boton"
              onClick={() => router.push(RUTAS.recuperar, 'back')}
            >
              ← Cambiar correo
            </button>
            <button type="button" className="auth-enlace enlace-boton" onClick={reenviarCodigo}>
              Reenviar código
            </button>
          </div>
        </form>
      )}

      {paso === 3 && (
        <form onSubmit={guardarContrasena} noValidate>
          <h2>Crea tu nueva contraseña</h2>
          <p>Elige una contraseña segura que no uses en otros sitios.</p>

          <CampoFormulario
            etiqueta="Nueva contraseña"
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

          {botonEnviar('Guardar contraseña')}
        </form>
      )}

      {paso === PASO_COMPLETADO && (
        <div>
          <h2>¡Contraseña actualizada!</h2>
          <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <IonButton routerLink={RUTAS.login} expand="block" className="btn-principal">
            Ir a iniciar sesión
          </IonButton>
        </div>
      )}

      {paso < PASOS.length && (
        <ol className="pasos-siguientes">
          {PASOS.map(
            (nombre, i) =>
              i + 1 > paso && (
                <li key={nombre}>
                  <span>{i + 1}</span> {nombre}
                </li>
              ),
          )}
        </ol>
      )}

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

export default RecuperarContrasena;
