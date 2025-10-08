// Controlador para reportes de servicios
const mysql = require('mysql2/promise');

class ServicioReportesController {
  // Obtener estadísticas generales de servicios
  static async obtenerEstadisticasGenerales(req, res) {
    try {
      console.log('📊 Obteniendo estadísticas generales de servicios...');

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'salon_sf'
      });

      const query = `
        SELECT 
          COUNT(DISTINCT servicio_nombre) as total_servicios_diferentes,
          COUNT(*) as total_citas_servicios,
          COUNT(CASE WHEN fecha_cita >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as citas_mes_actual,
          COUNT(CASE WHEN fecha_cita >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as citas_semana_actual,
          COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as servicios_completados,
          COUNT(CASE WHEN estado = 'Cancelada' THEN 1 END) as servicios_cancelados,
          COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as servicios_pendientes,
          AVG(precio_base) as precio_promedio_servicio
        FROM citas c
        LEFT JOIN servicios s ON c.servicio_nombre = s.nombre
        WHERE c.estado != 'Eliminada' 
          AND c.fecha_cita >= '2024-01-01'
          AND c.servicio_nombre IS NOT NULL
      `;

      const [rows] = await connection.execute(query);
      await connection.end();

      const estadisticas = rows[0];

      res.json({
        success: true,
        data: {
          total_servicios_diferentes: estadisticas.total_servicios_diferentes || 0,
          total_citas_servicios: estadisticas.total_citas_servicios || 0,
          citas_mes_actual: estadisticas.citas_mes_actual || 0,
          citas_semana_actual: estadisticas.citas_semana_actual || 0,
          servicios_completados: estadisticas.servicios_completados || 0,
          servicios_cancelados: estadisticas.servicios_cancelados || 0,
          servicios_pendientes: estadisticas.servicios_pendientes || 0,
          precio_promedio_servicio: Math.round(estadisticas.precio_promedio_servicio || 0),
          porcentaje_completados: estadisticas.total_citas_servicios > 0 
            ? Math.round((estadisticas.servicios_completados / estadisticas.total_citas_servicios) * 100)
            : 0
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de servicios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  // Obtener servicios más solicitados
  static async obtenerServiciosMasSolicitados(req, res) {
    try {
      const { limite = 10, periodo = 'todos' } = req.query;
      console.log(`🔥 Obteniendo top ${limite} servicios más solicitados para período: ${periodo}`);

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'salon_sf'
      });

      let fechaFiltro = '';
      switch (periodo) {
        case 'semana':
          fechaFiltro = "AND fecha_cita >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
          break;
        case 'mes':
          fechaFiltro = "AND fecha_cita >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
          break;
        case 'año':
          fechaFiltro = "AND fecha_cita >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
          break;
        default:
          fechaFiltro = "AND fecha_cita >= '2024-01-01'";
      }

      const query = `
        SELECT 
          servicio_nombre,
          COUNT(*) as total_solicitudes,
          COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as completadas,
          COUNT(CASE WHEN estado = 'Cancelada' THEN 1 END) as canceladas,
          COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as pendientes,
          AVG(s.precio_base) as precio_promedio,
          MAX(fecha_cita) as ultima_solicitud,
          MIN(fecha_cita) as primera_solicitud
        FROM citas c
        LEFT JOIN servicios s ON c.servicio_nombre = s.nombre
        WHERE c.estado != 'Eliminada' 
          AND c.servicio_nombre IS NOT NULL
          ${fechaFiltro}
        GROUP BY servicio_nombre
        ORDER BY total_solicitudes DESC
        LIMIT ${parseInt(limite) || 10}
      `;

      const [rows] = await connection.execute(query);
      await connection.end();

      const serviciosMasSolicitados = rows.map(servicio => ({
        nombre: servicio.servicio_nombre,
        total_solicitudes: servicio.total_solicitudes,
        completadas: servicio.completadas,
        canceladas: servicio.canceladas,
        pendientes: servicio.pendientes,
        precio_promedio: Math.round(servicio.precio_promedio || 0),
        ingresos_totales: Math.round((servicio.precio_promedio || 0) * servicio.total_solicitudes),
        ultima_solicitud: servicio.ultima_solicitud,
        primera_solicitud: servicio.primera_solicitud,
        porcentaje_completadas: servicio.total_solicitudes > 0 
          ? Math.round((servicio.completadas / servicio.total_solicitudes) * 100)
          : 0
      }));

      res.json({
        success: true,
        data: serviciosMasSolicitados,
        periodo: periodo
      });

    } catch (error) {
      console.error('❌ Error obteniendo servicios más solicitados:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  // Obtener distribución de servicios por período
  static async obtenerDistribucionServicios(req, res) {
    try {
      const { periodo = 'mes' } = req.query;
      console.log(`📈 Obteniendo distribución de servicios para período: ${periodo}`);

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'salon_sf'
      });

      let grupoBy, fechaFiltro;
      switch (periodo) {
        case 'semana':
          grupoBy = 'DATE(fecha_cita)';
          fechaFiltro = "AND fecha_cita >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
          break;
        case 'año':
          grupoBy = 'MONTH(fecha_cita)';
          fechaFiltro = "AND fecha_cita >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
          break;
        default: // mes
          grupoBy = 'DATE(fecha_cita)';
          fechaFiltro = "AND fecha_cita >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      }

      const query = `
        SELECT 
          ${grupoBy} as periodo,
          COUNT(*) as total_servicios,
          COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as servicios_completados,
          COUNT(CASE WHEN estado = 'Cancelada' THEN 1 END) as servicios_cancelados,
          COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as servicios_pendientes
        FROM citas 
        WHERE estado != 'Eliminada' 
          AND servicio_nombre IS NOT NULL
          ${fechaFiltro}
        GROUP BY ${grupoBy}
        ORDER BY periodo ASC
      `;

      const [rows] = await connection.execute(query);
      await connection.end();

      res.json({
        success: true,
        data: rows,
        periodo: periodo
      });

    } catch (error) {
      console.error('❌ Error obteniendo distribución de servicios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  // Obtener análisis de precios de servicios
  static async obtenerAnalisisPrecios(req, res) {
    try {
      console.log('💰 Obteniendo análisis de precios de servicios...');

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'salon_sf'
      });

      const query = `
        SELECT 
          servicio_nombre,
          AVG(s.precio_base) as precio_promedio,
          MIN(s.precio_base) as precio_minimo,
          MAX(s.precio_base) as precio_maximo,
          COUNT(*) as total_solicitudes,
          SUM(s.precio_base) as ingresos_totales
        FROM citas c
        LEFT JOIN servicios s ON c.servicio_nombre = s.nombre
        WHERE c.estado != 'Eliminada' 
          AND c.servicio_nombre IS NOT NULL
          AND c.fecha_cita >= '2024-01-01'
          AND s.precio_base IS NOT NULL
        GROUP BY servicio_nombre, s.precio_base
        ORDER BY ingresos_totales DESC
        LIMIT 15
      `;

      const [rows] = await connection.execute(query);
      await connection.end();

      const analisisPrecios = rows.map(servicio => ({
        nombre: servicio.servicio_nombre,
        precio_promedio: Math.round(servicio.precio_promedio || 0),
        precio_minimo: Math.round(servicio.precio_minimo || 0),
        precio_maximo: Math.round(servicio.precio_maximo || 0),
        total_solicitudes: servicio.total_solicitudes,
        ingresos_totales: Math.round(servicio.ingresos_totales || 0)
      }));

      res.json({
        success: true,
        data: analisisPrecios
      });

    } catch (error) {
      console.error('❌ Error obteniendo análisis de precios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  // Obtener servicios por tipo de cliente
  static async obtenerServiciosPorTipoCliente(req, res) {
    try {
      console.log('👥 Obteniendo servicios por tipo de cliente...');

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'salon_sf'
      });

      const query = `
        SELECT 
          tipo_cliente,
          servicio_nombre,
          COUNT(*) as total_solicitudes,
          COUNT(CASE WHEN estado = 'Completada' THEN 1 END) as completadas,
          AVG(s.precio_base) as precio_promedio
        FROM citas c
        LEFT JOIN servicios s ON c.servicio_nombre = s.nombre
        WHERE c.estado != 'Eliminada' 
          AND c.servicio_nombre IS NOT NULL
          AND c.fecha_cita >= '2024-01-01'
        GROUP BY tipo_cliente, servicio_nombre
        ORDER BY tipo_cliente, total_solicitudes DESC
      `;

      const [rows] = await connection.execute(query);
      await connection.end();

      // Agrupar por tipo de cliente
      const serviciosPorTipo = {};
      rows.forEach(row => {
        if (!serviciosPorTipo[row.tipo_cliente]) {
          serviciosPorTipo[row.tipo_cliente] = [];
        }
        serviciosPorTipo[row.tipo_cliente].push({
          nombre: row.servicio_nombre,
          total_solicitudes: row.total_solicitudes,
          completadas: row.completadas,
          precio_promedio: Math.round(row.precio_promedio || 0),
          porcentaje_completadas: row.total_solicitudes > 0 
            ? Math.round((row.completadas / row.total_solicitudes) * 100)
            : 0
        });
      });

      res.json({
        success: true,
        data: serviciosPorTipo
      });

    } catch (error) {
      console.error('❌ Error obteniendo servicios por tipo de cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
}

module.exports = ServicioReportesController;
