// Configuración de la base de datos PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión
const dbConfig = {
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'salon_user'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'salon_sf'}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Crear pool de conexiones
const db = new Pool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await db.connect();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
};

// Función para ejecutar consultas
const executeQuery = async (query, params = []) => {
  try {
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  }
};

module.exports = {
  db,
  testConnection,
  executeQuery
};
