import { NextResponse } from 'next/server';
import connection from '../../../../lib/db';

export async function POST(req) {
  const { email, activationCode } = await req.json();

  try {
    // Buscar el usuario en la base de datos
    const [rows] = await connection.execute(
      'SELECT id, activationExpires FROM usuarios WHERE correo = ? AND activationCode = ? AND isActivated = false',
      [email, activationCode]
    );

    // Si no encuentra un usuario con el código y correo proporcionado
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Código de activación incorrecto o ya activado' }, { status: 400 });
    }

    const user = rows[0];

    // Verificar si el código ha expirado
    if (new Date() > new Date(user.activationExpires)) {
      return NextResponse.json({ message: 'El código de activación ha expirado' }, { status: 400 });
    }

    // Activar la cuenta del usuario y limpiar el código y su fecha de expiración
    await connection.execute(
      'UPDATE usuarios SET isActivated = true, activationCode = NULL, activationExpires = NULL WHERE id = ?',
      [user.id]
    );

    return NextResponse.json({ message: 'Cuenta activada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al activar la cuenta:', error);
    return NextResponse.json({ message: 'Error al activar la cuenta' }, { status: 500 });
  }
}
