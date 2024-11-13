import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Desactivar bodyParser para manejar el archivo manualmente
  },
};

export async function POST(req) {
  try {
    // Verificar si el encabezado contiene el boundary
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('boundary=')) {
      throw new Error('Content-Type no contiene boundary');
    }

    // Extraer el boundary del encabezado Content-Type
    const boundary = `--${contentType.split('boundary=')[1]}`;

    // Crear el directorio `public/images-notes` si no existe
    const uploadDir = path.join(process.cwd(), 'public/images-notes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Leer el cuerpo de la solicitud como ArrayBuffer y convertirlo a Buffer
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Procesar el archivo y guardarlo
    const fileName = await parseMultipartFormData(buffer, boundary, uploadDir);

    // Devolver la ruta del archivo guardado como respuesta
    return new Response(JSON.stringify({ success: true, filePath: `/images-notes/${fileName}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error al subir el archivo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Función para procesar el archivo y guardarlo en el sistema de archivos
function parseMultipartFormData(buffer, boundary, uploadDir) {
  return new Promise((resolve, reject) => {
    const parts = buffer.toString().split(boundary).filter(part => part.includes('filename='));

    if (parts.length === 0) {
      return reject(new Error('No se encontró archivo en la solicitud'));
    }

    const filePart = parts[0];
    const [headers, content] = filePart.split('\r\n\r\n');
    const fileName = extractFileName(headers);
    const filePath = path.join(uploadDir, fileName);

    // Guardar el archivo en el sistema de archivos
    fs.writeFile(filePath, content.split('\r\n')[0], err => {
      if (err) {
        reject(err);
      } else {
        resolve(fileName);
      }
    });
  });
}

// Función para extraer el nombre del archivo del encabezado
function extractFileName(header) {
  const match = header.match(/filename="(.+?)"/);
  return match ? match[1] : `file-${Date.now()}`;
}
