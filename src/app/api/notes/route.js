import connection from '../../../../lib/db';
import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false, // Desactivar el body parser de Next.js para manejar streams
  },
};

export async function POST(request) {
  const { userId, title, content, attachments, files, icon, tags } = await request.json();

  console.log("Datos de la nota recibidos:", { userId, title, content, attachments, files, icon, tags });

  if (!userId || !title || !content) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  try {
    const [result] = await connection.execute(
      `INSERT INTO notas (userId, title, content, attachments, files, icon, tags, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        title,
        content,
        JSON.stringify(attachments), // Almacenar imágenes
        JSON.stringify(files), // Almacenar archivos
        icon,
        JSON.stringify(tags),
      ]
    );

    console.log("Nota guardada exitosamente:", { noteId: result.insertId });

    return NextResponse.json({
      success: true,
      message: "Nota guardada correctamente",
      noteId: result.insertId,
    });
  } catch (error) {
    console.error("Error al guardar la nota:", error);
    return NextResponse.json({ error: "Error al guardar la nota" }, { status: 500 });
  }
}



export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const noteId = searchParams.get('id');

  try {
    if (noteId) {
      const [notes] = await connection.execute(
        'SELECT id, title, content, attachments, files, icon, tags, created_at, updated_at FROM notas WHERE id = ? LIMIT 1',
        [noteId]
      );

      if (notes.length === 0) {
        return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
      }

      const note = notes[0];
      note.attachments = parseJSONSafely(note.attachments);
      note.files = parseJSONSafely(note.files);
      note.tags = parseJSONSafely(note.tags); // Aquí parseamos los tags correctamente
      

      //console.log("Nota obtenida:", note);

      return NextResponse.json(note);
    } else if (userId) {
      const [notes] = await connection.execute(
        'SELECT id, title, content, attachments, files, icon, tags, created_at, updated_at FROM notas WHERE userId = ? ORDER BY created_at DESC',
        [userId]
      );

      const formattedNotes = notes.map(note => {
        note.attachments = parseJSONSafely(note.attachments);
        note.files = parseJSONSafely(note.files);
        note.tags = parseJSONSafely(note.tags);

        return note;
      });

      //console.log("Notas obtenidas:", formattedNotes);

      return NextResponse.json(formattedNotes);
    } else {
      return NextResponse.json({ error: 'User ID or Note ID is required' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return NextResponse.json({ error: 'Error al obtener notas' }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id'); // Obtenemos el ID de la nota

    if (!noteId) {
      return NextResponse.json({ error: 'El ID de la nota es requerido' }, { status: 400 });
    }

    // Ejecutar la consulta para eliminar la nota
    const [result] = await connection.execute('DELETE FROM notas WHERE id = ?', [noteId]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Nota no encontrada o ya eliminada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Nota eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la nota:', error);
    return NextResponse.json({ error: 'Error al eliminar la nota' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, userId, title, content, attachments, files, icon, tags } = await request.json();

    console.log("Datos recibidos para actualizar:", { id, userId, title, content, attachments, files, icon, tags });

    if (!id || !userId || !title || !content) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Obtener los datos existentes de la nota
    const [existingNote] = await connection.execute(
      'SELECT files FROM notas WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (!existingNote || existingNote.length === 0) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    const existingFilesRaw = existingNote[0]?.files || '[]';
    let existingFiles = [];

    try {
      existingFiles = JSON.parse(existingFilesRaw);
      if (!Array.isArray(existingFiles)) {
        console.warn("El campo `files` no es un arreglo. Usando arreglo vacío.");
        existingFiles = [];
      }
    } catch (error) {
      console.error("Error al parsear el campo `files`:", error);
      existingFiles = [];
    }

    // Combinar los archivos existentes con los nuevos
    const updatedFiles = Array.from(new Set([...existingFiles, ...files]));

    console.log("Archivos combinados para actualizar:", updatedFiles);

    const [result] = await connection.execute(
      'UPDATE notas SET title = ?, content = ?, attachments = ?, files = ?, icon = ?, tags = ?, updated_at = NOW() WHERE id = ? AND userId = ?',
      [
        title,
        content,
        JSON.stringify(attachments), // Guardar direcciones de imágenes como JSON
        JSON.stringify(updatedFiles), // Guardar direcciones de archivos combinados como JSON
        icon,
        JSON.stringify(tags),
        id,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Nota no encontrada o no se pudo actualizar' }, { status: 404 });
    }

    console.log("Nota actualizada correctamente");

    return NextResponse.json({ success: true, message: 'Nota actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la nota:', error);
    return NextResponse.json({ error: 'Error al actualizar la nota' }, { status: 500 });
  }
}

// Función para parsear JSON de manera segura
function parseJSONSafely(data) {
  try {
    return typeof data === "string" ? JSON.parse(data) : Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn("Error parsing JSON, returning empty array:", data);
    return [];
  }
}
