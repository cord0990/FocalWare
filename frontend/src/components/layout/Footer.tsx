import './Footer.css';

const Footer: React.FC = () => (
  <footer className="pie">
    <nav className="pie-enlaces">
      <a href="#">Términos y condiciones</a>
      <a href="#">Atención al cliente</a>
      <a href="#">Acerca del equipo</a>
    </nav>
    <p className="pie-derechos">Derechos asociados a: FocalWare</p>
  </footer>
);

export default Footer;