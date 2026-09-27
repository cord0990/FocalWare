import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { checkmarkCircle, closeCircleOutline, closeOutline } from 'ionicons/icons';
import { PUNTAJE_MAXIMO_FACTOR, type DesgloseIndice } from '../../utils/opcionesReporte';
import { obtenerNivelRiesgo } from '../../utils/riesgo';
import './ExplicacionRiesgo.css';

interface ExplicacionRiesgoProps {
  abierto: boolean;
  desglose: DesgloseIndice;
  onCerrar: () => void;
}

// Ventana que explica cómo se calcula el índice de riesgo y cuánto aporta cada factor.
const ExplicacionRiesgo: React.FC<ExplicacionRiesgoProps> = ({ abierto, desglose, onCerrar }) => {
  const factores = [
    { nombre: 'Categoría', detalle: 'Qué tan inflamable es el residuo', puntos: desglose.categoria },
    { nombre: 'Volumen', detalle: 'Cantidad de residuos acumulados', puntos: desglose.volumen },
    { nombre: 'Cercanía a viviendas', detalle: 'Mientras más cerca, más puntos', puntos: desglose.cercania },
    { nombre: 'Apoyos vecinales', detalle: '1 punto por apoyo, hasta 20', puntos: desglose.apoyos },
    { nombre: 'Antigüedad', detalle: '1 punto por semana sin resolver, hasta 20', puntos: desglose.antiguedad },
  ];

  const condiciones = desglose.condicionesClima;
  const listaClima = [
    { texto: 'Temperatura sobre 30 °C', cumple: condiciones?.calor },
    { texto: 'Humedad bajo 30 %', cumple: condiciones?.sequedad },
    { texto: 'Viento sobre 30 km/h', cumple: condiciones?.viento },
  ];
  const cumplidas = listaClima.filter((condicion) => condicion.cumple).length;
  const nivel = desglose.indice === null ? null : obtenerNivelRiesgo(desglose.indice);

  return (
    <IonModal isOpen={abierto} onDidDismiss={onCerrar} className="modal-explicacion">
      <IonContent className="explicacion-contenido">
        <div className="explicacion">
          <div className="explicacion-encabezado">
            <h2>¿Cómo se calcula el riesgo?</h2>
            <IonButton fill="clear" onClick={onCerrar} aria-label="Cerrar explicación">
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </div>

          <p className="explicacion-formula">
            Índice = (Categoría + Volumen + Cercanía + Apoyos + Antigüedad) × Factor climático
          </p>
          <p className="explicacion-texto">
            Cada factor aporta de 0 a 20 puntos. Luego la suma se multiplica según el clima y el
            resultado se limita a 100.
          </p>

          <div className="explicacion-columnas">
            <section>
              <h3>1. Factores del reporte</h3>
              <ul className="explicacion-factores">
                {factores.map((factor) => (
                  <li key={factor.nombre}>
                    <div className="explicacion-factor-texto">
                      <strong>{factor.nombre}</strong>
                      <span>{factor.detalle}</span>
                    </div>
                    <div className="explicacion-barra" aria-hidden="true">
                      <span style={{ width: `${((factor.puntos ?? 0) / PUNTAJE_MAXIMO_FACTOR) * 100}%` }} />
                    </div>
                    <b>{factor.puntos === null ? 'Falta' : `${factor.puntos} / ${PUNTAJE_MAXIMO_FACTOR}`}</b>
                  </li>
                ))}
              </ul>
              <p className="explicacion-subtotal">
                Suma base: <b>{desglose.base} / 100</b>
              </p>
            </section>

            <section className="explicacion-columna-derecha">
              <h3>2. Factor climático (regla 30-30-30)</h3>
              {condiciones ? (
                <ul className="explicacion-clima">
                  {listaClima.map((condicion) => (
                    <li key={condicion.texto} className={condicion.cumple ? 'cumple' : ''}>
                      <IonIcon
                        icon={condicion.cumple ? checkmarkCircle : closeCircleOutline}
                        aria-hidden="true"
                      />
                      {condicion.texto}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="explicacion-texto">Sin datos del clima: el puntaje no cambia.</p>
              )}
              <p className="explicacion-subtotal">
                {cumplidas} de 3 condiciones: <b>× {desglose.factorClimatico}</b>
              </p>

              <div
                className="explicacion-resultado"
                style={nivel ? { background: nivel.color, color: nivel.texto } : undefined}
              >
                {desglose.indice === null ? (
                  'Completa categoría, volumen y distancia para calcular el riesgo.'
                ) : (
                  <>
                    {desglose.base} × {desglose.factorClimatico} = <b>{desglose.indice} %</b>
                    <span className="explicacion-resultado-nivel">
                      Riesgo {nivel?.etiqueta.toLowerCase()}
                    </span>
                  </>
                )}
              </div>
            </section>
          </div>

          <p className="explicacion-nota">
            Los puntajes son valores de ejemplo para esta etapa del proyecto. En la Entrega 2 el
            cálculo se hará en el servidor, con el clima real de Open-Meteo.
          </p>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ExplicacionRiesgo;
