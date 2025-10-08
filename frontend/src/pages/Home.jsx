// Página principal de la tienda
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productoService } from '../services/productoService'
import ProductoCard from '../components/ProductoCard/ProductoCard'
import salonImage from '../assets/Salon Sandra.jpg'
import '../styles/Home.css'

function Home() {
  const [productosDestacados, setProductosDestacados] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos()
  }, [])

  // Función para cargar productos destacados y categorías
  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [productosData, categoriasData] = await Promise.all([
        productoService.obtenerProductos(),
        productoService.obtenerCategorias()
      ])
      
      // Tomar los primeros 6 productos como destacados
      setProductosDestacados(productosData.slice(0, 6))
      setCategorias(categoriasData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <p>Cargando productos destacados...</p>
      </div>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <div className="home-error">
        <h2>❌ Error al cargar los datos</h2>
        <p>{error}</p>
        <button onClick={cargarDatos} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="highlight">Salón Sandra Fajardo</span>
            </h1>
            <p className="hero-description">
              Belleza y elegancia en cada detalle. Descubre los mejores tratamientos capilares 
              con la mejor calidad y atención personalizada. Tu satisfacción es nuestra prioridad.
            </p>
            <div className="hero-actions">
              <Link to="/productos" className="btn btn-primary btn-lg">
                Ver Productos
              </Link>
              <Link to="/servicios" className="btn btn-outline btn-lg">
                Nuestros Servicios
              </Link>
              <Link to="/carrito" className="btn btn-outline btn-lg">
                Mi Carrito
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-container">
              <img 
                src={salonImage} 
                alt="Salón Sandra Fajardo - Servicios de Belleza" 
                className="hero-main-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Misión */}
      <section className="mision-section">
        <div className="container">
          <div className="mision-content">
            <div className="mision-icon">
              <span className="mision-emoji">✨</span>
            </div>
            <div className="mision-text">
              <h2 className="mision-title">Nuestra Misión</h2>
              <p className="mision-description">
                Brindar un servicio de belleza exclusivo y personalizado, llevando tratamientos capilares de alta calidad directamente a las clientas, asegurando resultados profesionales sin que ellas tengan que salir de casa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visión */}
      <section className="vision-section">
        <div className="container">
          <div className="vision-content">
            <div className="vision-text">
              <h2 className="vision-title">Nuestra Visión</h2>
              <p className="vision-description">
                Convertirse en la marca líder en el servicio de belleza en Guatemala, combinando innovación y exclusividad brindando un portafolio de productos que permitan a cada clienta cuidar su imagen con los mejores tratamientos del mercado.
              </p>
            </div>
            <div className="vision-icon">
              <span className="vision-emoji">🎯</span>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="valores-section">
        <div className="container">
          <h2 className="section-title">Nuestros Valores</h2>
          <div className="valores-grid">
            <div className="valor-card">
              <div className="valor-icon">
                <span className="valor-emoji">✨</span>
              </div>
              <h3 className="valor-titulo">Exclusividad</h3>
              <p className="valor-descripcion">Servicios únicos y personalizados que nos distinguen en el mercado</p>
            </div>
            <div className="valor-card">
              <div className="valor-icon">
                <span className="valor-emoji">🎯</span>
              </div>
              <h3 className="valor-titulo">Personalización</h3>
              <p className="valor-descripcion">Cada tratamiento adaptado a las necesidades específicas de cada clienta</p>
            </div>
            <div className="valor-card">
              <div className="valor-icon">
                <span className="valor-emoji">💎</span>
              </div>
              <h3 className="valor-titulo">Calidad</h3>
              <p className="valor-descripcion">Productos y servicios de la más alta calidad para resultados excepcionales</p>
            </div>
            <div className="valor-card">
              <div className="valor-icon">
                <span className="valor-emoji">🤝</span>
              </div>
              <h3 className="valor-titulo">Confianza</h3>
              <p className="valor-descripcion">Relaciones sólidas basadas en la transparencia y honestidad</p>
            </div>
            <div className="valor-card">
              <div className="valor-icon">
                <span className="valor-emoji">❤️</span>
              </div>
              <h3 className="valor-titulo">Respeto</h3>
              <p className="valor-descripcion">Trato digno y profesional hacia cada una de nuestras clientas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="categorias-section">
        <div className="container">
          <h2 className="section-title">Nuestras Categorías</h2>
          <div className="categorias-grid">
            {Array.isArray(categorias) && categorias.map((categoria, index) => {
              const categoriaNombre = typeof categoria === 'string' ? categoria : categoria.nombre || 'Categoría';
              const categoriaId = typeof categoria === 'string' ? categoria : categoria.id || index;
              
              return (
              <Link 
                  key={`categoria-${index}-${categoriaId}`} 
                  to={`/productos?categoria=${categoriaNombre}`}
                className="categoria-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="categoria-icon">
                    {categoriaNombre === 'Shampoo' && '🧴'}
                    {categoriaNombre === 'Acondicionador' && '💧'}
                    {categoriaNombre === 'Tratamiento' && '✨'}
                    {categoriaNombre === 'Styling' && '💇‍♀️'}
                    {categoriaNombre === 'Herramientas' && '🔧'}
                </div>
                  <h3 className="categoria-nombre">{categoriaNombre}</h3>
                <p className="categoria-descripcion">
                    Explora nuestra selección de {categoriaNombre.toLowerCase()}
                </p>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="productos-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Productos Destacados</h2>
            <Link to="/productos" className="btn btn-outline">
              Ver Todos
            </Link>
          </div>
          <div className="productos-grid">
            {Array.isArray(productosDestacados) && productosDestacados.map((producto) => (
              <ProductoCard key={producto.producto_id ?? producto.id ?? producto.nombre} producto={producto} />
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="caracteristicas-section">
        <div className="container">
          <h2 className="section-title">¿Por qué elegirnos?</h2>
          <div className="caracteristicas-grid">
            <div className="caracteristica-card">
              <div className="caracteristica-icon">🚚</div>
              <h3>Envío Rápido</h3>
              <p>Entrega en toda la ciudad</p>
            </div>
            <div className="caracteristica-card">
              <div className="caracteristica-icon">🔒</div>
              <h3>Compra Segura</h3>
              <p>Pagos 100% seguros y protegidos</p>
            </div>
            <div className="caracteristica-card">
              <div className="caracteristica-icon">💎</div>
              <h3>Calidad Garantizada</h3>
              <p>Productos de la más alta calidad</p>
            </div>
            <div className="caracteristica-card">
              <div className="caracteristica-icon">🎯</div>
              <h3>Atención 24/7</h3>
              <p>Soporte al cliente siempre disponible</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
