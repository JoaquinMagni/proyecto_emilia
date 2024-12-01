import connection from '../../../../lib/db';
import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false, // Desactivar el body parser de Next.js para manejar streams
  },
};

export async function POST(request) {
  const { userId, title, content, attachments, icon, tags } = await request.json();
  
  console.log("Datos de la nota recibidos:", { userId, title, content, attachments, icon, tags });

  if (!userId || !title || !content) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  try {
    const [result] = await connection.execute(
      'INSERT INTO notas (userId, title, content, attachments, icon, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [userId, title, content, JSON.stringify(attachments), icon, JSON.stringify(tags)]
    );

    console.log("Nota guardada exitosamente:", { noteId: result.insertId });

    return NextResponse.json({ success: true, message: 'Nota guardada correctamente', noteId: result.insertId });
  } catch (error) {
    console.error('Error al guardar la nota:', error);
    return NextResponse.json({ error: 'Error al guardar la nota' }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const noteId = searchParams.get('id'); // Obtener el parámetro id si existe

  try {
    if (noteId) {
      const [notes] = await connection.execute(
        'SELECT id, title, content, attachments, icon, tags, created_at, updated_at FROM notas WHERE id = ? LIMIT 1',
        [noteId]
      );

      if (notes.length === 0) {
        return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
      }

      const note = notes[0];

      // Parse `attachments` y `tags` sólo si no son arreglos ya
      note.attachments = Array.isArray(note.attachments) ? note.attachments : parseJSONSafely(note.attachments);
      note.tags = Array.isArray(note.tags) ? note.tags : parseJSONSafely(note.tags);

      return NextResponse.json(note);
    } else if (userId) {
      const [notes] = await connection.execute(
        'SELECT id, title, content, attachments, icon, tags, created_at, updated_at FROM notas WHERE userId = ? ORDER BY created_at DESC',
        [userId]
      );

      const formattedNotes = notes.map(note => {
        // Verificar si `attachments` y `tags` son arreglos, si no, intentar parsearlos
        note.attachments = Array.isArray(note.attachments) ? note.attachments : parseJSONSafely(note.attachments);
        note.tags = Array.isArray(note.tags) ? note.tags : parseJSONSafely(note.tags);

        return note;
      });

      //console.log("Formatted notes with parsed tags:", formattedNotes);

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
    const { id, userId, title, content, attachments, icon, tags } = await request.json();

    //console.log("Datos recibidos para actualizar:", { id, userId, title, content, attachments, icon, tags });


    if (!id || !userId || !title || !content) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Actualizar la nota en la base de datos
    const [result] = await connection.execute(
      'UPDATE notas SET title = ?, content = ?, attachments = ?, icon = ?, tags = ?, updated_at = NOW() WHERE id = ? AND userId = ?',
      [
        title,
        content,
        JSON.stringify(attachments), // Guardar los attachments como JSON
        icon,
        JSON.stringify(tags), // Guardar las etiquetas como JSON
        id,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Nota no encontrada o no se pudo actualizar' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Nota actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la nota:', error);
    return NextResponse.json({ error: 'Error al actualizar la nota' }, { status: 500 });
  }
}

// Función para parsear JSON de manera segura o devolver un array vacío si falla
function parseJSONSafely(data) {
  try {
    //console.log("Intentando parsear JSON:", data);
    return JSON.parse(data || '[]');
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return [];
  }
}
