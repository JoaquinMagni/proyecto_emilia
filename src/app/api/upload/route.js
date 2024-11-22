import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Desactivar bodyParser para manejar datos binarios
  },
};

export async function POST(req) {
  try {
    // Obtener boundary del Content-Type
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('boundary=')) {
      throw new Error('Content-Type no contiene boundary');
    }

    const boundary = `--${contentType.split('boundary=')[1]}`;
    const uploadDir = path.join(process.cwd(), 'public/images-notes');

    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Leer el cuerpo de la solicitud
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dividir el contenido por el boundary
    const parts = buffer.toString('binary').split(boundary).filter(part => part.includes('filename='));
    if (parts.length === 0) {
      throw new Error('No se encontraron archivos en la solicitud');
    }

    // Procesar el archivo
    const filePart = parts[0];
    const [headers, content] = filePart.split('\r\n\r\n');
    const fileNameMatch = headers.match(/filename="(.+?)"/);
    if (!fileNameMatch) {
      throw new Error('No se pudo obtener el nombre del archivo');
    }

    const fileName = fileNameMatch[1];
    const filePath = path.join(uploadDir, fileName);

    // Eliminar los bytes adicionales del final del archivo
    const contentBuffer = Buffer.from(content, 'binary').slice(0, -4); // Eliminar "--\r\n"

    // Guardar el archivo en el sistema de archivos
    fs.writeFileSync(filePath, contentBuffer);

    // Responder con la ruta del archivo
    return new Response(
      JSON.stringify({ success: true, filePath: `/images-notes/${fileName}` }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}