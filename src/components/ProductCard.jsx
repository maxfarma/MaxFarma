'use client';
import { useStore, formatPrice, CAT_ICONS } from '@/lib/store';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { showToast } from '@/components/Toast';

export default function ProductCard({ product, onQuickView }) {
  const { state, dispatch } = useStore();
  const inWishlist = state.wishlist?.includes(product.codigo);
  const hasOffer   = product.precio_oferta && parseFloat(product.precio_oferta) > 0;
  const price      = hasOffer ? parseFloat(product.precio_oferta) : parseFloat(product.precio);
  const discount   = hasOffer ? Math.round((1 - parseFloat(product.precio_oferta) / parseFloat(product.precio)) * 100) : 0;
  const soldOut    = (product.stock || '').toLowerCase().includes('sin');

  return (
    <div className="product-card group cursor-pointer" onClick={() => dispatch({ type: 'OPEN_PRODUCT_MODAL', payload: product })}>
      {/* Image area */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        {/* Badges top-left */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {hasOffer && (
            <span className="bg-[#C8102E] text-white text-[11px] font-bold px-2 py-0.5 rounded-md leading-tight">-{discount}%</span>
          )}
          {(product.nuevo || '').toUpperCase() === 'SI' && (
            <span className="bg-amber-400 text-white text-[11px] font-bold px-2 py-0.5 rounded-md leading-tight">NUEVO</span>
          )}
          {(product.mas_vendido || '').toUpperCase() === 'SI' && !hasOffer && (
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md leading-tight">+ VENDIDO</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_WISHLIST', codigo: product.codigo }); showToast(inWishlist ? 'Eliminado de favoritos' : '❤️ Guardado en favoritos', 'wish'); }}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow-sm transition-all ${
            inWishlist ? 'bg-[#C8102E] text-white' : 'bg-white text-gray-400 hover:text-[#C8102E] opacity-0 group-hover:opacity-100'
          }`}>
          <Heart className="w-3.5 h-3.5" fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Product image */}
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="product-card-img w-full h-full object-contain p-4"
            loading="lazy"
            onError={e => { e.target.style.display='none'; if(e.target.nextSibling) e.target.nextSibling.style.display='flex'; }}
          />
        ) : null}
        <div className={`${product.imagen_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-5xl`}>
          {CAT_ICONS[product.categoria] || '💊'}
        </div>

        {/* Quick view hover overlay */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10">
          <button
            onClick={e => { e.stopPropagation(); dispatch({ type: 'OPEN_PRODUCT_MODAL', payload: product }); }}
            className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-100">
            <Eye className="w-3.5 h-3.5" /> Vista rápida
          </button>
        </div>

        {/* Sold out overlay */}
        {soldOut && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">Sin stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-1">{product.marca}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 mb-3 leading-snug">{product.nombre}</h3>

        {/* Stars mock */}
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400" fill="currentColor" />)}
          <span className="text-[11px] text-gray-400 ml-1">(12)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-gray-900">${formatPrice(price)}</span>
          {hasOffer && <span className="text-xs text-gray-400 line-through">${formatPrice(product.precio)}</span>}
        </div>

        {/* Cuotas hint */}
        <p className="text-[11px] text-gray-400 mb-3">3 cuotas con Go Cuotas de <strong className="text-gray-600">${formatPrice(price / 3)}</strong></p>

        <button
          onClick={e => {
            e.stopPropagation();
            if (!soldOut) { dispatch({ type: 'ADD_TO_CART', payload: product }); showToast('🛒 Agregado al carrito', 'cart'); }
          }}
          disabled={soldOut}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
            soldOut
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#C8102E] text-white hover:bg-[#9B0D22] active:scale-[.97] shadow-sm hover:shadow-md'
          }`}>
          <ShoppingCart className="w-4 h-4" />
          {soldOut ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}
