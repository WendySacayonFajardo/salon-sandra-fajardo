// Modelo para manejar operaciones de servicios y combos en MySQL
// Usando la estructura existente del salón Sandra Fajardo
const db = require('../database/ConexionBDD');

class ServicioModel {
  
  // Obtener todos los servicios
  static async obtenerServicios() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          servicio_id as id,
          nombre,
          descripcion,
          precio_base as precio
        FROM servicios
        ORDER BY nombre ASC
      `;
      
      db.query(query, (err, rows) => {
        if (err) {
          console.error('❌ Error al obtener servicios:', err);
          reject(err);
        } else {
          console.log('✅ Servicios obtenidos de la BD:', rows.length);
          const servicios = rows.map(row => ({
            id: row.id,
            nombre: row.nombre,
            descripcion: row.descripcion,
            precio: parseFloat(row.precio)
          }));
          resolve(servicios);
        }
      });
    });
  }

  // Obtener todos los combos
  static async obtenerCombos() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          combo_id as id,
          nombre,
          descripcion,
          precio_combo as precio
        FROM combos
        ORDER BY nombre ASC
      `;
      
      db.query(query, (err, rows) => {
        if (err) {
          console.error('❌ Error al obtener combos:', err);
          reject(err);
        } else {
          console.log('✅ Combos obtenidos de la BD:', rows.length);
          const combos = rows.map(row => ({
            id: row.id,
            nombre: row.nombre,
            descripcion: row.descripcion,
            precio: parseFloat(row.precio)
          }));
          resolve(combos);
        }
      });
    });
  }

  // Obtener un servicio por ID
  static async obtenerServicioPorId(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          servicio_id as id,
          nombre,
          descripcion,
          precio_base as precio
        FROM servicios
        WHERE servicio_id = ?
      `;
      
      db.query(query, [id], (err, rows) => {
        if (err) {
          console.error('Error al obtener servicio por ID:', err);
          reject(err);
        } else if (rows.length === 0) {
          resolve(null);
        } else {
          const row = rows[0];
          resolve({
            id: row.id,
            nombre: row.nombre,
            descripcion: row.descripcion,
            precio: parseFloat(row.precio)
          });
        }
      });
    });
  }

  // Obtener un combo por ID
  static async obtenerComboPorId(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          combo_id as id,
          nombre,
          descripcion,
          precio_combo as precio
        FROM combos
        WHERE combo_id = ?
      `;
      
      db.query(query, [id], (err, rows) => {
        if (err) {
          console.error('Error al obtener combo por ID:', err);
          reject(err);
        } else if (rows.length === 0) {
          resolve(null);
        } else {
          const row = rows[0];
          resolve({
            id: row.id,
            nombre: row.nombre,
            descripcion: row.descripcion,
            precio: parseFloat(row.precio)
          });
        }
      });
    });
  }
}

module.exports = ServicioModel;
