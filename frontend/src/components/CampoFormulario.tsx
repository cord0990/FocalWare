import type { ComponentProps } from 'react';
import { IonIcon, IonInput } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import './CampoFormulario.css';

type CampoFormularioProps = ComponentProps<typeof IonInput> & {
  etiqueta: string;
  obligatorio?: boolean;
};

const CampoFormulario: React.FC<CampoFormularioProps> = ({
  etiqueta,
  obligatorio = false,
  errorText,
  helperText,
  className,
  children,
  ...props
}) => {
  const mostrarError = Boolean(errorText && className?.includes('ion-invalid'));

  return (
    <div className={`campo${mostrarError ? ' campo--error' : ''}`}>
      <span className="campo-etiqueta">
        {etiqueta}{' '}
        {obligatorio ? (
          <>
            <span className="campo-asterisco">*</span> (obligatorio)
          </>
        ) : (
          '(opcional)'
        )}
      </span>

      <IonInput
        fill="outline"
        aria-label={etiqueta}
        aria-invalid={mostrarError}
        className={className}
        helperText={mostrarError ? undefined : helperText}
        {...props}
      >
        {children}
      </IonInput>

      {mostrarError && (
        <div className="campo-mensaje-error" role="alert">
          <IonIcon icon={alertCircleOutline} aria-hidden="true" />
          <span>{errorText}</span>
        </div>
      )}
    </div>
  );
};

export default CampoFormulario;