'use client';
import { useMemo, useState, useEffect } from 'react';
import { useStore, CAT_LABELS, CAT_ICONS, BRANDS, formatPrice } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import HeroBanner from '@/components/HeroBanner';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import Checkout from '@/components/Checkout';
import Admin from '@/components/Admin';
import ToastContainer from '@/components/Toast';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProgramaDescuento from '@/components/ProgramaDescuento';
import {
  ShoppingCart, Truck, Shield, CreditCard, Phone, Heart, Star,
  ChevronRight, Flame, Sparkles, TrendingUp, ArrowLeft, FileText,
  Droplets, Wind, Baby, Brush, Dumbbell, Zap, Home as HomeIcon,
  Smile, Ribbon, Users, ShoppingBag, MessageCircle, Pill, Activity,
  AlertCircle, Building2, Search
} from 'lucide-react';

const WA = '5493625298918';

export default function Home() {
  const { state } = useStore();
  const isPagina = state.currentSection?.startsWith('pagina-');
  return (
    <>
      <Header />
      <Cart />
      <ProductModal />
      <ToastContainer />
      <WhatsAppButton />
      <main className="min-h-screen bg-gray-50">
        {state.currentSection === 'inicio'    && <Inicio />}
        {state.currentSection === 'productos' && <Productos key={state.searchQuery + '|' + state.currentCategory} />}
        {state.currentSection === 'ofertas'   && <Ofertas />}
        {state.currentSection === 'promos'    && <Promos />}
        {state.currentSection === 'chimola'   && <Chimola />}
        {state.currentSection === 'wishlist'  && <Wishlist />}
        {state.currentSection === 'checkout'  && <Checkout />}
        {state.currentSection === 'programa'  && <ProgramaDescuento />}
        {state.currentSection === 'admin'     && <Admin />}
        {isPagina && <PaginaEstatica slug={state.currentSection.replace('pagina-', '')} />}
      </main>
      {!['admin','checkout'].includes(state.currentSection) && <Footer />}
    </>
  );
}

/* ════════════════════════════════════════════════════
   INICIO
════════════════════════════════════════════════════ */
function Inicio() {
  const { state, dispatch } = useStore();
  const featured    = state.products.filter(p => (p.destacado||'').toUpperCase() === 'SI').slice(0, 8);
  const ofertas     = state.products.filter(p => p.precio_oferta && parseFloat(p.precio_oferta) > 0).slice(0, 4);
  const masVendidos = state.products.filter(p => (p.mas_vendido||'').toUpperCase() === 'SI').slice(0, 4);
  const nuevos      = state.products.filter(p => (p.nuevo||'').toUpperCase() === 'SI').slice(0, 4);
  const activePromos = state.promos.filter(p => (p.activa||'SI').toUpperCase() === 'SI');

  return (
    <div className="pb-20">
      {/* ── Hero ── */}
      <HeroBanner />

      {/* ── Promo strip ── */}
      {activePromos.length > 0 && (
        <div className="mx-3 sm:mx-4 mt-3 bg-[#C8102E] rounded-xl px-4 py-3 flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="text-white font-bold text-xs whitespace-nowrap flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" /> Beneficios:
          </span>
          <div className="flex gap-2">
            {activePromos.map((p, i) => (
              <button key={i} onClick={() => dispatch({ type:'SET_SECTION', payload:'promos' })}
                className="bg-white/20 hover:bg-white/35 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors">
                {p.tarjeta}: {p.descuento > 0 ? `${p.descuento}% OFF` : ''}{p.cuotas > 0 ? ` ${p.cuotas} cuotas` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Beneficios ── */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon:<Truck className="w-5 h-5"/>,       title:'Envío a domicilio',      sub:'En tu zona' },
            { icon:<Shield className="w-5 h-5"/>,       title:'Compra 100% segura',     sub:'Datos protegidos' },
            { icon:<CreditCard className="w-5 h-5"/>,   title:'Go Cuotas — 4 cuotas',   sub:'Sin interés con débito' },
            { icon:<Phone className="w-5 h-5"/>,        title:'Atención personalizada',  sub:'Lun–Sáb 9–21 hs' },
          ].map((b, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3 border border-gray-100 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#FFF0F3] flex items-center justify-center text-[#C8102E] flex-shrink-0">{b.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{b.title}</p>
                <p className="text-xs text-gray-400">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Banner medicamentos especiales ── */}
      <MedicamentosBanner />

      {/* ── Categorías visuales ── */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <SectionHeader title="Explorá por categoría" link={{ label:'Ver todos los productos', section:'productos' }} />
        <CategoriaGrid />
      </div>

      {/* ── Ofertas del día ── */}
      {ofertas.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <SectionHeader icon={<Flame className="w-5 h-5 text-[#C8102E]"/>} title="Ofertas del día" badge="Tiempo limitado"
            link={{ label:'Ver todas las ofertas', section:'ofertas' }} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            {ofertas.map(p => <ProductCard key={p.codigo} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Destacados ── */}
      {featured.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <SectionHeader icon={<Sparkles className="w-5 h-5 text-amber-500"/>} title="Productos destacados"
            link={{ label:'Ver todos', section:'productos' }} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-5">
            {featured.map(p => <ProductCard key={p.codigo} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Más vendidos ── */}
      {masVendidos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <SectionHeader icon={<TrendingUp className="w-5 h-5 text-blue-600"/>} title="Más vendidos"
            link={{ label:'Ver todos', section:'productos' }} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            {masVendidos.map(p => <ProductCard key={p.codigo} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Nuevos ingresos ── */}
      {nuevos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <SectionHeader icon={<Sparkles className="w-5 h-5 text-purple-500"/>} title="Nuevos ingresos" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            {nuevos.map(p => <ProductCard key={p.codigo} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Marcas ── */}
      <div className="mt-14 bg-white border-y border-gray-100 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">Las mejores marcas</p>
        </div>
        <div className="overflow-hidden">
          <div className="marquee-track">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <div key={i} className="flex-shrink-0 mx-6 text-gray-300 hover:text-gray-600 transition-colors cursor-default">
                <p className="text-lg font-bold tracking-tight">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Banner CHIMOLA ── */}
      <ChimolaBanner />

      {/* ── Newsletter ── */}
      <Newsletter />
    </div>
  );
}

/* ════════════════════════════════════════════════════
   BANNER CHIMOLA — en la home, lleva al catálogo
════════════════════════════════════════════════════ */
function ChimolaBanner() {
  const { state, dispatch } = useStore();
  const cfg       = state.chimolaConfig || {};
  const titulo    = cfg.titulo    || 'Trabajamos con CHIMOLA';
  const subtitulo = cfg.subtitulo || 'Carteras, billeteras, mochilas y accesorios de moda. Calidad y estilo en cada producto. Consultá precios mayoristas.';
  const cta       = cfg.cta       || 'Ver catálogo CHIMOLA';
  const imgUrl    = cfg.imagen_url || '';
  if (cfg.visible === 'NO') return null;
  return (
    <div className="max-w-7xl mx-auto px-4 mt-10">
      <button onClick={() => dispatch({ type:'SET_SECTION', payload:'chimola' })} className="w-full text-left group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-700 shadow-xl">
          {imgUrl && (
            <>
              <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" onError={e=>e.target.style.display='none'}/>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-amber-800/40" />
            </>
          )}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage:'repeating-linear-gradient(45deg,#fff 0px,#fff 1px,transparent 1px,transparent 14px)' }} />
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-yellow-500/20 pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-amber-600/30 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-stretch gap-0">
            <div className="flex-1 px-7 py-8 sm:py-10">
              <span className="inline-block text-amber-300 text-[11px] font-black uppercase tracking-[0.18em] mb-3 border border-amber-400/40 rounded-full px-3 py-1">Moda & Accesorios</span>
              <h2 className="text-white text-3xl sm:text-4xl font-black leading-tight mb-3 tracking-tight">{titulo}</h2>
              <p className="text-amber-100/80 text-sm sm:text-base leading-relaxed mb-6 max-w-md">{subtitulo}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Carteras','Billeteras','Mochilas','Bolsos','Accesorios'].map(t => (
                  <span key={t} className="text-xs font-semibold text-amber-200 bg-white/10 border border-white/15 px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
              <span className="inline-flex items-center gap-2 bg-white text-amber-900 font-bold text-sm px-6 py-3 rounded-xl shadow-lg group-hover:bg-amber-50 transition-colors">
                {cta} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="hidden sm:flex flex-col justify-center items-center gap-3 px-8 border-l border-white/10">
              <div className="w-28 h-28 rounded-2xl bg-white border-2 border-white/30 flex items-center justify-center shadow-xl overflow-hidden p-2">
                <img src="https://res.cloudinary.com/dximjpxq7/image/upload/chimola_logo" alt="Chimola" className="w-full h-full object-contain" onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}} />
                <span style={{display:'none'}} className="text-amber-900 font-black text-2xl tracking-tighter leading-none text-center">CHI<br/>MOLA</span>
              </div>
              <span className="text-amber-300 text-xs font-bold uppercase tracking-widest mt-1">Marca exclusiva</span>
              <div className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <MessageCircle className="w-3.5 h-3.5" /> Precio mayorista
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECCIÓN CHIMOLA — catálogo completo
════════════════════════════════════════════════════ */
const CHIMOLA_SUBCATS = [
  { key:'todos',      label:'Todo CHIMOLA'  },
  { key:'carteras',   label:'Carteras'      },
  { key:'billeteras', label:'Billeteras'    },
  { key:'mochilas',   label:'Mochilas'      },
  { key:'bolsos',     label:'Bolsos'        },
  { key:'accesorios', label:'Accesorios'    },
];

function Chimola() {
  const { state, dispatch } = useStore();
  const [subcat, setSubcat] = useState('todos');
  const [query,  setQuery]  = useState('');

  const chimola = useMemo(() => {
    let list = state.products.filter(
      p => (p.marca || '').toLowerCase() === 'chimola'
    );
    if (subcat !== 'todos') {
      list = list.filter(p =>
        (p.categoria    || '').toLowerCase() === subcat ||
        (p.subcategoria || '').toLowerCase() === subcat ||
        (p.nombre       || '').toLowerCase().includes(subcat)
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        (p.nombre      || '').toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [state.products, subcat, query]);

  const waMsg = encodeURIComponent('¡Hola! Quiero consultar precios mayoristas de productos CHIMOLA.');

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage:'repeating-linear-gradient(45deg,#fff 0px,#fff 1px,transparent 1px,transparent 12px)' }} />
        <div className="relative max-w-5xl mx-auto px-4 py-10 sm:py-14 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 flex-shrink-0 bg-white border-2 border-white/30 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden p-1.5">
            <img src="https://res.cloudinary.com/dximjpxq7/image/upload/chimola_logo" alt="Chimola" className="w-full h-full object-contain" onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}} />
            <span style={{display:'none'}} className="text-amber-900 font-black text-xl tracking-tighter leading-none text-center">CHI<br/>MOLA</span>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-amber-300 text-[11px] font-black uppercase tracking-widest mb-1">Catálogo</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">CHIMOLA</h1>
            <p className="text-amber-100/80 text-sm max-w-md mb-4">
              Carteras, billeteras, mochilas y accesorios de moda con calidad y estilo.
            </p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg transition-colors">
                <MessageCircle className="w-4 h-4" /> Consultar precio mayorista
              </a>
              <button onClick={() => dispatch({ type:'SET_SECTION', payload:'inicio' })}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso mayorista */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <span className="text-amber-700 font-bold text-xs uppercase tracking-wide">💼 Venta mayorista disponible</span>
          <span className="text-amber-600 text-xs">Consultá precios especiales por mayor por WhatsApp.</span>
          <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
            className="ml-auto text-xs font-bold text-green-600 hover:underline flex items-center gap-1">
            Consultar <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2.5">
            {CHIMOLA_SUBCATS.map(s => (
              <button key={s.key} onClick={() => setSubcat(s.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  subcat === s.key
                    ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-800'
                }`}>
                {s.label}
              </button>
            ))}
            <div className="relative ml-auto flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 w-32 sm:w-44" />
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {chimola.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-5">
              <ShoppingBag className="w-9 h-9 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {query ? `Sin resultados para "${query}"` : 'Próximamente el catálogo CHIMOLA'}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mb-6">
              Estamos cargando los productos. Mientras tanto consultá disponibilidad y precios por WhatsApp.
            </p>
            <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-colors">
              <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
            </a>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-400 mb-5">
              {chimola.length} producto{chimola.length !== 1 ? 's' : ''}
              {subcat !== 'todos' ? ` en ${CHIMOLA_SUBCATS.find(s=>s.key===subcat)?.label}` : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {chimola.map(p => (
                <ChimolaCard key={p.codigo} product={p} waMsg={waMsg} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChimolaCard({ product, waMsg }) {
  const { dispatch } = useStore();
  return (
    <div onClick={() => dispatch({ type:'OPEN_PRODUCT_MODAL', payload:product })}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden group">
      <div className="relative aspect-square bg-amber-50 overflow-hidden">
        {product.imagen_url ? (
          <img src={product.imagen_url} alt={product.nombre}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="w-10 h-10 text-amber-300" />
            <span className="text-[10px] text-amber-400 font-semibold">CHIMOLA</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mb-0.5">CHIMOLA</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-3">{product.nombre}</h3>
        {product.precio && parseFloat(product.precio) > 0 ? (
          <p className="text-base font-bold text-gray-900 mb-2">${formatPrice(parseFloat(product.precio))}</p>
        ) : (
          <p className="text-xs font-semibold text-amber-700 mb-2">Consultá el precio</p>
        )}
        <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="w-full flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-xl transition-colors">
          <MessageCircle className="w-3.5 h-3.5" /> Consultar precio mayor
        </a>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   BANNER MEDICAMENTOS ESPECIALES
   Resalta medicamentos oncológicos, diabéticos y alto costo
════════════════════════════════════════════════════ */
function MedicamentosBanner() {
  const waUrl = `https://wa.me/${WA}?text=${encodeURIComponent('Hola MaxFarma, quisiera consultar sobre un medicamento.')}`;
  return (
    <div className="max-w-7xl mx-auto px-4 mt-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C8102E] translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500 -translate-x-10 translate-y-10" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Icono */}
          <div className="w-14 h-14 rounded-2xl bg-[#C8102E]/20 border border-[#C8102E]/30 flex items-center justify-center flex-shrink-0">
            <Pill className="w-7 h-7 text-[#C8102E]" />
          </div>

          {/* Texto principal */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#C8102E] uppercase tracking-widest">Farmacia especializada</span>
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-black leading-tight mb-2">
              Medicamentos de alto costo,<br className="hidden sm:block" /> oncológicos y para diabéticos
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-xl">
              Trabajamos con medicamentos oncológicos, insulinas, antidiabéticos, y medicamentos de alto costo. 
              Consultanos por disponibilidad, bonificaciones y programas de descuento de laboratorios.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { icon:<Activity className="w-3.5 h-3.5"/>,    label:'Oncológicos' },
                { icon:<Pill className="w-3.5 h-3.5"/>,        label:'Diabéticos' },
                { icon:<AlertCircle className="w-3.5 h-3.5"/>, label:'Alto costo' },
                { icon:<Building2 className="w-3.5 h-3.5"/>,   label:'Programas de laboratorio' },
              ].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
                  <span className="text-[#C8102E]">{t.icon}</span> {t.label}
                </span>
              ))}
            </div>

            {/* CTA WhatsApp */}
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1da851] text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg text-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Consultar por WhatsApp
            </a>
          </div>

          {/* Card lateral — solo desktop */}
          <div className="hidden lg:flex flex-col gap-3 flex-shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center min-w-[160px]">
              <MessageCircle className="w-6 h-6 text-[#25D366] mx-auto mb-1.5" />
              <p className="text-white text-xs font-semibold">Respuesta rápida</p>
              <p className="text-gray-400 text-xs mt-0.5">Lun–Sáb 9 a 21 hs</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Shield className="w-6 h-6 text-blue-400 mx-auto mb-1.5" />
              <p className="text-white text-xs font-semibold">Farmacia habilitada</p>
              <p className="text-gray-400 text-xs mt-0.5">Disposición ANMAT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CATEGORIAS GRID — iconos SVG profesionales
════════════════════════════════════════════════════ */
function getCatIcon(key) {
  const icons = {
    todos:              <ShoppingBag className="w-6 h-6" />,
    dermocosmetica:     <Droplets className="w-6 h-6" />,
    perfumes:           <Wind className="w-6 h-6" />,
    bebe:               <Baby className="w-6 h-6" />,
    'cuidado-personal': <Brush className="w-6 h-6" />,
    nutricion:          <Dumbbell className="w-6 h-6" />,
    maquillaje:         <Sparkles className="w-6 h-6" />,
    electro:            <Zap className="w-6 h-6" />,
    hogar:              <HomeIcon className="w-6 h-6" />,
    infantiles:         <Smile className="w-6 h-6" />,
    'salud-sexual':     <Ribbon className="w-6 h-6" />,
    'adultos-mayores':  <Users className="w-6 h-6" />,
  };
  return icons[key] || <ShoppingBag className="w-6 h-6" />;
}

function CategoriaGrid() {
  const { state, dispatch } = useStore();
  const cats = state.categorias && state.categorias.length > 0
    ? [{ key:'todos', label:'Todos los productos' }, ...state.categorias]
    : Object.entries(CAT_LABELS).map(([key, label]) => ({ key, label }));

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-5">
      {cats.map((cat) => {
        const isActive = state.currentCategory === cat.key;
        const icon = getCatIcon(cat.key);
        return (
          <button key={cat.key}
            onClick={() => dispatch({ type:'SET_CATEGORY', payload:cat.key })}
            className={`group flex flex-col items-center gap-2.5 rounded-2xl p-4 border transition-all duration-200
              ${isActive
                ? 'border-[#C8102E] bg-[#FFF0F3] shadow-sm'
                : 'border-gray-100 bg-white hover:border-[#C8102E] hover:bg-[#FFF0F3] hover:shadow-sm'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
              ${isActive ? 'bg-[#C8102E] text-white' : 'bg-gray-50 text-gray-500 group-hover:bg-[#C8102E] group-hover:text-white'}`}>
              {icon}
            </div>
            <span className={`text-xs font-semibold text-center leading-tight transition-colors
              ${isActive ? 'text-[#C8102E]' : 'text-gray-600 group-hover:text-[#C8102E]'}`}>
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   NEWSLETTER
════════════════════════════════════════════════════ */
function Newsletter() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }
    setStatus('loading');
    try {
      await addDoc(collection(db, 'newsletter'), {
        email: email.toLowerCase().trim(),
        fecha: serverTimestamp(),
        origen: 'web',
      });
      setStatus('ok');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (e) {
      console.error('Newsletter error:', e);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-14">
      <div className="bg-gradient-to-br from-[#C8102E] to-[#7A0019] rounded-2xl px-8 py-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white -translate-y-32" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white translate-y-24" />
        </div>
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">Newsletter</p>
          <h3 className="text-white text-2xl font-black mb-2">Recibí promociones exclusivas</h3>
          <p className="text-white/70 mb-6 text-sm">Suscribite y enterate de todas las ofertas antes que nadie</p>
          {status === 'ok' ? (
            <div className="flex items-center justify-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl max-w-md mx-auto">
              ✓ ¡Gracias! Te suscribiste correctamente.
            </div>
          ) : (
            <div className="flex gap-3 max-w-md mx-auto">
              <input type="email" placeholder="tu@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                disabled={status === 'loading'}
                className={`flex-1 bg-white/15 border text-white placeholder-white/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/60 transition-colors disabled:opacity-60 ${status === 'error' ? 'border-yellow-400' : 'border-white/30'}`}
              />
              <button onClick={handleSubmit} disabled={status === 'loading'}
                className="bg-white text-[#C8102E] font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm whitespace-nowrap disabled:opacity-60">
                {status === 'loading' ? 'Enviando...' : 'Suscribirme'}
              </button>
            </div>
          )}
          {status === 'error' && <p className="text-yellow-300 text-xs mt-2">Ingresá un email válido e intentá de nuevo.</p>}
        </div>
      </div>
    </div>
  );
}

/* ── Section header helper ── */
function SectionHeader({ title, sub, badge, link, icon }) {
  const { dispatch } = useStore();
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {badge && <span className="text-xs font-bold bg-[#C8102E] text-white px-2 py-0.5 rounded-full animate-pulse">{badge}</span>}
        </div>
        {sub && <p className="text-sm text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {link && (
        <button onClick={() => dispatch({ type:'SET_SECTION', payload:link.section })}
          className="flex items-center gap-1 text-sm text-[#C8102E] font-semibold hover:underline whitespace-nowrap">
          {link.label} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   PRODUCTOS
════════════════════════════════════════════════════ */
function Productos() {
  const { state, dispatch } = useStore();
  const [sortOrder, setSortOrder] = useState(state.sortOrder || 'default');
  const [priceMax, setPriceMax]   = useState(200000);
  const [showFilters, setShowFilters] = useState(false);

  const cats = state.categorias && state.categorias.length > 0
    ? [{ key:'todos', label:'Todos los productos' }, ...state.categorias]
    : Object.entries(CAT_LABELS).map(([key, label]) => ({ key, label }));

  const filtered = useMemo(() => {
    let list = [...state.products];
    if (state.currentCategory !== 'todos') list = list.filter(p => p.categoria === state.currentCategory);
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(p => (p.nombre||'').toLowerCase().includes(q) || (p.marca||'').toLowerCase().includes(q));
    }
    list = list.filter(p => parseFloat(p.precio) <= priceMax);
    if (sortOrder === 'price-asc')  list.sort((a,b) => parseFloat(a.precio) - parseFloat(b.precio));
    if (sortOrder === 'price-desc') list.sort((a,b) => parseFloat(b.precio) - parseFloat(a.precio));
    if (sortOrder === 'name')       list.sort((a,b) => (a.nombre||'').localeCompare(b.nombre||''));
    if (sortOrder === 'descuento')  list.sort((a,b) => {
      const dA = a.precio_oferta ? parseFloat(a.precio_oferta) : parseFloat(a.precio);
      const dB = b.precio_oferta ? parseFloat(b.precio_oferta) : parseFloat(b.precio);
      return (parseFloat(a.precio)-dA) < (parseFloat(b.precio)-dB) ? 1 : -1;
    });
    return list;
  }, [state.products, state.currentCategory, state.searchQuery, priceMax, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="section-title">
            {state.searchQuery ? `"${state.searchQuery}"` : (CAT_LABELS[state.currentCategory] || 'Productos')}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} producto(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-1.5 ${showFilters ? 'border-[#C8102E] text-[#C8102E]' : ''}`}>
            Filtros {showFilters ? '▲' : '▼'}
          </button>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="input-field w-auto">
            <option value="default">Relevancia</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="name">Nombre A-Z</option>
            <option value="descuento">Mayor descuento</option>
          </select>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categoría</p>
            <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
              {cats.map(c => (
                <button key={c.key} onClick={() => dispatch({ type:'SET_CATEGORY', payload:c.key })}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${state.currentCategory === c.key ? 'bg-[#FFF0F3] text-[#C8102E] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Precio máximo</p>
            <input type="range" min={0} max={200000} step={1000} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))}
              className="w-full accent-[#C8102E] mb-1" />
            <p className="text-sm font-semibold text-gray-700">${formatPrice(priceMax)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filtros rápidos</p>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => { dispatch({ type:'SET_SECTION', payload:'ofertas' }); setShowFilters(false); }}
                className="text-left px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Solo ofertas</button>
              <button onClick={() => dispatch({ type:'SET_CATEGORY', payload:'todos' })}
                className="text-left px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Destacados</button>
            </div>
            <button onClick={() => { dispatch({ type:'SET_CATEGORY', payload:'todos' }); dispatch({ type:'SET_SEARCH', payload:'' }); setPriceMax(200000); }}
              className="mt-3 text-xs text-[#C8102E] font-semibold hover:underline">
              Limpiar todos los filtros
            </button>
          </div>
        </div>
      )}

      {/* Category pills — usando categorías dinámicas */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
        {cats.slice(0, 12).map(c => (
          <button key={c.key} onClick={() => dispatch({ type:'SET_CATEGORY', payload:c.key })}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              state.currentCategory === c.key
                ? 'bg-[#C8102E] text-white border-[#C8102E]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#C8102E] hover:text-[#C8102E]'
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-gray-700 mb-1">Sin resultados</p>
          <p className="text-sm text-gray-400 mb-4">Probá con otros filtros o términos de búsqueda</p>
          <button onClick={() => { dispatch({ type:'SET_CATEGORY', payload:'todos' }); dispatch({ type:'SET_SEARCH', payload:'' }); }}
            className="btn-primary">Limpiar filtros</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(p => <ProductCard key={p.codigo} product={p} />)}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   OFERTAS
════════════════════════════════════════════════════ */
function Ofertas() {
  const { state } = useStore();
  const ofertas = state.products.filter(p => p.precio_oferta && parseFloat(p.precio_oferta) > 0);
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2"><Flame className="w-6 h-6 text-[#C8102E]" /> Ofertas imperdibles</h1>
        <p className="text-gray-400 mt-1">Descuentos exclusivos por tiempo limitado</p>
      </div>
      {ofertas.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-3">🔥</p><p>No hay ofertas disponibles en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ofertas.map(p => <ProductCard key={p.codigo} product={p} />)}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   PROMOS
════════════════════════════════════════════════════ */
function Promos() {
  const { state, dispatch } = useStore();
  const active   = state.promos.filter(p => (p.activa||'SI').toUpperCase() === 'SI');
  const programas = (state.programas||[]).filter(p => (p.activo||'SI').toUpperCase() === 'SI');

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-[#C8102E]" /> Promociones y programas
        </h1>
        <p className="text-gray-400 mt-1">Descuentos bancarios y programas de laboratorios</p>
      </div>

      {/* Programas de descuento */}
      {programas.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Programas de descuento</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {programas.map((prog, i) => (
              <button key={i}
                onClick={() => dispatch({ type:'SET_PROGRAMA', payload:prog })}
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 text-left group">
                {prog.imagen_url && (
                  <img src={prog.imagen_url} alt={prog.nombre} className="w-12 h-12 object-contain rounded-xl flex-shrink-0"
                    onError={e => e.target.style.display='none'} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 group-hover:text-[#C8102E] transition-colors">{prog.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{prog.descripcion}</p>
                  <p className="text-xs text-[#C8102E] font-semibold mt-1">{(prog.productos||[]).length} producto(s) con descuento</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#C8102E] transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Promos bancarias */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Promociones bancarias</h2>
      {active.length === 0 ? (
        <p className="text-center text-gray-400 py-16">Sin promociones vigentes</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {active.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF0F3] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {p.imagen_url
                    ? <img src={p.imagen_url} alt="" className="w-full h-full object-contain p-1" onError={e => e.target.style.display='none'} />
                    : <CreditCard className="w-6 h-6 text-[#C8102E]" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{p.tarjeta}
                    <span className="text-gray-400 font-normal text-sm ml-2">{p.tipo}</span>
                  </h3>
                  {p.dia && <span className="text-xs bg-[#FFF0F3] text-[#C8102E] font-semibold px-2 py-0.5 rounded-full inline-block mt-1">{p.dia}</span>}
                  <div className="mt-3">
                    {p.descuento > 0 && <p className="text-3xl font-black text-[#C8102E]">{p.descuento}% OFF</p>}
                    {p.cuotas > 0 && <p className="text-lg font-bold text-gray-700">{p.cuotas} cuotas sin interés</p>}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{p.detalle}</p>
                  {p.vigencia && <p className="text-xs text-gray-400 mt-2">Válido hasta {p.vigencia}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   WISHLIST
════════════════════════════════════════════════════ */
function Wishlist() {
  const { state, dispatch } = useStore();
  const items = state.products.filter(p => state.wishlist?.includes(p.codigo));
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2"><Heart className="w-6 h-6 text-[#C8102E]" fill="currentColor" /> Mis favoritos</h1>
          <p className="text-gray-400 mt-1">{items.length} producto(s) guardado(s)</p>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-700 mb-1">Tu lista de favoritos está vacía</p>
          <p className="text-sm text-gray-400 mb-5">Guardá los productos que te interesan con el corazón</p>
          <button onClick={() => dispatch({ type:'SET_SECTION', payload:'productos' })} className="btn-primary">Ver productos</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(p => <ProductCard key={p.codigo} product={p} />)}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   PÁGINA ESTÁTICA
════════════════════════════════════════════════════ */
function PaginaEstatica({ slug }) {
  const { state, dispatch } = useStore();
  const pagina = state.paginas?.[slug];

  if (!pagina) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-700 mb-2">Página no encontrada</h1>
        <button onClick={() => dispatch({ type:'SET_SECTION', payload:'inicio' })} className="btn-primary mt-4">Volver al inicio</button>
      </div>
    );
  }

  const renderContent = (text) => text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-3" />;
    if (line.startsWith('**') && line.endsWith('**'))
      return <h3 key={i} className="text-base font-bold text-gray-900 mt-5 mb-1">{line.replace(/\*\*/g, '')}</h3>;
    return <p key={i} className="text-sm text-gray-600 leading-relaxed">{line}</p>;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => dispatch({ type:'SET_SECTION', payload:'inicio' })}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-7 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#C8102E]" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">{pagina.titulo}</h1>
        </div>
        <div className="prose-sm">{renderContent(pagina.contenido)}</div>
      </div>
    </div>
  );
}
