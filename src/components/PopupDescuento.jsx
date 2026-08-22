'use client';
import { useState, useEffect } from 'react';
import { X, Sparkles, Tag } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const STORAGE_KEY = 'mf_popup_shown';

export default function PopupDescuento() {
  const [visible, setVisible]   = useState(false);
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState('idle'); // idle|loading|ok|error

  useEffect(() => {
    // Solo mostrar si no fue visto antes
    const shown = sessionStorage.getItem(STORAGE_KEY);
    if (shown) return;
    // Mostrar después de 4 segundos
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) { setStatus('error'); setTimeout(() => setStatus('idle'), 2500); return; }
    setStatus('loading');
    try {
      await addDoc(collection(db, 'newsletter'), {
        email: email.toLowerCase().trim(),
        fecha: serverTimestamp(),
        origen: 'popup-descuento',
      });
      setStatus('ok');
      setTimeout(() => close(), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }}
      onClick={close}>
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-scale"
        onClick={e => e.stopPropagation()}>

        {/* Header rojo */}
        <div className="bg-gradient-to-br from-[#C8102E] to-[#9B0D22] px-8 pt-10 pb-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white translate-x-8 -translate-y-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white -translate-x-6 translate-y-6" />
          </div>
          <button onClick={close} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors z-10">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Oferta exclusiva</p>
            <h2 className="text-white text-3xl font-black tracking-tight leading-none mb-1">
              10% OFF
            </h2>
            <p className="text-white/80 text-sm">en tu primera compra</p>
          </div>
        </div>

        {/* Badge flotante */}
        <div className="absolute top-[140px] left-1/2 -translate-x-1/2 bg-white text-[#C8102E] font-black text-xs px-4 py-1.5 rounded-full shadow-lg border-2 border-[#C8102E] whitespace-nowrap z-20">
          ✨ Suscribite y ahorrá
        </div>

        {/* Body */}
        <div className="px-8 pt-10 pb-8">
          <p className="text-gray-600 text-sm text-center mb-5 leading-relaxed">
            Dejanos tu email y recibí tu cupón de descuento + novedades y promos exclusivas.
          </p>

          {status === 'ok' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-green-500" />
              </div>
              <p className="font-bold text-gray-900 mb-1">¡Listo! Ya estás suscripto</p>
              <p className="text-sm text-gray-400">Te contactaremos con tu descuento</p>
            </div>
          ) : (
            <>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="tu@email.com"
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors mb-3 ${
                  status === 'error' ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#C8102E]'
                }`}
              />
              {status === 'error' && <p className="text-red-500 text-xs mb-2 text-center">Ingresá un email válido</p>}
              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="w-full bg-[#C8102E] hover:bg-[#9B0D22] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                {status === 'loading' ? 'Enviando...' : 'Quiero mi 10% de descuento'}
              </button>
            </>
          )}

          <button onClick={close} className="w-full text-gray-400 hover:text-gray-600 text-xs mt-3 transition-colors">
            No gracias, prefiero pagar precio completo
          </button>
        </div>
      </div>
    </div>
  );
}
