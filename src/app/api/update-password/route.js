import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connection from '../../../../lib/db';

export async function POST(req) {
  const { password, token } = await req.json();

  try {
    // Buscar el usuario en la base de datos usando el token
    const [rows] = await connection.execute(
      'SELECT id, resetPasswordExpires FROM usuarios WHERE resetPasswordToken = ?',
      [token]
    );

    // Si no encuentra un usuario con el token proporcionado
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 400 });
    }

    const user = rows[0];

    // Verificar si el token ha expirado
    if (new Date() > new Date(user.resetPasswordExpires)) {
      return NextResponse.json({ message: 'El token ha expirado' }, { status: 400 });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña del usuario en la base de datos
    await connection.execute(
      'UPDATE usuarios SET contraseña = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    return NextResponse.json({ message: 'Error al actualizar la contraseña' }, { status: 500 });
  }
}