import connection from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { userId, title, content, attachments, icon, tags } = await request.json();
  
  console.log("Datos de la nota recibidos:", { userId, title, content, attachments, icon, tags });

  // Verificación de datos obligatorios
  if (!userId || !title || !content) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  try {
    // Insertar la nota en la base de datos
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

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const [notes] = await connection.execute(
      'SELECT id, title, content, attachments, icon, tags, created_at, updated_at FROM notas WHERE userId = ? ORDER BY created_at DESC',
      [userId]
    );

    // Convertir `attachments` y `tags` a arrays válidos
    const formattedNotes = notes.map(note => ({
      ...note,
      attachments: (() => {
        if (!note.attachments || note.attachments === 'null') return [];
        try { 
          return JSON.parse(note.attachments);
        } catch (e) { 
          console.error('Error parsing attachments:', e, 'for note id:', note.id);
          return []; 
        }
      })(),
      tags: (() => {
        if (!note.tags || note.tags === 'null') return [];
        
        // Verificar si `tags` ya es un array o si necesita ser parseado
        if (typeof note.tags === 'string') {
          try { 
            return JSON.parse(note.tags);
          } catch (e) { 
            console.error('Error parsing tags:', e, 'for note id:', note.id);
            return []; 
          }
        }
        return Array.isArray(note.tags) ? note.tags : [];
      })(),
    }));

    console.log("Formatted notes with parsed tags:", formattedNotes);

    return NextResponse.json(formattedNotes);
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return NextResponse.json({ error: 'Error al obtener notas' }, { status: 500 });
  }
}



