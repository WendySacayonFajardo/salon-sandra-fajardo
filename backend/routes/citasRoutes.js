const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

// Rutas para citas
router.post('/', citaController.crearCita);
router.get('/', citaController.obtenerCitas);
router.get('/estadisticas', citaController.obtenerEstadisticas);
router.get('/fecha/:fecha', citaController.obtenerCitasPorFecha);
router.get('/:id', citaController.obtenerCitaPorId);
router.put('/:id', citaController.actualizarCita);
router.delete('/:id', citaController.eliminarCita);

module.exports = router;
