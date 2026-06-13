# MaxFarma — Next.js

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en modo desarrollo
npm run dev
```

Abrir http://localhost:3000

## Deploy en Vercel

1. Subir esta carpeta a un repositorio GitHub nuevo
2. Ir a vercel.com → Import Project → conectar el repo
3. Vercel detecta Next.js automáticamente → Deploy

## Estructura

```
src/
  app/
    page.jsx        → Página principal (todas las secciones)
    layout.jsx      → Layout con GTM, Clarity, Google Sign-In
    globals.css     → Estilos globales + Tailwind
  components/
    Header.jsx      → Header sticky con búsqueda
    Cart.jsx        → Carrito lateral
    ProductCard.jsx → Tarjeta de producto
    HeroBanner.jsx  → Carrusel hero
    Checkout.jsx    → Formulario de pedido + Firebase
    Admin.jsx       → Panel de administración + Firebase real-time
    Footer.jsx      → Pie de página
  lib/
    store.jsx       → Estado global (Context + useReducer)
    firebase.js     → Configuración Firebase
```

## Logo

Copiá tu archivo `logo.png` dentro de la carpeta `public/`

## Credenciales incluidas

- ✅ Firebase (Firestore pedidos en tiempo real)
- ✅ Google Tag Manager (GTM-NTN35XXD)
- ✅ Microsoft Clarity (x419jequ7o)
- ✅ Google Sign-In (Client ID configurado)
