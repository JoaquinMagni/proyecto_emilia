import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Desactivar bodyParser para manejar datos binarios
  },
};

export async function POST(req) {
  try {
    console.log("Recibiendo solicitud de subida de archivos...");

    const boundary = getBoundary(req.headers.get('content-type'));
    if (!boundary) {
      throw new Error('Content-Type no contiene boundary');
    }

    const uploadDir = path.join(process.cwd(), 'public/files-notes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const { files } = await parseMultipart(req, boundary);

    console.log("Archivos procesados:", files);

    const uploadedFiles = [];
    for (const file of files) {
      const filePath = path.join(uploadDir, file.filename);
      console.log("Guardando archivo:", filePath);

      fs.writeFileSync(filePath, file.content);
      uploadedFiles.push(`/files-notes/${file.filename}`);
    }

    console.log("Archivos subidos correctamente:", uploadedFiles);

    return new Response(
      JSON.stringify({ success: true, files: uploadedFiles }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


// Obtener el boundary desde el Content-Type
function getBoundary(contentType) {
  const match = contentType?.match(/boundary=(.+)$/);
  return match ? match[1] : null;
}

// Función para procesar multipart/form-data
async function parseMultipart(req, boundary) {
  const buffer = Buffer.from(await req.arrayBuffer());
  const parts = buffer.toString('binary').split(`--${boundary}`);
  
  const files = [];
  const fields = {};

  for (const part of parts) {
    const [rawHeaders, rawContent] = part.split('\r\n\r\n');
    if (!rawContent) continue; // Saltar partes vacías o delimitadores

    const headers = parseHeaders(rawHeaders);
    const contentDisposition = headers['content-disposition'] || '';

    // Obtener el nombre del campo y archivo
    const nameMatch = contentDisposition.match(/name="(.+?)"/);
    const filenameMatch = contentDisposition.match(/filename="(.+?)"/);

    const fieldName = nameMatch ? nameMatch[1] : null;
    const filename = filenameMatch ? filenameMatch[1] : null;

    
    if (filename) {
      // Archivo
      const content = Buffer.from(rawContent, 'binary').slice(0, -2); // Eliminar \r\n final
      files.push({ fieldName, filename, content });
    } else if (fieldName) {
      // Campo de formulario
      fields[fieldName] = rawContent.trim();
    }
  }

  return { fields, files };
}

// Parsear encabezados de una sección del multipart
function parseHeaders(headerString) {
  const headers = {};
  const lines = headerString.split('\r\n');
  for (const line of lines) {
    const [key, value] = line.split(': ');
    if (key && value) {
      headers[key.toLowerCase()] = value;
    }
  }
  return headers;
}
