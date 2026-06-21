'use client';
import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  doc, setDoc, getDoc, onSnapshot, deleteDoc
} from 'firebase/firestore';

/* ─── DEMO (solo si Firestore está vacío) ─── */
const DEMO_PRODUCTS = [
  { codigo:'DEMO001', nombre:'Crema Hidratante Demo', marca:'Demo', categoria:'dermocosmetica', precio:1000, precio_oferta:'', descripcion:'Producto de ejemplo.', stock:'Disponible', destacado:'SI', imagen_url:'' },
];

const DEMO_PROMOS = [
  { tarjeta:'Santander', tipo:'Visa / Mastercard', descuento:20, cuotas:6, detalle:'20% de descuento todos los días', dia:'', vigencia:'31/12/2026', activa:'SI', imagen_url:'' },
];

const DEMO_BANNERS = [
  { titulo:'Cuidá tu salud, cada día', subtitulo:'Productos de salud y bienestar con envío a domicilio', color:'#C8102E', boton:'Ver productos', link:'productos', activo:'SI', imagen_url:'', tipo:'principal' },
];

const DEMO_PAGINAS = {
  'preguntas-frecuentes': { titulo:'Preguntas Frecuentes', contenido:'**¿Cómo realizo un pedido?**\nNavegá por el catálogo, agregá productos al carrito y completá el formulario.' },
  'como-comprar': { titulo:'Cómo Comprar', contenido:'**Paso 1** — Explorá el catálogo\n\n**Paso 2** — Agregá al carrito\n\n**Paso 3** — Confirmá por WhatsApp' },
  'envios': { titulo:'Envíos y Entregas', contenido:'**Zona de cobertura**\nConsultanos por WhatsApp.' },
  'devoluciones': { titulo:'Cambios y Devoluciones', contenido:'**Política**\nHasta 30 días, producto sin uso.' },
  'medios-de-pago': { titulo:'Medios de Pago', contenido:'**Tarjetas**\nVisa, Mastercard, Amex.\n\n**Go Cuotas**\n4 cuotas sin interés.' },
  'terminos': { titulo:'Términos y Condiciones', contenido:'**1. Aceptación**\nAl usar el sitio aceptás estos términos.' },
};

/* ─── CHUNK CONFIG ─── */
const COL = 'config';
const CHUNK_SIZE = 400; // 400 productos por chunk → ~250KB, muy por debajo del límite 1MB

/* ─── GUARDAR PRODUCTOS EN CHUNKS ─── */
async function saveProductsChunked(products) {
  const total = products.length;
  const chunks = [];
  for (let i = 0; i < total; i += CHUNK_SIZE) {
    chunks.push(products.slice(i, i + CHUNK_SIZE));
  }
  const numChunks = chunks.length;

  console.log(`Guardando ${total} productos en ${numChunks} chunk(s)...`);

  // 1. Guardar cada chunk
  for (let i = 0; i < numChunks; i++) {
    await setDoc(doc(db, COL, `products_chunk_${i}`), { items: chunks[i] });
    console.log(`Chunk ${i + 1}/${numChunks} guardado (${chunks[i].length} productos)`);
  }

  // 2. Borrar chunks viejos que ya no se usan
  for (let i = numChunks; i < numChunks + 10; i++) {
    try {
      const old = await getDoc(doc(db, COL, `products_chunk_${i}`));
      if (old.exists()) {
        await deleteDoc(doc(db, COL, `products_chunk_${i}`));
        console.log(`Chunk viejo ${i} eliminado`);
      }
    } catch {}
  }

  // 3. Guardar metadata AL FINAL (esto dispara el onSnapshot)
  await setDoc(doc(db, COL, 'products_meta'), {
    totalChunks: numChunks,
    totalProducts: total,
    updatedAt: new Date().toISOString(),
  });

  console.log(`✓ ${total} productos guardados correctamente`);
}

/* ─── LEER TODOS LOS CHUNKS ─── */
async function loadProductsChunked(totalChunks) {
  const promises = [];
  for (let i = 0; i < totalChunks; i++) {
    promises.push(getDoc(doc(db, COL, `products_chunk_${i}`)));
  }
  const snaps = await Promise.all(promises);
  const all = [];
  for (const s of snaps) {
    if (s.exists()) {
      const items = s.data().items;
      if (Array.isArray(items)) all.push(...items);
    }
  }
  return all;
}

/* ─── GUARDAR OTROS DOCS ─── */
async function saveSimple(docId, payload) {
  await setDoc(doc(db, COL, docId), payload);
}

/* ─── ESTADO INICIAL ─── */
export const DEFAULT_CATS = [
  { key:'dermocosmetica',   label:'Dermocosmética',     icon:'droplets' },
  { key:'perfumes',         label:'Perfumes',            icon:'wind' },
  { key:'bebe',             label:'Bebé & Maternidad',   icon:'baby' },
  { key:'cuidado-personal', label:'Cuidado Personal',    icon:'brush' },
  { key:'nutricion',        label:'Nutrición & Deporte', icon:'dumbbell' },
  { key:'maquillaje',       label:'Maquillaje',          icon:'sparkles' },
  { key:'hogar',            label:'Hogar',               icon:'home' },
  { key:'infantiles',       label:'Infantiles',          icon:'smile' },
  { key:'salud-sexual',     label:'Salud Sexual',        icon:'ribbon' },
  { key:'adultos-mayores',  label:'Adultos Mayores',     icon:'users' },
  { key:'medicamentos',     label:'Medicamentos',        icon:'pill' },
];

const initialState = {
  products: [], promos: [], banners: [], orders: [], programas: [],
  categorias: DEFAULT_CATS,
  paginas: DEMO_PAGINAS,
  cart: [], wishlist: [], searchHistory: [],
  currentSection: 'inicio', currentCategory: 'todos',
  currentPrograma: null,
  searchQuery: '', sortOrder: 'default', maxPrice: 200000,
  cartOpen: false, productModal: null,
  dbLoaded: false,
};

/* ─── REDUCER ─── */
function reducer(state, action) {
  switch (action.type) {
    case 'INIT_LOCAL':          return { ...state, ...action.payload };
    case 'DB_LOADED':           return { ...state, dbLoaded: true };
    case 'SET_PRODUCTS':        return { ...state, products: action.payload };
    case 'SET_PROMOS':          return { ...state, promos: action.payload };
    case 'SET_BANNERS':         return { ...state, banners: action.payload };
    case 'SET_PAGINAS':         return { ...state, paginas: action.payload };
    case 'SET_ORDERS':          return { ...state, orders: action.payload };
    case 'SET_PROGRAMAS':       return { ...state, programas: action.payload };
    case 'SET_CATEGORIAS':      return { ...state, categorias: action.payload };
    case 'ADD_ORDER':           return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER_STATUS': return { ...state, orders: state.orders.map((o,i) => i===action.idx ? {...o,estado:action.status} : o) };
    case 'ADD_TO_CART': {
      const exists = state.cart.find(i => i.codigo === action.payload.codigo);
      return {
        ...state,
        cart: exists
          ? state.cart.map(i => i.codigo===action.payload.codigo ? {...i,qty:i.qty+1} : i)
          : [...state.cart, {...action.payload, qty:1}],
        cartOpen: true,
      };
    }
    case 'REMOVE_FROM_CART':    return { ...state, cart: state.cart.filter(i => i.codigo !== action.codigo) };
    case 'UPDATE_CART_QTY':     return { ...state, cart: state.cart.map(i => i.codigo===action.codigo ? {...i,qty:Math.max(1,i.qty+action.delta)} : i) };
    case 'CLEAR_CART':          return { ...state, cart: [] };
    case 'TOGGLE_CART':         return { ...state, cartOpen: !state.cartOpen };
    case 'CLOSE_CART':          return { ...state, cartOpen: false };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.includes(action.codigo);
      return { ...state, wishlist: exists ? state.wishlist.filter(c=>c!==action.codigo) : [...state.wishlist, action.codigo] };
    }
    case 'SET_SECTION':         return { ...state, currentSection: action.payload };
    case 'SET_CATEGORY':        return { ...state, currentCategory: action.payload, searchQuery:'', currentSection:'productos' };
    case 'SET_PROGRAMA':        return { ...state, currentPrograma: action.payload, currentSection:'programa' };
    case 'SET_SEARCH':          return {
      ...state,
      searchQuery: action.payload,
      currentSection:  action.payload ? 'productos' : state.currentSection,
      currentCategory: action.payload ? 'todos'     : state.currentCategory,
      searchHistory: action.saveToHistory && action.payload && !state.searchHistory.includes(action.payload)
        ? [action.payload, ...state.searchHistory].slice(0, 5)
        : state.searchHistory,
    };
    case 'SET_SORT':            return { ...state, sortOrder: action.payload };
    case 'SET_MAX_PRICE':       return { ...state, maxPrice: action.payload };
    case 'OPEN_PRODUCT_MODAL':  return { ...state, productModal: action.payload };
    case 'CLOSE_PRODUCT_MODAL': return { ...state, productModal: null };
    default:                    return state;
  }
}

/* ─── CONTEXT ─── */
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const loadedRef = useRef(false);
  const loadedCount = useRef(0);
  const TOTAL_LISTENERS = 5; // meta, promos, banners, paginas, categorias

  const markLoaded = () => {
    loadedCount.current++;
    if (loadedCount.current >= TOTAL_LISTENERS && !loadedRef.current) {
      loadedRef.current = true;
      dispatch({ type: 'DB_LOADED' });
    }
  };

  /* 1. localStorage — solo carrito/wishlist/historial */
  useEffect(() => {
    try {
      const cart         = JSON.parse(localStorage.getItem('mf_cart')           || '[]');
      const wishlist     = JSON.parse(localStorage.getItem('mf_wishlist')        || '[]');
      const searchHistory= JSON.parse(localStorage.getItem('mf_search_history')  || '[]');
      localStorage.removeItem('mf_products');
      dispatch({ type:'INIT_LOCAL', payload:{ cart, wishlist, searchHistory } });
    } catch {}
  }, []);

  /* 2. Firestore listeners */
  useEffect(() => {
    const unsubs = [];

    /* ── PRODUCTOS: escuchar el meta-doc, luego leer chunks ── */
    unsubs.push(onSnapshot(doc(db, COL, 'products_meta'), async (metaSnap) => {
      try {
        if (metaSnap.exists()) {
          const { totalChunks, totalProducts } = metaSnap.data();
          console.log(`Meta recibido: ${totalProducts} productos en ${totalChunks} chunks`);
          const products = await loadProductsChunked(totalChunks);
          console.log(`Cargados: ${products.length} productos`);
          dispatch({ type:'SET_PRODUCTS', payload: products.length > 0 ? products : [] });
        } else {
          // Primera vez: inicializar con demo
          console.log('No hay productos en Firestore, cargando demo...');
          dispatch({ type:'SET_PRODUCTS', payload: DEMO_PRODUCTS });
          await saveProductsChunked(DEMO_PRODUCTS);
        }
      } catch (e) {
        console.error('Error cargando productos:', e);
        dispatch({ type:'SET_PRODUCTS', payload: [] });
      }
      markLoaded();
    }, err => {
      console.error('products_meta error:', err);
      dispatch({ type:'SET_PRODUCTS', payload: [] });
      markLoaded();
    }));

    /* ── PROMOS ── */
    unsubs.push(onSnapshot(doc(db, COL, 'promos'), snap => {
      if (snap.exists()) {
        dispatch({ type:'SET_PROMOS', payload: snap.data().items ?? DEMO_PROMOS });
      } else {
        dispatch({ type:'SET_PROMOS', payload: DEMO_PROMOS });
        saveSimple('promos', { items: DEMO_PROMOS });
      }
      markLoaded();
    }, err => { console.error('promos error:', err); markLoaded(); }));

    /* ── BANNERS ── */
    unsubs.push(onSnapshot(doc(db, COL, 'banners'), snap => {
      if (snap.exists()) {
        dispatch({ type:'SET_BANNERS', payload: snap.data().items ?? DEMO_BANNERS });
      } else {
        dispatch({ type:'SET_BANNERS', payload: DEMO_BANNERS });
        saveSimple('banners', { items: DEMO_BANNERS });
      }
      markLoaded();
    }, err => { console.error('banners error:', err); markLoaded(); }));

    /* ── PAGINAS ── */
    unsubs.push(onSnapshot(doc(db, COL, 'paginas'), snap => {
      if (snap.exists()) {
        dispatch({ type:'SET_PAGINAS', payload: snap.data().data ?? DEMO_PAGINAS });
      } else {
        dispatch({ type:'SET_PAGINAS', payload: DEMO_PAGINAS });
        saveSimple('paginas', { data: DEMO_PAGINAS });
      }
      markLoaded();
    }, err => { console.error('paginas error:', err); markLoaded(); }));

    /* ── CATEGORIAS ── */
    unsubs.push(onSnapshot(doc(db, COL, 'categorias'), snap => {
      if (snap.exists()) {
        dispatch({ type:'SET_CATEGORIAS', payload: snap.data().items ?? DEFAULT_CATS });
      } else {
        dispatch({ type:'SET_CATEGORIAS', payload: DEFAULT_CATS });
        saveSimple('categorias', { items: DEFAULT_CATS });
      }
      markLoaded();
    }, err => { console.error('categorias error:', err); markLoaded(); }));

    /* ── PROGRAMAS ── */
    unsubs.push(onSnapshot(doc(db, COL, 'programas'), snap => {
      if (snap.exists()) {
        dispatch({ type:'SET_PROGRAMAS', payload: snap.data().items ?? [] });
      }
    }, err => console.error('programas error:', err)));

    return () => unsubs.forEach(u => u());
  }, []);

  /* 3. Persistir carrito/wishlist en localStorage */
  useEffect(() => { localStorage.setItem('mf_cart',            JSON.stringify(state.cart));          }, [state.cart]);
  useEffect(() => { localStorage.setItem('mf_wishlist',        JSON.stringify(state.wishlist));       }, [state.wishlist]);
  useEffect(() => { localStorage.setItem('mf_search_history',  JSON.stringify(state.searchHistory)); }, [state.searchHistory]);

  /* 4. saveConfig — disponible en contexto */
  const saveConfig = async (type, data) => {
    try {
      switch (type) {
        case 'products':
          dispatch({ type:'SET_PRODUCTS', payload: data });
          await saveProductsChunked(data);
          break;
        case 'promos':
          await saveSimple('promos',     { items: data });
          break;
        case 'banners':
          await saveSimple('banners',    { items: data });
          break;
        case 'paginas':
          await saveSimple('paginas',    { data });
          break;
        case 'programas':
          await saveSimple('programas',  { items: data });
          break;
        case 'categorias':
          await saveSimple('categorias', { items: data });
          break;
      }
    } catch (e) {
      console.error('saveConfig error:', e);
      alert('Error al guardar. Revisá la consola.');
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

/* ─── EXPORTS ─── */
export const CAT_LABELS = Object.fromEntries([
  ['todos', 'Todos los productos'],
  ...DEFAULT_CATS.map(c => [c.key, c.label]),
]);

export const CAT_ICONS = Object.fromEntries([
  ['todos', '🛍️'],
  ...DEFAULT_CATS.map(c => [c.key, c.icon]),
]);

export function getCatLabels(categorias) {
  return Object.fromEntries([
    ['todos', 'Todos los productos'],
    ...(categorias || DEFAULT_CATS).map(c => [c.key, c.label]),
  ]);
}

export function getCatIcons(categorias) {
  return Object.fromEntries([
    ['todos', '🛍️'],
    ...(categorias || DEFAULT_CATS).map(c => [c.key, c.icon]),
  ]);
}

export const CAT_IMAGES = {};
export const BRANDS = ['Bagó','Roemmers','Bayer','Vichy','ISDIN','Eucerin','La Roche-Posay','Neutrogena','Nivea','Pantene','Revlon',"Johnson's",'Pampers','Omron','Andrómaco'];
export const ORDER_STATUS_LABELS = { nuevo:'Nuevo', 'en-proceso':'En proceso', completado:'Completado', cancelado:'Cancelado' };

export function formatPrice(n) {
  if (n === undefined || n === null || n === '') return '0';
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}
