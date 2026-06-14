'use client';
import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const DEMO_PRODUCTS = [
  { codigo:'7793200100001', nombre:'Crema Nivea Aclarante 400ml', marca:'Nivea', categoria:'dermocosmetica', precio:3200, precio_oferta:2600, descripcion:'Hidratante corporal con efecto aclarante.', stock:'Disponible', destacado:'SI', imagen_url:'' },
  { codigo:'7793200100002', nombre:'Shampoo Pantene Pro-V 750ml', marca:'Pantene', categoria:'cuidado-personal', precio:2800, precio_oferta:'', descripcion:'Shampoo Pro-V para cabello fuerte.', stock:'Disponible', destacado:'SI', imagen_url:'' },
  { codigo:'7793200100003', nombre:'Perfume Natura Essencial 100ml', marca:'Natura', categoria:'perfumes', precio:12500, precio_oferta:10000, descripcion:'Fragancia fresca y duradera.', stock:'Disponible', destacado:'SI', imagen_url:'' },
  { codigo:'7793200100004', nombre:'Pañales Pampers Talle M x24', marca:'Pampers', categoria:'bebe', precio:5200, precio_oferta:'', descripcion:'Suavidad y protección hasta 12 horas.', stock:'Disponible', destacado:'SI', imagen_url:'' },
  { codigo:'7793200100005', nombre:'Protector Solar Banana Boat FPS50', marca:'Banana Boat', categoria:'dermocosmetica', precio:3800, precio_oferta:3200, descripcion:'Protección solar alta resistente al agua.', stock:'Disponible', destacado:'SI', imagen_url:'' },
  { codigo:'7793200100006', nombre:'Vitamina C 1000mg x60 comp', marca:'Bagó', categoria:'nutricion', precio:3600, precio_oferta:2900, descripcion:'Vitamina C para reforzar el sistema inmune.', stock:'Disponible', destacado:'SI', imagen_url:'' },
];

const DEMO_PROMOS = [
  { tarjeta:'Santander', tipo:'Visa / Mastercard', descuento:20, cuotas:6, detalle:'20% de descuento todos los días', dia:'', vigencia:'31/12/2026', activa:'SI', imagen_url:'' },
  { tarjeta:'Galicia', tipo:'Mastercard', descuento:15, cuotas:12, detalle:'15% off + 12 cuotas sin interés', dia:'Jueves', vigencia:'31/12/2026', activa:'SI', imagen_url:'' },
];

const DEMO_BANNERS = [
  { titulo:'Cuidá tu salud, cada día', subtitulo:'Productos de salud y bienestar con envío a domicilio', color:'#C8102E', boton:'Ver productos', link:'productos', activo:'SI', imagen_url:'', tipo:'principal' },
  { titulo:'Ofertas imperdibles', subtitulo:'Descuentos exclusivos por tiempo limitado', color:'#1a3a5c', boton:'Ver ofertas', link:'ofertas', activo:'SI', imagen_url:'', tipo:'principal' },
  { titulo:'Promos bancarias', subtitulo:'Hasta 20% off con tu tarjeta', color:'#2F855A', boton:'Ver promos', link:'promos', activo:'SI', imagen_url:'', tipo:'secundario' },
  { titulo:'Bonos y descuentos', subtitulo:'Subimos imágenes de tus descuentos', color:'#7B2D8B', boton:'Ver más', link:'ofertas', activo:'SI', imagen_url:'', tipo:'secundario' },
  { titulo:'Novedades', subtitulo:'Nuevos productos disponibles', color:'#D97706', boton:'Ver productos', link:'productos', activo:'SI', imagen_url:'', tipo:'secundario' },
];

const DEMO_PAGINAS = {
  'preguntas-frecuentes': { titulo:'Preguntas Frecuentes', contenido:'**¿Cómo realizo un pedido?**\nNavegá por el catálogo, agregá productos al carrito y completá el formulario.\n\n**¿Cuáles son los medios de pago?**\nAceptamos efectivo, transferencia, Mercado Pago y tarjetas.\n\n**¿Hacen envíos?**\nSí, en la zona de Cañuelas y alrededores.' },
  'como-comprar': { titulo:'Cómo Comprar', contenido:'**Paso 1** — Explorá el catálogo\n\n**Paso 2** — Agregá al carrito\n\n**Paso 3** — Completá tus datos\n\n**Paso 4** — Confirmá por WhatsApp' },
  'envios': { titulo:'Envíos y Entregas', contenido:'**Zona de cobertura**\nCañuelas y alrededores.\n\n**Tiempo de entrega**\nMismo día o día siguiente.\n\n**Retiro sin cargo**\nRuta Nacional 6 Km 22,5.' },
  'devoluciones': { titulo:'Cambios y Devoluciones', contenido:'**Política de cambios**\nHasta 30 días, producto sin uso.\n\n**Botón de arrepentimiento**\nLey 24.240: 10 días hábiles.' },
  'medios-de-pago': { titulo:'Medios de Pago', contenido:'**Tarjetas de crédito**\nVisa, Mastercard, Amex, Naranja X, Cabal.\n\n**Mercado Pago**\nPagos y cuotas.\n\n**Efectivo**\nEn el local o contra entrega.' },
  'terminos': { titulo:'Términos y Condiciones', contenido:'**1. Aceptación**\nAl usar el sitio aceptás estos términos.\n\n**2. Precios**\nSujetos a cambios sin previo aviso.\n\n**3. Privacidad**\nDatos protegidos por Ley 25.326.' },
};

const initialState = {
  // Estos SIEMPRE vienen de Firestore — nunca de localStorage
  products: [], promos: [], banners: [], orders: [],
  paginas: DEMO_PAGINAS,
  // Estos se persisten en localStorage (solo datos del usuario)
  cart: [], wishlist: [], searchHistory: [],
  currentSection: 'inicio', currentCategory: 'todos',
  searchQuery: '', sortOrder: 'default', maxPrice: 200000,
  cartOpen: false, productModal: null,
  dbLoaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT_LOCAL':         return { ...state, ...action.payload };
    case 'DB_LOADED':          return { ...state, dbLoaded: true };
    case 'SET_PRODUCTS':       return { ...state, products: action.payload };
    case 'SET_PROMOS':         return { ...state, promos: action.payload };
    case 'SET_BANNERS':        return { ...state, banners: action.payload };
    case 'SET_PAGINAS':        return { ...state, paginas: action.payload };
    case 'SET_ORDERS':         return { ...state, orders: action.payload };
    case 'ADD_ORDER':          return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER_STATUS':return { ...state, orders: state.orders.map((o,i) => i===action.idx ? {...o,estado:action.status} : o) };
    case 'ADD_TO_CART': {
      const exists = state.cart.find(i => i.codigo === action.payload.codigo);
      return { ...state, cart: exists ? state.cart.map(i => i.codigo===action.payload.codigo ? {...i,qty:i.qty+1} : i) : [...state.cart,{...action.payload,qty:1}], cartOpen:true };
    }
    case 'REMOVE_FROM_CART':   return { ...state, cart: state.cart.filter(i => i.codigo !== action.codigo) };
    case 'UPDATE_CART_QTY':    return { ...state, cart: state.cart.map(i => i.codigo===action.codigo ? {...i,qty:Math.max(1,i.qty+action.delta)} : i) };
    case 'CLEAR_CART':         return { ...state, cart: [] };
    case 'TOGGLE_CART':        return { ...state, cartOpen: !state.cartOpen };
    case 'CLOSE_CART':         return { ...state, cartOpen: false };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.includes(action.codigo);
      return { ...state, wishlist: exists ? state.wishlist.filter(c=>c!==action.codigo) : [...state.wishlist,action.codigo] };
    }
    case 'SET_SECTION':        return { ...state, currentSection: action.payload };
    case 'SET_CATEGORY':       return { ...state, currentCategory: action.payload, searchQuery:'', currentSection:'productos' };
    // FIX: historial solo se guarda cuando viene con saveToHistory:true
    case 'SET_SEARCH':         return {
      ...state,
      searchQuery: action.payload,
      currentSection: action.payload ? 'productos' : state.currentSection,
      searchHistory: action.saveToHistory && action.payload && !state.searchHistory.includes(action.payload)
        ? [action.payload, ...state.searchHistory].slice(0, 5)
        : state.searchHistory,
    };
    case 'SET_SORT':           return { ...state, sortOrder: action.payload };
    case 'SET_MAX_PRICE':      return { ...state, maxPrice: action.payload };
    case 'OPEN_PRODUCT_MODAL': return { ...state, productModal: action.payload };
    case 'CLOSE_PRODUCT_MODAL':return { ...state, productModal: null };
    default:                   return state;
  }
}

const COL = 'config';
async function saveToFirestore(docId, payload) {
  try { await setDoc(doc(db, COL, docId), payload, { merge: true }); }
  catch (e) { console.error('Firestore save error:', e); }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialLoadDone = useRef(false);

  // 1. Cargar SOLO carrito/wishlist/historial desde localStorage
  // Los productos, banners y promos SIEMPRE vienen de Firestore
  useEffect(() => {
    try {
      const cart          = JSON.parse(localStorage.getItem('mf_cart')           || '[]');
      const wishlist      = JSON.parse(localStorage.getItem('mf_wishlist')        || '[]');
      const searchHistory = JSON.parse(localStorage.getItem('mf_search_history')  || '[]');
      // Limpiar cualquier dato de catálogo que pudiera estar cacheado en localStorage
      localStorage.removeItem('mf_products');
      localStorage.removeItem('mf_banners');
      localStorage.removeItem('mf_promos');
      localStorage.removeItem('mf_paginas');
      dispatch({ type:'INIT_LOCAL', payload:{ cart, wishlist, searchHistory } });
    } catch {}
  }, []);

  // 2. Escuchar Firestore en tiempo real — FUENTE DE VERDAD
  // Cualquier cambio en Firestore se propaga INMEDIATAMENTE a todos los dispositivos
  // Los datos de localStorage NUNCA pisan estos valores
  useEffect(() => {
    const unsubs = [];
    let loadedCount = 0;
    const TOTAL = 4; // products, promos, banners, paginas

    const markLoaded = () => {
      loadedCount++;
      if (loadedCount >= TOTAL && !initialLoadDone.current) {
        initialLoadDone.current = true;
        dispatch({ type:'DB_LOADED' });
      }
    };

    unsubs.push(onSnapshot(doc(db, COL, 'products'), snap => {
      if (snap.exists()) {
        // Si Firestore tiene array vacío [] significa que el admin borró todos los productos
        dispatch({ type:'SET_PRODUCTS', payload: snap.data().items ?? DEMO_PRODUCTS });
      } else {
        dispatch({ type:'SET_PRODUCTS', payload: DEMO_PRODUCTS });
        saveToFirestore('products', { items: DEMO_PRODUCTS });
      }
      markLoaded();
    }, err => {
      console.error('products error:', err);
      dispatch({ type:'SET_PRODUCTS', payload: DEMO_PRODUCTS });
      markLoaded();
    }));

    unsubs.push(onSnapshot(doc(db, COL, 'promos'), snap => {
      if (snap.exists()) {
        dispatch({ type:'SET_PROMOS', payload: snap.data().items ?? DEMO_PROMOS });
      } else {
        dispatch({ type:'SET_PROMOS', payload: DEMO_PROMOS });
        saveToFirestore('promos', { items: DEMO_PROMOS });
      }
      markLoaded();
    }, err => {
      console.error('promos error:', err);
      dispatch({ type:'SET_PROMOS', payload: DEMO_PROMOS });
      markLoaded();
    }));

    unsubs.push(onSnapshot(doc(db, COL, 'banners'), snap => {
      if (snap.exists()) {
        dispatch({ type:'SET_BANNERS', payload: snap.data().items ?? DEMO_BANNERS });
      } else {
        dispatch({ type:'SET_BANNERS', payload: DEMO_BANNERS });
        saveToFirestore('banners', { items: DEMO_BANNERS });
      }
      markLoaded();
    }, err => {
      console.error('banners error:', err);
      dispatch({ type:'SET_BANNERS', payload: DEMO_BANNERS });
      markLoaded();
    }));

    unsubs.push(onSnapshot(doc(db, COL, 'paginas'), snap => {
      if (snap.exists()) {
        dispatch({ type:'SET_PAGINAS', payload: snap.data().data ?? DEMO_PAGINAS });
      } else {
        dispatch({ type:'SET_PAGINAS', payload: DEMO_PAGINAS });
        saveToFirestore('paginas', { data: DEMO_PAGINAS });
      }
      markLoaded();
    }, err => {
      console.error('paginas error:', err);
      markLoaded();
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  // 3. Persistir carrito y wishlist (NO historial — se guarda solo al confirmar búsqueda)
  useEffect(() => { localStorage.setItem('mf_cart',     JSON.stringify(state.cart));    }, [state.cart]);
  useEffect(() => { localStorage.setItem('mf_wishlist', JSON.stringify(state.wishlist));}, [state.wishlist]);
  useEffect(() => { localStorage.setItem('mf_search_history', JSON.stringify(state.searchHistory)); }, [state.searchHistory]);

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

export const CAT_LABELS = {
  todos:'Todos los productos', dermocosmetica:'Dermocosmética', perfumes:'Perfumes',
  bebe:'Bebé & Maternidad', 'cuidado-personal':'Cuidado Personal', nutricion:'Nutrición & Deporte',
  maquillaje:'Maquillaje', electro:'Electro Salud', hogar:'Hogar',
  infantiles:'Infantiles', 'salud-sexual':'Salud Sexual', 'adultos-mayores':'Adultos Mayores',
};

export const CAT_ICONS = {
  todos:'🛍️', dermocosmetica:'✨', perfumes:'🌸', bebe:'👶', 'cuidado-personal':'🪥',
  nutricion:'💪', maquillaje:'💄', electro:'⚡', hogar:'🏠',
  infantiles:'🧸', 'salud-sexual':'❤️', 'adultos-mayores':'🏥',
};

export const CAT_IMAGES = {};
export const BRANDS = ['Bagó','Roemmers','Bayer','Vichy','ISDIN','Eucerin','La Roche-Posay','Neutrogena','Nivea','Pantene','Revlon',"Johnson's",'Pampers','Omron'];
export const ORDER_STATUS_LABELS = { nuevo:'Nuevo', 'en-proceso':'En proceso', completado:'Completado', cancelado:'Cancelado' };

export function formatPrice(n) {
  if (n===undefined||n===null||n==='') return '0';
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits:0 });
}
