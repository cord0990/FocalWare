const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { detectarExtension } = require('../src/dominio/imagenes');

const png = fs.readFileSync(path.join(__dirname, '..', 'postman', 'foto-prueba.png'));

// Firmas mínimas que file-type reconoce como imágenes.
const jpeg = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
]);
const webp = Buffer.from('RIFF\x24\x00\x00\x00WEBPVP8 ', 'binary');

test('acepta JPG, PNG y WEBP por su contenido real', async () => {
  assert.equal(await detectarExtension(png), '.png');
  assert.equal(await detectarExtension(jpeg), '.jpg');
  assert.equal(await detectarExtension(webp), '.webp');
});

test('rechaza HTML, SVG, texto y archivos vacíos', async () => {
  const invalidos = [
    Buffer.from('<html><body>hola</body></html>'),
    Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
    Buffer.from('esto no es una imagen'),
    Buffer.alloc(0),
  ];

  for (const buffer of invalidos) {
    await assert.rejects(() => detectarExtension(buffer), (error) => {
      assert.equal(error.estado, 400);
      assert.match(error.message, /JPG, PNG o WEBP/);
      return true;
    });
  }
});
