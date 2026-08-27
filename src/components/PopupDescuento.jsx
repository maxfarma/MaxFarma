'use client';
import { useState, useEffect } from 'react';
import { X, Tag, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useStore } from '@/lib/store';

const STORAGE_KEY = 'mf_popup_shown';

const DEFAULTS = {
  activo: true,
  titulo: '10% OFF en tu primera compra',
  subtitulo: 'Suscribite y ahorrá en tu primer pedido',
  descuento: '10% OFF',
  imagen_url: '',
  delay_segundos: 4,
  boton_texto: 'Quiero mi descuento',
  color: '#C8102E',
};

export default function PopupDescuento() {
  const { state } = useStore();
  const [visible, setVisible] = useState(false);
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState('idle');

  // Config desde Firestore o defaults
  const cfg = { ...DEFAULTS, ...(state.contenido?.popup || {}) };

  useEffect(() => {
    if (!cfg.activo) return;
    const shown = sessionStorage.getItem(STORAGE_KEY);
    if (shown) return;
    const t = setTimeout(() => setVisible(true), (cfg.delay_segundos || 4) * 1000);
    return () => clearTimeout(t);
  }, [cfg.activo, cfg.delay_segundos]);

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
      return;
    }
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
      style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }}
      onClick={close}>
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-scale"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-8 pt-10 pb-8 text-center relative overflow-hidden"
          style={{ background:`linear-gradient(135deg, ${cfg.color}, #7A0019)` }}>
          {/* Decoración */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white translate-x-8 -translate-y-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white -translate-x-6 translate-y-6" />
          </div>

          {/* Cerrar */}
          <button onClick={close}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors z-10">
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative z-10">
            {/* Imagen o ícono */}
            {cfg.imagen_url ? (
              <img src={cfg.imagen_url} alt="" className="w-20 h-20 object-contain mx-auto mb-4 rounded-2xl"
                onError={e => e.target.style.display='none'} />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Tag className="w-7 h-7 text-white" />
              </div>
            )}
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Oferta exclusiva</p>
            <h2 className="text-white text-4xl font-black tracking-tight leading-none mb-2">
              {cfg.descuento}
            </h2>
            <p className="text-white/80 text-sm mb-4">{cfg.titulo}</p>
            {/* Badge — dentro del header, sin flotar */}
            <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-4 py-1.5 shadow-sm"
              style={{ color: cfg.color }}>
              <Tag className="w-3 h-3" />
              <span className="text-xs font-black">Suscribite y ahorrá</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-8">
          <p className="text-gray-500 text-sm text-center mb-5 leading-relaxed">
            {cfg.subtitulo}
          </p>

          {status === 'ok' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Tag className="w-7 h-7 text-green-500" />
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
                  status === 'error' ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#C8102E]'
                }`}
              />
              {status === 'error' && (
                <p className="text-red-500 text-xs mb-2 text-center">Ingresá un email válido</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="w-full text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: cfg.color }}>
                {status === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : cfg.boton_texto}
              </button>
            </>
          )}

          <button onClick={close}
            className="w-full text-gray-400 hover:text-gray-600 text-xs mt-3 transition-colors">
            No gracias, prefiero pagar precio completo
          </button>
        </div>
      </div>
    </div>
  );
}
