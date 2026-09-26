import AppLayout from '../../components/layout/AppLayout';

interface EnConstruccionProps {
  titulo: string;
}

// Pantalla temporal para las secciones del menú que aún no están implementadas.
const EnConstruccion: React.FC<EnConstruccionProps> = ({ titulo }) => (
  <AppLayout>
    <h1>{titulo}</h1>
    <p>Esta sección está en construcción.</p>
  </AppLayout>
);

export default EnConstruccion;
