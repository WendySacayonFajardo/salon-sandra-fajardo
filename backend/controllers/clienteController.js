// Controlador para gestión de clientes unificados
const mysql = require('mysql2/promise');

// Obtener todos los clientes unificados (de citas + tabla clientes)
exports.obtenerClientesUnificados = async (req, res) => {
  try {
    console.log('👥 Obteniendo clientes unificados...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'salon_sf'
    });

    // Query para obtener clientes únicos de las citas con estadísticas
    const query = `
      SELECT 
        c.nombre_cliente,
        c.apellidos_cliente,
        c.telefono,
        c.correo,
        MAX(c.direccion) as direccion,
        MAX(c.foto_cliente) as foto_cliente,
        MAX(c.tipo_cliente) as tipo_cliente,
        COUNT(*) as total_citas,
        MAX(c.fecha_cita) as ultima_cita,
        MIN(c.fecha_cita) as primera_cita,
        GROUP_CONCAT(DISTINCT c.servicio_nombre SEPARATOR ', ') as servicios_solicitados,
        GROUP_CONCAT(DISTINCT c.estado SEPARATOR ', ') as estados_citas,
        GROUP_CONCAT(DISTINCT c.fecha_cita ORDER BY c.fecha_cita DESC SEPARATOR ', ') as fechas_citas
      FROM citas c 
      WHERE c.estado != 'Eliminada'
      GROUP BY c.nombre_cliente, c.apellidos_cliente, c.telefono, c.correo
      ORDER BY ultima_cita DESC, total_citas DESC
    `;

    const [rows] = await connection.execute(query);
    await connection.end();

    console.log(`✅ ${rows.length} clientes únicos obtenidos`);

    // Procesar datos para el frontend
    const clientesProcesados = rows.map(cliente => ({
      id: `${cliente.nombre_cliente}_${cliente.apellidos_cliente}_${cliente.telefono}`.replace(/\s+/g, '_'),
      nombre_completo: `${cliente.nombre_cliente} ${cliente.apellidos_cliente}`,
      nombre: cliente.nombre_cliente,
      apellidos: cliente.apellidos_cliente,
      telefono: cliente.telefono,
      correo: cliente.correo,
      direccion: cliente.direccion || '',
      foto_cliente: cliente.foto_cliente,
      tipo_cliente: cliente.tipo_cliente,
      estadisticas: {
        total_citas: cliente.total_citas,
        ultima_cita: cliente.ultima_cita,
        primera_cita: cliente.primera_cita,
        servicios_solicitados: cliente.servicios_solicitados ? cliente.servicios_solicitados.split(', ') : [],
        estados_citas: cliente.estados_citas ? cliente.estados_citas.split(', ') : [],
        fechas_citas: cliente.fechas_citas ? cliente.fechas_citas.split(', ') : []
      }
    }));

    res.json({
      success: true,
      data: clientesProcesados,
      total: clientesProcesados.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo clientes unificados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener historial de citas de un cliente específico
exports.obtenerHistorialCliente = async (req, res) => {
  try {
    const { nombre, apellidos, telefono } = req.params;
    console.log(`📋 Obteniendo historial para cliente: ${nombre} ${apellidos}`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'salon_sf'
    });

    const query = `
      SELECT 
        id_cita,
        fecha_cita,
        hora_cita,
        servicio_nombre,
        combo_nombre,
        estado,
        observaciones,
        foto_cliente,
        fecha_registro
      FROM citas 
      WHERE nombre_cliente = ? AND apellidos_cliente = ? AND telefono = ?
      ORDER BY fecha_cita DESC, hora_cita DESC
    `;

    const [rows] = await connection.execute(query, [nombre, apellidos, telefono]);
    await connection.end();

    console.log(`✅ ${rows.length} citas encontradas para el cliente`);

    res.json({
      success: true,
      data: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo historial del cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener estadísticas de un cliente específico
exports.obtenerEstadisticasCliente = async (req, res) => {
  try {
    const { nombre, apellidos, telefono } = req.params;
    console.log(`📊 Obteniendo estadísticas para cliente: ${nombre} ${apellidos}`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'salon_sf'
    });

    const query = `
      SELECT 
        COUNT(*) as total_citas,
        COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as citas_completadas,
        COUNT(CASE WHEN estado = 'Cancelada' THEN 1 END) as citas_canceladas,
        COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as citas_pendientes,
        COUNT(CASE WHEN estado = 'Confirmada' THEN 1 END) as citas_confirmadas,
        MAX(fecha_cita) as ultima_cita,
        MIN(fecha_cita) as primera_cita,
        GROUP_CONCAT(DISTINCT servicio_nombre SEPARATOR ', ') as servicios_unicos,
        COUNT(DISTINCT servicio_nombre) as servicios_diferentes,
        AVG(CASE WHEN estado = 'Completada' THEN 1 ELSE 0 END) * 100 as porcentaje_asistencia
      FROM citas 
      WHERE nombre_cliente = ? AND apellidos_cliente = ? AND telefono = ?
    `;

    const [rows] = await connection.execute(query, [nombre, apellidos, telefono]);
    await connection.end();

    const estadisticas = rows[0];

    res.json({
      success: true,
      data: {
        total_citas: estadisticas.total_citas,
        citas_completadas: estadisticas.citas_completadas,
        citas_canceladas: estadisticas.citas_canceladas,
        citas_pendientes: estadisticas.citas_pendientes,
        citas_confirmadas: estadisticas.citas_confirmadas,
        ultima_cita: estadisticas.ultima_cita,
        primera_cita: estadisticas.primera_cita,
        servicios_unicos: estadisticas.servicios_unicos ? estadisticas.servicios_unicos.split(', ') : [],
        servicios_diferentes: estadisticas.servicios_diferentes,
        porcentaje_asistencia: Math.round(estadisticas.porcentaje_asistencia || 0)
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Buscar clientes por criterios
exports.buscarClientes = async (req, res) => {
  try {
    const { termino, tipo } = req.query;
    console.log(`🔍 Buscando clientes: "${termino}" tipo: "${tipo}"`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'salon_sf'
    });

    let query = `
      SELECT 
        c.nombre_cliente,
        c.apellidos_cliente,
        c.telefono,
        c.correo,
        MAX(c.direccion) as direccion,
        MAX(c.foto_cliente) as foto_cliente,
        MAX(c.tipo_cliente) as tipo_cliente,
        COUNT(*) as total_citas,
        MAX(c.fecha_cita) as ultima_cita
      FROM citas c 
      WHERE c.estado != 'Eliminada'
    `;

    const params = [];

    if (termino) {
      query += ` AND (
        c.nombre_cliente LIKE ? OR 
        c.apellidos_cliente LIKE ? OR 
        c.telefono LIKE ? OR 
        c.correo LIKE ?
      )`;
      const terminoBusqueda = `%${termino}%`;
      params.push(terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda);
    }

    if (tipo && tipo !== 'todos') {
      query += ` AND c.tipo_cliente = ?`;
      params.push(tipo);
    }

    query += `
      GROUP BY c.nombre_cliente, c.apellidos_cliente, c.telefono, c.correo
      ORDER BY ultima_cita DESC, total_citas DESC
      LIMIT 50
    `;

    const [rows] = await connection.execute(query, params);
    await connection.end();

    console.log(`✅ ${rows.length} clientes encontrados en la búsqueda`);

    const clientesProcesados = rows.map(cliente => ({
      id: `${cliente.nombre_cliente}_${cliente.apellidos_cliente}_${cliente.telefono}`.replace(/\s+/g, '_'),
      nombre_completo: `${cliente.nombre_cliente} ${cliente.apellidos_cliente}`,
      nombre: cliente.nombre_cliente,
      apellidos: cliente.apellidos_cliente,
      telefono: cliente.telefono,
      correo: cliente.correo,
      direccion: cliente.direccion || '',
      foto_cliente: cliente.foto_cliente,
      tipo_cliente: cliente.tipo_cliente,
      total_citas: cliente.total_citas,
      ultima_cita: cliente.ultima_cita
    }));

    res.json({
      success: true,
      data: clientesProcesados,
      total: clientesProcesados.length,
      termino: termino,
      tipo: tipo
    });

  } catch (error) {
    console.error('❌ Error buscando clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener estadísticas de clientes nuevos por período
exports.obtenerClientesNuevos = async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query; // mes, semana, año
    console.log(`📈 Obteniendo clientes nuevos para período: ${periodo}`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'salon_sf'
    });

    let fechaInicio, grupoBy;
    
    switch (periodo) {
      case 'semana':
        fechaInicio = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
        grupoBy = 'DATE(fecha_cita)';
        break;
      case 'año':
        fechaInicio = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        grupoBy = 'MONTH(fecha_cita)';
        break;
      default: // mes
        fechaInicio = 'DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        grupoBy = 'DATE(fecha_cita)';
    }
    
    // Modificar para incluir datos de 2024 en adelante
    const query = `
      SELECT 
        ${grupoBy} as periodo,
        COUNT(DISTINCT CONCAT(nombre_cliente, apellidos_cliente, telefono)) as clientes_nuevos
      FROM citas 
      WHERE fecha_cita >= '2024-01-01'
        AND estado != 'Eliminada'
      GROUP BY ${grupoBy}
      ORDER BY periodo ASC
    `;
    
    const [rows] = await connection.execute(query);
    await connection.end();

    console.log(`✅ ${rows.length} períodos de clientes nuevos obtenidos`);

    res.json({
      success: true,
      data: rows,
      periodo: periodo
    });

  } catch (error) {
    console.error('❌ Error obteniendo clientes nuevos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener clientes frecuentes
exports.obtenerClientesFrecuentes = async (req, res) => {
  try {
    const { limite = 10 } = req.query;
    console.log(`⭐ Obteniendo top ${limite} clientes frecuentes`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'salon_sf'
    });
    
    const limiteNumero = parseInt(limite) || 10;
    console.log(`🔢 Límite procesado: ${limiteNumero} (tipo: ${typeof limiteNumero})`);
    
    const query = `
      SELECT 
        nombre_cliente,
        apellidos_cliente,
        telefono,
        correo,
        COUNT(*) as total_citas,
        MAX(fecha_cita) as ultima_cita,
        MIN(fecha_cita) as primera_cita,
        GROUP_CONCAT(DISTINCT servicio_nombre SEPARATOR ', ') as servicios_solicitados,
        COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as citas_completadas,
        COUNT(CASE WHEN estado = 'Cancelada' THEN 1 END) as citas_canceladas
      FROM citas 
      WHERE estado != 'Eliminada' AND fecha_cita >= '2024-01-01'
      GROUP BY nombre_cliente, apellidos_cliente, telefono, correo
      ORDER BY total_citas DESC, ultima_cita DESC
      LIMIT ${limiteNumero}
    `;
    
    const [rows] = await connection.execute(query);
    await connection.end();

    console.log(`✅ ${rows.length} clientes frecuentes obtenidos`);

    const clientesFrecuentes = rows.map(cliente => ({
      nombre_completo: `${cliente.nombre_cliente} ${cliente.apellidos_cliente}`,
      telefono: cliente.telefono,
      correo: cliente.correo,
      total_citas: cliente.total_citas,
      ultima_cita: cliente.ultima_cita,
      primera_cita: cliente.primera_cita,
      servicios_solicitados: cliente.servicios_solicitados ? cliente.servicios_solicitados.split(', ') : [],
      citas_completadas: cliente.citas_completadas,
      citas_canceladas: cliente.citas_canceladas,
      porcentaje_asistencia: Math.round((cliente.citas_completadas / cliente.total_citas) * 100)
    }));

    res.json({
      success: true,
      data: clientesFrecuentes
    });

  } catch (error) {
    console.error('❌ Error obteniendo clientes frecuentes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener estadísticas generales de clientes
exports.obtenerEstadisticasGenerales = async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas generales de clientes');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'salon_sf'
    });
    
    const query = `
      SELECT 
        COUNT(DISTINCT CONCAT(nombre_cliente, apellidos_cliente, telefono)) as total_clientes,
        COUNT(DISTINCT CASE WHEN fecha_cita >= '2024-01-01' THEN CONCAT(nombre_cliente, apellidos_cliente, telefono) END) as clientes_mes_actual,
        COUNT(DISTINCT CASE WHEN fecha_cita >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN CONCAT(nombre_cliente, apellidos_cliente, telefono) END) as clientes_semana_actual,
        COUNT(*) as total_citas,
        COUNT(CASE WHEN fecha_cita >= '2024-01-01' THEN 1 END) as citas_mes_actual,
        COUNT(CASE WHEN fecha_cita >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as citas_semana_actual,
        COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as citas_completadas,
        COUNT(CASE WHEN estado = 'Cancelada' THEN 1 END) as citas_canceladas,
        COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as citas_pendientes,
        AVG(citas_por_cliente) as promedio_citas_cliente
      FROM citas c
      LEFT JOIN (
        SELECT 
          CONCAT(nombre_cliente, apellidos_cliente, telefono) as cliente_key,
          COUNT(*) as citas_por_cliente
        FROM citas 
        WHERE estado != 'Eliminada' AND fecha_cita >= '2024-01-01'
        GROUP BY nombre_cliente, apellidos_cliente, telefono
      ) stats ON CONCAT(c.nombre_cliente, c.apellidos_cliente, c.telefono) = stats.cliente_key
      WHERE c.estado != 'Eliminada' AND c.fecha_cita >= '2024-01-01'
    `;
    
    const [rows] = await connection.execute(query);
    await connection.end();

    const estadisticas = rows[0];

    res.json({
      success: true,
      data: {
        total_clientes: estadisticas.total_clientes,
        clientes_mes_actual: estadisticas.clientes_mes_actual,
        clientes_semana_actual: estadisticas.clientes_semana_actual,
        total_citas: estadisticas.total_citas,
        citas_mes_actual: estadisticas.citas_mes_actual,
        citas_semana_actual: estadisticas.citas_semana_actual,
        citas_completadas: estadisticas.citas_completadas,
        citas_canceladas: estadisticas.citas_canceladas,
        citas_pendientes: estadisticas.citas_pendientes,
        promedio_citas_cliente: Math.round(estadisticas.promedio_citas_cliente || 0),
        porcentaje_asistencia: Math.round((estadisticas.citas_completadas / estadisticas.total_citas) * 100) || 0
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas generales:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};
