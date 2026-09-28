import { useState } from 'react';
import './Graficos.css';

interface DatoMes {
  valor: string;
  etiqueta: string;
  corta: string;
  recibidos: number;
  resueltos: number;
}

// Marcas redondas para el eje: 0, un cuarto, la mitad, tres cuartos y el máximo.
const lineasGuia = (maximo: number) => {
  const paso = Math.max(1, Math.ceil(maximo / 4));
  return [0, 1, 2, 3, 4].map((n) => n * paso);
};

// Barras agrupadas por mes: reportes recibidos y resueltos (dos series, con leyenda).
const GraficoEvolucion: React.FC<{ datos: DatoMes[] }> = ({ datos }) => {
  const [activo, setActivo] = useState<number | null>(null);
  const guias = lineasGuia(Math.max(...datos.flatMap((d) => [d.recibidos, d.resueltos]), 1));
  const tope = guias[guias.length - 1];

  return (
    <figure className="grafico">
      <div className="grafico-leyenda" aria-hidden="true">
        <span>
          <i className="grafico-clave recibidos" /> Recibidos
        </span>
        <span>
          <i className="grafico-clave resueltos" /> Resueltos
        </span>
      </div>

      <div className="grafico-columnas-marco">
        <div className="grafico-eje-y" aria-hidden="true">
          {[...guias].reverse().map((valor) => (
            <span key={valor}>{valor}</span>
          ))}
        </div>

        <div className="grafico-columnas" onPointerLeave={() => setActivo(null)}>
          {guias.map((valor) => (
            <span key={valor} className="grafico-guia" style={{ bottom: `${(valor / tope) * 100}%` }} />
          ))}

          {datos.map((mes, indice) => (
            <div
              key={mes.valor}
              className={activo === indice ? 'grafico-grupo activo' : 'grafico-grupo'}
              tabIndex={0}
              aria-label={`${mes.etiqueta}: ${mes.recibidos} recibidos, ${mes.resueltos} resueltos`}
              onPointerEnter={() => setActivo(indice)}
              onFocus={() => setActivo(indice)}
              onBlur={() => setActivo(null)}
            >
              <div className="grafico-par">
                <span className="grafico-barra-v recibidos" style={{ height: `${(mes.recibidos / tope) * 100}%` }} />
                <span className="grafico-barra-v resueltos" style={{ height: `${(mes.resueltos / tope) * 100}%` }} />
              </div>
              <span className="grafico-mes">{mes.corta}</span>

              {activo === indice && (
                <span
                  className={indice > datos.length / 2 ? 'grafico-tooltip izquierda' : 'grafico-tooltip'}
                  role="tooltip"
                >
                  <span className="grafico-tooltip-titulo">{mes.etiqueta}</span>
                  <span className="grafico-tooltip-fila">
                    <i className="grafico-tooltip-linea recibidos" />
                    <strong>{mes.recibidos}</strong> recibidos
                  </span>
                  <span className="grafico-tooltip-fila">
                    <i className="grafico-tooltip-linea resueltos" />
                    <strong>{mes.resueltos}</strong> resueltos
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <details className="grafico-tabla">
        <summary>Ver datos en tabla</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              <th scope="col">Recibidos</th>
              <th scope="col">Resueltos</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((mes) => (
              <tr key={mes.valor}>
                <th scope="row">{mes.etiqueta}</th>
                <td>{mes.recibidos}</td>
                <td>{mes.resueltos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
};

export default GraficoEvolucion;
