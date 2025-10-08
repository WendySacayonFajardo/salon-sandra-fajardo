// Índice de middlewares
// Este archivo exporta todos los middlewares organizados para facilitar su importación

// Middlewares de autenticación
const {
  verificarToken,
  verificarAdmin,
  verificarTokenOpcional,
  verificarRol
} = require('./authMiddleware');

// Middlewares de seguridad
const {
  corsConfig,
  helmetConfig,
  apiRateLimiter,
  authRateLimiter,
  registerRateLimiter,
  sanitizeInput,
  validatePayloadSize,
  validateOrigin
} = require('./securityMiddleware');

// Middlewares de validación
const {
  procesarValidacion,
  validacionesAuth,
  validacionesProductos,
  validacionesCitas,
  validacionesParams,
  validacionesQuery
} = require('./validationMiddleware');

// Middlewares de logging
const {
  logRequests,
  logResponses,
  logAuth,
  logAdminActivity,
  logErrors,
  logSecurity,
  cleanupLogs,
  writeLogToFile,
  getClientIP
} = require('./loggingMiddleware');

// Middlewares de manejo de errores
const {
  manejarErrores,
  manejarRutasNoEncontradas,
  manejarMetodosNoPermitidos,
  crearError,
  erroresComunes,
  capturarErroresAsync,
  requerirAutenticacion,
  requerirAdmin,
  enviarRespuestaExito,
  enviarRespuestaError
} = require('./errorMiddleware');

// Exportar todos los middlewares organizados por categoría
module.exports = {
  // Autenticación
  auth: {
    verificarToken,
    verificarAdmin,
    verificarTokenOpcional,
    verificarRol
  },
  
  // Seguridad
  security: {
    corsConfig,
    helmetConfig,
    apiRateLimiter,
    authRateLimiter,
    registerRateLimiter,
    sanitizeInput,
    validatePayloadSize,
    validateOrigin
  },
  
  // Validación
  validation: {
    procesarValidacion,
    validacionesAuth,
    validacionesProductos,
    validacionesCitas,
    validacionesParams,
    validacionesQuery
  },
  
  // Logging
  logging: {
    logRequests,
    logResponses,
    logAuth,
    logAdminActivity,
    logErrors,
    logSecurity,
    cleanupLogs,
    writeLogToFile,
    getClientIP
  },
  
  // Manejo de errores
  error: {
    manejarErrores,
    manejarRutasNoEncontradas,
    manejarMetodosNoPermitidos,
    crearError,
    erroresComunes,
    capturarErroresAsync,
    requerirAutenticacion,
    requerirAdmin,
    enviarRespuestaExito,
    enviarRespuestaError
  }
};
