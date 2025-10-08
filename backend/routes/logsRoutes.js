const express = require('express');
const router = express.Router();
const LogsController = require('../controllers/logsController');

// Obtener estadísticas generales de todos los logs
router.get('/estadisticas-generales', LogsController.obtenerEstadisticasGenerales);

// Obtener análisis de logs de autenticación
router.get('/auth', LogsController.obtenerLogsAuth);

// Obtener análisis de logs de errores
router.get('/errores', LogsController.obtenerLogsErrores);

// Obtener análisis de logs de requests
router.get('/requests', LogsController.obtenerLogsRequests);

// Obtener análisis de logs de responses
router.get('/responses', LogsController.obtenerLogsResponses);

module.exports = router;