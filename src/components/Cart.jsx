'use client';
import { useStore, formatPrice, CAT_ICONS } from '@/lib/store';
import { X, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';

export default function Cart() {
  const { state, dispatch } = useStore();
  const total = state.cart.reduce((s, i) => {
    const p = i.precio_oferta && parseFloat(i.precio_oferta) > 0 ? parseFloat(i.precio_oferta) : parseFloat(i.precio);
    return s + p * i.qty;
  }, 0);

  return (
    <>
      {state.cartOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => dispatch({ type: 'CLOSE_CART' })} />
      )}
      <div className={`cart-panel fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl ${state.cartOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C8102E]" /> Tu carrito
            {state.cart.length > 0 && <span className="text-xs bg-[#C8102E] text-white px-1.5 py-0.5 rounded-full">{state.cart.length}</span>}
          </h2>
          <button onClick={() => dispatch({ type: 'CLOSE_CART' })} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {state.cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3">
              <ShoppingBag className="w-14 h-14 text-gray-100" />
              <p className="font-medium text-gray-600">Tu carrito está vacío</p>
              <p className="text-sm">Explorá nuestros productos</p>
              <button onClick={() => { dispatch({ type: 'CLOSE_CART' }); dispatch({ type: 'SET_SECTION', payload: 'productos' }); }}
                className="btn-primary mt-2">Ver productos</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {state.cart.map(item => {
                const price = item.precio_oferta && parseFloat(item.precio_oferta) > 0
                  ? parseFloat(item.precio_oferta) : parseFloat(item.precio);
                return (
                  <div key={item.codigo} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                      {item.imagen_url
                        ? <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-contain p-1" />
                        : <span className="text-2xl">{CAT_ICONS[item.categoria] || '💊'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.nombre}</p>
                      <p className="text-sm font-bold text-[#C8102E] mt-0.5">${formatPrice(price * item.qty)}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <button onClick={() => dispatch({ type: 'UPDATE_CART_QTY', codigo: item.codigo, delta: -1 })}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-bold hover:border-gray-400 transition-colors">−</button>
                        <span className="text-xs font-semibold w-5 text-center">{item.qty}</span>
                        <button onClick={() => dispatch({ type: 'UPDATE_CART_QTY', codigo: item.codigo, delta: 1 })}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-bold hover:border-gray-400 transition-colors">+</button>
                      </div>
                    </div>
                    <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', codigo: item.codigo })}
                      className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors self-start">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.cart.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-white space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-xl font-black text-gray-900">${formatPrice(total)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">Envío y descuentos se calculan al finalizar</p>
            <button onClick={() => { dispatch({ type: 'CLOSE_CART' }); dispatch({ type: 'SET_SECTION', payload: 'checkout' }); }}
              className="w-full bg-[#C8102E] hover:bg-[#9B0D22] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[.98]">
              Finalizar compra <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => dispatch({ type: 'CLOSE_CART' })}
              className="w-full text-sm text-gray-500 hover:text-gray-800 transition-colors py-1">
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
