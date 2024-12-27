import connection from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const [rows] = await connection.execute('SELECT DISTINCT carpeta FROM eventos_calendario WHERE carpeta IS NOT NULL');
    const carpetas = rows.map(row => row.carpeta);
    return NextResponse.json(carpetas);
  } catch (error) {
    console.error('Error al obtener carpetas:', error);
    return NextResponse.json({ error: 'Error al obtener carpetas' }, { status: 500 });
  }
}