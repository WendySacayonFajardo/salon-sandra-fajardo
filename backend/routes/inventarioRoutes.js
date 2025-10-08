// Rutas para gestión de inventario
const express = require('express');
const router = express.Router();
const InventarioController = require('../controllers/inventarioController');

// ===== RUTAS DE INVENTARIO =====

// GET /api/inventario - Obtener inventario completo
router.get('/', InventarioController.obtenerInventarioCompleto);

// GET /api/inventario/estadisticas - Obtener estadísticas de inventario
router.get('/estadisticas', InventarioController.obtenerEstadisticasInventario);

// GET /api/inventario/:productoId/movimientos - Obtener movimientos de un producto
router.get('/:productoId/movimientos', InventarioController.obtenerMovimientosProducto);

// POST /api/inventario/movimiento - Registrar movimiento de inventario
router.post('/movimiento', InventarioController.registrarMovimiento);

// PUT /api/inventario/stock-minimo - Actualizar stock mínimo
router.put('/stock-minimo', InventarioController.actualizarStockMinimo);

// DELETE /api/inventario/:productoId - Eliminar producto (borrado lógico)
router.delete('/:productoId', InventarioController.eliminarProductoInventario);

module.exports = router;
