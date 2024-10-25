import nodemailer from 'nodemailer';

// Configuración de nodemailer para Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dashboardadm2024@gmail.com',
    pass: 'kwxx uyby ctpj slxt', // Contraseña de aplicación generada por Google
  },
});

const sendActivationEmail = async (email, token) => {
    // Enlace de activación sin el token
    const activationLink = `http://localhost:3000/auth/activate?email=${encodeURIComponent(email)}&token=${token}`;
  
    const mailOptions = {
        from: 'dashboardadm2024@gmail.com',
        to: email,
        subject: 'Activa tu cuenta',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h1>Gracias por registrarte en Modernize</h1>
            <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
            <p>
              <a href="${activationLink}" style="background-color:#4CAF50;color:white;padding:10px 20px;text-align:center;text-decoration:none;display:inline-block;font-size:16px;border-radius:4px;">
                Activar cuenta
              </a>
            </p>
            <p>O usa este código de activación:</p>
            <h2 style="text-align:center;">${token}</h2>
            <p>Copia y pega este código en la página de activación.</p>
            <p>Este enlace y código expiran en 24 horas.</p>
          </div>
        `,
      };
  
    // Enviar el correo
    await transporter.sendMail(mailOptions);
  };

export default sendActivationEmail;
