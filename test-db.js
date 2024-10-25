const mysql = require('mysql2/promise');

const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',   // Reemplaza con tu usuario de MySQL
      password: 'root',  // Reemplaza con tu contraseña de MySQL
      database: 'pruebamysql', // Reemplaza con el nombre de tu base de datos
    });

    console.log('Conexión exitosa');
    await connection.end();
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

testConnection();