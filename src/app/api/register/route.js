import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connection from '../../../../lib/db';
import sendActivationEmail from '../../../../lib/sendActivationEmail'; // Función que envía el correo de activación

// Función para generar un código de activación de 6 dígitos
function generateActivationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Genera un número entre 100000 y 999999
}

export async function POST(req) {
  const { username, password, email, firstName, lastName, birthDate, timezone, nationality, language } = await req.json();

  // Validar que todos los campos estén presentes
  if (!username || !password || !email || !firstName || !lastName || !birthDate || !timezone || !nationality || !language) {
    return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
  }

  try {
    // Verificar que el correo no esté ya registrado
    const [rows] = await connection.execute('SELECT id FROM usuarios WHERE correo = ?', [email]);
    if (rows.length > 0) {
      return NextResponse.json({ message: 'El correo ya está en uso' }, { status: 400 });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar el código de activación de 6 dígitos
    const activationCode = generateActivationCode();
    
    // Establecer la fecha de expiración del código (24 horas desde ahora)
    const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas desde la fecha actual

    // Insertar el usuario en la base de datos, con `isActivated` en false por defecto y guardar el código de activación
    await connection.execute(
      'INSERT INTO usuarios (nombre_usuario, contraseña, correo, nombre, apellido, fecha_nacimiento, zona_horaria, nacionalidad, idioma, isActivated, activationCode, activationExpires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [username, hashedPassword, email, firstName, lastName, birthDate, timezone, nationality, language, false, activationCode, activationExpires]
    );

    // Enviar el correo de activación con el enlace que incluye el código de activación
    const activationLink = `http://localhost:3000/auth/activate?token=${activationCode}`;
    await sendActivationEmail(email, activationCode); // Cambia activationLink por activationCode

    // Responder al cliente que el registro fue exitoso
    return NextResponse.json({ message: 'Usuario registrado exitosamente. Revisa tu correo para activar la cuenta.' }, { status: 201 });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    return NextResponse.json({ message: 'Error al registrar el usuario' }, { status: 500 });
  }
}
