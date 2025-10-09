const express = require('express');
const router = express.Router();
const ServicioReportesController = require('../controllers/servicioReportesController');

// Rutas para reportes de servicios
router.get('/estadisticas-generales', ServicioReportesController.obtenerEstadisticasGenerales);
router.get('/por-servicio', ServicioReportesController.obtenerEstadisticasPorServicio);
router.get('/mensuales', ServicioReportesController.obtenerEstadisticasMensuales);
router.get('/mas-rentables', ServicioReportesController.obtenerServiciosMasRentables);
router.get('/tendencias-diarias', ServicioReportesController.obtenerTendenciasDiarias);

module.exports = router;
