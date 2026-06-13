'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, X, ShoppingCart, Heart, AlertCircle } from 'lucide-react';

let toastQueue = [];
let listeners = [];

export function showToast(msg, type = 'success') {
  const id = Date.now();
  toastQueue = [...toastQueue, { id, msg, type }];
  listeners.forEach(fn => fn([...toastQueue]));
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    listeners.forEach(fn => fn([...toastQueue]));
  }, 3200);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter(fn => fn !== setToasts); };
  }, []);

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
    cart:    <ShoppingCart className="w-4 h-4 text-[#C8102E] flex-shrink-0" />,
    wish:    <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" fill="currentColor" />,
    error:   <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className="flex items-center gap-2.5 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl border border-white/10 animate-fade-up pointer-events-auto min-w-[220px] max-w-[340px]">
          {icons[t.type] || icons.success}
          <span className="flex-1">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
