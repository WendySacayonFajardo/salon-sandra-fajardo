const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// Rutas para reportes y estadísticas (deben ir ANTES de las rutas con parámetros)
router.get('/estadisticas/:periodo', ventaController.obtenerEstadisticasVentas);
router.get('/top-productos/:periodo', ventaController.obtenerTopProductos);
router.get('/top-categorias/:periodo', ventaController.obtenerTopCategorias);

// Rutas para la gestión de ventas
router.get('/', ventaController.obtenerVentas);
router.get('/por-fecha', ventaController.obtenerVentasPorFecha);
router.get('/:id/detalles', ventaController.obtenerDetallesVenta);
router.post('/', ventaController.crearVenta);

module.exports = router;
