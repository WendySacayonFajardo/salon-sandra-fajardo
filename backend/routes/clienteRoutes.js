// Rutas para gestión de clientes unificados
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// GET /api/clientes/unificados - Obtener todos los clientes unificados
router.get('/unificados', clienteController.obtenerClientesUnificados);

// GET /api/clientes/buscar - Buscar clientes por criterios (DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS)
router.get('/buscar', clienteController.buscarClientes);

// Rutas para estadísticas y gráficas (DEBEN IR ANTES DE LAS RUTAS CON PARÁMETROS)
// GET /api/clientes/estadisticas/nuevos - Obtener clientes nuevos por período
router.get('/estadisticas/nuevos', clienteController.obtenerClientesNuevos);

// GET /api/clientes/estadisticas/frecuentes - Obtener clientes frecuentes
router.get('/estadisticas/frecuentes', clienteController.obtenerClientesFrecuentes);

// GET /api/clientes/estadisticas/generales - Obtener estadísticas generales
router.get('/estadisticas/generales', clienteController.obtenerEstadisticasGenerales);

// Rutas con parámetros dinámicos (DEBEN IR AL FINAL)
// GET /api/clientes/:nombre/:apellidos/:telefono/historial - Obtener historial de citas de un cliente
router.get('/:nombre/:apellidos/:telefono/historial', clienteController.obtenerHistorialCliente);

// GET /api/clientes/:nombre/:apellidos/:telefono/estadisticas - Obtener estadísticas de un cliente
router.get('/:nombre/:apellidos/:telefono/estadisticas', clienteController.obtenerEstadisticasCliente);

module.exports = router;
