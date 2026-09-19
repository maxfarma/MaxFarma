'use client';
import { useState, useMemo } from 'react';
import { useStore, formatPrice } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import {
  ArrowLeft, CheckCircle, Truck, Store,
  CreditCard, Smartphone, Wallet, Tag, Info
} from 'lucide-react';

const WHATSAPP = '5493625298918';

// Defaults — se sobreescriben con los valores del panel admin
const MP_CONFIG_DEFAULTS = {
  mp_debito_descuento:  10,
  credito_umbral:       50000,
  credito_cuotas_base:  3,
  credito_cuotas_extra: 6,
};

export default function Checkout() {
  const { state, dispatch } = useStore();
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(1);
  const [metodoPago, setMetodoPago] = useState(''); // 'mp'|'debito'|'credito'
  const [cuotasElegidas, setCuotasElegidas] = useState(null); // null = no elegido aún

  // Leer config de Firestore (panel admin → Config → Medios de pago)
  const mpCfg = { ...MP_CONFIG_DEFAULTS, ...(state.contenido?.medios_pago || {}) };
  const DESCUENTO_MP_DEBITO = mpCfg.mp_debito_descuento;
  const [form, setForm] = useState({
    name:'', phone:'', email:'', city:'', address:'', delivery:'retiro', notes:''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Calcular precio con descuento de programa si aplica
  const getProductoPrice = (item) => {
    const base    = parseFloat(item.precio || 0);
    const oferta  = item.precio_oferta && parseFloat(item.precio_oferta) > 0
      ? parseFloat(item.precio_oferta) : 0;
    if (oferta > 0) return oferta;
    // Buscar programa de descuento
    for (const prog of (state.programas || [])) {
      const pp = (prog.productos || []).find(p => p.codigo === item.codigo);
      if (pp?.descuento > 0) return base * (1 - pp.descuento / 100);
    }
    return base;
  };

  const tieneOfertaOPrograma = (item) => {
    if (item.precio_oferta && parseFloat(item.precio_oferta) > 0) return true;
    for (const prog of (state.programas || [])) {
      if ((prog.productos || []).find(p => p.codigo === item.codigo)) return true;
    }
    return false;
  };

  // Total base (con ofertas y programas pero sin descuento de medio de pago)
  const subtotal = state.cart.reduce((s, i) => s + getProductoPrice(i) * i.qty, 0);

  // Total con descuento de medio de pago
  const { totalFinal, descuentoAplicado } = useMemo(() => {
    if (!metodoPago || metodoPago === 'credito') {
      return { totalFinal: subtotal, descuentoAplicado: 0 };
    }
    // MP y débito: 10% en productos sin oferta ni programa
    let descuento = 0;
    state.cart.forEach(item => {
      if (!tieneOfertaOPrograma(item)) {
        const precio = getProductoPrice(item);
        descuento += precio * item.qty * (DESCUENTO_MP_DEBITO / 100);
      }
    });
    return { totalFinal: subtotal - descuento, descuentoAplicado: descuento };
  }, [metodoPago, subtotal, state.cart]);

  // Cuotas según monto y config del panel
  const cuotasOpciones = useMemo(() => {
    if (metodoPago !== 'credito') return [];
    const base  = mpCfg.credito_cuotas_base;
    const extra = mpCfg.credito_cuotas_extra;
    const umbral = mpCfg.credito_umbral;
    // Siempre mostrar cuotas base; si supera el umbral, agregar también las extra
    if (subtotal >= umbral && extra > base) {
      return [
        { cuotas: base,  label: `${base} cuotas sin interés` },
        { cuotas: extra, label: `${extra} cuotas sin interés` },
      ];
    }
    return [{ cuotas: base, label: `${base} cuotas sin interés` }];
  }, [metodoPago, subtotal, mpCfg]);

  // Reset cuotas elegidas cuando cambia el método de pago
  const handleSetMetodo = (metodo) => {
    setMetodoPago(metodo);
    setCuotasElegidas(null);
  };

  const MEDIOS = [
    {
      key: 'mp',
      icon: <Wallet className="w-5 h-5"/>,
      label: 'Mercado Pago / QR',
      sub: `${DESCUENTO_MP_DEBITO}% OFF en productos sin oferta`,
      badge: `${DESCUENTO_MP_DEBITO}% OFF`,
      color: 'text-[#009EE3]',
      bg: 'bg-blue-50',
      border: 'border-[#009EE3]',
    },
    {
      key: 'debito',
      icon: <CreditCard className="w-5 h-5"/>,
      label: 'Tarjeta de débito',
      sub: `${DESCUENTO_MP_DEBITO}% OFF en productos sin oferta`,
      badge: `${DESCUENTO_MP_DEBITO}% OFF`,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-500',
    },
    {
      key: 'credito',
      icon: <CreditCard className="w-5 h-5"/>,
      label: 'Tarjeta de crédito',
      sub: cuotasOpciones.length > 1
        ? `${mpCfg.credito_cuotas_base} o ${mpCfg.credito_cuotas_extra} cuotas sin interés a elección`
        : `${mpCfg.credito_cuotas_base} cuotas sin interés`,
      badge: cuotasOpciones.length > 1
        ? `Hasta ${mpCfg.credito_cuotas_extra} cuotas`
        : `${mpCfg.credito_cuotas_base} cuotas`,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-500',
    },
  ];

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !metodoPago) return;
    setLoading(true);

    const items = state.cart.map(item => ({
      nombre:  item.nombre,
      codigo:  item.codigo,
      qty:     item.qty,
      precio:  getProductoPrice(item),
    }));

    const orderData = {
      id:        'ORD-' + Date.now(),
      fecha:     new Date().toISOString(),
      cliente:   form.name,
      telefono:  form.phone,
      email:     form.email,
      ciudad:    form.city,
      direccion: form.address,
      entrega:   form.delivery,
      notas:     form.notes,
      metodo_pago: metodoPago,
      cuotas_elegidas: metodoPago === 'credito' ? (cuotasElegidas || cuotasOpciones[0]?.cuotas) : null,
      items,
      subtotal,
      descuento_pago: descuentoAplicado,
      total:     totalFinal,
      estado:    'nuevo',
    };

    try { await addDoc(collection(db,'pedidos'), orderData); } catch {}
    dispatch({ type:'ADD_ORDER', payload: orderData });

    let lines = '';
    state.cart.forEach(item => {
      lines += `• *${item.nombre}* x${item.qty} = $${formatPrice(getProductoPrice(item) * item.qty)}\n`;
    });

    const medioLabel = MEDIOS.find(m => m.key === metodoPago)?.label || metodoPago;
    const cuotasLabel = metodoPago === 'credito' && cuotasElegidas
      ? ` — ${cuotasElegidas} cuotas`
      : metodoPago === 'credito' && cuotasOpciones.length === 1
        ? ` — ${cuotasOpciones[0].cuotas} cuotas`
        : '';

    const msg = [
      `*NUEVO PEDIDO — MaxFarma*`,
      `============================`,
      ``,
      `*Cliente:* ${form.name}`,
      `*Teléfono:* ${form.phone}`,
      form.email ? `*Email:* ${form.email}` : '',
      form.city  ? `*Localidad:* ${form.city}` : '',
      form.address ? `*Dirección:* ${form.address}` : '',
      `*Entrega:* ${form.delivery==='retiro' ? 'Retiro en farmacia' : 'Envío a domicilio'}`,
      `*Medio de pago:* ${medioLabel}${cuotasLabel}`,
      ``,
      `*Productos:*`,
      lines,
      descuentoAplicado > 0 ? `*Descuento ${medioLabel}:* -$${formatPrice(descuentoAplicado)}` : '',
      `*TOTAL:* $${formatPrice(totalFinal)}`,
      form.notes ? `\n*Notas:* ${form.notes}` : '',
      ``,
      `_${new Date().toLocaleString('es-AR')}_`,
    ].filter(Boolean).join('\n');

    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(msg)}`, '_blank');
    dispatch({ type:'CLEAR_CART' });
    dispatch({ type:'SET_SECTION', payload:'inicio' });
    setLoading(false);
  };

  const steps = ['Tus datos','Entrega','Pago','Confirmación'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => dispatch({ type:'SET_SECTION', payload:'inicio' })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <h1 className="text-2xl font-black text-gray-900 mb-2">Finalizar pedido</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
              i+1 <= step ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {i+1 < step ? <CheckCircle className="w-4 h-4"/> : i+1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i+1<=step?'text-gray-800':'text-gray-400'}`}>{s}</span>
            {i < steps.length-1 && <div className={`flex-1 h-px ${i+1<step?'bg-[#C8102E]':'bg-gray-200'}`}/>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">

          {/* STEP 1 — Datos */}
          {step===1 && (
            <>
              <h2 className="font-bold text-gray-800 mb-3">Tus datos</h2>
              {[
                ['name', 'Nombre completo *', 'Juan Pérez', 'text'],
                ['phone','Teléfono (WhatsApp) *','1123456789','tel'],
                ['email','Email','tu@email.com','email'],
              ].map(([k,l,ph,t]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{l}</label>
                  <input type={t} className="input-field" value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph}/>
                </div>
              ))}
              <button onClick={()=>setStep(2)} disabled={!form.name||!form.phone}
                className="w-full btn-primary py-3 disabled:opacity-50 mt-2">Continuar →</button>
            </>
          )}

          {/* STEP 2 — Entrega */}
          {step===2 && (
            <>
              <h2 className="font-bold text-gray-800 mb-3">Modalidad de entrega</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v:'retiro', icon:<Store className="w-5 h-5"/>,  t:'Retiro en sucursal', s:'Ruta 6 Km 22,5' },
                  { v:'envio',  icon:<Truck className="w-5 h-5"/>,  t:'Envío a domicilio',  s:'Coordinar dirección' },
                ].map(o => (
                  <button key={o.v} onClick={()=>set('delivery',o.v)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.delivery===o.v?'border-[#C8102E] bg-[#FFF0F3]':'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`mb-2 ${form.delivery===o.v?'text-[#C8102E]':'text-gray-500'}`}>{o.icon}</div>
                    <p className="font-semibold text-sm text-gray-800">{o.t}</p>
                    <p className="text-xs text-gray-400">{o.s}</p>
                  </button>
                ))}
              </div>
              {form.delivery==='envio' && (
                <div className="grid gap-3 mt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Ciudad / Localidad</label>
                    <input className="input-field" value={form.city} onChange={e=>set('city',e.target.value)} placeholder="Cañuelas"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Dirección</label>
                    <input className="input-field" value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Calle, número, piso"/>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notas adicionales</label>
                <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Marcas preferidas, talles, etc."/>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="btn-secondary flex-1">← Atrás</button>
                <button onClick={()=>setStep(3)} className="btn-primary flex-1 py-3">Continuar →</button>
              </div>
            </>
          )}

          {/* STEP 3 — Medio de pago */}
          {step===3 && (
            <>
              <h2 className="font-bold text-gray-800 mb-1">Medio de pago</h2>
              <p className="text-xs text-gray-400 mb-4">El pago se coordina al confirmar por WhatsApp</p>

              <div className="flex flex-col gap-3">
                {MEDIOS.map(m => (
                  <button key={m.key} onClick={()=>handleSetMetodo(m.key)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      metodoPago===m.key
                        ? `${m.border} ${m.bg}`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      metodoPago===m.key ? m.bg : 'bg-gray-100'
                    } ${metodoPago===m.key ? m.color : 'text-gray-500'}`}>
                      {m.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">{m.label}</p>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full text-white ${
                          m.key==='mp'||m.key==='debito' ? 'bg-[#C8102E]' : 'bg-purple-600'
                        }`}>{m.badge}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{m.sub}</p>
                      {metodoPago===m.key && (m.key==='mp'||m.key==='debito') && descuentoAplicado > 0 && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          Ahorrás ${formatPrice(descuentoAplicado)} en esta compra
                        </p>
                      )}
                      {metodoPago===m.key && m.key==='credito' && cuotasInfo && (
                        <p className="text-xs text-purple-600 font-semibold mt-1">{cuotasInfo.label}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      metodoPago===m.key ? m.border : 'border-gray-300'
                    }`}>
                      {metodoPago===m.key && <div className={`w-2.5 h-2.5 rounded-full ${
                        m.key==='mp'||m.key==='debito' ? 'bg-[#009EE3]' : 'bg-purple-600'}`} />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Info descuento */}
              {(metodoPago==='mp'||metodoPago==='debito') && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                  <p>El {DESCUENTO_MP_DEBITO}% de descuento se aplica sobre productos que no tienen precio de oferta ni programa de descuento activo.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="btn-secondary flex-1">← Atrás</button>
                <button
                  onClick={()=>setStep(4)}
                  disabled={!metodoPago || (metodoPago==='credito' && cuotasOpciones.length > 1 && !cuotasElegidas)}
                  className="btn-primary flex-1 py-3 disabled:opacity-50">
                  Revisar pedido →
                </button>
              </div>
            </>
          )}

          {/* STEP 4 — Confirmación */}
          {step===4 && (
            <>
              <h2 className="font-bold text-gray-800 mb-3">Revisá tu pedido</h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 mb-3">
                <p><span className="text-gray-500">Nombre:</span> <strong>{form.name}</strong></p>
                <p><span className="text-gray-500">Tel:</span> <strong>{form.phone}</strong></p>
                {form.email && <p><span className="text-gray-500">Email:</span> <strong>{form.email}</strong></p>}
                <p><span className="text-gray-500">Entrega:</span> <strong>{form.delivery==='retiro'?'Retiro en sucursal':'Envío — '+form.city}</strong></p>
                <p><span className="text-gray-500">Medio de pago:</span> <strong>{MEDIOS.find(m=>m.key===metodoPago)?.label}</strong></p>
                {form.notes && <p><span className="text-gray-500">Notas:</span> <strong>{form.notes}</strong></p>}
              </div>
              {descuentoAplicado > 0 && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-3">
                  <Tag className="w-4 h-4 text-green-600"/>
                  <p className="text-sm text-green-700 font-semibold">
                    Descuento aplicado: -${formatPrice(descuentoAplicado)}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={()=>setStep(3)} className="btn-secondary flex-1">← Atrás</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  <Smartphone className="w-4 h-4"/>
                  {loading ? 'Procesando...' : 'Confirmar por WhatsApp'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Resumen */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Resumen</h3>
            <div className="space-y-3 mb-4">
              {state.cart.map(item => {
                const p = getProductoPrice(item);
                return (
                  <div key={item.codigo} className="flex justify-between text-xs">
                    <span className="text-gray-700 flex-1 mr-2 leading-snug">
                      {item.nombre} <span className="text-gray-400">×{item.qty}</span>
                    </span>
                    <span className="font-semibold whitespace-nowrap">${formatPrice(p*item.qty)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${formatPrice(subtotal)}</span>
              </div>
              {descuentoAplicado > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>Descuento medio de pago</span>
                  <span>-${formatPrice(descuentoAplicado)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[#C8102E] text-lg">${formatPrice(totalFinal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
