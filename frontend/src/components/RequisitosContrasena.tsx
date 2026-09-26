import { REGLAS_CONTRASENA } from '../utils/validaciones';

interface RequisitosContrasenaProps {
  contrasena: string;
}

const RequisitosContrasena: React.FC<RequisitosContrasenaProps> = ({ contrasena }) => (
  <ul className="requisitos">
    {REGLAS_CONTRASENA.map((regla) => {
      const cumple = regla.cumple(contrasena);
      return (
        <li key={regla.texto} className={cumple ? 'cumple' : ''}>
          {cumple ? '✓' : '•'} {regla.texto}
        </li>
      );
    })}
  </ul>
);

export default RequisitosContrasena;