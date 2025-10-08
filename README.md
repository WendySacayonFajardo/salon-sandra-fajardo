# Nueva Tienda - Salón Sandra Fajardo

Sistema completo de e-commerce y gestión para salón de belleza.

## 🚀 Tecnologías

- **Frontend:** React + Vite + React Router
- **Backend:** Node.js + Express + MySQL
- **Base de Datos:** MySQL con 15 tablas
- **Autenticación:** JWT + bcryptjs
- **PDF:** jsPDF + html2canvas
- **WhatsApp:** Integración para pedidos

## 📋 Funcionalidades

### Tienda Online
- ✅ Catálogo de productos
- ✅ Carrito de compras persistente
- ✅ Checkout con WhatsApp
- ✅ PDF de comprobante
- ✅ Gestión de stock automática

### Dashboard Administrativo
- ✅ Gestión de productos (CRUD)
- ✅ Gestión de inventario
- ✅ Gestión de citas del salón
- ✅ Gestión de clientes
- ✅ Reportes avanzados con gráficas
- ✅ Análisis de logs

### Sistema de Citas
- ✅ Formulario completo de citas
- ✅ Calendario por fecha
- ✅ Gestión de servicios y combos
- ✅ Estados de citas
- ✅ Upload de fotos de clientes

## 🛠️ Instalación Local

```bash
# Instalar dependencias
npm run install-all

# Configurar variables de entorno
cp backend/env.example backend/.env

# Ejecutar en desarrollo
npm run dev
```

## 🌐 URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4000
- **API Docs:** http://localhost:4000/api

## 📊 Base de Datos

Ejecutar el script: `backend/database/salon_sf_LDD.sql`

Incluye:
- 15 tablas con relaciones FK
- 90 citas de ejemplo del salón
- Datos de productos y servicios
- Usuario admin por defecto

## 🔧 Variables de Entorno

```env
# Backend (.env)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=salon_sf
PORT=4000
JWT_SECRET=tu_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email
EMAIL_PASS=tu_password
```

## 📱 Responsive

- ✅ Desktop (>1024px)
- ✅ Tablet (768px-1024px)
- ✅ Mobile (<768px)

## 🚀 Deploy

### Vercel (Frontend)
- Deploy automático desde GitHub
- CDN global incluido
- SSL automático

### Railway (Backend + MySQL)
- Deploy automático desde GitHub
- MySQL incluido
- Variables de entorno fáciles

## 📞 WhatsApp

Número configurado: **50240439206**
- Integración para confirmación de pedidos
- Mensajes formateados automáticamente

## 👥 Usuarios por Defecto

- **Admin:** admin@salonsf.com / password123
- **Cliente:** Registro libre

## 📈 Reportes

- Dashboard con métricas en tiempo real
- Gráficas interactivas con Recharts
- Reportes de ventas por período
- Estadísticas de clientes
- Análisis de logs del sistema