'use client';
import { useMemo, useState, useEffect } from 'react';
import { useStore, CAT_LABELS, CAT_ICONS, CAT_IMAGES, BRANDS, formatPrice } from '@/lib/store';
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
import { ShoppingCart, Truck, Shield, CreditCard, Phone, Heart, Star, ChevronRight, Flame, Sparkles, TrendingUp, ArrowLeft, FileText } from 'lucide-react';

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
        {state.currentSection === 'productos' && <Productos />}
        {state.currentSection === 'ofertas'   && <Ofertas />}
        {state.currentSection === 'promos'    && <Promos />}
        {state.currentSection === 'wishlist'  && <Wishlist />}
        {state.currentSection === 'checkout'  && <Checkout />}
        {state.currentSection === 'programa' && <ProgramaDescuento />}
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
  const featured   = state.products.filter(p => (p.destacado||'').toUpperCase() === 'SI').slice(0, 8);
  const ofertas    = state.products.filter(p => p.precio_oferta && parseFloat(p.precio_oferta) > 0).slice(0, 4);
  const masVendidos= state.products.filter(p => (p.mas_vendido||'').toUpperCase() === 'SI').slice(0, 4);
  const nuevos     = state.products.filter(p => (p.nuevo||'').toUpperCase() === 'SI').slice(0, 4);
  const activePromos = state.promos.filter(p => (p.activa||'SI').toUpperCase() === 'SI');

  return (
    <div className="pb-20">
      {/* ── Hero ── */}
      <HeroBanner />

      {/* ── Promo strip ── */}
      {activePromos.length > 0 && (
        <div className="mx-3 sm:mx-4 mt-3 bg-[#C8102E] rounded-xl px-4 py-3 flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="text-white font-bold text-xs whitespace-nowrap flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Beneficios:</span>
          <div className="flex gap-2">
            {activePromos.map((p, i) => (
              <button key={i} onClick={() => dispatch({ type: 'SET_SECTION', payload: 'promos' })}
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
            { icon: <Truck className="w-5 h-5" />,   title: 'Envío a domicilio',    sub: 'En tu zona' },
            { icon: <Shield className="w-5 h-5" />,  title: 'Compra 100% segura',   sub: 'Datos protegidos' },
            { icon: <CreditCard className="w-5 h-5"/>,title: 'Pagá con Go Cuotas',  sub: 'Cuotas con tu débito' },
            { icon: <Phone className="w-5 h-5" />,   title: 'Atención personalizada',sub: 'Lun–Sáb 9–21 hs' },
          ].map((b, i) => (
            <div key={i} className={`bg-white rounded-xl p-4 flex items-center gap-3 border border-gray-100 shadow-sm animate-fade-up animate-delay-${i+1}`}>
              <div className="w-9 h-9 rounded-lg bg-[#FFF0F3] flex items-center justify-center text-[#C8102E] flex-shrink-0">{b.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{b.title}</p>
                <p className="text-xs text-gray-400">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Categorías visuales ── */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <SectionHeader title="Explorá por categoría" link={{ label: 'Ver todos los productos', section: 'productos' }} />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-5">
          {Object.entries(CAT_ICONS).map(([key, icon], i) => (
            <button key={key}
              onClick={() => dispatch({ type: 'SET_CATEGORY', payload: key })}
              className={`group flex flex-col items-center gap-2 rounded-2xl p-4 border border-gray-100 bg-white hover:border-[#C8102E] hover:bg-[#FFF0F3] transition-all duration-200 animate-fade-up`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              {CAT_IMAGES[key] ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 group-hover:border-[#C8102E]/30 transition-colors">
                  <img src={CAT_IMAGES[key]} alt={CAT_LABELS[key]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{icon}</span>
              )}
              <span className="text-xs font-semibold text-gray-600 group-hover:text-[#C8102E] text-center leading-tight transition-colors">{CAT_LABELS[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Ofertas del día ── */}
      {ofertas.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <SectionHeader
            icon={<Flame className="w-5 h-5 text-[#C8102E]" />}
            title="Ofertas del día"
            badge="Tiempo limitado"
            link={{ label: 'Ver todas las ofertas', section: 'ofertas' }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            {ofertas.map(p => <ProductCard key={p.codigo} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Destacados ── */}
      {featured.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <SectionHeader
            icon={<Sparkles className="w-5 h-5 text-amber-500" />}
            title="Productos destacados"
            link={{ label: 'Ver todos', section: 'productos' }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-5">
            {featured.map(p => <ProductCard key={p.codigo} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Más vendidos ── */}
      {masVendidos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <SectionHeader
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            title="Más vendidos"
            link={{ label: 'Ver todos', section: 'productos' }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            {masVendidos.map(p => <ProductCard key={p.codigo} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Nuevos ingresos ── */}
      {nuevos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <SectionHeader
            icon={<Sparkles className="w-5 h-5 text-purple-500" />}
            title="Nuevos ingresos"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            {nuevos.map(p => <ProductCard key={p.codigo} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Marcas carrusel ── */}
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

      {/* ── Newsletter ── */}
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
            <div className="flex gap-3 max-w-md mx-auto">
              <input type="email" placeholder="tu@email.com"
                className="flex-1 bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/60 transition-colors" />
              <button className="bg-white text-[#C8102E] font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm whitespace-nowrap">
                Suscribirme
              </button>
            </div>
          </div>
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
        <button onClick={() => dispatch({ type: 'SET_SECTION', payload: link.section })}
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

  const cats = Object.entries(CAT_LABELS);

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
              {cats.map(([k, v]) => (
                <button key={k} onClick={() => dispatch({ type: 'SET_CATEGORY', payload: k })}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${state.currentCategory === k ? 'bg-[#FFF0F3] text-[#C8102E] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {CAT_ICONS[k] || ''} {v}
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
              {[
                { label: 'Solo ofertas',   fn: () => { dispatch({ type: 'SET_SECTION', payload: 'ofertas' }); setShowFilters(false); }},
                { label: 'Destacados',     fn: () => { dispatch({ type: 'SET_CATEGORY', payload: 'todos' }); }},
              ].map((f, i) => (
                <button key={i} onClick={f.fn} className="text-left px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">{f.label}</button>
              ))}
            </div>
            <button onClick={() => { dispatch({ type: 'SET_CATEGORY', payload: 'todos' }); dispatch({ type: 'SET_SEARCH', payload: '' }); setPriceMax(200000); }}
              className="mt-3 text-xs text-[#C8102E] font-semibold hover:underline">
              Limpiar todos los filtros
            </button>
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
        {cats.slice(0, 10).map(([k, v]) => (
          <button key={k} onClick={() => dispatch({ type: 'SET_CATEGORY', payload: k })}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              state.currentCategory === k
                ? 'bg-[#C8102E] text-white border-[#C8102E]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#C8102E] hover:text-[#C8102E]'
            }`}>
            {CAT_ICONS[k] || ''} {v}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-gray-700 mb-1">Sin resultados</p>
          <p className="text-sm text-gray-400 mb-4">Probá con otros filtros o términos de búsqueda</p>
          <button onClick={() => { dispatch({ type: 'SET_CATEGORY', payload: 'todos' }); dispatch({ type: 'SET_SEARCH', payload: '' }); }}
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
  const { state } = useStore();
  const active = state.promos.filter(p => (p.activa||'SI').toUpperCase() === 'SI');
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="section-title">💳 Promociones bancarias</h1>
        <p className="text-gray-400 mt-1">Aprovechá descuentos y cuotas sin interés</p>
      </div>
      {active.length === 0 ? (
        <p className="text-center text-gray-400 py-16">Sin promociones vigentes</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {active.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF0F3] flex items-center justify-center flex-shrink-0 text-2xl">💳</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{p.tarjeta}
                    <span className="text-gray-400 font-normal text-sm ml-2">{p.tipo}</span>
                  </h3>
                  {p.dia && <span className="text-xs bg-[#FFF0F3] text-[#C8102E] font-semibold px-2 py-0.5 rounded-full inline-block mt-1">📅 {p.dia}</span>}
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
          <p className="text-sm text-gray-400 mb-5">Guardá los productos que te interesan con el corazón ❤️</p>
          <button onClick={() => dispatch({ type: 'SET_SECTION', payload: 'productos' })} className="btn-primary">Ver productos</button>
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
   PÁGINA ESTÁTICA (Ayuda, Términos, etc.)
════════════════════════════════════════════════════ */
function PaginaEstatica({ slug }) {
  const { state, dispatch } = useStore();
  const pagina = state.paginas?.[slug];

  if (!pagina) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-700 mb-2">Página no encontrada</h1>
        <button onClick={() => dispatch({ type: 'SET_SECTION', payload: 'inicio' })} className="btn-primary mt-4">Volver al inicio</button>
      </div>
    );
  }

  // Render simple markdown-like: **bold**, párrafos separados por línea en blanco
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-3" />;
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={i} className="text-base font-bold text-gray-900 mt-5 mb-1">{line.replace(/\*\*/g, '')}</h3>;
      }
      return <p key={i} className="text-sm text-gray-600 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => dispatch({ type: 'SET_SECTION', payload: 'inicio' })}
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
