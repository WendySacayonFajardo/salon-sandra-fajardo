// Servidor principal del Salón Sandra Fajardo
// Este archivo configura y arranca el servidor Express con todos los middlewares organizados

// Importar dependencias principales
const express = require('express');
const path = require('path');
require('dotenv').config();

// Importar middlewares organizados
const middlewares = require('../middlewares');

// Importar rutas
const usuarioRoutes = require('../routes/usuarioRoutes');
const verificacionRoutes = require('../routes/verificacionRoutes');
const productosRoutes = require('../routes/productosRoutes');
const categoriasRoutes = require('../routes/categoriasRoutes');
const carritoRoutes = require('../routes/carritoRoutes');
const serviciosRoutes = require('../routes/serviciosRoutes');
const uploadRoutes = require('../routes/uploadRoutes');
const clienteRoutes = require('../routes/clienteRoutes');

// Importar controladores
const usuarioController = require('../controllers/usuarioController');

// Crear instancia de Express
const app = express();
const PORT = process.env.PORT || 4000;

// ===============================
// CONFIGURACIÓN DE MIDDLEWARES
// ===============================

// Middleware de seguridad
app.use(middlewares.security.helmetConfig);
app.use(require('cors')(middlewares.security.corsConfig));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    // Configuración permisiva para desarrollo
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Middleware de sanitización
app.use(middlewares.security.sanitizeInput);

// Middleware de logging - TEMPORALMENTE COMENTADO PARA DEBUGGING
// app.use(middlewares.logging.logRequests);
// app.use(middlewares.logging.logResponses);
// app.use(middlewares.logging.logAuth);
// app.use(middlewares.logging.logAdminActivity);
// app.use(middlewares.logging.logSecurity);

// Rutas para logs - TEMPORALMENTE COMENTADO PARA DEBUGGING
// app.use('/api/', middlewares.security.apiRateLimiter);
// app.use('/api/auth/login', middlewares.security.authRateLimiter);
// app.use('/api/auth/admin-login', middlewares.security.authRateLimiter);
// app.use('/api/auth/registro', middlewares.security.registerRateLimiter);

// ===============================
// RUTAS PRINCIPALES
// ===============================

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    mensaje: '🟢 API del Salón Sandra Fajardo funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      productos: '/api/productos',
      carrito: '/api/carrito',
      categorias: '/api/categorias',
      usuarios: '/api/usuarios',
      verificacion: '/api/verificacion',
      auth: '/api/auth',
      admin: '/api/admin',
      citas: '/api/citas',
      stock: '/api/stock'
    }
  });
});

// ===============================
// RUTA PARA COMBOS (FALTANTE)
// ===============================

// GET /api/servicios/combos
app.get('/api/servicios/combos', (req, res) => {
  const combos = [
    {
      id: 1,
      nombre: 'Combo Spa Completo',
      descripcion: 'Incluye manicure, pedicure y tratamiento facial',
      precio: 65.00,
      serviciosIncluidos: ['Manicure', 'Pedicure', 'Tratamiento Facial'],
      duracion: 180
    },
    {
      id: 2,
      nombre: 'Combo Belleza Express',
      descripcion: 'Corte de cabello y manicure rápida',
      precio: 35.00,
      serviciosIncluidos: ['Corte de Cabello', 'Manicure Express'],
      duracion: 90
    },
    {
      id: 3,
      nombre: 'Combo Novia Premium',
      descripcion: 'Paquete completo para novias con peinado y maquillaje profesional',
      precio: 120.00,
      serviciosIncluidos: ['Peinado', 'Maquillaje', 'Manicure', 'Pedicure'],
      duracion: 240
    },
    {
      id: 4,
      nombre: 'Combo Relax',
      descripcion: 'Masaje relajante y tratamiento capilar',
      precio: 55.00,
      serviciosIncluidos: ['Masaje Relajante', 'Tratamiento Capilar'],
      duracion: 120
    },
    {
      id: 5,
      nombre: 'Combo Familiar',
      descripcion: 'Servicios para toda la familia con descuento especial',
      precio: 85.00,
      serviciosIncluidos: ['2 Cortes', '1 Manicure', '1 Pedicure'],
      duracion: 150
    }
  ];

  middlewares.error.enviarRespuestaExito(res, combos);
});


// ===============================
// RUTAS DE API
// ===============================

// Rutas de usuarios y autenticación
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/verificacion', verificacionRoutes);

// Rutas de productos y comercio
app.use('/api/productos', productosRoutes);
app.use('/api/productos/reportes', require('../routes/productoReportesRoutes'));
app.use('/api/categorias', categoriasRoutes);
app.use('/api/inventario', require('../routes/inventarioRoutes'));
app.use('/api/carrito', carritoRoutes);

// Rutas de servicios y combos
app.use('/api/servicios', serviciosRoutes);
app.use('/api/servicios/reportes', require('../routes/servicioReportesRoutes'));
app.use('/api/upload', uploadRoutes);

// Rutas de análisis de logs
app.use('/api/logs', require('../routes/logsRoutes'));

// Rutas de citas
const citasRoutes = require('../routes/citasRoutes');
app.use('/api/citas', citasRoutes);

// Rutas de ventas
const ventasRoutes = require('../routes/ventasRoutes');
app.use('/api/ventas', ventasRoutes);

// Rutas de clientes
app.use('/api/clientes', clienteRoutes);

// Rutas de autenticación - ELIMINADO (se implementará directamente)

// ===============================
// RUTAS DE AUTENTICACIÓN
// ===============================

// Ruta de registro (compatibilidad con frontend)
app.post('/api/registro', 
  middlewares.validation.validacionesAuth.registro,
  middlewares.validation.procesarValidacion,
  middlewares.error.capturarErroresAsync(async (req, res) => {
    await usuarioController.crearUsuario(req, res);
  })
);

// Ruta de login de usuarios
app.post('/api/auth/login',
  middlewares.validation.validacionesAuth.login,
  middlewares.validation.procesarValidacion,
  middlewares.error.capturarErroresAsync(async (req, res) => {
    const { email, password } = req.body;
    
    // Buscar usuario en la base de datos
    const usuarioModel = require('../models/usuarioModel');
    const usuario = await usuarioModel.buscarPorCredenciales(email, password);
    
    if (!usuario) {
      return middlewares.error.enviarRespuestaError(
        res, 
        'Credenciales inválidas', 
        'INVALID_CREDENTIALS', 
        401
      );
    }
    
    // Generar JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        rol: usuario.rol 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Enviar correo de confirmación de inicio de sesión
    try {
      const emailService = require('../services/emailService');
      const fechaHora = new Date().toLocaleString('es-GT', {
        timeZone: 'America/Guatemala',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Enviar correo de forma asíncrona (no bloquea la respuesta)
      emailService.enviarCorreoInicioSesion(
        usuario.email, 
        usuario.nombre, 
        fechaHora
      ).then(result => {
        if (result.success) {
          console.log('✅ Correo de inicio de sesión enviado a:', usuario.email);
        } else {
          console.error('❌ Error enviando correo de inicio de sesión:', result.error);
        }
      }).catch(error => {
        console.error('❌ Error en envío de correo de inicio de sesión:', error);
      });
      
    } catch (error) {
      console.error('❌ Error preparando correo de inicio de sesión:', error);
      // No fallar el login si el correo no se puede enviar
    }
    
    middlewares.error.enviarRespuestaExito(res, {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      },
      token
    }, 'Login exitoso');
  })
);

// ===============================
// RUTA DE LOGIN DE ADMINISTRADOR
// ===============================
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    console.log('🔐 Intentando login admin...');
    
    // Extraer email y password del cuerpo de la petición
    const { email, password } = req.body;
    
    // Validar que se envíen los datos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email y contraseña son requeridos' 
      });
    }
    
    console.log('📧 Email recibido:', email);
    
    // Importar el modelo de usuario
    const Usuario = require('../models/usuarioModel');
    
    // Buscar usuario por email en la base de datos
    Usuario.buscarPorEmail(email, async (err, results) => {
      if (err) {
        console.error('❌ Error en base de datos:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Error interno del servidor' 
        });
      }
      
      // Verificar si se encontró el usuario
      if (!results || results.length === 0) {
        console.log('❌ Usuario no encontrado:', email);
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales inválidas' 
        });
      }
      
      const usuario = results[0];
      console.log('✅ Usuario encontrado:', usuario.email);
      
      // Importar bcrypt para comparar contraseñas
      const bcrypt = require('bcryptjs');
      
      // Comparar la contraseña enviada con la almacenada (hasheada)
      const passwordValida = await bcrypt.compare(password, usuario.contrasena);
      
      if (!passwordValida) {
        console.log('❌ Contraseña incorrecta');
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales inválidas' 
        });
      }
      
      console.log('✅ Contraseña válida');
      
      // Importar jwt para generar token
      const jwt = require('jsonwebtoken');
      
      // Generar token JWT con los datos del usuario
      const token = jwt.sign(
        { 
          id: usuario.id_usuario, 
          email: usuario.email, 
          rol: usuario.rol || 'admin' // Usar 'admin' por defecto si no hay rol
        },
        process.env.JWT_SECRET || 'fallback_secret', // Usar secret del .env o uno por defecto
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } // Token válido por 24 horas
      );
      
      console.log('✅ Token generado exitosamente');
      
      // Enviar correo de confirmación de inicio de sesión para admin
      try {
        const emailService = require('../services/emailService');
        const fechaHora = new Date().toLocaleString('es-GT', {
          timeZone: 'America/Guatemala',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        // Enviar correo de forma asíncrona (no bloquea la respuesta)
        emailService.enviarCorreoInicioSesion(
          usuario.email, 
          usuario.nombre, 
          fechaHora
        ).then(result => {
          if (result.success) {
            console.log('✅ Correo de inicio de sesión admin enviado a:', usuario.email);
          } else {
            console.error('❌ Error enviando correo de inicio de sesión admin:', result.error);
          }
        }).catch(error => {
          console.error('❌ Error en envío de correo de inicio de sesión admin:', error);
        });
        
      } catch (error) {
        console.error('❌ Error preparando correo de inicio de sesión admin:', error);
        // No fallar el login si el correo no se puede enviar
      }
      
      // Enviar respuesta exitosa con token y datos del usuario
      res.json({
        success: true,
        token: token,
        usuario: {
          id: usuario.id_usuario,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol || 'admin'
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error en login admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// ===============================
// RUTAS DE SERVICIOS
// ===============================

// Ruta del carrito eliminada - ahora se maneja por carritoRoutes

// Ruta para servicios (evitar error 404)
app.get('/api/servicios', (req, res) => {
  const servicios = [
    {
      id: 1,
      nombre: 'Corte de Cabello',
      descripcion: 'Corte profesional personalizado',
      precio: 15.00,
      duracion: 60
    },
    {
      id: 2,
      nombre: 'Peinado',
      descripcion: 'Peinado para ocasiones especiales',
      precio: 25.00,
      duracion: 90
    },
    {
      id: 3,
      nombre: 'Tinte y Coloración',
      descripcion: 'Coloración profesional del cabello',
      precio: 45.00,
      duracion: 120
    },
    {
      id: 4,
      nombre: 'Manicure',
      descripcion: 'Manicure completa con esmaltado',
      precio: 20.00,
      duracion: 60
    },
    {
      id: 5,
      nombre: 'Pedicure',
      descripcion: 'Pedicure completa con esmaltado',
      precio: 25.00,
      duracion: 75
    }
  ];

  middlewares.error.enviarRespuestaExito(res, servicios);
});

// ===============================
// RUTAS DE ADMINISTRACIÓN
// ===============================

// Ruta para obtener estadísticas del dashboard
app.get('/api/admin/dashboard', 
  middlewares.auth.verificarToken,
  middlewares.auth.verificarAdmin,
  middlewares.error.capturarErroresAsync(async (req, res) => {
    // Datos de ejemplo para el dashboard
    const estadisticas = {
      totalProductos: 6,
      totalUsuarios: 1,
      totalVentas: 0,
      totalCitas: 0,
      productosBajoStock: 0,
      ventasDelMes: 0,
      clientesNuevos: 0
    };

    middlewares.error.enviarRespuestaExito(res, estadisticas);
  })
);

// ===============================
// RUTAS DE CITAS
// ===============================

// Obtener todas las citas
app.get('/api/citas',
  middlewares.auth.verificarToken,
  middlewares.error.capturarErroresAsync(async (req, res) => {
    // Datos de ejemplo para citas
    const citas = [
      {
        id: '1',
        nombre: 'María González',
        email: 'maria@email.com',
        telefono: '+502 1234-5678',
        fecha: '2024-01-25',
        hora: '10:00',
        servicio: 'Corte y Peinado',
        tipoCliente: 'frecuente',
        estado: 'confirmada',
        notas: 'Cliente regular, prefiere cortes cortos',
        fechaCreacion: '2024-01-20T10:30:00Z'
      }
    ];

    middlewares.error.enviarRespuestaExito(res, citas);
  })
);

// Crear nueva cita
app.post('/api/citas',
  middlewares.auth.verificarToken,
  middlewares.validation.validacionesCitas.crear,
  middlewares.validation.procesarValidacion,
  middlewares.error.capturarErroresAsync(async (req, res) => {
    const nuevaCita = {
      id: Date.now().toString(),
      ...req.body,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    middlewares.error.enviarRespuestaExito(res, nuevaCita, 'Cita creada exitosamente', 201);
  })
);

// ===============================
// RUTAS DE STOCK
// ===============================

// Obtener todo el stock
app.get('/api/stock',
  middlewares.auth.verificarToken,
  middlewares.error.capturarErroresAsync(async (req, res) => {
    // Datos de ejemplo para stock
    const stock = [
      {
        id: '1',
        productoId: '1',
        nombre: 'iPhone 15 Pro',
        categoria: 'Electrónicos',
        stockActual: 5,
        stockMinimo: 10,
        stockMaximo: 100,
        precioCompra: 800,
        precioVenta: 1200,
        //proveedor: 'Apple Inc.',
        //ubicacion: 'Almacén A - Estante 1',
        estado: 'activo',
        alertas: {
          stockBajo: true,
          stockCritico: false,
          proximoVencimiento: false
        }
      }
    ];

    middlewares.error.enviarRespuestaExito(res, stock);
  })
);

// ===============================
// MIDDLEWARE DE MANEJO DE ERRORES
// ===============================

// Middleware de logging de errores - TEMPORALMENTE COMENTADO PARA DEBUGGING
// app.use(middlewares.logging.logErrors);

// Middleware principal de manejo de errores - TEMPORALMENTE COMENTADO PARA DEBUGGING
// app.use(middlewares.error.manejarErrores);

// Middleware para rutas no encontradas - TEMPORALMENTE COMENTADO PARA DEBUGGING
// app.use(middlewares.error.manejarRutasNoEncontradas);

// ===============================
// INICIALIZACIÓN DEL SERVIDOR
// ===============================

// Función para inicializar el administrador por defecto
async function inicializarAdmin() {
  try {
    console.log('🔧 Inicializando administrador...');
    
    const usuarioModel = require('../models/usuarioModel');
    const adminExistente = await usuarioModel.buscarPorEmail('admin@nuevatienda.com');
    
    if (!adminExistente) {
      console.log('👤 Creando nuevo administrador...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password', 10);
      
      const adminData = {
        nombre: 'Administrador',
        email: 'admin@nuevatienda.com',
        password: hashedPassword,
        rol: 'admin',
        verificado: true
      };
      
      await usuarioModel.crearUsuario(adminData);
      console.log('✅ Usuario administrador creado exitosamente');
      console.log('👤 Usuario: admin@nuevatienda.com');
      console.log('🔑 Contraseña: password');
    } else {
      console.log('✅ Usuario administrador ya existe');
    }
  } catch (error) {
    console.error('❌ Error al inicializar administrador:', error.message);
  }
}

// Arrancar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor Backend del Salón Sandra Fajardo corriendo en http://localhost:${PORT}`);
  console.log(`📱 API disponible en http://localhost:${PORT}/api`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Inicializar administrador por defecto
  await inicializarAdmin();
  
  // Limpiar logs antiguos - COMENTADO TEMPORALMENTE
  // middlewares.logging.cleanupLogs(30);
});

// ===============================
// RUTA DE LOGIN DE ADMINISTRADOR (ELIMINADA - DUPLICADA)
// ===============================

module.exports = app;
