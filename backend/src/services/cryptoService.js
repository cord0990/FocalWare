const crypto = require('node:crypto');
const fs = require('node:fs');

const PREFIJO = 'enc:v1:';
const AAD = Buffer.from('focalware:datos-sensibles:v1');
const ARCHIVO_CLAVE_POR_DEFECTO = '/app/data/data_encryption_key';

let claveCache = null;

const errorClave = () =>
  new Error(
    'DATA_ENCRYPTION_KEY debe existir y tener 64 caracteres hexadecimales (32 bytes). ' +
      "Generala con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  );

// Prioriza la variable de entorno. En Docker, el entrypoint también deja la
// clave en el volumen para que `docker exec` pueda ejecutar el script de cifrado.
const obtenerClave = () => {
  if (claveCache) return claveCache;

  let hex = process.env.DATA_ENCRYPTION_KEY?.trim();

  if (!hex) {
    const archivo = process.env.DATA_ENCRYPTION_KEY_FILE || ARCHIVO_CLAVE_POR_DEFECTO;
    if (fs.existsSync(archivo)) {
      hex = fs.readFileSync(archivo, 'utf8').trim();
    }
  }

  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw errorClave();
  }

  claveCache = Buffer.from(hex, 'hex');
  return claveCache;
};

const esEncriptado = (valor) =>
  typeof valor === 'string' && valor.startsWith(PREFIJO);

// Cifra un texto con AES-256-GCM. El IV es aleatorio en cada operación y el
// auth tag permite detectar si el valor fue alterado.
const encriptar = (valor) => {
  if (valor === null || valor === undefined || valor === '') return valor;
  if (esEncriptado(valor)) return valor;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', obtenerClave(), iv);
  cipher.setAAD(AAD);

  const cifrado = Buffer.concat([
    cipher.update(String(valor), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${PREFIJO}${iv.toString('base64')}:${tag.toString('base64')}:${cifrado.toString('base64')}`;
};

// Acepta valores antiguos en texto plano para poder migrar sin romper la app.
const desencriptar = (valor) => {
  if (valor === null || valor === undefined || valor === '') return valor;
  if (!esEncriptado(valor)) return valor;

  const partes = valor.split(':');
  if (partes.length !== 5 || partes[0] !== 'enc' || partes[1] !== 'v1') {
    throw new Error('El dato cifrado tiene un formato inválido');
  }

  try {
    const iv = Buffer.from(partes[2], 'base64');
    const tag = Buffer.from(partes[3], 'base64');
    const cifrado = Buffer.from(partes[4], 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', obtenerClave(), iv);
    decipher.setAAD(AAD);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString('utf8');
  } catch {
    throw new Error('No se pudo desencriptar el dato. Revisa DATA_ENCRYPTION_KEY');
  }
};

const validarConfiguracion = () => {
  obtenerClave();
};

module.exports = {
  encriptar,
  desencriptar,
  esEncriptado,
  validarConfiguracion,
};
