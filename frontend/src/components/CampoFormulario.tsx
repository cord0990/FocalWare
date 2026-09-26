import type { ComponentProps } from 'react';
import { IonInput } from '@ionic/react';

type CampoFormularioProps = ComponentProps<typeof IonInput> & {
  etiqueta: string;
  obligatorio?: boolean;
};

const CampoFormulario: React.FC<CampoFormularioProps> = ({
  etiqueta,
  obligatorio = false,
  children,
  ...props
}) => (
  <div className="campo">
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
    <IonInput fill="outline" aria-label={etiqueta} {...props}>
      {children}
    </IonInput>
  </div>
);

export default CampoFormulario;