// Rutas para gestión de clientes unificados
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// GET /api/clientes/unificados - Obtener todos los clientes unificados
router.get('/unificados', clienteController.obtenerClientesUnificados);

// GET /api/clientes/estadisticas/generales - Obtener estadísticas generales
router.get('/estadisticas/generales', clienteController.obtenerEstadisticasClientes);

// GET /api/clientes/mas-frecuentes - Obtener clientes más frecuentes
router.get('/mas-frecuentes', clienteController.obtenerClientesMasFrecuentes);

// GET /api/clientes/por-periodo/:periodo - Obtener clientes por período
router.get('/por-periodo/:periodo', clienteController.obtenerClientesPorPeriodo);

// GET /api/clientes/analisis-retencion - Obtener análisis de retención
router.get('/analisis-retencion', clienteController.obtenerAnalisisRetencion);

// GET /api/clientes/tendencias-mensuales - Obtener tendencias mensuales
router.get('/tendencias-mensuales', clienteController.obtenerTendenciasClientesMensuales);

module.exports = router;
