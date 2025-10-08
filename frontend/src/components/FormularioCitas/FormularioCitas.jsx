// Componente de formulario para que los clientes agenden citas - Completamente Responsive
import { useState, useEffect } from 'react'
import { useResponsive } from '../../hooks/useResponsive'
import citasService from '../../services/citasService'
import './FormularioCitas.css'

function FormularioCitas({ onCitaCreada, onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    direccion: '',
    telefono: '',
    email: '',
    fecha: '',
    hora: '',
    servicio: '',
    tipoCliente: 'nuevo',
    tieneTratamientoQuimico: false,
    tipoTratamiento: '',
    largoPelo: '',
    deseaCombo: false,
    notas: '',
    foto: null
  })
  // Servicios y combos se cargarán desde la base de datos

  // Horarios predefinidos de 7:00 AM a 7:00 PM
  const horariosPredefinidos = [
    '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM'
  ]

  const [servicios, setServicios] = useState([])
  const [combos, setCombos] = useState([])
  const [horariosDisponibles, setHorariosDisponibles] = useState(horariosPredefinidos)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [citasDelDia, setCitasDelDia] = useState(0)
  const [maxCitasPorDia, setMaxCitasPorDia] = useState(3)
  
  const { isMobile, isTablet, getPadding } = useResponsive()

  // Cargar servicios y combos desde la base de datos
  useEffect(() => {
    cargarServicios()
    cargarCombos()
  }, [])

  const cargarServicios = async () => {
    try {
      console.log('🔄 Cargando servicios desde API...')
      const response = await fetch('http://localhost:4000/api/servicios')
      console.log('📡 Respuesta de servicios:', response.status)
      const data = await response.json()
      console.log('📦 Datos de servicios:', data)
      if (data.success) {
        setServicios(data.data)
        console.log('✅ Servicios cargados:', data.data.length)
      } else {
        console.error('❌ Error en respuesta de servicios:', data)
      }
    } catch (error) {
      console.error('❌ Error al cargar servicios:', error)
    }
  }

  const cargarCombos = async () => {
    try {
      console.log('🔄 Cargando combos desde API...')
      const response = await fetch('http://localhost:4000/api/servicios/combos')
      console.log('📡 Respuesta de combos:', response.status)
      const data = await response.json()
      console.log('📦 Datos de combos:', data)
      if (data.success) {
        setCombos(data.data)
        console.log('✅ Combos cargados:', data.data.length)
      } else {
        console.error('❌ Error en respuesta de combos:', data)
      }
    } catch (error) {
      console.error('❌ Error al cargar combos:', error)
    }
  }

  // Manejar cambios en el formulario
  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Limpiar error al cambiar datos
    if (error) setError(null)
  }

  // Manejar subida de foto
  const manejarSubidaFoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          foto: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Validar formulario
  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido')
      return false
    }
    if (!formData.apellidos.trim()) {
      setError('Los apellidos son requeridos')
      return false
    }
    if (!formData.direccion.trim()) {
      setError('La dirección es requerida')
      return false
    }
    if (!formData.email.trim()) {
      setError('El email es requerido')
      return false
    }
    if (!formData.fecha) {
      setError('La fecha es requerida')
      return false
    }
    if (!formData.hora) {
      setError('La hora es requerida')
      return false
    }
    if (!formData.servicio) {
      setError('El servicio es requerido')
      return false
    }
    if (!formData.tipoCliente) {
      setError('El tipo de cliente es requerido')
      return false
    }
    return true
  }

  // Manejar envío del formulario
  const manejarEnvio = async (e) => {
    e.preventDefault()
    
    if (!validarFormulario()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await citasService.createCita(formData)
      setSuccess(true)
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        apellidos: '',
        direccion: '',
        telefono: '',
        email: '',
        fecha: '',
        hora: '',
        servicio: '',
        tipoCliente: 'nuevo',
        tieneTratamientoQuimico: false,
        tipoTratamiento: '',
        largoPelo: '',
        deseaCombo: false,
        notas: '',
        foto: null
      })
      
      // Notificar al componente padre
      if (onCitaCreada) {
        onCitaCreada(response.data)
      }
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        if (onClose) onClose()
      }, 2000)
      
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear la cita')
    } finally {
      setLoading(false)
    }
  }

  // Obtener fecha mínima (mañana)
  const getFechaMinima = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Verificar si la fecha es domingo
  const esDomingo = (fecha) => {
    const fechaObj = new Date(fecha)
    return fechaObj.getDay() === 0
  }

  if (success) {
    return (
      <div className="formulario-citas-success">
        <div className="success-icon">✅</div>
        <h3>¡Cita Agendada Exitosamente!</h3>
        <p>Tu cita ha sido registrada. Te contactaremos pronto para confirmar.</p>
        <div className="success-details">
          <p><strong>Cliente:</strong> {formData.nombre}</p>
          <p><strong>Servicio:</strong> {formData.servicio}</p>
          <p><strong>Fecha:</strong> {new Date(formData.fecha).toLocaleDateString('es-ES')}</p>
          <p><strong>Hora:</strong> {formData.hora}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="formulario-citas">
      <div className="formulario-header">
        <h2>Agendar Cita en el Salón</h2>
        <p>Completa el formulario para reservar tu cita</p>
      </div>

      {/* Información de disponibilidad */}
      {formData.fecha && (
        <div className="disponibilidad-info">
          <div className="info-card">
            <span className="info-icon">📊</span>
            <span>Horarios disponibles: 7:00 AM - 7:00 PM</span>
          </div>
          <div className="info-card">
            <span className="info-icon">⏰</span>
            <span>Intervalos de 30 minutos</span>
          </div>
        </div>
      )}

      <form onSubmit={manejarEnvio} className="formulario-form">
        {/* Información personal */}
        <div className="form-section">
          <h3>👤 Información Personal</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={manejarCambio}
                placeholder="Tu nombre"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="apellidos">Apellidos *</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={manejarCambio}
                placeholder="Tus apellidos"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={manejarCambio}
                placeholder="Tu dirección completa"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={manejarCambio}
                placeholder="+502 1234-5678"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={manejarCambio}
                placeholder="tu@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tipoCliente">Tipo de Cliente *</label>
              <select
                id="tipoCliente"
                name="tipoCliente"
                value={formData.tipoCliente}
                onChange={manejarCambio}
                required
              >
                <option value="nuevo">🆕 Cliente Nuevo</option>
                <option value="frecuente">🔄 Cliente Frecuente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información de la cita */}
        <div className="form-section">
          <h3>Información de la Cita</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fecha">Fecha *</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={manejarCambio}
                min={getFechaMinima()}
                required
              />
              {formData.fecha && esDomingo(formData.fecha) && (
                <div className="form-warning">
                   No se pueden agendar citas los domingos
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="hora">Hora *</label>
              <select
                id="hora"
                name="hora"
                value={formData.hora}
                onChange={manejarCambio}
                required
                disabled={!formData.fecha || esDomingo(formData.fecha)}
              >
                <option value="">Selecciona una hora</option>
                {horariosDisponibles.map(horario => (
                  <option key={horario} value={horario}>
                    {horario}
                  </option>
                ))}
              </select>
              {!formData.fecha && (
                <div className="form-help">
                  Primero selecciona una fecha
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="deseaCombo">¿Desea servicio de combo?</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="deseaCombo"
                  name="deseaCombo"
                  checked={formData.deseaCombo}
                  onChange={manejarCambio}
                />
                <label htmlFor="deseaCombo">Sí, deseo un combo especial</label>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="servicio">Servicio *</label>
              <select
                id="servicio"
                name="servicio"
                value={formData.servicio}
                onChange={manejarCambio}
                required
              >
                <option value="">Selecciona un servicio</option>
                {formData.deseaCombo ? (
                  combos.map(combo => (
                    <option key={combo.id} value={combo.nombre}>
                      {combo.nombre} - Q{combo.precio}
                    </option>
                  ))
                ) : (
                  servicios.map(servicio => (
                    <option key={servicio.id} value={servicio.nombre}>
                      {servicio.nombre} - Q{servicio.precio}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="tieneTratamientoQuimico">¿Tiene algún tratamiento químico en el pelo?</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="tieneTratamientoQuimico"
                  name="tieneTratamientoQuimico"
                  checked={formData.tieneTratamientoQuimico}
                  onChange={manejarCambio}
                />
                <label htmlFor="tieneTratamientoQuimico">Sí, tengo tratamiento químico</label>
              </div>
            </div>
            
            {formData.tieneTratamientoQuimico && (
              <div className="form-group">
                <label htmlFor="tipoTratamiento">¿Qué tipo de tratamiento?</label>
                <input
                  type="text"
                  id="tipoTratamiento"
                  name="tipoTratamiento"
                  value={formData.tipoTratamiento}
                  onChange={manejarCambio}
                  placeholder="Ej: Alisado, permanente, decoloración, etc."
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="largoPelo">Largo del pelo</label>
              <select
                id="largoPelo"
                name="largoPelo"
                value={formData.largoPelo}
                onChange={manejarCambio}
              >
                <option value="">Selecciona el largo</option>
                <option value="corto">Corto</option>
                <option value="mediano">Mediano</option>
                <option value="largo">Largo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="form-section">
          <h3>📝 Información Adicional</h3>
          <div className="form-group">
            <label htmlFor="notas">Notas o Comentarios</label>
            <textarea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={manejarCambio}
              placeholder="Alguna preferencia especial o información adicional..."
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="foto">Foto (Obligatorio lado de atras)</label>
            <input
              type="file"
              id="foto"
              name="foto"
              accept="image/*"
              onChange={manejarSubidaFoto}
            />
            {formData.foto && (
              <div className="foto-preview">
                <img src={formData.foto} alt="Preview" />
                <span>Foto seleccionada</span>
              </div>
            )}
          </div>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="form-error">
            <span className="error-icon">❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || citasDelDia >= maxCitasPorDia}
          >
            {loading ? 'Agendando...' : 'Agendar Cita'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioCitas
