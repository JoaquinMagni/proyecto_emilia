import mysql from 'mysql2/promise';

const connection = mysql.createPool({
  host: 'localhost',  // Cambia esto si tu base de datos está en otro servidor
  user: 'root', // Tu usuario de MySQL
  password: 'root', // La contraseña de MySQL
  database: 'pruebamysql', // El nombre de la base de datos
});

export default connection;