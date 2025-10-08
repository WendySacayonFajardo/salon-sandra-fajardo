// Contexto para manejar el estado global del carrito de compras
import { createContext, useContext, useReducer, useEffect } from 'react'
import { carritoService } from '../services/carritoService'
import { useAuth } from './AuthContext'

// Estado inicial del carrito
const initialState = {
  items: [],
  total: 0,
  cantidad: 0,
  loading: false,
  error: null
}

// Tipos de acciones para el reducer
const CARRITO_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CARRITO: 'SET_CARRITO',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CARRITO: 'CLEAR_CARRITO'
}

// Reducer para manejar el estado del carrito
function carritoReducer(state, action) {
  switch (action.type) {
    case CARRITO_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case CARRITO_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case CARRITO_ACTIONS.SET_CARRITO:
      const items = action.payload || [];
      return {
        ...state,
        items: items,
        total: items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0),
        cantidad: items.reduce((sum, item) => sum + item.cantidad, 0),
        loading: false,
        error: null
      }
    
    case CARRITO_ACTIONS.ADD_ITEM:
      const existingItem = state.items.find(item => item.producto_id === action.payload.producto_id)
      let newItems
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.producto_id === action.payload.producto_id
            ? { ...item, cantidad: item.cantidad + action.payload.cantidad }
            : item
        )
      } else {
        newItems = [...state.items, action.payload]
      }
      
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0),
        cantidad: newItems.reduce((sum, item) => sum + item.cantidad, 0)
      }
    
    case CARRITO_ACTIONS.UPDATE_ITEM:
      const updatedItems = state.items.map(item =>
        item.producto_id === action.payload.producto_id
          ? { ...item, cantidad: action.payload.cantidad }
          : item
      ).filter(item => item.cantidad > 0)
      
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0),
        cantidad: updatedItems.reduce((sum, item) => sum + item.cantidad, 0)
      }
    
    case CARRITO_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(item => item.producto_id !== action.payload)
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0),
        cantidad: filteredItems.reduce((sum, item) => sum + item.cantidad, 0)
      }
    
    case CARRITO_ACTIONS.CLEAR_CARRITO:
      return {
        ...state,
        items: [],
        total: 0,
        cantidad: 0
      }
    
    default:
      return state
  }
}

// Crear el contexto
const CarritoContext = createContext()

// Hook personalizado para usar el contexto del carrito
export function useCarrito() {
  const context = useContext(CarritoContext)
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider')
  }
  return context
}

// Provider del contexto del carrito
export function CarritoProvider({ children }) {
  const [state, dispatch] = useReducer(carritoReducer, initialState)
  const { usuario } = useAuth()

  // Obtener ID numérico válido para el backend (prefiere cliente_id)
  const getUserId = () => {
    if (!usuario) return null
    const idPreferido = usuario.cliente_id ?? usuario.id
    const idNumero = Number(idPreferido)
    return Number.isFinite(idNumero) ? idNumero : null
  }

  // Determinar si es usuario invitado de forma segura (sin asumir tipo string)
  const isGuestUser = () => {
    const raw = usuario?.id
    return typeof raw === 'string' && raw.startsWith('invitado_')
  }

  // Helpers para invitados: sincronizar con localStorage
  const guardarCarritoInvitado = (items) => {
    try {
      localStorage.setItem('carrito_invitado', JSON.stringify(items))
    } catch {}
  }

  // Cargar carrito al inicializar o cuando cambie el usuario
  useEffect(() => {
    if (usuario && usuario.id) {
      cargarCarrito()
    } else {
      // Si no hay usuario, limpiar carrito
      dispatch({ type: CARRITO_ACTIONS.CLEAR_CARRITO })
    }
  }, [usuario])

  // Función para cargar el carrito desde el servidor o local
  const cargarCarrito = async () => {
    const userId = getUserId()
    if (!usuario) {
      const local = JSON.parse(localStorage.getItem('carrito_invitado') || '[]')
      dispatch({ type: CARRITO_ACTIONS.SET_CARRITO, payload: local })
      return
    }

    try {
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: true })
      // Si es invitado, no llamar al backend: usar carrito local (si existe) o vacío
      if (isGuestUser()) {
        const local = JSON.parse(localStorage.getItem('carrito_invitado') || '[]')
        dispatch({ type: CARRITO_ACTIONS.SET_CARRITO, payload: local })
        return
      }

      if (!userId) {
        throw new Error('Cuenta no vinculada a cliente. Contacta al administrador.')
      }

      const carritoData = await carritoService.obtenerCarrito(userId)
      dispatch({ type: CARRITO_ACTIONS.SET_CARRITO, payload: carritoData.items })
    } catch (error) {
      console.log('Error cargando carrito:', error.message)
      // Si es usuario invitado, usar carrito local
      if (isGuestUser()) {
        dispatch({ type: CARRITO_ACTIONS.SET_CARRITO, payload: [] })
      } else {
        dispatch({ type: CARRITO_ACTIONS.SET_ERROR, payload: error.message })
      }
    }
  }

  // Función para agregar producto al carrito
  const agregarAlCarrito = async (producto, cantidad = 1) => {
    const userId = getUserId()
    if (!usuario || (!usuario.id && !usuario.cliente_id)) {
      // Modo invitado sin sesión: operar localmente
      const itemCarrito = {
        producto_id: producto.producto_id || producto.id,
        nombre: producto.nombre,
        marca: producto.marca || '',
        precio_unitario: parseFloat(producto.precio || producto.precio_unitario || 0),
        imagen: producto.imagen || producto.foto1 || '/images/producto-default.svg',
        cantidad: parseInt(cantidad),
        stock_actual: parseInt(producto.stock_actual || producto.stock || 0),
        stock_minimo: parseInt(producto.stock_minimo || 0),
        activo: Boolean(producto.activo !== false),
        subtotal: parseFloat(producto.precio || producto.precio_unitario || 0) * parseInt(cantidad)
      }
      const existente = state.items.find(i => i.producto_id === itemCarrito.producto_id)
      const nuevos = existente
        ? state.items.map(i => i.producto_id === itemCarrito.producto_id ? { ...i, cantidad: i.cantidad + itemCarrito.cantidad } : i)
        : [...state.items, itemCarrito]
      guardarCarritoInvitado(nuevos)
      dispatch({ type: CARRITO_ACTIONS.ADD_ITEM, payload: itemCarrito })
      return
    }

    try {
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: true })
      
      // Si es usuario invitado, solo agregar localmente
      if (isGuestUser()) {
        const itemCarrito = {
          producto_id: producto.producto_id || producto.id,
          nombre: producto.nombre,
          marca: producto.marca || '',
          precio_unitario: parseFloat(producto.precio || producto.precio_unitario || 0),
          imagen: producto.imagen || producto.foto1 || '/images/producto-default.svg',
          cantidad: parseInt(cantidad),
          stock_actual: parseInt(producto.stock_actual || producto.stock || 0),
          stock_minimo: parseInt(producto.stock_minimo || 0),
          activo: Boolean(producto.activo !== false),
          subtotal: parseFloat(producto.precio || producto.precio_unitario || 0) * parseInt(cantidad)
        }
        // Calcular nuevo arreglo para persistir
        const existente = state.items.find(i => i.producto_id === itemCarrito.producto_id)
        const nuevos = existente
          ? state.items.map(i => i.producto_id === itemCarrito.producto_id ? { ...i, cantidad: i.cantidad + itemCarrito.cantidad } : i)
          : [...state.items, itemCarrito]
        guardarCarritoInvitado(nuevos)
        dispatch({ type: CARRITO_ACTIONS.ADD_ITEM, payload: itemCarrito })
      } else {
        // Usuario autenticado, usar servidor
        if (!userId) throw new Error('Cuenta sin cliente asociado')
        await carritoService.agregarAlCarrito(userId, producto.producto_id || producto.id, cantidad)
        
        const itemCarrito = {
          producto_id: producto.producto_id || producto.id,
          nombre: producto.nombre,
          marca: producto.marca || '',
          precio_unitario: parseFloat(producto.precio || producto.precio_unitario || 0),
          imagen: producto.imagen || producto.foto1 || '/images/producto-default.svg',
          cantidad: parseInt(cantidad),
          stock_actual: parseInt(producto.stock_actual || producto.stock || 0),
          stock_minimo: parseInt(producto.stock_minimo || 0),
          activo: Boolean(producto.activo !== false),
          subtotal: parseFloat(producto.precio || producto.precio_unitario || 0) * parseInt(cantidad)
        }
        
        dispatch({ type: CARRITO_ACTIONS.ADD_ITEM, payload: itemCarrito })
      }
    } catch (error) {
      dispatch({ type: CARRITO_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Función para actualizar cantidad de un item
  const actualizarCantidad = async (productoId, cantidad) => {
    const userId = getUserId()
    if (!usuario || (!usuario.id && !usuario.cliente_id)) {
      const nuevos = state.items
        .map(i => i.producto_id === productoId ? { ...i, cantidad } : i)
        .filter(i => i.cantidad > 0)
      guardarCarritoInvitado(nuevos)
      dispatch({ type: CARRITO_ACTIONS.UPDATE_ITEM, payload: { producto_id: productoId, cantidad } })
      return
    }

    try {
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: true })
      
      // Si es usuario invitado, solo actualizar localmente
      if (isGuestUser()) {
        const nuevos = state.items
          .map(i => i.producto_id === productoId ? { ...i, cantidad } : i)
          .filter(i => i.cantidad > 0)
        guardarCarritoInvitado(nuevos)
        dispatch({ type: CARRITO_ACTIONS.UPDATE_ITEM, payload: { producto_id: productoId, cantidad } })
      } else {
        // Usuario autenticado, usar servidor
        if (!userId) throw new Error('Cuenta sin cliente asociado')
        await carritoService.actualizarCantidad(userId, productoId, cantidad)
        dispatch({ type: CARRITO_ACTIONS.UPDATE_ITEM, payload: { producto_id: productoId, cantidad } })
      }
    } catch (error) {
      dispatch({ type: CARRITO_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Función para eliminar producto del carrito
  const eliminarDelCarrito = async (productoId) => {
    const userId = getUserId()
    if (!usuario || (!usuario.id && !usuario.cliente_id)) {
      const nuevos = state.items.filter(i => i.producto_id !== productoId)
      guardarCarritoInvitado(nuevos)
      dispatch({ type: CARRITO_ACTIONS.REMOVE_ITEM, payload: productoId })
      return
    }

    try {
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: true })
      
      // Si es usuario invitado, solo eliminar localmente
      if (isGuestUser()) {
        const nuevos = state.items.filter(i => i.producto_id !== productoId)
        guardarCarritoInvitado(nuevos)
        dispatch({ type: CARRITO_ACTIONS.REMOVE_ITEM, payload: productoId })
      } else {
        // Usuario autenticado, usar servidor
        if (!userId) throw new Error('Cuenta sin cliente asociado')
        await carritoService.eliminarDelCarrito(userId, productoId)
        dispatch({ type: CARRITO_ACTIONS.REMOVE_ITEM, payload: productoId })
      }
    } catch (error) {
      dispatch({ type: CARRITO_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Función para vaciar el carrito
  const vaciarCarrito = async () => {
    const userId = getUserId()
    if (!usuario || (!usuario.id && !usuario.cliente_id)) {
      guardarCarritoInvitado([])
      dispatch({ type: CARRITO_ACTIONS.CLEAR_CARRITO })
      return
    }

    try {
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: true })
      
      // Si es usuario invitado, solo vaciar localmente
      if (isGuestUser()) {
        guardarCarritoInvitado([])
        dispatch({ type: CARRITO_ACTIONS.CLEAR_CARRITO })
      } else {
        // Usuario autenticado, usar servidor
        if (!userId) throw new Error('Cuenta sin cliente asociado')
        await carritoService.vaciarCarrito(userId)
        dispatch({ type: CARRITO_ACTIONS.CLEAR_CARRITO })
      }
    } catch (error) {
      dispatch({ type: CARRITO_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Función para verificar si un producto está en el carrito
  const estaEnCarrito = (productoId) => {
    return state.items.some(item => item.producto_id === productoId)
  }

  // Función para obtener la cantidad de un producto en el carrito
  const obtenerCantidad = (productoId) => {
    const item = state.items.find(item => item.producto_id === productoId)
    return item ? item.cantidad : 0
  }

  // Función para procesar checkout
  const procesarCheckout = async (datosCheckout = {}) => {
    const userId = getUserId()
    if (!userId) {
      throw new Error('Debes iniciar sesión para procesar el checkout')
    }

    try {
      dispatch({ type: CARRITO_ACTIONS.SET_LOADING, payload: true })
      
      // Si es usuario invitado, no puede hacer checkout
      if (isGuestUser()) {
        throw new Error('Debes registrarte para procesar el checkout')
      }

      // Procesar checkout en el servidor
      const resultado = await carritoService.procesarCheckout(userId, datosCheckout)
      
      // Vaciar carrito local después del checkout exitoso
      dispatch({ type: CARRITO_ACTIONS.CLEAR_CARRITO })
      
      return resultado
    } catch (error) {
      dispatch({ type: CARRITO_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  const value = {
    // Estado
    items: state.items,
    total: state.total,
    cantidad: state.cantidad,
    loading: state.loading,
    error: state.error,
    
    // Acciones
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    cargarCarrito,
    estaEnCarrito,
    obtenerCantidad,
    procesarCheckout
  }

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  )
}
