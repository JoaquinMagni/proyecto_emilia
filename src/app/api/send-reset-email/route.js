import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connection from '../../../../lib/db';
import crypto from 'crypto';

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(req) {
  const { email, username } = await req.json();
  const token = generateToken();

  try {
    // Verificar si el nombre de usuario y el correo coinciden en la base de datos
    const [rows] = await connection.execute(
      'SELECT * FROM usuarios WHERE correo = ? AND nombre_usuario = ?',
      [email, username]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dashboardadm2024@gmail.com',
        pass: 'kwxx uyby ctpj slxt',
      },
    });

    const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

    const mailOptions = {
      from: 'dashboardadm2024@gmail.com',
      to: email,
      subject: 'Restablece tu contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Restablecer Contraseña</h1>
          <p>Haz clic en el siguiente enlace para generar una nueva contraseña:</p>
          <p>
            <a href="${resetLink}" style="background-color:#4CAF50;color:white;padding:10px 20px;text-align:center;text-decoration:none;display:inline-block;font-size:16px;border-radius:4px;">
              Generar Nueva Contraseña
            </a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Guarda el token y su expiración en la base de datos
    await connection.execute(
      'UPDATE usuarios SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE correo = ?',
      [token, new Date(Date.now() + 3600000), email] // 1 hora de expiración
    );

    return NextResponse.json({ message: 'Email sent' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}