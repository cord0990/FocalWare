import { useState } from 'react';
import { IonIcon, IonSelect, IonSelectOption, IonToast } from '@ionic/react';
import { downloadOutline, statsChart } from 'ionicons/icons';
import AppLayout from '../../components/layout/AppLayout';
import GraficoEvolucion from '../../components/municipal/GraficoEvolucion';
import GraficoSectores from '../../components/municipal/GraficoSectores';
import {
  cifrasDelMes,
  evolucionMensual,
  generarCsv,
  promedioPorSector,
  ultimosMeses,
} from '../../services/estadisticasService';
import { fechaDeHoy } from '../../services/reportesService';
import './Estadisticas.css';

// Panel de métricas del Funcionario (RF-09) con exportación a CSV (RNF-12).
const Estadisticas: React.FC = () => {
  const meses = ultimosMeses();
  const [mes, setMes] = useState(meses[meses.length - 1].valor);
  const [mensaje, setMensaje] = useState('');
  const cifras = cifrasDelMes(mes);
  const porcentajeResuelto = cifras.total ? Math.round((cifras.resueltos / cifras.total) * 100) : 0;

  const exportar = () => {
    // El BOM hace que Excel reconozca los tildes al abrir el archivo.
    const archivo = new Blob(['﻿', generarCsv()], { type: 'text/csv;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = `focalware-reportes-${fechaDeHoy()}.csv`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
    setMensaje('Se descargó el archivo CSV con los reportes de los últimos 12 meses.');
  };

  return (
    <AppLayout>
      <div className="estadisticas">
        <section className="estadisticas-lateral">
          <header className="estadisticas-encabezado">
            <span className="estadisticas-icono">
              <IonIcon icon={statsChart} aria-hidden="true" />
            </span>
            <div>
              <h1>Estadísticas</h1>
              <p>Reportes de los últimos 12 meses</p>
            </div>
          </header>

          <section className="estadisticas-cifras" aria-labelledby="titulo-cifras">
            <div className="estadisticas-cifras-titulo">
              <h2 id="titulo-cifras">Cifras mensuales</h2>
            </div>
            <div className="estadisticas-cifras-cuerpo">
              <IonSelect
                label="Mes"
                labelPlacement="stacked"
                fill="outline"
                interface="popover"
                value={mes}
                onIonChange={(e) => setMes(e.detail.value)}
              >
                {[...meses].reverse().map((opcion) => (
                  <IonSelectOption key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </IonSelectOption>
                ))}
              </IonSelect>

              <dl>
                <div>
                  <dt>Reportes totales</dt>
                  <dd>{cifras.total}</dd>
                </div>
                <div>
                  <dt>Reportes resueltos</dt>
                  <dd>
                    {cifras.resueltos}
                    <small>{porcentajeResuelto} % del total</small>
                  </dd>
                </div>
                <div>
                  <dt>Tiempo promedio de resolución</dt>
                  <dd>
                    {cifras.promedioDias === null
                      ? 'Sin datos'
                      : `${cifras.promedioDias.toLocaleString('es-CL')} días`}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <button type="button" className="estadisticas-exportar" onClick={exportar}>
            <IonIcon icon={downloadOutline} aria-hidden="true" />
            Exportar a CSV
          </button>
        </section>

        <section className="estadisticas-graficos">
          <article className="estadisticas-tarjeta">
            <h2>Tiempo promedio de resolución por sector</h2>
            <p>Días desde que se recibe un reporte hasta que queda controlado.</p>
            <GraficoSectores datos={promedioPorSector()} />
          </article>

          <article className="estadisticas-tarjeta">
            <h2>Evolución mensual</h2>
            <p>Reportes recibidos y resueltos cada mes.</p>
            <GraficoEvolucion datos={evolucionMensual()} />
          </article>
        </section>
      </div>

      <IonToast
        isOpen={!!mensaje}
        message={mensaje}
        duration={3000}
        color="success"
        position="top"
        onDidDismiss={() => setMensaje('')}
      />
    </AppLayout>
  );
};

export default Estadisticas;
