import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import clienteService from '../../services/clienteService';
import ServicioReportesService from '../../services/servicioReportesService';
import InventarioService from '../../services/inventarioService';
import LogsService from '../../services/logsService';
import './ResumenGeneral.css';

const ResumenGeneral = () => {
  const { usuario } = useAuth();
  const [resumen, setResumen] = useState({
    clientes: null,
    servicios: null,
    inventario: null,
    logs: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    try {
      setLoading(true);
      setError(null);

      const [clientes, servicios, inventario, logs] = await Promise.allSettled([
        clienteService.obtenerEstadisticasGenerales(),
        ServicioReportesService.obtenerEstadisticasGenerales(),
        InventarioService.obtenerEstadisticasInventario(),
        LogsService.obtenerEstadisticasGenerales()
      ]);

      setResumen({
        clientes: clientes.status === 'fulfilled' ? clientes.value.data : null,
        servicios: servicios.status === 'fulfilled' ? servicios.value.data : null,
        inventario: inventario.status === 'fulfilled' ? inventario.value.data : null,
        logs: logs.status === 'fulfilled' ? logs.value.data : null
      });

    } catch (error) {
      console.error('Error cargando resumen general:', error);
      setError('Error al cargar el resumen general');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="resumen-general-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando resumen general...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resumen-general-container">
        <div className="error">
          <p>❌ {error}</p>
          <button onClick={cargarResumen} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="resumen-general-container">
      <div className="resumen-header">
        <h1>📊 Resumen General del Sistema</h1>
        <p>Vista general de todas las categorías y módulos del sistema</p>
        <div className="welcome-admin">
          <h2>👋 ¡Hola {usuario?.nombre || 'Administrador'}!</h2>
          <p>Bienvenido al panel de administración de Nueva Tienda</p>
        </div>
      </div>

      {/* Resumen de Clientes */}
      {resumen.clientes && (
        <div className="categoria-section">
          <div className="categoria-header">
            <h2>👥 Gestión de Clientes</h2>
            <span className="categoria-badge">Clientes</span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{resumen.clientes.total_clientes || 0}</h3>
                <p>Total Clientes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🆕</div>
              <div className="stat-content">
                <h3>{resumen.clientes.clientes_mes_actual || 0}</h3>
                <p>Nuevos este Mes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{resumen.clientes.total_citas || 0}</h3>
                <p>Total Citas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{resumen.clientes.porcentaje_asistencia || 0}%</h3>
                <p>Asistencia</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de Servicios */}
      {resumen.servicios && (
        <div className="categoria-section">
          <div className="categoria-header">
            <h2>💇‍♀️ Servicios y Citas</h2>
            <span className="categoria-badge">Servicios</span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💇‍♀️</div>
              <div className="stat-content">
                <h3>{resumen.servicios.total_servicios_diferentes || 0}</h3>
                <p>Servicios Diferentes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{resumen.servicios.total_citas_servicios || 0}</h3>
                <p>Total Citas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{resumen.servicios.porcentaje_completados || 0}%</h3>
                <p>Completados</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Q{resumen.servicios.precio_promedio_servicio || 0}</h3>
                <p>Precio Promedio</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de Inventario */}
      {resumen.inventario && (
        <div className="categoria-section">
          <div className="categoria-header">
            <h2>📦 Gestión de Inventario</h2>
            <span className="categoria-badge">Inventario</span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{resumen.inventario.total_productos || 0}</h3>
                <p>Total Productos</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{resumen.inventario.stock_total || 0}</h3>
                <p>Stock Total</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Q{resumen.inventario.valor_total_inventario?.toFixed(2) || '0.00'}</h3>
                <p>Valor Inventario</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>{resumen.inventario.productos_stock_bajo || 0}</h3>
                <p>Stock Bajo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de Logs del Sistema */}
      {resumen.logs && (
        <div className="categoria-section">
          <div className="categoria-header">
            <h2>📊 Análisis de Logs</h2>
            <span className="categoria-badge">Sistema</span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>{resumen.logs.total_logs || 0}</h3>
                <p>Total Logs</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔐</div>
              <div className="stat-content">
                <h3>{resumen.logs.auth_logs || 0}</h3>
                <p>Logs Auth</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>{resumen.logs.error_logs || 0}</h3>
                <p>Logs Errores</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📥</div>
              <div className="stat-content">
                <h3>{resumen.logs.request_logs || 0}</h3>
                <p>Logs Requests</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones Rápidas */}
      <div className="acciones-rapidas">
        <h2>⚡ Acciones Rápidas</h2>
        <div className="acciones-grid">
          <div className="accion-card">
            <div className="accion-icon">📅</div>
            <div className="accion-content">
              <h3>Gestionar Citas</h3>
              <p>Ver y administrar todas las citas</p>
            </div>
          </div>
          <div className="accion-card">
            <div className="accion-icon">👥</div>
            <div className="accion-content">
              <h3>Gestionar Clientes</h3>
              <p>Administrar información de clientes</p>
            </div>
          </div>
          <div className="accion-card">
            <div className="accion-icon">📦</div>
            <div className="accion-content">
              <h3>Controlar Inventario</h3>
              <p>Gestionar stock y productos</p>
            </div>
          </div>
          <div className="accion-card">
            <div className="accion-icon">📊</div>
            <div className="accion-content">
              <h3>Ver Reportes</h3>
              <p>Análisis y estadísticas detalladas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenGeneral;
