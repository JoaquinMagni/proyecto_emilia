import connection from '../../../../lib/db';
import { NextResponse } from 'next/server';

// Obtener los eventos de un usuario
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Obtener userId desde localStorage
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Usuario no proporcionado' }, { status: 400 });
  }

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM eventos_calendario WHERE userId = ?',
      [userId]
    );
    return NextResponse.json(rows || []); // Asegúrate de devolver un array
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 });
  }
}

// Crear o actualizar un evento
export async function POST(request) {
  const { userId, title, start, end, color, carpeta, id } = await request.json();

  if (!userId || !title || !start || !end || !color || !carpeta) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  try {
    if (id) {
      // Actualizar evento existente
      const [result] = await connection.execute(
        'UPDATE eventos_calendario SET title = ?, start = ?, end = ?, color = ?, carpeta = ? WHERE id = ? AND userId = ?',
        [title, start, end, color, carpeta, id, userId]
      );
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Evento no encontrado o no autorizado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Evento actualizado correctamente' });
    } else {
      // Crear nuevo evento
      const [result] = await connection.execute(
        'INSERT INTO eventos_calendario (userId, title, start, end, color, carpeta) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, title, start, end, color, carpeta]
      );
      const newEventId = result.insertId;
      return NextResponse.json({ success: true, id: newEventId, message: 'Evento creado correctamente' });
    }
  } catch (error) {
    console.error('Error al guardar evento:', error);
    return NextResponse.json({ error: 'Error al guardar evento' }, { status: 500 });
  }
}

// Actualizar un evento
export async function PUT(request) {
  const { userId, title, start, end, color, carpeta, id } = await request.json();

  if (!userId || !title || !start || !end || !color || !carpeta || !id) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  try {
    const [result] = await connection.execute(
      'UPDATE eventos_calendario SET title = ?, start = ?, end = ?, color = ?, carpeta = ? WHERE id = ? AND userId = ?',
      [title, start, end, color, carpeta, id, userId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Evento no encontrado o no autorizado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Evento actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    return NextResponse.json({ error: 'Error al actualizar evento' }, { status: 500 });
  }
}


// Eliminar evento
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID del evento no proporcionado' }, { status: 400 });
  }

  try {
    const [result] = await connection.execute('DELETE FROM eventos_calendario WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    return NextResponse.json({ error: 'Error al eliminar evento' }, { status: 500 });
  }
}
