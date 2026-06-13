'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function HeroBanner() {
  const { state, dispatch } = useStore();
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const banners = state.banners.filter(b => (b.activo || 'SI').toUpperCase() === 'SI');

  // Reiniciar el estado de error cada vez que cambia el slide
  useEffect(() => { setImgError(false); }, [index]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => goTo((index + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length, index]);

  const goTo = (i) => {
    if (animating) return;
    setAnimating(true);
    setIndex(i);
    setTimeout(() => setAnimating(false), 600);
  };

  if (banners.length === 0) return null;
  const b = banners[index];

  // Color de fondo: siempre hay un color sólido detrás (nunca gris transparente).
  // Si el color es 'transparent' o vacío, usamos un azul oscuro como base.
  // La imagen (si existe y carga bien) se dibuja ENCIMA del color.
  const isTransparent = !b.color || b.color === 'transparent';
  const baseColor = isTransparent ? '#1a1a2e' : b.color;
  const showImage = b.imagen_url && !imgError;

  return (
    <div
      className="relative overflow-hidden mx-3 sm:mx-4 mt-4 rounded-2xl"
      style={{ minHeight: '240px', background: baseColor }}>

      {/* IMAGEN DE FONDO — se dibuja encima del color base. Si falla, queda el color. */}
      {showImage && (
        <>
          <img
            src={b.imagen_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
            onError={() => setImgError(true)}
          />
          {/* Overlay oscuro solo para que el texto sea legible */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.04) 100%)',
              zIndex: 1
            }}
          />
        </>
      )}

      {/* Sin imagen visible: círculos decorativos de fondo */}
      {!showImage && (
        <>
          <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full opacity-[.07] bg-white translate-x-40 -translate-y-40 pointer-events-none" style={{ zIndex: 1 }} />
          <div className="absolute right-32 bottom-0 w-72 h-72 rounded-full opacity-[.07] bg-white translate-y-20 pointer-events-none" style={{ zIndex: 1 }} />
        </>
      )}

      {/* Contenido del banner — siempre z-10 para estar sobre imagen y overlay */}
      <div
        className={`relative px-8 sm:px-12 py-10 sm:py-14 max-w-xl hero-slide ${animating ? 'opacity-0' : 'opacity-100'}`}
        style={{ zIndex: 10 }}>
        <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight mb-3 tracking-tight drop-shadow-md">
          {b.titulo}
        </h1>
        {b.subtitulo && (
          <p className="text-white/85 text-base sm:text-lg mb-7 leading-relaxed drop-shadow">
            {b.subtitulo}
          </p>
        )}
        {b.boton && (
          <button
            onClick={() => dispatch({ type: 'SET_SECTION', payload: b.link || 'productos' })}
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all active:scale-[.98] shadow-lg text-sm">
            {b.boton} <span className="text-[#C8102E]">→</span>
          </button>
        )}
      </div>

      {/* Controles de navegación */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => goTo((index - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
            style={{ zIndex: 20 }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => goTo((index + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
            style={{ zIndex: 20 }}>
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5" style={{ zIndex: 20 }}>
            {banners.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === index ? 'bg-white w-6 h-2' : 'bg-white/50 w-2 h-2'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
