'use client';
// Página pública de un programa de descuento
// Se muestra cuando el cliente hace clic en "Programa Andrómaco" en el menú Promos
import { useStore, formatPrice } from '@/lib/store';
import { ArrowLeft, Tag, Package } from 'lucide-react';

export default function ProgramaDescuento() {
  const { state, dispatch } = useStore();
  const programa = state.currentPrograma;

  if (!programa) {
    dispatch({ type: 'SET_SECTION', payload: 'promos' });
    return null;
  }

  // Buscar los productos del programa en el catálogo completo
  const productosConDatos = (programa.productos || []).map(pp => {
    const catalogoProd = state.products.find(p => p.codigo === pp.codigo);
    return {
      ...pp,
      ...catalogoProd,
      descuento: pp.descuento, // el % definido en el programa tiene prioridad
      nombre: pp.nombre || catalogoProd?.nombre || 'Producto',
      imagen_url: pp.imagen_url || catalogoProd?.imagen_url || '',
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={() => dispatch({ type: 'SET_SECTION', payload: 'promos' })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a Promos
      </button>

      {/* Header del programa */}
      <div className="rounded-2xl p-8 mb-8 flex items-center gap-6 flex-wrap"
        style={{ background: programa.color || '#C8102E' }}>
        {programa.imagen_url && (
          <img src={programa.imagen_url} alt={programa.nombre}
            className="w-20 h-20 object-contain rounded-2xl bg-white p-2 shadow-lg"
            onError={e => e.target.style.display = 'none'} />
        )}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-sm font-medium">Programa de descuentos</span>
          </div>
          <h1 className="text-white text-3xl font-black">{programa.nombre}</h1>
          {programa.descripcion && <p className="text-white/80 mt-1">{programa.descripcion}</p>}
          <p className="text-white/60 text-sm mt-2">{productosConDatos.length} producto(s) con descuento especial</p>
        </div>
      </div>

      {/* Grilla de productos */}
      {productosConDatos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Este programa no tiene productos cargados todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {productosConDatos.map((prod, i) => {
            const precioOriginal = parseFloat(prod.precio || 0);
            const precioOferta   = parseFloat(prod.precio_oferta || 0);
            const precioBase     = precioOferta > 0 ? precioOferta : precioOriginal;
            const precioFinal    = prod.descuento > 0
              ? precioBase * (1 - prod.descuento / 100)
              : precioBase;

            return (
              <div key={i}
                className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all overflow-hidden group cursor-pointer"
                onClick={() => {
                  if (prod.codigo) dispatch({ type: 'OPEN_PRODUCT_MODAL', payload: prod });
                }}>
                {/* Badge descuento */}
                {prod.descuento > 0 && (
                  <div className="absolute m-2 z-10">
                    <span className="text-xs font-black px-2 py-1 rounded-lg text-white shadow-sm"
                      style={{ background: programa.color || '#C8102E' }}>
                      {prod.descuento}% OFF
                    </span>
                  </div>
                )}
                <div className="relative">
                  {/* Imagen */}
                  <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                    {prod.imagen_url
                      ? <img src={prod.imagen_url} alt={prod.nombre}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      : null}
                    <div className={`${prod.imagen_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                      <Package className="w-10 h-10 text-gray-200" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{prod.marca || ''}</p>
                  <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-2">{prod.nombre}</p>
                  {precioOriginal > 0 && (
                    <div>
                      {prod.descuento > 0 ? (
                        <>
                          <p className="text-xs text-gray-400 line-through">${formatPrice(precioBase)}</p>
                          <p className="text-lg font-black" style={{ color: programa.color || '#C8102E' }}>
                            ${formatPrice(precioFinal)}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-black text-gray-900">${formatPrice(precioBase)}</p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'ADD_TO_CART', payload: { ...prod, precio: precioFinal || precioBase } }); }}
                    className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                    style={{ background: programa.color || '#C8102E' }}>
                    Agregar al carrito
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
