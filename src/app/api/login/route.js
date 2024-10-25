import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connection from '../../../../lib/db'; // Importar la conexión a la base de datos

// Clave secreta para firmar los tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura'; 

export async function POST(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: 'Usuario y contraseña son requeridos' }, { status: 400 });
  }

  try {
    // Buscar al usuario en la base de datos
    const [rows] = await connection.execute('SELECT * FROM usuarios WHERE nombre_usuario = ?', [username]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'El usuario no existe' }, { status: 401 });
    }

    const user = rows[0];

    // Verificar si la cuenta está activada
    if (!user.isActivated) {
      return NextResponse.json({ message: 'La cuenta no está activada. Revisa tu correo electrónico para activarla.' }, { status: 403 });
    }

    // Verificar la contraseña
    const isPasswordCorrect = await bcrypt.compare(password, user.contraseña);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Crear un token JWT para la sesión
    const token = jwt.sign({ id: user.id, username: user.nombre_usuario, email: user.correo }, JWT_SECRET, {
      expiresIn: '1d', // Token válido por un día
    });

    // Enviar el token y la información del usuario
    return NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: { id: user.id, username: user.nombre_usuario, email: user.correo },
      token,
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return NextResponse.json({ message: 'Error al iniciar sesión' }, { status: 500 });
  }
}
