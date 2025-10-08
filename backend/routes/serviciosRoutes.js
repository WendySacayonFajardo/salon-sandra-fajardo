// Rutas para servicios y combos - Conectadas a base de datos MySQL del Salón Sandra Fajardo
const express = require('express');
const router = express.Router();
const ServicioController = require('../controllers/servicioController');

// ===== RUTAS PÚBLICAS =====

// GET /api/servicios - Obtener todos los servicios
router.get('/', ServicioController.obtenerServicios);

// GET /api/servicios/combos - Obtener todos los combos
router.get('/combos', ServicioController.obtenerCombos);

// GET /api/servicios/:id - Obtener un servicio por ID
router.get('/:id', ServicioController.obtenerServicioPorId);

// GET /api/servicios/combos/:id - Obtener un combo por ID
router.get('/combos/:id', ServicioController.obtenerComboPorId);

module.exports = router;






