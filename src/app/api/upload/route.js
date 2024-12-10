import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
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

    // Guardar el archivo sin cortar bytes
    const contentBuffer = Buffer.from(content.trim(), 'binary');
    fs.writeFileSync(filePath, contentBuffer);

    // Verificar si el archivo se guardó correctamente
    const savedBuffer = fs.readFileSync(filePath);
    console.log("Tamaño del archivo guardado:", savedBuffer.length);

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
