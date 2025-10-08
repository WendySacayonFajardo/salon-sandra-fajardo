const express = require('express');
const router = express.Router();

// Importamos el controller de usuarios
const UsuarioController = require('../controllers/usuarioController');

// --- Rutas de usuarios ---
// GET /api/usuarios → obtener todos los usuarios
router.get('/', UsuarioController.obtenerUsuarios);

// POST /api/usuarios/crear → crear nuevo usuario
router.post('/crear', UsuarioController.crearUsuario);
    
// POST /api/auth/admin-login → MOVIDO A server.js para simplificar

// Exportamos las rutas para usar en server.js
module.exports = router;
