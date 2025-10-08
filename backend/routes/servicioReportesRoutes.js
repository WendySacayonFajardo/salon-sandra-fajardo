const express = require('express');
const router = express.Router();
const ServicioReportesController = require('../controllers/servicioReportesController');

// Rutas para reportes de servicios
router.get('/estadisticas-generales', ServicioReportesController.obtenerEstadisticasGenerales);
router.get('/mas-solicitados', ServicioReportesController.obtenerServiciosMasSolicitados);
router.get('/distribucion', ServicioReportesController.obtenerDistribucionServicios);
router.get('/analisis-precios', ServicioReportesController.obtenerAnalisisPrecios);
router.get('/por-tipo-cliente', ServicioReportesController.obtenerServiciosPorTipoCliente);

module.exports = router;
