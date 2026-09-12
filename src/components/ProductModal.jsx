'use client';
import { useState, useEffect, useMemo } from 'react';
import { X, ShoppingCart, Heart, ZoomIn, Truck, Shield, CreditCard, Store, Star, Send } from 'lucide-react';
import { useStore, formatPrice } from '@/lib/store';
import { showToast } from '@/components/Toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function ProductModal() {
  const { state, dispatch } = useStore();
  const [qty, setQty]         = useState(1);
  const [zoomed, setZoomed]   = useState(false);
  const [zoomPos, setZoomPos] = useState({ x:50, y:50 });
  const [tab, setTab]         = useState('info'); // 'info' | 'resenas'
  const [resenas, setResenas] = useState([]);
  const [reviewForm, setReviewForm] = useState({ nombre:'', estrellas:5, comentario:'' });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  const product = state.productModal;

  // Cargar reseñas del producto
  useEffect(() => {
    if (!product) return;
    const q = query(collection(db,'resenas'), where('codigo','==', product.codigo));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      data.sort((a,b) => (b.fecha?.seconds||0) - (a.fecha?.seconds||0));
      setResenas(data);
    });
    return () => unsub();
  }, [product?.codigo]);

  if (!product) return null;

  // Buscar descuento de programas de laboratorio
  const programaDescuento = useMemo(() => {
    for (const prog of (state.programas || [])) {
      const prodProg = (prog.productos || []).find(p => p.codigo === product.codigo);
      if (prodProg && prodProg.descuento > 0) {
        return { programa: prog.nombre, descuento: prodProg.descuento };
      }
    }
    return null;
  }, [product.codigo, state.programas]);

  const precioBase = parseFloat(product.precio || 0);
  const precioOferta = product.precio_oferta && parseFloat(product.precio_oferta) > 0
    ? parseFloat(product.precio_oferta) : 0;

  // Si tiene precio_oferta propio, usarlo; si no, aplicar descuento del programa
  let price = precioBase;
  let discount = 0;
  let discountSource = null;

  if (precioOferta > 0) {
    price = precioOferta;
    discount = Math.round((1 - precioOferta / precioBase) * 100);
    discountSource = 'oferta';
  } else if (programaDescuento) {
    price = precioBase * (1 - programaDescuento.descuento / 100);
    discount = programaDescuento.descuento;
    discountSource = 'programa';
  }

  const avgRating = resenas.length
    ? (resenas.reduce((s,r) => s + (r.estrellas||5), 0) / resenas.length).toFixed(1)
    : null;

  const close = () => {
    dispatch({ type:'CLOSE_PRODUCT_MODAL' });
    setZoomed(false);
    setQty(1);
    setTab('info');
    setSent(false);
  };

  const addToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({ type:'ADD_TO_CART', payload: { ...product, precio_oferta: price < precioBase ? price : product.precio_oferta } });
    }
    showToast(`${product.nombre} agregado al carrito`, 'cart');
    close();
  };

  const toggleWishlist = () => {
    dispatch({ type:'TOGGLE_WISHLIST', codigo: product.codigo });
    const inWish = state.wishlist?.includes(product.codigo);
    showToast(inWish ? 'Eliminado de favoritos' : 'Agregado a favoritos', 'wish');
  };

  const submitResena = async () => {
    if (!reviewForm.nombre.trim() || !reviewForm.comentario.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db,'resenas'), {
        codigo:      product.codigo,
        nombre_prod: product.nombre,
        nombre:      reviewForm.nombre.trim(),
        estrellas:   reviewForm.estrellas,
        comentario:  reviewForm.comentario.trim(),
        fecha:       serverTimestamp(),
        aprobada:    true,
      });
      setSent(true);
      setReviewForm({ nombre:'', estrellas:5, comentario:'' });
    } catch(e) { console.error(e); }
    setSending(false);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  };

  const inWishlist = state.wishlist?.includes(product.codigo);

  // Productos relacionados (misma categoría, distintos)
  const relacionados = state.products
    .filter(p => p.categoria === product.categoria && p.codigo !== product.codigo)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={close}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>

        {/* Cerrar */}
        <button onClick={close} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* ── Imagen ── */}
          <div className="relative bg-gray-50 rounded-tl-2xl rounded-tr-2xl md:rounded-tr-none md:rounded-bl-2xl overflow-hidden">
            {product.imagen_url ? (
              <>
                <div className="relative aspect-square cursor-zoom-in overflow-hidden"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setZoomed(true)}
                  onMouseLeave={() => setZoomed(false)}>
                  <img src={product.imagen_url} alt={product.nombre}
                    className="w-full h-full object-contain p-6 transition-transform duration-200"
                    style={zoomed ? { transform:'scale(2)', transformOrigin:`${zoomPos.x}% ${zoomPos.y}%`, cursor:'zoom-in' } : { transform:'scale(1)' }}
                    draggable={false}
                  />
                </div>
                <div className="hidden md:flex absolute bottom-3 left-0 right-0 justify-center">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100">
                    <ZoomIn className="w-3 h-3" /> Pasá el mouse para ampliar
                  </span>
                </div>
              </>
            ) : (
              <div className="aspect-square flex items-center justify-center">
                <Shield className="w-16 h-16 text-gray-200" />
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-3 left-3 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow"
                style={{ background: discountSource === 'programa' ? '#7C3AED' : '#C8102E' }}>
                -{discount}% {discountSource === 'programa' ? 'PROG.' : 'OFF'}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="p-6 flex flex-col">
            <p className="text-xs text-gray-400 mb-1 font-mono">Código: {product.codigo}</p>
            <h2 className="text-xl font-black text-gray-900 leading-tight mb-1">{product.nombre}</h2>
            {product.marca && <p className="text-sm text-gray-500 mb-2">{product.marca}</p>}

            {/* Rating rápido */}
            {avgRating && (
              <div className="flex items-center gap-1.5 mb-3">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                ))}
                <span className="text-xs text-gray-500">{avgRating} ({resenas.length} reseña{resenas.length!==1?'s':''})</span>
              </div>
            )}

            {/* Programa de descuento badge */}
            {discountSource === 'programa' && programaDescuento && (
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                <p className="text-xs text-purple-700 font-semibold">
                  Descuento {programaDescuento.descuento}% · Programa {programaDescuento.programa}
                </p>
              </div>
            )}

            {/* Precio */}
            <div className="mb-4">
              {discount > 0 && <p className="text-sm text-gray-400 line-through">${formatPrice(precioBase)}</p>}
              <p className="text-3xl font-black text-[#C8102E]">${formatPrice(price)}</p>
              <div className="mt-2 flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#1A1F71]" />
                  3 cuotas sin interés con Visa / Mastercard —
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
                product.stock === 'Disponible' ? 'bg-green-50 text-green-700' :
                product.stock === 'Sin stock'  ? 'bg-red-50 text-red-600'    : 'bg-amber-50 text-amber-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  product.stock === 'Disponible' ? 'bg-green-500' :
                  product.stock === 'Sin stock'  ? 'bg-red-500'   : 'bg-amber-500'
                }`} />
                {product.stock || 'Disponible'}
              </span>
            </div>

            {product.descripcion && <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{product.descripcion}</p>}

            {/* Cantidad */}
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Cantidad</p>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1,q-1))} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold">−</button>
                <span className="w-10 text-center text-sm font-bold text-gray-900">{qty}</span>
                <button onClick={() => setQty(q => q+1)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold">+</button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-2.5">
              <button onClick={addToCart} disabled={product.stock==='Sin stock'}
                className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#9B0D22] disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                <ShoppingCart className="w-4 h-4" />
                {product.stock==='Sin stock' ? 'Sin stock' : 'Agregar al carrito'}
              </button>
              <button onClick={toggleWishlist}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-colors ${
                  inWishlist ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-pink-500 text-pink-500' : ''}`} />
                {inWishlist ? 'En favoritos' : 'Agregar a favoritos'}
              </button>
            </div>

            {/* Beneficios */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { icon:<Truck className="w-3.5 h-3.5"/>,    label:'Envío a domicilio' },
                { icon:<Shield className="w-3.5 h-3.5"/>,   label:'Compra segura' },
                { icon:<CreditCard className="w-3.5 h-3.5"/>,label:'Cuotas sin interés' },
                { icon:<Store className="w-3.5 h-3.5"/>,    label:'Retiro en sucursal' },
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="text-[#C8102E]">{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Reseñas + Relacionados ── */}
        <div className="border-t border-gray-100 px-6 pt-4 pb-6">
          <div className="flex gap-1 mb-5">
            {[
              { key:'resenas',    label:`Reseñas${resenas.length ? ` (${resenas.length})` : ''}` },
              { key:'relacionados', label:'Productos relacionados' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  tab===t.key ? 'bg-[#C8102E] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Reseñas */}
          {tab==='resenas' && (
            <div>
              {resenas.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm">Todavía no hay reseñas. ¡Sé el primero!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mb-5">
                  {resenas.map(r => (
                    <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-semibold text-gray-800 text-sm">{r.nombre}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s<=r.estrellas ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{r.comentario}</p>
                      {r.fecha?.toDate && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          {r.fecha.toDate().toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario nueva reseña */}
              {sent ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-semibold text-sm">¡Gracias por tu reseña!</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-800 text-sm mb-3">Dejar una reseña</p>
                  <input value={reviewForm.nombre} onChange={e => setReviewForm(f=>({...f,nombre:e.target.value}))}
                    placeholder="Tu nombre" className="input-field mb-2 text-sm" />
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs text-gray-500">Calificación:</span>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewForm(f=>({...f,estrellas:s}))}>
                        <Star className={`w-5 h-5 transition-colors ${s<=reviewForm.estrellas ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea value={reviewForm.comentario} onChange={e => setReviewForm(f=>({...f,comentario:e.target.value}))}
                    placeholder="Contanos tu experiencia con este producto..."
                    rows={2} className="input-field mb-2 resize-none text-sm" />
                  <button onClick={submitResena} disabled={sending || !reviewForm.nombre || !reviewForm.comentario}
                    className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#9B0D22] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                    <Send className="w-3.5 h-3.5" />
                    {sending ? 'Enviando...' : 'Publicar reseña'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Relacionados */}
          {tab==='relacionados' && (
            <div>
              {relacionados.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">No hay productos relacionados</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relacionados.map(p => {
                    const pp = p.precio_oferta && parseFloat(p.precio_oferta) > 0 ? parseFloat(p.precio_oferta) : parseFloat(p.precio);
                    // Check programa discount
                    let finalPrice = pp;
                    for (const prog of (state.programas||[])) {
                      const pp2 = (prog.productos||[]).find(x => x.codigo === p.codigo);
                      if (pp2?.descuento > 0 && !(p.precio_oferta && parseFloat(p.precio_oferta) > 0)) {
                        finalPrice = parseFloat(p.precio) * (1 - pp2.descuento/100);
                        break;
                      }
                    }
                    return (
                      <button key={p.codigo}
                        onClick={() => dispatch({ type:'OPEN_PRODUCT_MODAL', payload:p })}
                        className="bg-gray-50 hover:bg-gray-100 rounded-xl p-3 text-left transition-colors border border-gray-100 hover:border-gray-200">
                        {p.imagen_url && (
                          <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden">
                            <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain p-2" />
                          </div>
                        )}
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{p.nombre}</p>
                        <p className="text-sm font-black text-[#C8102E]">${formatPrice(finalPrice)}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
