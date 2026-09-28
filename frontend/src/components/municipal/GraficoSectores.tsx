import { useState } from 'react';
import './Graficos.css';

interface DatoSector {
  sector: string;
  dias: number;
  cantidad: number;
}

const formatoDias = (dias: number) => `${dias.toLocaleString('es-CL')} ${dias === 1 ? 'día' : 'días'}`;

// Barras horizontales: tiempo promedio de resolución por sector (una sola serie, un solo color).
const GraficoSectores: React.FC<{ datos: DatoSector[] }> = ({ datos }) => {
  const [activo, setActivo] = useState<number | null>(null);
  const maximo = Math.max(...datos.map((d) => d.dias), 1);

  return (
    <figure className="grafico">
      <div className="grafico-barras-h" onPointerLeave={() => setActivo(null)}>
        {datos.map((dato, indice) => (
          <div
            key={dato.sector}
            className={activo === indice ? 'grafico-fila activa' : 'grafico-fila'}
            tabIndex={0}
            aria-label={`${dato.sector}: ${formatoDias(dato.dias)} en promedio, ${dato.cantidad} reportes resueltos`}
            onPointerEnter={() => setActivo(indice)}
            onFocus={() => setActivo(indice)}
            onBlur={() => setActivo(null)}
          >
            <span className="grafico-fila-etiqueta">{dato.sector}</span>
            <span className="grafico-fila-pista">
              <span className="grafico-barra-h" style={{ width: `${(dato.dias / maximo) * 100}%` }} />
              <span className="grafico-fila-valor">{formatoDias(dato.dias)}</span>
            </span>
            {activo === indice && (
              <span className="grafico-tooltip" role="tooltip">
                <strong>{formatoDias(dato.dias)}</strong>
                <span>{dato.sector}</span>
                <span>{dato.cantidad} reportes resueltos</span>
              </span>
            )}
          </div>
        ))}
      </div>

      <details className="grafico-tabla">
        <summary>Ver datos en tabla</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Sector</th>
              <th scope="col">Días promedio</th>
              <th scope="col">Reportes resueltos</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((dato) => (
              <tr key={dato.sector}>
                <th scope="row">{dato.sector}</th>
                <td>{dato.dias.toLocaleString('es-CL')}</td>
                <td>{dato.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
};

export default GraficoSectores;
