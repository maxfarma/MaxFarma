'use client';
import { useState } from 'react';
import { useStore, formatPrice } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ArrowLeft, CheckCircle, Truck, Store } from 'lucide-react';

const WHATSAPP = '5493625298918';

export default function Checkout() {
  const { state, dispatch } = useStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=datos, 2=entrega, 3=resumen
  const [form, setForm] = useState({ name:'', phone:'', email:'', city:'', address:'', delivery:'retiro', notes:'' });

  const total = state.cart.reduce((s, i) => {
    const p = i.precio_oferta && parseFloat(i.precio_oferta) > 0 ? parseFloat(i.precio_oferta) : parseFloat(i.precio);
    return s + p * i.qty;
  }, 0);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return;
    setLoading(true);
    const items = state.cart.map(item => {
      const price = item.precio_oferta && parseFloat(item.precio_oferta) > 0 ? parseFloat(item.precio_oferta) : parseFloat(item.precio);
      return { nombre: item.nombre, codigo: item.codigo, qty: item.qty, precio: price };
    });
    const orderData = { id:'ORD-'+Date.now(), fecha:new Date().toISOString(), cliente:form.name, telefono:form.phone, email:form.email, ciudad:form.city, direccion:form.address, entrega:form.delivery, notas:form.notes, items, total, estado:'nuevo' };
    try { await addDoc(collection(db,'pedidos'), orderData); } catch {}
    dispatch({ type:'ADD_ORDER', payload:orderData });

    let lines = '';
    state.cart.forEach(item => {
      const p = item.precio_oferta && parseFloat(item.precio_oferta) > 0 ? parseFloat(item.precio_oferta) : parseFloat(item.precio);
      lines += `• *${item.nombre}* x${item.qty} = $${formatPrice(p * item.qty)}\n`;
    });
    const msg = `*NUEVO PEDIDO — MaxFarma*\n============================\n\n*Cliente:* ${form.name}\n*Teléfono:* ${form.phone}\n*Email:* ${form.email||'—'}\n*Localidad:* ${form.city||'—'}\n*Dirección:* ${form.address||'—'}\n*Entrega:* ${form.delivery==='retiro'?'Retiro en farmacia':'Envío a domicilio'}\n\n*Productos:*\n${lines}\n*TOTAL:* $${formatPrice(total)}\n\n*Notas:* ${form.notes||'Sin notas'}\n\n_${new Date().toLocaleString('es-AR')}_`;
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(msg)}`,'_blank');
    dispatch({ type:'CLEAR_CART' });
    dispatch({ type:'SET_SECTION', payload:'inicio' });
    setLoading(false);
  };

  const steps = ['Tus datos','Entrega','Confirmación'];

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
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${i+1 <= step ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-400'}`}>
              {i+1 < step ? <CheckCircle className="w-4 h-4" /> : i+1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i+1 <= step ? 'text-gray-800' : 'text-gray-400'}`}>{s}</span>
            {i < steps.length-1 && <div className={`flex-1 h-px ${i+1 < step ? 'bg-[#C8102E]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Form */}
        <div className="md:col-span-3 space-y-4">
          {step === 1 && (
            <>
              <h2 className="font-bold text-gray-800 mb-3">Tus datos</h2>
              {[['name','Nombre completo *','Juan Pérez','text'],['phone','Teléfono (WhatsApp) *','1123456789','tel'],['email','Email','tu@email.com','email']].map(([k,l,ph,t]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{l}</label>
                  <input type={t} className="input-field" value={form[k]} onChange={e => set(k,e.target.value)} placeholder={ph} />
                </div>
              ))}
              <button onClick={() => setStep(2)} disabled={!form.name||!form.phone}
                className="w-full btn-primary py-3 disabled:opacity-50 mt-2">Continuar →</button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-bold text-gray-800 mb-3">Modalidad de entrega</h2>
              <div className="grid grid-cols-2 gap-3">
                {[{v:'retiro',icon:<Store className="w-5 h-5"/>,t:'Retiro en sucursal',s:'Ruta 6 Km 22,5'},{v:'envio',icon:<Truck className="w-5 h-5"/>,t:'Envío a domicilio',s:'Coordinar dirección'}].map(o => (
                  <button key={o.v} onClick={() => set('delivery',o.v)}
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
                    <input className="input-field" value={form.city} onChange={e => set('city',e.target.value)} placeholder="Cañuelas" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Dirección</label>
                    <input className="input-field" value={form.address} onChange={e => set('address',e.target.value)} placeholder="Calle, número, piso" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notas adicionales</label>
                <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={e => set('notes',e.target.value)} placeholder="Marcas preferidas, talles, etc." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Atrás</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Revisar pedido →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-bold text-gray-800 mb-3">Revisá tu pedido</h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                <p><span className="text-gray-500">Nombre:</span> <strong>{form.name}</strong></p>
                <p><span className="text-gray-500">Tel:</span> <strong>{form.phone}</strong></p>
                {form.email && <p><span className="text-gray-500">Email:</span> <strong>{form.email}</strong></p>}
                <p><span className="text-gray-500">Entrega:</span> <strong>{form.delivery==='retiro'?'Retiro en sucursal':'Envío — '+form.city}</strong></p>
                {form.notes && <p><span className="text-gray-500">Notas:</span> <strong>{form.notes}</strong></p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Atrás</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? '⏳ Procesando...' : '📲 Confirmar y enviar por WhatsApp'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Order summary */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Resumen</h3>
            <div className="space-y-3 mb-4">
              {state.cart.map(item => {
                const p = item.precio_oferta && parseFloat(item.precio_oferta) > 0 ? parseFloat(item.precio_oferta) : parseFloat(item.precio);
                return (
                  <div key={item.codigo} className="flex justify-between text-xs">
                    <span className="text-gray-700 flex-1 mr-2 leading-snug">{item.nombre} <span className="text-gray-400">×{item.qty}</span></span>
                    <span className="font-semibold whitespace-nowrap">${formatPrice(p*item.qty)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-[#C8102E] text-lg">${formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
