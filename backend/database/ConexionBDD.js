// Instrucciones para la conexión a la base de datos PostgreSQL
const { db } = require('../config/database');
require('dotenv').config();

// Exportar la conexión para compatibilidad
module.exports = db;
