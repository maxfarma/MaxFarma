'use client';
import { useState } from 'react';
import { useStore, formatPrice, CAT_ICONS } from '@/lib/store';
import { X, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Truck, Shield, CreditCard, Package } from 'lucide-react';

export default function ProductModal() {
  const { state, dispatch } = useStore();
  const product = state.productModal;
  const [qty, setQty]   = useState(1);
  const [tab, setTab]   = useState('descripcion');
  const [imgIdx, setImgIdx] = useState(0);

  if (!product) return null;

  const inWishlist = state.wishlist?.includes(product.codigo);
  const hasOffer   = product.precio_oferta && parseFloat(product.precio_oferta) > 0;
  const price      = hasOffer ? parseFloat(product.precio_oferta) : parseFloat(product.precio);
  const discount   = hasOffer ? Math.round((1 - parseFloat(product.precio_oferta) / parseFloat(product.precio)) * 100) : 0;
  const soldOut    = (product.stock || '').toLowerCase().includes('sin');

  const images = [product.imagen_url].filter(Boolean);
  const currentImg = images[imgIdx] || null;

  const addToCart = () => {
    for (let i = 0; i < qty; i++) dispatch({ type: 'ADD_TO_CART', payload: product });
    dispatch({ type: 'CLOSE_PRODUCT_MODAL' });
  };

  const related = state.products
    .filter(p => p.categoria === product.categoria && p.codigo !== product.codigo)
    .slice(0, 4);

  return (
    <div className="modal-backdrop fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => dispatch({ type: 'CLOSE_PRODUCT_MODAL' })}>
      <div
        className="modal-panel bg-white w-full sm:max-w-4xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header bar */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between z-10">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{product.marca}</p>
          <button onClick={() => dispatch({ type: 'CLOSE_PRODUCT_MODAL' })}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* ── Image side ── */}
          <div className="bg-gray-50 p-8 flex flex-col items-center justify-center relative min-h-[300px] sm:min-h-[420px]">
            {hasOffer && (
              <span className="absolute top-4 left-4 bg-[#C8102E] text-white text-xs font-bold px-2.5 py-1 rounded-lg">-{discount}%</span>
            )}

            {/* Main image */}
            <div className="w-full max-w-xs aspect-square flex items-center justify-center">
              {currentImg ? (
                <img src={currentImg} alt={product.nombre}
                  className="w-full h-full object-contain transition-all duration-300 hover:scale-105 cursor-zoom-in"
                  onClick={() => window.open(currentImg, '_blank')} />
              ) : (
                <span className="text-8xl">{CAT_ICONS[product.categoria] || '💊'}</span>
              )}
            </div>

            {/* Image nav */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${i === imgIdx ? 'border-[#C8102E]' : 'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Zoom hint */}
            {currentImg && (
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">🔍 Hacé clic en la imagen para ampliar</p>
            )}
          </div>

          {/* ── Info side ── */}
          <div className="p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 leading-snug mb-1">{product.nombre}</h2>
            <p className="text-sm text-gray-400 mb-3">Código: {product.codigo}</p>

            {/* Stars */}
            <div className="flex items-center gap-1.5 mb-4">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-amber-400" fill="currentColor" />)}
              <span className="text-sm text-gray-400">(12 opiniones)</span>
            </div>

            {/* Price block */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-black text-gray-900">${formatPrice(price)}</span>
                {hasOffer && <span className="text-lg text-gray-400 line-through">${formatPrice(product.precio)}</span>}
                {hasOffer && <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Ahorrás ${formatPrice(parseFloat(product.precio) - price)}</span>}
              </div>
              <p className="text-sm text-gray-500">3 cuotas con Go Cuotas de <strong className="text-gray-700">${formatPrice(price / 3)}</strong></p>
              <p className="text-xs text-[#C8102E] mt-1 font-medium">💳 Pagá en cuotas con tu débito vía Go Cuotas</p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full ${soldOut ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className={`text-sm font-medium ${soldOut ? 'text-red-600' : 'text-emerald-700'}`}>
                {product.stock || 'Disponible'}
              </span>
            </div>

            {/* Qty + add to cart */}
            {!soldOut && (
              <div className="flex gap-3 mb-5">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors font-bold">−</button>
                  <span className="px-4 py-2.5 font-semibold text-gray-900 min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="px-3 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors font-bold">+</button>
                </div>
                <button onClick={addToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#9B0D22] text-white font-bold py-2.5 rounded-xl transition-all active:scale-[.98] shadow-sm">
                  <ShoppingCart className="w-4 h-4" /> Agregar al carrito
                </button>
              </div>
            )}
            {soldOut && <div className="mb-5 bg-gray-100 text-gray-500 text-center py-3 rounded-xl text-sm font-medium">Sin stock disponible</div>}

            {/* Wishlist */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', codigo: product.codigo })}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all mb-5 ${
                inWishlist ? 'bg-red-50 border-red-200 text-[#C8102E]' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
              }`}>
              <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
              {inWishlist ? 'Guardado en favoritos' : 'Agregar a favoritos'}
            </button>

            {/* Benefits strip */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { icon: <Truck className="w-4 h-4" />, text: 'Envío a domicilio' },
                { icon: <Shield className="w-4 h-4" />, text: 'Compra segura' },
                { icon: <CreditCard className="w-4 h-4" />, text: 'Cuotas sin interés' },
                { icon: <Package className="w-4 h-4" />, text: 'Retiro en sucursal' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-[#C8102E]">{b.icon}</span> {b.text}
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex gap-1 mb-3">
                {['descripcion','beneficios','modo-de-uso'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${tab === t ? 'bg-[#C8102E] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {t === 'modo-de-uso' ? 'Modo de uso' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {tab === 'descripcion' && <p>{product.descripcion || 'Descripción no disponible para este producto.'}</p>}
                {tab === 'beneficios'  && <ul className="list-disc list-inside space-y-1"><li>Formulación dermatológicamente testeada</li><li>Libre de parabenos</li><li>Sin fragancia artificial</li><li>Apto para todo tipo de piel</li></ul>}
                {tab === 'modo-de-uso' && <p>Aplicar la cantidad necesaria sobre la zona deseada. Para mejores resultados utilizar diariamente. Mantener fuera del alcance de los niños.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5">
            <p className="text-sm font-bold text-gray-800 mb-3">Productos relacionados</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {related.map(p => {
                const rPrice = p.precio_oferta && parseFloat(p.precio_oferta) > 0 ? parseFloat(p.precio_oferta) : parseFloat(p.precio);
                return (
                  <button key={p.codigo} onClick={() => dispatch({ type: 'OPEN_PRODUCT_MODAL', payload: p })}
                    className="bg-gray-50 rounded-xl p-3 text-left hover:bg-gray-100 transition-colors">
                    <div className="w-full aspect-square flex items-center justify-center mb-2">
                      {p.imagen_url
                        ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain" />
                        : <span className="text-3xl">{CAT_ICONS[p.categoria] || '💊'}</span>}
                    </div>
                    <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-snug mb-1">{p.nombre}</p>
                    <p className="text-sm font-bold text-[#C8102E]">${formatPrice(rPrice)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
