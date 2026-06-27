'use client';
import { useState, useMemo } from 'react';
import { useStore, formatPrice } from '@/lib/store';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import ProductModal from '@/components/ProductModal';
import ToastContainer from '@/components/Toast';
import WhatsAppButton from '@/components/WhatsAppButton';
import { MessageCircle, ShoppingBag, Search, ChevronRight, Package } from 'lucide-react';

const WA = '5493625298918';

const SUBCATS = [
  { key: 'todos',      label: 'Todo CHIMOLA' },
  { key: 'carteras',   label: 'Carteras'     },
  { key: 'billeteras', label: 'Billeteras'   },
  { key: 'mochilas',   label: 'Mochilas'     },
  { key: 'bolsos',     label: 'Bolsos'       },
  { key: 'accesorios', label: 'Accesorios'   },
];

export default function ChimolaPage() {
  return (
    <>
      <Header />
      <Cart />
      <ProductModal />
      <ToastContainer />
      <WhatsAppButton />
      <main className="min-h-screen bg-gray-50">
        <ChimolaContent />
      </main>
      <Footer />
    </>
  );
}

function ChimolaContent() {
  const { state, dispatch } = useStore();
  const [subcat, setSubcat]   = useState('todos');
  const [query, setQuery]     = useState('');

  const chimola = useMemo(() => {
    let list = state.products.filter(
      p => (p.marca || '').toLowerCase() === 'chimola'
    );
    if (subcat !== 'todos') {
      list = list.filter(p =>
        (p.categoria || '').toLowerCase() === subcat ||
        (p.subcategoria || '').toLowerCase() === subcat ||
        (p.nombre || '').toLowerCase().includes(subcat)
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [state.products, subcat, query]);

  const waMsg = encodeURIComponent(
    '¡Hola! Quiero consultar precios mayoristas de productos CHIMOLA.'
  );

  return (
    <div>
      {/* ── Hero Banner CHIMOLA ── */}
      <div className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 overflow-hidden">
        {/* Textura decorativa */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #fff 0px, #fff 1px,
              transparent 1px, transparent 12px
            )`
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Logo / Marca */}
            <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-white/10 border-2 border-white/30 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-black text-3xl tracking-tighter leading-none text-center">
                CHI<br/>MOLA
              </span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">
                Marca exclusiva
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
                CHIMOLA
              </h1>
              <p className="text-amber-100 text-sm sm:text-base max-w-md leading-relaxed mb-4">
                Carteras, billeteras, mochilas y accesorios de moda. 
                Diseños modernos con materiales de primera calidad.
              </p>
              {/* CTA mayorista */}
              <a
                href={`https://wa.me/${WA}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 active:scale-[.97] text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg transition-all duration-150"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar precios mayoristas
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Aviso mayorista ── */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wide flex-shrink-0">
            💼 Venta mayorista disponible
          </span>
          <span className="text-amber-700 text-xs">
            Consultá precios especiales por mayor por WhatsApp — respondemos a la brevedad.
          </span>
          <a
            href={`https://wa.me/${WA}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex-shrink-0 text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 underline underline-offset-2"
          >
            Consultar <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ── Filtros subcategoría ── */}
      <div className="sticky top-[var(--header-h,60px)] z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2.5">
            {SUBCATS.map(s => (
              <button
                key={s.key}
                onClick={() => setSubcat(s.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  subcat === s.key
                    ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-800'
                }`}
              >
                {s.label}
              </button>
            ))}

            {/* Buscador inline */}
            <div className="relative ml-auto flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 w-32 sm:w-44"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Catálogo ── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {chimola.length === 0 ? (
          <EmptyState
            subcat={subcat}
            query={query}
            waMsg={waMsg}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-500">
                {chimola.length} producto{chimola.length !== 1 ? 's' : ''}
                {subcat !== 'todos' ? ` en ${SUBCATS.find(s=>s.key===subcat)?.label}` : ''}
              </h2>
            </div>
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

/* ── Tarjeta de producto CHIMOLA ── */
function ChimolaCard({ product, waMsg }) {
  const { dispatch } = useStore();

  const handleClick = () => {
    dispatch({ type: 'OPEN_PRODUCT_MODAL', payload: product });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-amber-50 overflow-hidden">
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="w-10 h-10 text-amber-300" />
            <span className="text-[10px] text-amber-400 font-semibold">CHIMOLA</span>
          </div>
        )}
        {/* Badge subcategoría */}
        {product.subcategoria && (
          <span className="absolute top-2 left-2 bg-amber-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {product.subcategoria}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mb-0.5">CHIMOLA</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-3">
          {product.nombre}
        </h3>

        {/* Precio / consultar */}
        {product.precio && parseFloat(product.precio) > 0 ? (
          <p className="text-base font-bold text-gray-900 mb-2">
            ${formatPrice(parseFloat(product.precio))}
          </p>
        ) : (
          <p className="text-xs font-semibold text-amber-700 mb-2">Consultá el precio</p>
        )}

        <a
          href={`https://wa.me/${WA}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="w-full flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-xl transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Consultar precio mayor
        </a>
      </div>
    </div>
  );
}

/* ── Estado vacío ── */
function EmptyState({ subcat, query, waMsg }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-5">
        <Package className="w-9 h-9 text-amber-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">
        {query
          ? `Sin resultados para "${query}"`
          : subcat !== 'todos'
          ? `Próximamente productos en ${SUBCATS.find(s => s.key === subcat)?.label}`
          : 'Próximamente el catálogo CHIMOLA'
        }
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        Estamos cargando los productos. Mientras tanto podés consultar disponibilidad y precios por WhatsApp.
      </p>
      <a
        href={`https://wa.me/${WA}?text=${waMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        Consultar por WhatsApp
      </a>
    </div>
  );
}
