// Rutas para reportes y estadísticas de productos
const express = require('express');
const router = express.Router();
const ProductoReportesController = require('../controllers/productoReportesController');

// ===== RUTAS DE REPORTES =====

// GET /api/productos/reportes/estadisticas-generales
router.get('/estadisticas-generales', ProductoReportesController.obtenerEstadisticasGenerales);

// GET /api/productos/reportes/mas-vendidos
router.get('/mas-vendidos', ProductoReportesController.obtenerProductosMasVendidos);

// GET /api/productos/reportes/distribucion-categorias
router.get('/distribucion-categorias', ProductoReportesController.obtenerDistribucionCategorias);

// GET /api/productos/reportes/stock-bajo
router.get('/stock-bajo', ProductoReportesController.obtenerProductosStockBajo);

// GET /api/productos/reportes/analisis-precios
router.get('/analisis-precios', ProductoReportesController.obtenerAnalisisPrecios);

module.exports = router;
