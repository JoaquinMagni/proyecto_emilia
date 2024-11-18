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

      console.log("Formatted notes with parsed tags:", formattedNotes);

      return NextResponse.json(formattedNotes);
    } else {
      return NextResponse.json({ error: 'User ID or Note ID is required' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return NextResponse.json({ error: 'Error al obtener notas' }, { status: 500 });
  }
}

// Función para parsear JSON de manera segura o devolver un array vacío si falla
function parseJSONSafely(data) {
  try {
    console.log("Intentando parsear JSON:", data);
    return JSON.parse(data || '[]');
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return [];
  }
}
