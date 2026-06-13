'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore, formatPrice, ORDER_STATUS_LABELS, CAT_LABELS, CAT_ICONS } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import {
  X, Plus, Pencil, Trash2, Upload, ChevronDown, ChevronUp,
  Save, ArrowLeft, Eye, EyeOff, Lock, Package, CreditCard,
  Image, Settings, ShoppingBag, AlertCircle,
  CheckCircle, LayoutDashboard, FileText
} from 'lucide-react';

/* ─── AUTH ─────────────────────────────────────────────── */
const ADMIN_PASS_KEY = 'maxfarma_panel_pass';
function encodePass(p) { return 'mxf_' + btoa(unescape(encodeURIComponent(p))); }
function decodePass(e) { try { return decodeURIComponent(escape(atob(e.replace('mxf_', '')))); } catch { return ''; } }
function getPass() {
  const v = localStorage.getItem(ADMIN_PASS_KEY);
  if (!v) localStorage.setItem(ADMIN_PASS_KEY, encodePass('Maxfarma2024!'));
  return decodePass(localStorage.getItem(ADMIN_PASS_KEY));
}
function setNewPass(p) { localStorage.setItem(ADMIN_PASS_KEY, encodePass(p)); }

/* ─── TEMPLATES ─────────────────────────────────────────── */
const EMPTY_PRODUCT = { codigo: '', nombre: '', marca: '', categoria: 'dermocosmetica', precio: '', precio_oferta: '', descripcion: '', stock: 'Disponible', destacado: 'NO', imagen_url: '' };
const EMPTY_PROMO   = { tarjeta: '', tipo: '', descuento: 0, cuotas: 0, detalle: '', dia: '', vigencia: '', activa: 'SI', imagen_url: '' };
const EMPTY_BANNER  = { titulo: '', subtitulo: '', color: '#C8102E', boton: '', link: 'productos', activo: 'SI', imagen_url: '' };

const LINK_OPTIONS = [
  { value: 'productos', label: 'Productos' },
  { value: 'ofertas',   label: 'Ofertas' },
  { value: 'promos',    label: 'Promos Bancarias' },
  { value: 'inicio',    label: 'Inicio' },
];

/* ─── SHARED UI ─────────────────────────────────────────── */
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{children}</label>
);

const Field = ({ label, children, col2 }) => (
  <div className={col2 ? 'md:col-span-2' : ''}>
    {label && <Label>{label}</Label>}
    {children}
  </div>
);

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
    active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {active ? 'Activa' : 'Inactiva'}
  </span>
);

/* ─── IMAGE UPLOAD FIELD ─────────────────────────────────
   Permite ingresar URL O subir imagen desde el ordenador (convierte a base64).
   Props:
     value        → imagen_url actual (string)
     onChange     → fn(newValue: string)
     label        → string
     placeholder  → string
     previewClass → clase css para el preview
─────────────────────────────────────────────────────────── */
function ImageField({ value, onChange, label = 'URL de imagen', placeholder = 'https://...', previewClass = 'w-16 h-16' }) {
  const fileRef = useRef();
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Seleccioná un archivo de imagen (jpg, png, webp, etc.)'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('La imagen debe pesar menos de 2 MB. Comprimila antes de subirla.'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => { onChange(ev.target.result); setImgError(false); setUploading(false); };
    reader.onerror = () => { alert('Error al leer el archivo.'); setUploading(false); };
    reader.readAsDataURL(file);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
          value={value && value.startsWith('data:') ? '(imagen subida desde PC)' : (value || '')}
          onChange={e => { if (!e.target.value.startsWith('(')) { onChange(e.target.value); setImgError(false); } }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap border border-gray-200"
          title="Subir imagen desde tu ordenador"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Cargando...' : 'Subir'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setImgError(false); }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Quitar imagen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-3">
          {!imgError ? (
            <img
              src={value}
              alt="preview"
              className={`${previewClass} object-contain border border-gray-100 rounded-lg bg-gray-50 p-1`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`${previewClass} border border-red-200 rounded-lg bg-red-50 flex items-center justify-center`}>
              <X className="w-4 h-4 text-red-400" />
            </div>
          )}
          <p className="text-xs text-gray-400">
            {imgError ? '⚠ URL no válida o imagen no disponible' :
              value.startsWith('data:') ? '✓ Imagen subida desde tu PC' : '✓ Vista previa'}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── CONFIRM MODAL ─────────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Confirmar acción</p>
            <p className="text-xs text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN ADMIN
═══════════════════════════════════════════════════════════ */
export default function Admin() {
  const { state, dispatch, saveConfig } = useStore();
  const [unlocked, setUnlocked]   = useState(false);
  const [pass, setPass]           = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [passError, setPassError] = useState(false);
  const [tab, setTab]             = useState('pedidos');
  const [orders, setOrders]       = useState([]);
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    if (!unlocked) return;
    const q = query(collection(db, 'pedidos'), orderBy('fecha', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ ...d.data(), _fbId: d.id })));
    });
    return () => unsub();
  }, [unlocked]);

  const handleLogin = () => {
    if (pass === getPass()) { setUnlocked(true); setPassError(false); }
    else { setPassError(true); setPass(''); }
  };

  const updateStatus = async (order, status) => {
    if (order._fbId) await updateDoc(doc(db, 'pedidos', order._fbId), { estado: status });
  };

  const filtered = statusFilter === 'todos' ? orders : orders.filter(o => o.estado === statusFilter);
  const nuevos = orders.filter(o => o.estado === 'nuevo').length;

  /* ── LOGIN ── */
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="MaxFarma" className="h-10 w-auto object-contain mx-auto mb-6 brightness-200" onError={e => e.target.style.display='none'} />
            <h1 className="text-white text-xl font-bold tracking-tight">Panel de Administración</h1>
            <p className="text-gray-400 text-sm mt-1">Acceso restringido</p>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-7">
            <div className="mb-5">
              <Label>Contraseña</Label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Ingresá la contraseña"
                  className={`w-full bg-white/10 border ${passError ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8102E] transition-colors pr-10`}
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passError && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Contraseña incorrecta
                </p>
              )}
            </div>
            <button onClick={handleLogin}
              className="w-full bg-[#C8102E] hover:bg-[#9B0D22] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
              Ingresar al panel
            </button>
            <p className="text-xs text-gray-600 mt-4 text-center">
              Contraseña por defecto: <span className="text-gray-400 font-mono">Maxfarma2024!</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── PANEL ── */
  const TABS = [
    { key: 'pedidos',   label: 'Pedidos',          icon: <ShoppingBag className="w-4 h-4" />,    badge: nuevos || null },
    { key: 'productos', label: 'Productos',         icon: <Package className="w-4 h-4" /> },
    { key: 'promos',    label: 'Promos Bancarias',  icon: <CreditCard className="w-4 h-4" /> },
    { key: 'banners',   label: 'Banners',           icon: <Image className="w-4 h-4" /> },
    { key: 'paginas',   label: 'Páginas',           icon: <FileText className="w-4 h-4" /> },
    { key: 'config',    label: 'Configuración',     icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#C8102E] flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Panel MaxFarma</span>
            <span className="hidden sm:block text-gray-300">|</span>
            <nav className="hidden sm:flex items-center gap-1">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    tab === t.key ? 'bg-[#C8102E] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  {t.icon} {t.label}
                  {t.badge && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ${tab === t.key ? 'bg-white text-[#C8102E]' : 'bg-[#C8102E] text-white'}`}>
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <button onClick={() => { setUnlocked(false); dispatch({ type: 'SET_SECTION', payload: 'inicio' }); }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Salir al sitio
          </button>
        </div>
        {/* Mobile tabs */}
        <div className="sm:hidden flex overflow-x-auto border-t border-gray-100 px-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key ? 'border-[#C8102E] text-[#C8102E]' : 'border-transparent text-gray-500'
              }`}>
              {t.icon} {t.label}
              {t.badge && <span className="bg-[#C8102E] text-white text-xs rounded-full px-1 leading-none py-0.5">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'pedidos'   && <PedidosTab orders={filtered} statusFilter={statusFilter} setStatusFilter={setStatusFilter} updateStatus={updateStatus} allOrders={orders} />}
        {tab === 'productos' && <ProductosTab />}
        {tab === 'promos'    && <PromosTab />}
        {tab === 'banners'   && <BannersTab />}
        {tab === 'paginas'   && <PaginasTab />}
        {tab === 'config'    && <ConfigTab />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB: PEDIDOS
═══════════════════════════════════════════════════════════ */
function PedidosTab({ orders, statusFilter, setStatusFilter, updateStatus, allOrders }) {
  const stats = [
    { label: 'Nuevos',       val: allOrders.filter(o => o.estado === 'nuevo').length,       color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'En proceso',   val: allOrders.filter(o => o.estado === 'en-proceso').length,  color: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'Completados',  val: allOrders.filter(o => o.estado === 'completado').length,  color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Total',        val: allOrders.length,                                          color: 'text-gray-700',   bg: 'bg-gray-100' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent">
          <option value="todos">Todos los estados</option>
          <option value="nuevo">Nuevos</option>
          <option value="en-proceso">En Proceso</option>
          <option value="completado">Completados</option>
          <option value="cancelado">Cancelados</option>
        </select>
        <span className="text-sm text-gray-400">{orders.length} pedido(s)</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay pedidos para mostrar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order, i) => <OrderCard key={order._fbId || i} order={order} onStatusChange={updateStatus} />)}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(order.estado || 'nuevo');

  const handleStatus = (e) => { const s = e.target.value; setStatus(s); onStatusChange(order, s); };

  const statusStyles = {
    nuevo:       'bg-blue-50 text-blue-700 border-blue-200',
    'en-proceso':'bg-amber-50 text-amber-700 border-amber-200',
    completado:  'bg-green-50 text-green-700 border-green-200',
    cancelado:   'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm">{order.cliente}</p>
          <p className="text-xs text-gray-400 mt-0.5">{order.id} · {new Date(order.fecha).toLocaleString('es-AR')} · {order.items?.length} ítem(s) · {order.entrega === 'retiro' ? 'Retiro en sucursal' : 'Envío a domicilio'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-gray-900">${formatPrice(order.total)}</span>
          <select value={status} onChange={handleStatus}
            className={`text-xs font-semibold border rounded-lg px-2 py-1.5 focus:outline-none ${statusStyles[status] || ''}`}>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
          <div className="grid sm:grid-cols-2 gap-3 mb-4 text-xs">
            {[['Email', order.email], ['Teléfono', order.telefono], ['Ciudad', order.ciudad], ['Dirección', order.direccion], ['Notas', order.notas || 'Sin notas']].map(([k, v]) => (
              <div key={k}><span className="text-gray-400 uppercase tracking-wide">{k}</span><p className="font-medium text-gray-700 mt-0.5">{v || '—'}</p></div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
                <span className="text-gray-700">{item.nombre} <span className="text-gray-400">×{item.qty}</span></span>
                <span className="font-semibold">${formatPrice(item.precio * item.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-sm border-t border-gray-200 pt-2 mt-1">
              <span className="text-gray-600">Total</span>
              <span className="text-[#C8102E]">${formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB: PRODUCTOS
═══════════════════════════════════════════════════════════ */
function ProductosTab() {
  const { state, dispatch, saveConfig } = useStore();
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch]     = useState('');
  const [filterCat, setFilterCat]     = useState('todos');
  const [filterMarca, setFilterMarca] = useState('');
  const [filterStock, setFilterStock] = useState('todos');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const fileRef = useRef();

  const marcas = useMemo(() => [...new Set(state.products.map(p => p.marca).filter(Boolean))].sort(), [state.products]);

  const filtered = useMemo(() => {
    return state.products.filter(p => {
      if (search && !(p.nombre + p.marca + p.categoria).toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat !== 'todos' && p.categoria !== filterCat) return false;
      if (filterMarca && p.marca !== filterMarca) return false;
      if (filterStock !== 'todos' && p.stock !== filterStock) return false;
      return true;
    });
  }, [state.products, search, filterCat, filterMarca, filterStock]);

  const saveProduct = (form) => {
    if (!form.nombre || !form.precio) { alert('Nombre y precio son obligatorios.'); return; }
    const clean = { ...form };
    delete clean._isNew;
    if (!clean.codigo) clean.codigo = 'PRD-' + Date.now();
    let updated;
    if (form._isNew) {
      updated = [...state.products, clean];
    } else {
      updated = state.products.map(p => p.codigo === clean.codigo ? clean : p);
    }
    dispatch({ type: 'SET_PRODUCTS', payload: updated });
    saveConfig('products', updated);
    setEditingProduct(null);
  };

  const deleteProduct = (codigo) => {
    const updated = state.products.filter(p => p.codigo !== codigo);
    dispatch({ type: 'SET_PRODUCTS', payload: updated });
    saveConfig('products', updated);
    setConfirmDelete(null);
  };

  const handleXlsx = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const products = rows.map((r, i) => ({
          codigo: String(r.codigo || r.Codigo || r.CODIGO || ('PRD-' + Date.now() + i)),
          nombre: String(r.nombre || r.Nombre || r.NOMBRE || ''),
          marca: String(r.marca || r.Marca || r.MARCA || ''),
          categoria: String(r.categoria || r.Categoria || r.CATEGORIA || 'dermocosmetica'),
          precio: Number(r.precio || r.Precio || r.PRECIO || 0),
          precio_oferta: r.precio_oferta || r.PrecioOferta || '',
          descripcion: String(r.descripcion || r.Descripcion || ''),
          stock: String(r.stock || r.Stock || 'Disponible'),
          destacado: String(r.destacado || r.Destacado || 'NO').toUpperCase(),
          nuevo: String(r.nuevo || r.Nuevo || 'NO').toUpperCase(),
          mas_vendido: String(r.mas_vendido || r.MasVendido || 'NO').toUpperCase(),
          imagen_url: String(r.imagen_url || r.ImagenUrl || r.imagen || ''),
        })).filter(p => p.nombre);
        if (products.length === 0) { alert('No se encontraron productos en el archivo.'); return; }
        if (window.confirm(`¿Importar ${products.length} productos? Esto reemplazará el catálogo actual.`)) {
          dispatch({ type: 'SET_PRODUCTS', payload: products });
          saveConfig('products', products);
        }
      } catch (err) { alert('Error al leer el archivo XLSX: ' + err.message); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  if (editingProduct) {
    return <ProductForm product={editingProduct} onSave={saveProduct} onCancel={() => setEditingProduct(null)} />;
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca, categoría..."
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
          Filtros
        </button>
        <button onClick={() => setEditingProduct({ ...EMPTY_PRODUCT, _isNew: true })}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#C8102E] hover:bg-[#9B0D22] rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
          <Upload className="w-4 h-4" /> Importar XLSX
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleXlsx} />
      </div>

      {showFilters && (
        <div className="grid sm:grid-cols-3 gap-3 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <Label>Categoría</Label>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent">
              <option value="todos">Todas</option>
              {Object.entries(CAT_LABELS).filter(([k]) => k !== 'todos').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <Label>Marca</Label>
            <select value={filterMarca} onChange={e => setFilterMarca(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent">
              <option value="">Todas</option>
              {marcas.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <Label>Stock</Label>
            <select value={filterStock} onChange={e => setFilterStock(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent">
              <option value="todos">Todos</option>
              <option value="Disponible">Disponible</option>
              <option value="Sin stock">Sin stock</option>
              <option value="Bajo stock">Bajo stock</option>
              <option value="Por encargo">Por encargo</option>
            </select>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mb-3">{filtered.length} producto(s) encontrado(s)</p>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay productos para mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Categoría</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.codigo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.imagen_url
                            ? <img src={p.imagen_url} alt="" className="w-full h-full object-contain p-0.5" onError={e => e.target.style.display='none'} />
                            : <span className="text-base">{CAT_ICONS[p.categoria] || '💊'}</span>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">{p.nombre}</p>
                          <p className="text-xs text-gray-400">{p.marca} · #{p.codigo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">{CAT_LABELS[p.categoria] || p.categoria}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        {p.precio_oferta && parseFloat(p.precio_oferta) > 0 ? (
                          <>
                            <p className="font-semibold text-[#C8102E]">${formatPrice(p.precio_oferta)}</p>
                            <p className="text-xs text-gray-400 line-through">${formatPrice(p.precio)}</p>
                          </>
                        ) : (
                          <p className="font-semibold text-gray-900">${formatPrice(p.precio)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.stock === 'Disponible' ? 'bg-green-50 text-green-700' :
                        p.stock === 'Sin stock'  ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-700'
                      }`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditingProduct({ ...p })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(p.codigo)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          message="Esta acción eliminará el producto de forma permanente."
          onConfirm={() => deleteProduct(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

/* ── Product Form ─────────────────────────────────────── */
function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({ ...product });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al listado
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-bold text-gray-900">{form._isNew ? 'Nuevo producto' : 'Editar producto'}</h2>
        {!form._isNew && <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">#{form.codigo}</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-4 bg-white rounded-xl border border-gray-200 p-6">
        <Field label="Nombre del producto *" col2>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
            value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Crema Nivea Aclarante 400ml" />
        </Field>

        <Field label="Marca">
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
            value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Nivea" />
        </Field>

        <Field label="Categoría">
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
            value={form.categoria} onChange={e => set('categoria', e.target.value)}>
            {Object.entries(CAT_LABELS).filter(([k]) => k !== 'todos').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>

        <Field label="Estado de stock">
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
            value={form.stock} onChange={e => set('stock', e.target.value)}>
            <option value="Disponible">Disponible</option>
            <option value="Sin stock">Sin stock</option>
            <option value="Bajo stock">Bajo stock</option>
            <option value="Por encargo">Por encargo</option>
          </select>
        </Field>

        <Field label="Precio regular *">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
            <input type="number" min="0"
              className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.precio} onChange={e => set('precio', e.target.value)} placeholder="3200" />
          </div>
        </Field>

        <Field label="Precio oferta — dejar vacío si no aplica">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
            <input type="number" min="0"
              className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.precio_oferta} onChange={e => set('precio_oferta', e.target.value)} placeholder="2600" />
          </div>
        </Field>

        <Field label="Visibilidad">
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
            value={form.destacado} onChange={e => set('destacado', e.target.value)}>
            <option value="NO">No mostrar en inicio</option>
            <option value="SI">Destacado — mostrar en inicio</option>
          </select>
        </Field>

        <Field label="Código / EAN — se genera automáticamente si se deja vacío">
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
            value={form.codigo} onChange={e => set('codigo', e.target.value)} placeholder="7793200100001" />
        </Field>

        {/* Imagen con URL + subida desde PC */}
        <div className="md:col-span-2">
          <ImageField
            label="Imagen del producto — URL o subir desde tu ordenador"
            value={form.imagen_url || ''}
            onChange={v => set('imagen_url', v)}
            placeholder="https://ejemplo.com/imagen-producto.jpg"
            previewClass="w-16 h-16"
          />
        </div>

        <Field label="Descripción" col2>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
            rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            placeholder="Descripción breve del producto..."
          />
        </Field>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
          Cancelar
        </button>
        <button onClick={() => onSave(form)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#C8102E] hover:bg-[#9B0D22] rounded-lg transition-colors">
          <Save className="w-4 h-4" /> Guardar producto
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB: PROMOS BANCARIAS
═══════════════════════════════════════════════════════════ */
function PromosTab() {
  const { state, dispatch, saveConfig } = useStore();
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm]       = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const openNew  = () => { setForm({ ...EMPTY_PROMO, _isNew: true }); setEditIdx(-1); };
  const openEdit = (i) => { setForm({ ...state.promos[i] }); setEditIdx(i); };
  const set      = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.tarjeta) { alert('El nombre de la tarjeta es obligatorio.'); return; }
    let updated;
    if (form._isNew) {
      const { _isNew, ...clean } = form;
      updated = [...state.promos, clean];
    } else {
      updated = state.promos.map((p, i) => i === editIdx ? { ...form } : p);
    }
    dispatch({ type: 'SET_PROMOS', payload: updated }); saveConfig('promos', updated);
    setEditIdx(null); setForm(null);
  };

  const remove = (i) => {
    const newPromos = state.promos.filter((_, idx) => idx !== i);
    dispatch({ type: 'SET_PROMOS', payload: newPromos }); saveConfig('promos', newPromos);
    setConfirmDel(null);
  };

  const toggle = (i) => {
    const toggled = state.promos.map((p, idx) => idx === i ? { ...p, activa: (p.activa || 'SI') === 'SI' ? 'NO' : 'SI' } : p);
    dispatch({ type: 'SET_PROMOS', payload: toggled }); saveConfig('promos', toggled);
  };

  /* ── Form view ── */
  if (editIdx !== null) {
    return (
      <div>
        <button onClick={() => { setEditIdx(null); setForm(null); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a promos
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-6">{form._isNew ? 'Nueva promo bancaria' : 'Editar promo'}</h2>

        <div className="grid md:grid-cols-2 gap-4 bg-white rounded-xl border border-gray-200 p-6">
          <Field label="Banco / Tarjeta *">
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.tarjeta} onChange={e => set('tarjeta', e.target.value)} placeholder="Santander, Galicia, BBVA..." />
          </Field>
          <Field label="Tipo">
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.tipo} onChange={e => set('tipo', e.target.value)} placeholder="Visa, Mastercard, Débito..." />
          </Field>
          <Field label="% Descuento — 0 si no aplica">
            <input type="number" min="0" max="100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.descuento} onChange={e => set('descuento', Number(e.target.value))} />
          </Field>
          <Field label="Cuotas sin interés — 0 si no aplica">
            <input type="number" min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.cuotas} onChange={e => set('cuotas', Number(e.target.value))} />
          </Field>
          <Field label="Día especial — ej: Jueves">
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.dia} onChange={e => set('dia', e.target.value)} placeholder="Todos los días, Jueves..." />
          </Field>
          <Field label="Vigencia hasta">
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.vigencia} onChange={e => set('vigencia', e.target.value)} placeholder="31/12/2026" />
          </Field>
          <Field label="Descripción / Detalle" col2>
            <textarea rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.detalle} onChange={e => set('detalle', e.target.value)}
              placeholder="20% de descuento todos los días con Visa Santander" />
          </Field>
          {/* Imagen de la promo — URL o desde PC */}
          <div className="md:col-span-2">
            <ImageField
              label="Imagen de la promo — opcional (URL o subir desde tu ordenador)"
              value={form.imagen_url || ''}
              onChange={v => set('imagen_url', v)}
              placeholder="https://banco.com/logo.png"
              previewClass="w-14 h-14"
            />
          </div>
          <Field label="Estado">
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.activa} onChange={e => set('activa', e.target.value)}>
              <option value="SI">Activa — visible en el sitio</option>
              <option value="NO">Inactiva — oculta</option>
            </select>
          </Field>
        </div>

        {/* Preview */}
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Vista previa</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
              {form.imagen_url
                ? <img src={form.imagen_url} alt="" className="w-full h-full object-contain p-0.5" onError={e => e.target.style.display='none'} />
                : '💳'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{form.tarjeta || '—'} <span className="text-gray-400 font-normal text-sm">{form.tipo}</span></p>
              {form.descuento > 0 && <p className="text-xl font-bold text-[#C8102E]">{form.descuento}% OFF</p>}
              {form.cuotas > 0 && <p className="text-sm font-semibold text-gray-700">{form.cuotas} cuotas sin interés</p>}
              <p className="text-xs text-gray-400">{form.detalle}</p>
            </div>
            <StatusBadge active={(form.activa||'SI') === 'SI'} />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={() => { setEditIdx(null); setForm(null); }}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
            Cancelar
          </button>
          <button onClick={save}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#C8102E] hover:bg-[#9B0D22] rounded-lg transition-colors">
            <Save className="w-4 h-4" /> Guardar promo
          </button>
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-400">{state.promos.length} promoción(es) configurada(s)</p>
        <button onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#C8102E] hover:bg-[#9B0D22] rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Nueva promo
        </button>
      </div>

      {state.promos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay promos bancarias.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.promos.map((p, i) => (
            <div key={i} className={`bg-white rounded-xl border transition-opacity ${(p.activa||'SI') === 'NO' ? 'opacity-50 border-gray-200' : 'border-gray-200'} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg overflow-hidden">
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt="" className="w-full h-full object-contain p-0.5" onError={e => e.target.style.display='none'} />
                      : '💳'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{p.tarjeta}</p>
                    <p className="text-xs text-gray-400">{p.tipo}</p>
                  </div>
                </div>
                <StatusBadge active={(p.activa||'SI') === 'SI'} />
              </div>
              {p.descuento > 0 && <p className="text-2xl font-bold text-[#C8102E]">{p.descuento}% OFF</p>}
              {p.cuotas > 0 && <p className="text-sm font-semibold text-gray-700">{p.cuotas} cuotas sin interés</p>}
              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{p.detalle}</p>
              {p.vigencia && <p className="text-xs text-gray-400 mt-1">Hasta {p.vigencia}</p>}
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => toggle(i)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  {(p.activa||'SI') === 'SI' ? <><EyeOff className="w-3.5 h-3.5" /> Ocultar</> : <><Eye className="w-3.5 h-3.5" /> Mostrar</>}
                </button>
                <button onClick={() => openEdit(i)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDel(i)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDel !== null && (
        <ConfirmModal
          message="¿Eliminar esta promo bancaria?"
          onConfirm={() => remove(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB: BANNERS
═══════════════════════════════════════════════════════════ */
function BannersTab() {
  const { state, dispatch, saveConfig } = useStore();
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm]       = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const openNew  = () => { setForm({ ...EMPTY_BANNER, _isNew: true }); setEditIdx(-1); };
  const openEdit = (i) => { setForm({ ...state.banners[i] }); setEditIdx(i); };
  const set      = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.titulo) { alert('El título es obligatorio.'); return; }
    let updated;
    if (form._isNew) {
      const { _isNew, ...clean } = form;
      updated = [...state.banners, clean];
    } else {
      updated = state.banners.map((b, i) => i === editIdx ? { ...form } : b);
    }
    dispatch({ type: 'SET_BANNERS', payload: updated }); saveConfig('banners', updated);
    setEditIdx(null); setForm(null);
  };

  const remove   = (i) => { const nb = state.banners.filter((_, idx) => idx !== i); dispatch({ type: 'SET_BANNERS', payload: nb }); saveConfig('banners', nb); setConfirmDel(null); };
  const toggle   = (i) => { const t = state.banners.map((b, idx) => idx === i ? { ...b, activo: (b.activo||'SI') === 'SI' ? 'NO' : 'SI' } : b); dispatch({ type: 'SET_BANNERS', payload: t }); saveConfig('banners', t); };
  const moveUp   = (i) => { if (i === 0) return; const a = [...state.banners]; [a[i-1],a[i]]=[a[i],a[i-1]]; dispatch({ type: 'SET_BANNERS', payload: a }); saveConfig('banners', a); };
  const moveDown = (i) => { if (i === state.banners.length-1) return; const a = [...state.banners]; [a[i],a[i+1]]=[a[i+1],a[i]]; dispatch({ type: 'SET_BANNERS', payload: a }); saveConfig('banners', a); };

  const PRESET_COLORS = ['#C8102E','#2F855A','#2B6CB0','#7B2D8B','#D97706','#1A202C','#2D3748','#065F46','transparent'];

  /* ── Form ── */
  if (editIdx !== null) {
    const bgColor = form.color === 'transparent' ? '#1a1a2e' : (form.color || '#C8102E');
    return (
      <div>
        <button onClick={() => { setEditIdx(null); setForm(null); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a banners
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-5">{form._isNew ? 'Nuevo banner' : 'Editar banner'}</h2>

        {/* Live Preview */}
        <div className="rounded-xl mb-5 overflow-hidden relative" style={{ minHeight: '130px', background: bgColor }}>
          {form.imagen_url && (
            <>
              <img src={form.imagen_url} alt="banner bg"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
                onError={e => e.target.style.display='none'} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.15) 100%)', zIndex: 1 }} />
            </>
          )}
          <div className="relative z-10 px-7 py-8">
            <p className="text-white text-xl font-bold leading-tight drop-shadow">{form.titulo || 'Título del banner'}</p>
            {form.subtitulo && <p className="text-white/80 text-sm mt-1">{form.subtitulo}</p>}
            {form.boton && (
              <div className="mt-4 inline-block bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm">{form.boton} →</div>
            )}
          </div>
          <span className="absolute bottom-2 right-3 text-white/30 text-xs" style={{ zIndex: 10 }}>Vista previa</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 bg-white rounded-xl border border-gray-200 p-6">
          <Field label="Título *" col2>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Bienvenido a MaxFarma" />
          </Field>
          <Field label="Subtítulo" col2>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.subtitulo} onChange={e => set('subtitulo', e.target.value)} placeholder="Salud, belleza y bienestar con envío a domicilio" />
          </Field>

          {/* Imagen del banner — URL o subida desde PC */}
          <div className="md:col-span-2">
            <ImageField
              label="Imagen de fondo del banner — URL o subir desde tu ordenador (opcional)"
              value={form.imagen_url || ''}
              onChange={v => set('imagen_url', v)}
              placeholder="https://ejemplo.com/imagen-banner.jpg"
              previewClass="w-20 h-12"
            />
          </div>

          <Field label="Texto del botón — dejar vacío para ocultar">
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.boton} onChange={e => set('boton', e.target.value)} placeholder="Ver Productos" />
          </Field>
          <Field label="Destino del botón">
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.link} onChange={e => set('link', e.target.value)}>
              {LINK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <Field label="Color de fondo — usá 'transparent' si solo querés imagen" col2>
            <div className="flex items-center gap-2 mb-2">
              <input type="color" value={form.color === 'transparent' ? '#000000' : (form.color || '#C8102E')}
                onChange={e => set('color', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
              <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                value={form.color} onChange={e => set('color', e.target.value)} placeholder="#C8102E" />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center ${form.color === c ? 'border-gray-600 scale-110' : 'border-gray-200'}`}
                  style={{ background: c === 'transparent' ? 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 10px 10px' : c }}
                  title={c === 'transparent' ? 'Transparente (solo imagen)' : c}>
                  {c === 'transparent' && <span className="text-[9px] font-bold text-gray-500 leading-none">T</span>}
                </button>
              ))}
              <span className="text-xs text-gray-400 ml-1">← T = transparente</span>
            </div>
          </Field>

          <Field label="Estado">
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.activo} onChange={e => set('activo', e.target.value)}>
              <option value="SI">Visible en el sitio</option>
              <option value="NO">Oculto</option>
            </select>
          </Field>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={() => { setEditIdx(null); setForm(null); }}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
            Cancelar
          </button>
          <button onClick={save}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#C8102E] hover:bg-[#9B0D22] rounded-lg transition-colors">
            <Save className="w-4 h-4" /> Guardar banner
          </button>
        </div>
      </div>
    );
  }

  /* ── List ── */
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-400">{state.banners.length} banner(s) · Usá ↑↓ para reordenar el carrusel</p>
        <button onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#C8102E] hover:bg-[#9B0D22] rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Nuevo banner
        </button>
      </div>

      {state.banners.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Image className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay banners configurados.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {state.banners.map((b, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-xl overflow-hidden border border-white/20 transition-opacity ${(b.activo||'SI') === 'NO' ? 'opacity-50' : ''}`}
              style={{ background: b.color === 'transparent' ? '#1a1a2e' : (b.color || '#C8102E') }}>
              {b.imagen_url && <img src={b.imagen_url} alt="" className="w-16 h-full object-cover opacity-30 hidden sm:block" onError={e => e.target.style.display='none'} />}
              <div className="flex-1 px-4 py-4 min-w-0">
                <p className="font-semibold text-white leading-tight truncate">{b.titulo}</p>
                <p className="text-xs text-white/60 truncate">{b.subtitulo}</p>
                <p className="text-xs text-white/40 mt-0.5">→ {LINK_OPTIONS.find(o => o.value === b.link)?.label || b.link} · {(b.activo||'SI') === 'SI' ? 'Visible' : 'Oculto'}</p>
              </div>
              <div className="flex items-center gap-1 pr-4 flex-shrink-0">
                <button onClick={() => moveUp(i)} disabled={i===0} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/30 disabled:opacity-20 transition-colors"><ChevronUp className="w-3.5 h-3.5 text-white" /></button>
                <button onClick={() => moveDown(i)} disabled={i===state.banners.length-1} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/30 disabled:opacity-20 transition-colors"><ChevronDown className="w-3.5 h-3.5 text-white" /></button>
                <button onClick={() => toggle(i)} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/30 transition-colors">
                  {(b.activo||'SI') === 'SI' ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-white" />}
                </button>
                <button onClick={() => openEdit(i)} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/30 transition-colors"><Pencil className="w-3.5 h-3.5 text-white" /></button>
                <button onClick={() => setConfirmDel(i)} className="p-1.5 rounded-lg bg-white/15 hover:bg-red-500/60 transition-colors"><Trash2 className="w-3.5 h-3.5 text-white" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDel !== null && (
        <ConfirmModal
          message="¿Eliminar este banner?"
          onConfirm={() => remove(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB: CONFIGURACIÓN
═══════════════════════════════════════════════════════════ */
function ConfigTab() {
  const [currentPass, setCurrentPass]   = useState('');
  const [newPass1, setNewPass1]         = useState('');
  const [newPass2, setNewPass2]         = useState('');
  const [showC, setShowC] = useState(false);
  const [showN, setShowN] = useState(false);
  const [msg, setMsg]     = useState(null);

  const handleChangePass = () => {
    setMsg(null);
    if (!currentPass || !newPass1 || !newPass2) { setMsg({ type: 'error', text: 'Completá todos los campos.' }); return; }
    if (currentPass !== getPass()) { setMsg({ type: 'error', text: 'La contraseña actual es incorrecta.' }); return; }
    if (newPass1.length < 8) { setMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' }); return; }
    if (newPass1 !== newPass2) { setMsg({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' }); return; }
    setNewPass(newPass1);
    setCurrentPass(''); setNewPass1(''); setNewPass2('');
    setMsg({ type: 'ok', text: 'Contraseña actualizada correctamente.' });
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Configuración del panel</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Cambiar contraseña</p>
            <p className="text-xs text-gray-400">La contraseña se almacena localmente en este navegador</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <Label>Contraseña actual</Label>
            <div className="relative">
              <input type={showC ? 'text' : 'password'} value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent pr-10"
                placeholder="••••••••" />
              <button onClick={() => setShowC(!showC)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label>Nueva contraseña</Label>
            <div className="relative">
              <input type={showN ? 'text' : 'password'} value={newPass1} onChange={e => setNewPass1(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent pr-10"
                placeholder="Mínimo 8 caracteres" />
              <button onClick={() => setShowN(!showN)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label>Repetir nueva contraseña</Label>
            <input type="password" value={newPass2} onChange={e => setNewPass2(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              placeholder="••••••••" />
          </div>
        </div>

        {msg && (
          <div className={`mt-3 flex items-center gap-2 text-sm p-3 rounded-lg ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {msg.type === 'ok' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {msg.text}
          </div>
        )}

        <button onClick={handleChangePass}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#C8102E] hover:bg-[#9B0D22] rounded-lg transition-colors">
          <Save className="w-4 h-4" /> Cambiar contraseña
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB: PÁGINAS (Ayuda, Términos, etc.)
═══════════════════════════════════════════════════════════ */
const PAGE_SLUGS = [
  { slug: 'preguntas-frecuentes', label: 'Preguntas Frecuentes' },
  { slug: 'como-comprar',         label: 'Cómo Comprar' },
  { slug: 'envios',               label: 'Envíos y Entregas' },
  { slug: 'devoluciones',         label: 'Cambios y Devoluciones' },
  { slug: 'medios-de-pago',       label: 'Medios de Pago' },
  { slug: 'terminos',             label: 'Términos y Condiciones' },
];

function PaginasTab() {
  const { state, dispatch, saveConfig } = useStore();
  const [editSlug, setEditSlug] = useState(null);
  const [form, setForm]         = useState({ titulo: '', contenido: '' });
  const [saved, setSaved]       = useState(false);

  const openEdit = (slug) => {
    const p = state.paginas?.[slug] || { titulo: PAGE_SLUGS.find(s => s.slug === slug)?.label || slug, contenido: '' };
    setForm({ ...p });
    setEditSlug(slug);
    setSaved(false);
  };

  const save = () => {
    const updated = { ...(state.paginas || {}), [editSlug]: { titulo: form.titulo, contenido: form.contenido } };
    dispatch({ type: 'SET_PAGINAS', payload: updated }); saveConfig('paginas', updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (editSlug) {
    return (
      <div>
        <button onClick={() => setEditSlug(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a páginas
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Editar: {PAGE_SLUGS.find(s => s.slug === editSlug)?.label || editSlug}
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <Label>Título de la página</Label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
          </div>
          <div>
            <Label>Contenido — usá **texto** para negrita, líneas vacías para separar párrafos</Label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
              rows={18}
              value={form.contenido}
              onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setEditSlug(null)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
              Cancelar
            </button>
            <button onClick={save}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#C8102E] hover:bg-[#9B0D22] rounded-lg transition-colors">
              <Save className="w-4 h-4" /> Guardar página
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" /> Guardado
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">Páginas informativas</h2>
        <p className="text-sm text-gray-400 mt-0.5">Editá el contenido de los links del footer</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {PAGE_SLUGS.map(({ slug, label }) => {
          const p = state.paginas?.[slug];
          const preview = p?.contenido?.slice(0, 80) || 'Sin contenido todavía';
          return (
            <div key={slug} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#FFF0F3] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[#C8102E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{preview}…</p>
              </div>
              <button onClick={() => openEdit(slug)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
