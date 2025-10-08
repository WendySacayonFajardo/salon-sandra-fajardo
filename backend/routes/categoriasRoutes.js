// Rutas para categorías de productos - Conectadas a base de datos MySQL
const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/productoController');

// GET /api/categorias - Obtener todas las categorías
router.get('/', ProductoController.obtenerCategorias);

module.exports = router;
