'use client';
import { useState } from 'react';
import { X, ShoppingCart, Heart, ZoomIn, ChevronLeft, ChevronRight, Truck, Shield, CreditCard, Store } from 'lucide-react';
import { useStore, formatPrice } from '@/lib/store';
import { showToast } from '@/components/Toast';

export default function ProductModal() {
  const { state, dispatch } = useStore();
  const [qty, setQty]           = useState(1);
  const [zoomed, setZoomed]     = useState(false);  // zoom overlay
  const [zoomPos, setZoomPos]   = useState({ x: 50, y: 50 }); // % position

  const product = state.productModal;
  if (!product) return null;

  const price = product.precio_oferta && parseFloat(product.precio_oferta) > 0
    ? parseFloat(product.precio_oferta)
    : parseFloat(product.precio || 0);

  const originalPrice = parseFloat(product.precio || 0);
  const discount = product.precio_oferta && parseFloat(product.precio_oferta) > 0
    ? Math.round((1 - parseFloat(product.precio_oferta) / originalPrice) * 100)
    : 0;

  const close = () => {
    dispatch({ type: 'CLOSE_PRODUCT_MODAL' });
    setZoomed(false);
    setQty(1);
  };

  const addToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({ type: 'ADD_TO_CART', payload: product });
    }
    showToast(`${product.nombre} agregado al carrito`, 'cart');
    close();
  };

  const toggleWishlist = () => {
    dispatch({ type: 'TOGGLE_WISHLIST', codigo: product.codigo });
    const inWish = state.wishlist?.includes(product.codigo);
    showToast(inWish ? 'Eliminado de favoritos' : 'Agregado a favoritos', 'wish');
  };

  const inWishlist = state.wishlist?.includes(product.codigo);

  // Mouse move para zoom inteligente
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <>
      {/* Overlay fondo */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={close}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Cerrar */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          <div className="grid md:grid-cols-2 gap-0">
            {/* ── Imagen con zoom ── */}
            <div className="relative bg-gray-50 rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl md:rounded-tr-none overflow-hidden">
              {product.imagen_url ? (
                <>
                  {/* Imagen principal con hover zoom */}
                  <div
                    className="relative aspect-square cursor-zoom-in overflow-hidden"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setZoomed(true)}
                    onMouseLeave={() => setZoomed(false)}
                    onClick={() => {}} // evita que se abra en otra ventana
                  >
                    <img
                      src={product.imagen_url}
                      alt={product.nombre}
                      className="w-full h-full object-contain p-6 transition-transform duration-200"
                      style={
                        zoomed
                          ? {
                              transform: 'scale(2)',
                              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                              cursor: 'zoom-in',
                            }
                          : { transform: 'scale(1)' }
                      }
                      draggable={false}
                    />
                  </div>
                  {/* Hint de zoom — solo en desktop */}
                  <div className="hidden md:flex absolute bottom-3 left-0 right-0 justify-center">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100">
                      <ZoomIn className="w-3 h-3" /> Pasá el mouse para ampliar
                    </span>
                  </div>
                </>
              ) : (
                <div className="aspect-square flex items-center justify-center">
                  <span className="text-7xl">💊</span>
                </div>
              )}

              {/* Badge descuento */}
              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-[#C8102E] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow">
                  -{discount}% OFF
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="p-6 flex flex-col">
              {/* Nombre y código */}
              <p className="text-xs text-gray-400 mb-1 font-mono">Código: {product.codigo}</p>
              <h2 className="text-xl font-black text-gray-900 leading-tight mb-1">{product.nombre}</h2>
              {product.marca && (
                <p className="text-sm text-gray-500 mb-3">{product.marca}</p>
              )}

              {/* Precio */}
              <div className="mb-4">
                {discount > 0 && (
                  <p className="text-sm text-gray-400 line-through">${formatPrice(originalPrice)}</p>
                )}
                <p className="text-3xl font-black text-[#C8102E]">${formatPrice(price)}</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#1A1F71]" />
                    3 cuotas sin interés con Visa / Mastercard
                    <span className="text-[#C8102E] font-bold">${formatPrice(price / 3)}</span>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3 text-[#00C16E]" />
                    4 cuotas con Go Cuotas (débito) — <strong>${formatPrice(price / 4)}</strong>
                  </p>
                </div>
              </div>

              {/* Stock */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full ${
                  product.stock === 'Disponible'
                    ? 'bg-green-50 text-green-700'
                    : product.stock === 'Sin stock'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    product.stock === 'Disponible' ? 'bg-green-500' :
                    product.stock === 'Sin stock'  ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  {product.stock || 'Disponible'}
                </span>
              </div>

              {/* Descripción */}
              {product.descripcion && (
                <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">{product.descripcion}</p>
              )}

              {/* Cantidad */}
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Cantidad</p>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold"
                  >−</button>
                  <span className="w-10 text-center text-sm font-bold text-gray-900">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold"
                  >+</button>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 'Sin stock'}
                  className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#9B0D22] disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.stock === 'Sin stock' ? 'Sin stock' : 'Agregar al carrito'}
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-colors ${
                    inWishlist
                      ? 'bg-pink-50 border-pink-200 text-pink-600'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-pink-500 text-pink-500' : ''}`} />
                  {inWishlist ? 'En favoritos' : 'Agregar a favoritos'}
                </button>
              </div>

              {/* Beneficios */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  { icon: <Truck className="w-3.5 h-3.5" />,   label: 'Envío a domicilio' },
                  { icon: <Shield className="w-3.5 h-3.5" />,  label: 'Compra segura' },
                  { icon: <CreditCard className="w-3.5 h-3.5"/>,label: 'Cuotas sin interés' },
                  { icon: <Store className="w-3.5 h-3.5" />,   label: 'Retiro en sucursal' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="text-[#C8102E]">{b.icon}</span> {b.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
