'use client';
import { useMemo, useState } from 'react';
import { useStore, formatPrice } from '@/lib/store';
import { ShoppingCart, Heart, MessageCircle, ChevronRight, Search, SlidersHorizontal, X, Star, Package } from 'lucide-react';
import { showToast } from '@/components/Toast';

const WA_MAYORISTA = '5493625298918';
const WA_MSG_MAYORISTA = encodeURIComponent('Hola MaxFarma, quisiera consultar precios mayoristas de la marca CHIMOLA.');
const WA_MSG_CONSULTA  = encodeURIComponent('Hola MaxFarma, quisiera consultar sobre un producto CHIMOLA.');

const CATEGORIAS_CHIMOLA = [
  { key: 'todos',      label: 'Todo CHIMOLA' },
  { key: 'carteras',   label: 'Carteras' },
  { key: 'billeteras', label: 'Billeteras' },
  { key: 'mochilas',   label: 'Mochilas' },
  { key: 'bolsos',     label: 'Bolsos' },
  { key: 'accesorios', label: 'Accesorios' },
];

export default function MarcaChimola() {
  const { state, dispatch } = useStore();
  const [catActiva, setCatActiva] = useState('todos');
  const [buscar, setBuscar]       = useState('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [orden, setOrden]         = useState('default');

  // Todos los productos CHIMOLA del catálogo
  const productos = useMemo(() => {
    let list = state.products.filter(p =>
      (p.marca || '').toUpperCase().includes('CHIMOLA')
    );

    // Filtro por subcategoría (usa el campo categoria o nombre)
    if (catActiva !== 'todos') {
      list = list.filter(p =>
        (p.categoria || '').toLowerCase().includes(catActiva) ||
        (p.nombre    || '').toLowerCase().includes(catActiva)
      );
    }

    // Búsqueda
    if (buscar) {
      const q = buscar.toLowerCase();
      list = list.filter(p =>
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q)
      );
    }

    // Ordenar
    if (orden === 'price-asc')  list.sort((a,b) => parseFloat(a.precio) - parseFloat(b.precio));
    if (orden === 'price-desc') list.sort((a,b) => parseFloat(b.precio) - parseFloat(a.precio));
    if (orden === 'name')       list.sort((a,b) => (a.nombre||'').localeCompare(b.nombre||''));

    return list;
  }, [state.products, catActiva, buscar, orden]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Hero banner CHIMOLA ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f0e 50%, #1a1a1a 100%)' }}>
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-400 translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-600 -translate-x-16 translate-y-16" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-14 sm:py-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Marca oficial disponible en MaxFarma
              </div>

              <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight mb-3">
                CHIMOLA
              </h1>
              <p className="text-amber-200/80 text-lg mb-2 font-medium">
                Carteras · Billeteras · Mochilas · Accesorios
              </p>
              <p className="text-gray-400 text-sm mb-8 max-w-lg leading-relaxed">
                Encontrá toda la colección CHIMOLA en un solo lugar. 
                Diseño, calidad y estilo para cada ocasión.
              </p>

              <div className="flex flex-wrap gap-3">
                {/* Botón mayorista */}
                <a
                  href={`https://wa.me/${WA_MAYORISTA}?text=${WA_MSG_MAYORISTA}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-xl transition-colors shadow-lg text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Consultar precio mayorista
                </a>
                {/* Botón ver productos */}
                <a href="#productos"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-white/20">
                  Ver productos <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Stats card */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-3">
              {[
                { val: productos.length || '—', label: 'Productos' },
                { val: 'Mayorista', label: 'Consultar' },
                { val: '4 cuotas', label: 'Sin interés' },
                { val: 'Envío', label: 'A domicilio' },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-center">
                  <p className="text-white font-black text-xl">{s.val}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Banner mayorista ── */}
      <div className="bg-amber-50 border-y border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">¿Comprás por mayor?</p>
              <p className="text-amber-700 text-xs">Tenemos precios especiales para revendedores. Consultanos sin compromiso.</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${WA_MAYORISTA}?text=${WA_MSG_MAYORISTA}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Consultar precio mayorista
          </a>
        </div>
      </div>

      {/* ── Catálogo ── */}
      <div id="productos" className="max-w-7xl mx-auto px-4 pt-10">

        {/* Filtros por subcategoría */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {CATEGORIAS_CHIMOLA.map(c => (
            <button key={c.key} onClick={() => setCatActiva(c.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                catActiva === c.key
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-600'
              }`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              placeholder="Buscar en CHIMOLA..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {buscar && (
              <button onClick={() => setBuscar('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select value={orden} onChange={e => setOrden(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="default">Relevancia</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="name">Nombre A-Z</option>
          </select>
          <span className="text-sm text-gray-400">{productos.length} producto(s)</span>
        </div>

        {/* Sin productos */}
        {productos.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-amber-400" />
            </div>
            <p className="font-bold text-gray-700 text-lg mb-1">
              {buscar ? 'Sin resultados' : 'Productos CHIMOLA próximamente'}
            </p>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              {buscar
                ? `No encontramos productos CHIMOLA con "${buscar}"`
                : 'Estamos cargando el catálogo completo. Mientras tanto, consultanos por WhatsApp.'
              }
            </p>
            <a href={`https://wa.me/${WA_MAYORISTA}?text=${WA_MSG_CONSULTA}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
              <MessageCircle className="w-4 h-4" /> Consultar disponibilidad
            </a>
          </div>
        )}

        {/* Grid productos */}
        {productos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {productos.map(product => (
              <ChimolaCard key={product.codigo} product={product} dispatch={dispatch} wishlist={state.wishlist} />
            ))}
          </div>
        )}

        {/* Footer CTA mayorista — siempre visible */}
        <div className="mt-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-center">
          <h3 className="text-white font-black text-2xl mb-2">¿Comprás para revender?</h3>
          <p className="text-amber-100 mb-6">Precios especiales para mayoristas. Consultanos y te asesoramos sin compromiso.</p>
          <a href={`https://wa.me/${WA_MAYORISTA}?text=${WA_MSG_MAYORISTA}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-white text-amber-600 font-black px-8 py-3.5 rounded-xl hover:bg-amber-50 transition-colors text-sm shadow-lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Consultar precio mayorista ahora
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta de producto CHIMOLA ── */
function ChimolaCard({ product, dispatch, wishlist }) {
  const inWishlist = wishlist?.includes(product.codigo);
  const hasOffer   = product.precio_oferta && parseFloat(product.precio_oferta) > 0;
  const price      = hasOffer ? parseFloat(product.precio_oferta) : parseFloat(product.precio);
  const discount   = hasOffer ? Math.round((1 - parseFloat(product.precio_oferta) / parseFloat(product.precio)) * 100) : 0;
  const soldOut    = (product.stock || '').toLowerCase().includes('sin');

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 hover:border-amber-300 hover:shadow-md transition-all overflow-hidden group cursor-pointer"
      onClick={() => dispatch({ type:'OPEN_PRODUCT_MODAL', payload: product })}>

      {/* Imagen */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* Badge descuento */}
        {hasOffer && (
          <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
            -{discount}%
          </span>
        )}
        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); dispatch({ type:'TOGGLE_WISHLIST', codigo:product.codigo }); showToast(inWishlist ? 'Eliminado de favoritos' : '❤️ Guardado', 'wish'); }}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow-sm transition-all ${inWishlist ? 'bg-[#C8102E] text-white' : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100'}`}>
          <Heart className="w-3.5 h-3.5" fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {product.imagen_url ? (
          <img src={product.imagen_url} alt={product.nombre}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display='none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-200" />
          </div>
        )}

        {soldOut && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">Sin stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">CHIMOLA</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2">{product.nombre}</h3>

        {/* Precio */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-black text-gray-900">${formatPrice(price)}</span>
          {hasOffer && <span className="text-xs text-gray-400 line-through">${formatPrice(product.precio)}</span>}
        </div>
        <p className="text-[11px] text-gray-400 mb-3">
          4 cuotas de <strong className="text-gray-600">${formatPrice(price / 4)}</strong>
        </p>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              if (!soldOut) { dispatch({ type:'ADD_TO_CART', payload:product }); showToast('🛒 Agregado al carrito', 'cart'); }
            }}
            disabled={soldOut}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors">
            <ShoppingCart className="w-3.5 h-3.5" />
            {soldOut ? 'Sin stock' : 'Agregar'}
          </button>
          <a
            href={`https://wa.me/${WA_MAYORISTA}?text=${encodeURIComponent(`Hola MaxFarma, quisiera consultar precio mayorista de: ${product.nombre}`)}`}
            target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
            title="Consultar precio mayorista">
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
