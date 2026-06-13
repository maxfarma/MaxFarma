'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  doc, setDoc, onSnapshot
} from 'firebase/firestore';

/* ─────────────────────────────────────────────────────────
   DATOS DEMO — solo se usan si Firestore está vacío
───────────────────────────────────────────────────────── */
const DEMO_PRODUCTS = [
  { codigo:'7793200100001', nombre:'Crema Nivea Aclarante 400ml', marca:'Nivea', categoria:'dermocosmetica', precio:3200, precio_oferta:2600, descripcion:'Hidratante corporal con efecto aclarante para todo tipo de piel.', stock:'Disponible', destacado:'SI', nuevo:'SI', mas_vendido:'SI', imagen_url:'' },
  { codigo:'7793200100002', nombre:'Shampoo Pantene Pro-V 750ml', marca:'Pantene', categoria:'cuidado-personal', precio:2800, precio_oferta:'', descripcion:'Shampoo con tecnología Pro-V para cabello fuerte y brillante.', stock:'Disponible', destacado:'SI', nuevo:'NO', mas_vendido:'SI', imagen_url:'' },
  { codigo:'7793200100003', nombre:'Perfume Natura Essencial 100ml', marca:'Natura', categoria:'perfumes', precio:12500, precio_oferta:10000, descripcion:'Fragancia fresca y duradera inspirada en la naturaleza.', stock:'Disponible', destacado:'SI', nuevo:'NO', mas_vendido:'NO', imagen_url:'' },
  { codigo:'7793200100004', nombre:'Pañales Pampers Talle M x24', marca:'Pampers', categoria:'bebe', precio:5200, precio_oferta:'', descripcion:'Suavidad y protección para tu bebé. Absorción de hasta 12 horas.', stock:'Disponible', destacado:'SI', nuevo:'NO', mas_vendido:'SI', imagen_url:'' },
  { codigo:'7793200100005', nombre:'Protector Solar Banana Boat FPS50', marca:'Banana Boat', categoria:'dermocosmetica', precio:3800, precio_oferta:3200, descripcion:'Protección solar alta FPS50 resistente al agua.', stock:'Disponible', destacado:'SI', nuevo:'SI', mas_vendido:'NO', imagen_url:'' },
  { codigo:'7793200100006', nombre:'Vitamina C 1000mg x60 comp', marca:'Bagó', categoria:'nutricion', precio:3600, precio_oferta:2900, descripcion:'Vitamina C de alta potencia para reforzar el sistema inmune.', stock:'Disponible', destacado:'SI', nuevo:'NO', mas_vendido:'SI', imagen_url:'' },
  { codigo:'7793200100007', nombre:'Crema Eucerin Aquaporin 50ml', marca:'Eucerin', categoria:'dermocosmetica', precio:7800, precio_oferta:6500, descripcion:'Hidratación intensa de larga duración.', stock:'Disponible', destacado:'SI', nuevo:'SI', mas_vendido:'NO', imagen_url:'' },
  { codigo:'7793200100008', nombre:'Labial Revlon Ultra HD Matte', marca:'Revlon', categoria:'maquillaje', precio:2900, precio_oferta:2500, descripcion:'Color intenso y larga duración con vitamina E.', stock:'Disponible', destacado:'SI', nuevo:'SI', mas_vendido:'NO', imagen_url:'' },
];

const DEMO_PROMOS = [
  { tarjeta:'Santander', tipo:'Visa / Mastercard', descuento:20, cuotas:6, detalle:'20% de descuento todos los días', dia:'', vigencia:'31/12/2026', activa:'SI' },
  { tarjeta:'Galicia', tipo:'Mastercard', descuento:15, cuotas:12, detalle:'15% off + 12 cuotas sin interés', dia:'Jueves', vigencia:'31/12/2026', activa:'SI' },
  { tarjeta:'BBVA', tipo:'Débito', descuento:10, cuotas:0, detalle:'10% de descuento con débito BBVA', dia:'', vigencia:'30/11/2026', activa:'SI' },
];

const DEMO_BANNERS = [
  { titulo:'Cuidá tu salud, cada día', subtitulo:'Productos de salud y bienestar con envío a domicilio', color:'#C8102E', boton:'Ver productos', link:'productos', activo:'SI', imagen_url:'' },
  { titulo:'Ofertas imperdibles', subtitulo:'Descuentos exclusivos por tiempo limitado', color:'#1a3a5c', boton:'Ver ofertas', link:'ofertas', activo:'SI', imagen_url:'' },
];

const DEMO_PAGINAS = {
  'preguntas-frecuentes': { titulo:'Preguntas Frecuentes', contenido:`**¿Cómo realizo un pedido?**\nNavegá por el catálogo, agregá productos al carrito y completá el formulario. Te contactamos por WhatsApp para confirmar.\n\n**¿Cuáles son los medios de pago?**\nAceptamos efectivo, transferencia, Mercado Pago y tarjetas. Consultá promos bancarias para descuentos y cuotas.\n\n**¿Hacen envíos?**\nSí, en la zona de Cañuelas y alrededores. Consultanos por WhatsApp.\n\n**¿Puedo retirar en la farmacia?**\nSí, en Ruta Nacional 6 Km 22,5, lunes a sábados 9:00–21:00 hs.` },
  'como-comprar':         { titulo:'Cómo Comprar', contenido:`**Paso 1 — Explorá**\nNavegá por categorías o usá el buscador.\n\n**Paso 2 — Agregá al carrito**\nHacé clic en "Agregar al carrito".\n\n**Paso 3 — Completá tus datos**\nIngresá nombre, teléfono y elegí retiro o envío.\n\n**Paso 4 — Confirmá por WhatsApp**\nTe redirigimos a WhatsApp con el detalle del pedido.\n\n**Paso 5 — Recibí tu pedido**\nCoordinamos entrega o retiro.` },
  'envios':               { titulo:'Envíos y Entregas', contenido:`**Zona de cobertura**\nCañuelas y alrededores. Consultanos para verificar tu domicilio.\n\n**Tiempo de entrega**\nMismo día o día siguiente, sujeto a disponibilidad.\n\n**Costo de envío**\nVaria según distancia. Consultanos por WhatsApp.\n\n**Retiro sin cargo**\nRuta Nacional 6 Km 22,5, lunes a sábados 9:00–21:00 hs.` },
  'devoluciones':         { titulo:'Cambios y Devoluciones', contenido:`**Política de cambios**\nHasta 30 días, producto sin uso y embalaje intacto.\n\n**Sin devolución**\nProductos abiertos o sin precinto de seguridad.\n\n**Cómo iniciar un cambio**\nContactanos por WhatsApp con el número de pedido.\n\n**Botón de arrepentimiento**\nLey 24.240: 10 días hábiles desde la recepción. Email: ventamaxfarma@gmail.com.` },
  'medios-de-pago':       { titulo:'Medios de Pago', contenido:`**Tarjetas de crédito**\nVisa, Mastercard, Amex, Naranja X, Cabal.\n\n**Tarjetas de débito**\nVisa Débito, Mastercard Débito, Maestro.\n\n**Transferencia / CVU**\nEnvianos el comprobante por WhatsApp.\n\n**Mercado Pago**\nPagos, Mercado Crédito y cuotas.\n\n**Go Cuotas**\nFinanciación disponible con Go Cuotas.\n\n**Efectivo**\nEn el local o contra entrega.` },
  'terminos':             { titulo:'Términos y Condiciones', contenido:`**1. Aceptación**\nAl usar el sitio aceptás estos términos. MaxFarma puede modificarlos sin previo aviso.\n\n**2. Precios**\nSujetos a cambios. Nos reservamos el derecho de cancelar pedidos por error de precio o falta de stock.\n\n**3. Privacidad**\nDatos usados solo para procesar pedidos. Ley 25.326 de Protección de Datos.\n\n**4. Jurisdicción**\nTribunales ordinarios de la Provincia de Buenos Aires.` },
};

/* ─────────────────────────────────────────────────────────
   ESTADO INICIAL
───────────────────────────────────────────────────────── */
const initialState = {
  products: [], promos: [], banners: [], orders: [],
  paginas: DEMO_PAGINAS,
  cart: [], wishlist: [], searchHistory: [],
  currentSection: 'inicio', currentCategory: 'todos',
  searchQuery: '', sortOrder: 'default', maxPrice: 200000,
  cartOpen: false, productModal: null,
  dbLoaded: false,
};

/* ─────────────────────────────────────────────────────────
   REDUCER
───────────────────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case 'INIT_LOCAL': return { ...state, ...action.payload };
    case 'DB_LOADED':  return { ...state, dbLoaded: true };
    case 'SET_PRODUCTS': return { ...state, products: action.payload };
    case 'SET_PROMOS':   return { ...state, promos:   action.payload };
    case 'SET_BANNERS':  return { ...state, banners:  action.payload };
    case 'SET_PAGINAS':  return { ...state, paginas:  action.payload };
    case 'SET_ORDERS':   return { ...state, orders:   action.payload };
    case 'ADD_ORDER':    return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER_STATUS': return {
      ...state,
      orders: state.orders.map((o, i) => i === action.idx ? { ...o, estado: action.status } : o),
    };
    case 'ADD_TO_CART': {
      const exists = state.cart.find(i => i.codigo === action.payload.codigo);
      return {
        ...state,
        cart: exists
          ? state.cart.map(i => i.codigo === action.payload.codigo ? { ...i, qty: i.qty + 1 } : i)
          : [...state.cart, { ...action.payload, qty: 1 }],
        cartOpen: true,
      };
    }
    case 'REMOVE_FROM_CART':  return { ...state, cart: state.cart.filter(i => i.codigo !== action.codigo) };
    case 'UPDATE_CART_QTY':   return { ...state, cart: state.cart.map(i => i.codigo === action.codigo ? { ...i, qty: Math.max(1, i.qty + action.delta) } : i) };
    case 'CLEAR_CART':        return { ...state, cart: [] };
    case 'TOGGLE_CART':       return { ...state, cartOpen: !state.cartOpen };
    case 'CLOSE_CART':        return { ...state, cartOpen: false };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.includes(action.codigo);
      return { ...state, wishlist: exists ? state.wishlist.filter(c => c !== action.codigo) : [...state.wishlist, action.codigo] };
    }
    case 'SET_SECTION':  return { ...state, currentSection: action.payload };
    case 'SET_CATEGORY': return { ...state, currentCategory: action.payload, searchQuery: '', currentSection: 'productos' };
    case 'SET_SEARCH': {
      const newHistory = action.payload && !state.searchHistory.includes(action.payload)
        ? [action.payload, ...state.searchHistory].slice(0, 5)
        : state.searchHistory;
      return { ...state, searchQuery: action.payload, searchHistory: newHistory, currentSection: action.payload ? 'productos' : state.currentSection };
    }
    case 'SET_SORT':           return { ...state, sortOrder: action.payload };
    case 'SET_MAX_PRICE':      return { ...state, maxPrice: action.payload };
    case 'OPEN_PRODUCT_MODAL': return { ...state, productModal: action.payload };
    case 'CLOSE_PRODUCT_MODAL':return { ...state, productModal: null };
    default: return state;
  }
}

/* ─────────────────────────────────────────────────────────
   HELPERS FIRESTORE
   config/products → { items: [...] }
   config/promos   → { items: [...] }
   config/banners  → { items: [...] }
   config/paginas  → { data: {...} }
───────────────────────────────────────────────────────── */
const COL = 'config';

async function saveToFirestore(docId, payload) {
  try {
    await setDoc(doc(db, COL, docId), payload, { merge: true });
  } catch (e) {
    console.error('Firestore save error:', e);
  }
}

/* ─────────────────────────────────────────────────────────
   PROVIDER
───────────────────────────────────────────────────────── */
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /* 1. Cargar carrito/wishlist desde localStorage */
  useEffect(() => {
    try {
      const cart    = JSON.parse(localStorage.getItem('mf_cart')     || '[]');
      const wishlist= JSON.parse(localStorage.getItem('mf_wishlist') || '[]');
      const searchHistory = JSON.parse(localStorage.getItem('mf_search_history') || '[]');
      dispatch({ type: 'INIT_LOCAL', payload: { cart, wishlist, searchHistory } });
    } catch {}
  }, []);

  /* 2. Escuchar Firestore en tiempo real — todos los dispositivos se sincronizan */
  useEffect(() => {
    const unsubs = [];

    unsubs.push(onSnapshot(doc(db, COL, 'products'), snap => {
      if (snap.exists()) {
        const items = snap.data().items || [];
        dispatch({ type: 'SET_PRODUCTS', payload: items.length ? items : DEMO_PRODUCTS });
      } else {
        dispatch({ type: 'SET_PRODUCTS', payload: DEMO_PRODUCTS });
        saveToFirestore('products', { items: DEMO_PRODUCTS });
      }
    }, err => console.error('products snapshot error:', err)));

    unsubs.push(onSnapshot(doc(db, COL, 'promos'), snap => {
      if (snap.exists()) {
        dispatch({ type: 'SET_PROMOS', payload: snap.data().items || DEMO_PROMOS });
      } else {
        dispatch({ type: 'SET_PROMOS', payload: DEMO_PROMOS });
        saveToFirestore('promos', { items: DEMO_PROMOS });
      }
    }, err => console.error('promos snapshot error:', err)));

    unsubs.push(onSnapshot(doc(db, COL, 'banners'), snap => {
      if (snap.exists()) {
        dispatch({ type: 'SET_BANNERS', payload: snap.data().items || DEMO_BANNERS });
      } else {
        dispatch({ type: 'SET_BANNERS', payload: DEMO_BANNERS });
        saveToFirestore('banners', { items: DEMO_BANNERS });
      }
    }, err => console.error('banners snapshot error:', err)));

    unsubs.push(onSnapshot(doc(db, COL, 'paginas'), snap => {
      if (snap.exists()) {
        dispatch({ type: 'SET_PAGINAS', payload: snap.data().data || DEMO_PAGINAS });
      } else {
        dispatch({ type: 'SET_PAGINAS', payload: DEMO_PAGINAS });
        saveToFirestore('paginas', { data: DEMO_PAGINAS });
      }
      dispatch({ type: 'DB_LOADED' });
    }, err => { console.error('paginas snapshot error:', err); dispatch({ type: 'DB_LOADED' }); }));

    return () => unsubs.forEach(u => u());
  }, []);

  /* 3. Persistir carrito y wishlist en localStorage */
  useEffect(() => { localStorage.setItem('mf_cart',     JSON.stringify(state.cart));    }, [state.cart]);
  useEffect(() => { localStorage.setItem('mf_wishlist', JSON.stringify(state.wishlist)); }, [state.wishlist]);
  useEffect(() => { localStorage.setItem('mf_search_history', JSON.stringify(state.searchHistory)); }, [state.searchHistory]);

  /* 4. Función de guardado a Firestore — disponible en contexto */
  const saveConfig = async (type, data) => {
    switch(type) {
      case 'products': await saveToFirestore('products', { items: data }); break;
      case 'promos':   await saveToFirestore('promos',   { items: data }); break;
      case 'banners':  await saveToFirestore('banners',  { items: data }); break;
      case 'paginas':  await saveToFirestore('paginas',  { data });        break;
    }
  };

  return (
    <StoreContext.Provider value={{ state, dispatch, saveConfig }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

/* ─────────────────────────────────────────────────────────
   CONSTANTES EXPORTADAS
───────────────────────────────────────────────────────── */
export const CAT_LABELS = {
  todos: 'Todos los productos',
  dermocosmetica: 'Dermocosmética',
  perfumes: 'Perfumes',
  bebe: 'Bebé & Maternidad',
  'cuidado-personal': 'Cuidado Personal',
  nutricion: 'Nutrición & Deporte',
  maquillaje: 'Maquillaje',
  electro: 'Electro Salud',
  hogar: 'Hogar',
  infantiles: 'Infantiles',
  'salud-sexual': 'Salud Sexual',
  'adultos-mayores': 'Adultos Mayores',
};

export const CAT_ICONS = {
  todos: '🛍️',
  dermocosmetica: '✨',
  perfumes: '🌸',
  bebe: '👶',
  'cuidado-personal': '🪥',
  nutricion: '💪',
  maquillaje: '💄',
  electro: '⚡',
  hogar: '🏠',
  infantiles: '🧸',
  'salud-sexual': '❤️',
  'adultos-mayores': '🏥',
};

export const CAT_IMAGES = {};

export const BRANDS = ['Bagó','Roemmers','Bayer','Vichy','ISDIN','Eucerin','La Roche-Posay','Neutrogena','Nivea','Pantene','Revlon',"Johnson's",'Pampers','Omron','Go Cuotas'];

export const ORDER_STATUS_LABELS = {
  nuevo: 'Nuevo',
  'en-proceso': 'En proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export function formatPrice(n) {
  if (n === undefined || n === null || n === '') return '0';
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}
