import { IonSelect, IonSelectOption } from '@ionic/react';
import { CATEGORIAS, DISTANCIAS, VOLUMENES } from '../../utils/opcionesReporte';

interface Opcion {
  valor: string;
}

interface CampoDesglose {
  etiqueta: string;
  opciones: readonly Opcion[];
  valor: string;
  error: string;
  onCambiar: (valor: string) => void;
}

interface CamposDesgloseProps {
  categoria: string;
  volumen: string;
  distancia: string;
  errores: { categoria: string; volumen: string; distancia: string };
  onCategoria: (valor: string) => void;
  onVolumen: (valor: string) => void;
  onDistancia: (valor: string) => void;
}

// Los tres datos del reporte que definen su riesgo: categoría, volumen y distancia a viviendas.
const CamposDesglose: React.FC<CamposDesgloseProps> = ({
  categoria,
  volumen,
  distancia,
  errores,
  onCategoria,
  onVolumen,
  onDistancia,
}) => {
  const campos: CampoDesglose[] = [
    { etiqueta: 'Categoría', opciones: CATEGORIAS, valor: categoria, error: errores.categoria, onCambiar: onCategoria },
    { etiqueta: 'Volumen estimado', opciones: VOLUMENES, valor: volumen, error: errores.volumen, onCambiar: onVolumen },
    {
      etiqueta: 'Distancia a viviendas',
      opciones: DISTANCIAS,
      valor: distancia,
      error: errores.distancia,
      onCambiar: onDistancia,
    },
  ];

  return (
    <>
      {campos.map((campo) => (
        <div key={campo.etiqueta}>
          <IonSelect
            label={campo.etiqueta}
            labelPlacement="stacked"
            fill="outline"
            interface="popover"
            placeholder="Elige una opción"
            value={campo.valor}
            className={campo.error ? 'campo-invalido' : ''}
            onIonChange={(e) => campo.onCambiar(e.detail.value)}
          >
            {campo.opciones.map((opcion) => (
              <IonSelectOption key={opcion.valor} value={opcion.valor}>
                {opcion.valor}
              </IonSelectOption>
            ))}
          </IonSelect>
          {campo.error && <p className="formulario-error">{campo.error}</p>}
        </div>
      ))}
    </>
  );
};

export default CamposDesglose;
