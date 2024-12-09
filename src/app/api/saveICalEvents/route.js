import connection from '../../../../lib/db';
import { NextResponse } from 'next/server';

const convertDateToMySQLFormat = (dateString) => {
  return dateString.replace("T", " ").replace(".000Z", "");
};

export async function POST(request) {
  const { userId, url, events } = await request.json();
  
  console.log("Datos recibidos:", { userId, url, events });

  if (!userId || !url || !events) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  try {
    await connection.execute(
      'INSERT INTO calendarios_ical (userId, url) VALUES (?, ?) ON DUPLICATE KEY UPDATE url = ?',
      [userId, url, url]
    );

    for (const event of events) {
      const eventStart = convertDateToMySQLFormat(event.start);
      const eventEnd = convertDateToMySQLFormat(event.end);

      console.log("Guardando evento:", { userId, title: event.title, start: eventStart, end: eventEnd, color: event.color });

      // Check if the event already exists
      const [existingEvents] = await connection.execute(
        'SELECT id FROM eventos_calendario WHERE userId = ? AND title = ? AND start = ? AND end = ?',
        [userId, event.title, eventStart, eventEnd]
      );

      if (existingEvents.length === 0) {
        // Insert the event only if it doesn't exist
        await connection.execute(
          'INSERT INTO eventos_calendario (userId, title, start, end, color) VALUES (?, ?, ?, ?, ?)',
          [userId, event.title, eventStart, eventEnd, event.color]
        );
      } else {
        console.log("Evento ya existe, no se duplica:", { userId, title: event.title, start: eventStart, end: eventEnd });
      }
    }

    return NextResponse.json({ success: true, message: 'Eventos guardados correctamente' });
  } catch (error) {
    console.error('Error al guardar eventos:', error);
    return NextResponse.json({ error: 'Error al guardar eventos' }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const [rows] = await connection.execute(
      'SELECT url FROM calendarios_ical WHERE userId = ?',
      [userId]
    );

    if (rows.length > 0) {
      return NextResponse.json({ url: rows[0].url });
    } else {
      return NextResponse.json({ url: null });
    }
  } catch (error) {
    console.error('Error retrieving iCal URL:', error);
    return NextResponse.json({ error: 'Error retrieving iCal URL' }, { status: 500 });
  }
}