const db = require('../database/ConexionBDD');

const Cita = {
  // Crear nueva cita
  crear: (cita, callback) => {
    const query = `
      INSERT INTO citas (
        nombre_cliente, apellidos_cliente, telefono, correo, direccion,
        fecha_cita, hora_cita, servicio_id, servicio_nombre, combo_id, combo_nombre,
        tiene_tratamiento_quimico, tipo_tratamiento, largo_pelo, desea_combo,
        tipo_cliente, estado, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      cita.nombre_cliente,
      cita.apellidos_cliente,
      cita.telefono,
      cita.correo,
      cita.direccion,
      cita.fecha_cita,
      cita.hora_cita,
      cita.servicio_id,
      cita.servicio_nombre,
      cita.combo_id,
      cita.combo_nombre,
      cita.tiene_tratamiento_quimico,
      cita.tipo_tratamiento,
      cita.largo_pelo,
      cita.desea_combo,
      cita.tipo_cliente,
      cita.estado,
      cita.observaciones
    ];
    
    db.query(query, values, callback);
  },

  // Obtener todas las citas
  obtenerTodas: (callback) => {
    const query = `
      SELECT 
        id_cita, nombre_cliente, apellidos_cliente, telefono, correo, direccion,
        fecha_cita, hora_cita, servicio_id, servicio_nombre, combo_id, combo_nombre,
        tiene_tratamiento_quimico, tipo_tratamiento, largo_pelo, desea_combo,
        tipo_cliente, estado, observaciones, fecha_registro, fecha_modificacion
      FROM citas 
      WHERE estado != 'Eliminada'
      ORDER BY fecha_cita DESC, hora_cita DESC
    `;
    db.query(query, callback);
  },

  // Obtener cita por ID
  obtenerPorId: (id, callback) => {
    const query = 'SELECT * FROM citas WHERE id_cita = ? AND estado != ?';
    db.query(query, [id, 'Eliminada'], callback);
  },

  // Obtener citas por fecha
  obtenerPorFecha: (fecha, callback) => {
    const query = `
      SELECT * FROM citas 
      WHERE fecha_cita = ? AND estado != 'Eliminada'
      ORDER BY hora_cita ASC
    `;
    db.query(query, [fecha], callback);
  },

  // Obtener citas por estado
  obtenerPorEstado: (estado, callback) => {
    const query = 'SELECT * FROM citas WHERE estado = ? ORDER BY fecha_cita DESC';
    db.query(query, [estado], callback);
  },

  // Actualizar cita
  actualizar: (id, cita, callback) => {
    const query = `
      UPDATE citas SET 
        nombre_cliente = ?, apellidos_cliente = ?, telefono = ?, correo = ?, 
        direccion = ?, fecha_cita = ?, hora_cita = ?, servicio_id = ?, 
        servicio_nombre = ?, combo_id = ?, combo_nombre = ?,
        tiene_tratamiento_quimico = ?, tipo_tratamiento = ?, largo_pelo = ?, 
        desea_combo = ?, tipo_cliente = ?, estado = ?, observaciones = ?,
        fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id_cita = ?
    `;
    
    const values = [
      cita.nombre_cliente,
      cita.apellidos_cliente,
      cita.telefono,
      cita.correo,
      cita.direccion,
      cita.fecha_cita,
      cita.hora_cita,
      cita.servicio_id,
      cita.servicio_nombre,
      cita.combo_id,
      cita.combo_nombre,
      cita.tiene_tratamiento_quimico,
      cita.tipo_tratamiento,
      cita.largo_pelo,
      cita.desea_combo,
      cita.tipo_cliente,
      cita.estado,
      cita.observaciones,
      id
    ];
    
    db.query(query, values, callback);
  },

  // Eliminar cita (borrado lógico)
  eliminar: (id, callback) => {
    const query = 'UPDATE citas SET estado = ?, fecha_modificacion = CURRENT_TIMESTAMP WHERE id_cita = ?';
    db.query(query, ['Eliminada', id], callback);
  },

  // Obtener estadísticas de citas
  obtenerEstadisticas: (callback) => {
    const query = `
      SELECT 
        COUNT(*) as total_citas,
        COUNT(CASE WHEN estado = 'Confirmada' THEN 1 END) as citas_confirmadas,
        COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as citas_pendientes,
        COUNT(CASE WHEN estado = 'Cancelada' THEN 1 END) as citas_canceladas,
        COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as citas_completadas,
        COUNT(CASE WHEN tipo_cliente = 'Frecuente' THEN 1 END) as clientes_frecuentes,
        COUNT(CASE WHEN tipo_cliente = 'Nuevo' THEN 1 END) as clientes_nuevos
      FROM citas 
      WHERE estado != 'Eliminada'
    `;
    db.query(query, callback);
  },

  // Obtener citas por rango de fechas
  obtenerPorRango: (fechaInicio, fechaFin, callback) => {
    const query = `
      SELECT * FROM citas 
      WHERE fecha_cita BETWEEN ? AND ? AND estado != 'Eliminada'
      ORDER BY fecha_cita ASC, hora_cita ASC
    `;
    db.query(query, [fechaInicio, fechaFin], callback);
  },

  // Verificar disponibilidad de horario
  verificarDisponibilidad: (fecha, hora, callback) => {
    const query = `
      SELECT COUNT(*) as ocupado 
      FROM citas 
      WHERE fecha_cita = ? AND hora_cita = ? AND estado IN ('Pendiente', 'Confirmada')
    `;
    db.query(query, [fecha, hora], callback);
  }
};

module.exports = Cita;
