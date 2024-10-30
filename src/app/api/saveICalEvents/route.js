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

      await connection.execute(
        'INSERT INTO eventos_calendario (userId, title, start, end, color) VALUES (?, ?, ?, ?, ?)',
        [userId, event.title, eventStart, eventEnd, event.color]
      );
    }

    return NextResponse.json({ success: true, message: 'Eventos guardados correctamente' });
  } catch (error) {
    console.error('Error al guardar eventos:', error);
    return NextResponse.json({ error: 'Error al guardar eventos' }, { status: 500 });
  }
}