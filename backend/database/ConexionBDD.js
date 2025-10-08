// Instrucciones para la conexion a la base de datos MySQL
const mysql = require('mysql2');
require('dotenv').config();

//CONFIGURACION DE LA BASE DE DATOS CON POOL DE CONEXIONES
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  idleTimeout: 60000
});

// Verificar conexión
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error de Conexión a la Base de Datos:', err.message);
  } else {
    console.log('✅ Conectado a la Base de Datos MySQL con Pool de Conexiones');
    connection.release();
  }
});

module.exports = db;
