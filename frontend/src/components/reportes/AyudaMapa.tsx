import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { caretUp, closeOutline, flameOutline, funnelOutline, layersOutline } from 'ionicons/icons';
import { NIVELES_RIESGO, rangoNivel } from '../../utils/riesgo';
import './AyudaMapa.css';

interface AyudaMapaProps {
  abierto: boolean;
  onCerrar: () => void;
}

// Ventana que explica cómo leer el mapa: colores, botones y apoyos.
// Se agregó porque en la prueba con usuarios nadie entendía el mapa a la primera.
const AyudaMapa: React.FC<AyudaMapaProps> = ({ abierto, onCerrar }) => {
  const botones = [
    {
      icono: funnelOutline,
      titulo: 'Filtros y buscador',
      texto: 'Busca por sector, nombre o categoría, o filtra por estado, sector, categoría y fecha.',
    },
    {
      icono: layersOutline,
      titulo: 'Mapa detallado',
      texto: 'Cambia el fondo a uno con más calles y nombres. Vuelve con "Mapa simple".',
    },
    {
      icono: flameOutline,
      titulo: 'Mapa de calor',
      texto: 'Muestra las zonas con más reportes de los últimos 12 meses.',
    },
    {
      icono: caretUp,
      titulo: 'Apoyar',
      texto: 'Si el problema ya está reportado, apóyalo en vez de crear otro. Cada apoyo sube su riesgo.',
    },
  ];

  return (
    <IonModal isOpen={abierto} onDidDismiss={onCerrar} className="modal-ayuda-mapa">
      <IonContent className="ayuda-mapa-contenido">
        <div className="ayuda-mapa">
          <div className="ayuda-mapa-encabezado">
            <h2>¿Cómo leer el mapa?</h2>
            <IonButton fill="clear" onClick={onCerrar} aria-label="Cerrar ayuda del mapa">
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </div>

          <h3>Color de cada marcador</h3>
          <p>Cada punto es un reporte. Su color indica el riesgo de incendio.</p>
          <ul className="ayuda-mapa-niveles">
            {[...NIVELES_RIESGO].reverse().map((nivel) => (
              <li key={nivel.nivel} style={{ background: nivel.color, color: nivel.texto }}>
                <strong>{nivel.etiqueta}</strong>
                <span>{rangoNivel(nivel)}</span>
              </li>
            ))}
          </ul>

          <h3>Botones</h3>
          <ul className="ayuda-mapa-botones">
            {botones.map((boton) => (
              <li key={boton.titulo}>
                <span className="ayuda-mapa-icono">
                  <IonIcon icon={boton.icono} aria-hidden="true" />
                </span>
                <div>
                  <strong>{boton.titulo}</strong>
                  <p>{boton.texto}</p>
                </div>
              </li>
            ))}
          </ul>

          <IonButton expand="block" className="ayuda-mapa-entendido" onClick={onCerrar}>
            Entendido
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AyudaMapa;
