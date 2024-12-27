// src/app/api/eventosPorCarpeta.js
import connection from '../../../../lib/db';
import { NextResponse } from 'next/server';

// Obtener eventos de un usuario para una carpeta específica
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Obtener userId y carpeta desde los parámetros de búsqueda
  const userId = searchParams.get('userId');
  const carpeta = searchParams.get('carpeta');

  if (!userId || !carpeta) {
    return NextResponse.json({ error: 'Usuario o carpeta no proporcionados' }, { status: 400 });
  }

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM eventos_calendario WHERE userId = ? AND carpeta = ?',
      [userId, carpeta]
    );
    return NextResponse.json(rows || []); // Asegúrate de devolver un array
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 });
  }
}