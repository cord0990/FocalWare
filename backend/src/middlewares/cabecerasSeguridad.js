// Cabeceras de seguridad para todas las respuestas de la API.
// No reemplazan la validación ni el escape de datos: son una capa extra para
// el navegador (evitar que adivine tipos, embeber la API o cargar recursos).
const cabecerasSeguridad = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; base-uri 'none'; frame-ancestors 'none'"
  );
  next();
};

module.exports = { cabecerasSeguridad };
