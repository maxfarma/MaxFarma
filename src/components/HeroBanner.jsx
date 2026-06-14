'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useStore } from '@/lib/store';

/* ── Skeleton mientras carga Firestore ── */
function BannerSkeleton() {
  return (
    <div className="mx-3 sm:mx-4 mt-4">
      <div className="grid grid-cols-3 gap-3" style={{ height: '340px' }}>
        <div className="col-span-1 flex flex-col gap-3">
          <div className="flex-1 bg-gray-200 animate-pulse rounded-2xl" />
          <div className="flex-1 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
        <div className="col-span-1 bg-gray-200 animate-pulse rounded-2xl" />
        <div className="col-span-1 flex flex-col gap-3">
          <div className="flex-1 bg-gray-200 animate-pulse rounded-2xl" />
          <div className="flex-1 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ── Banner individual (imagen de fondo o color sólido) ── */
function BannerCard({ banner, onClick, className = '', style = {} }) {
  const [imgError, setImgError] = useState(false);
  const b = banner;
  const isTransparent = !b.color || b.color === 'transparent';
  const baseColor = isTransparent ? '#1a1a2e' : b.color;
  const showImage = b.imagen_url && !imgError;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${className}`}
      style={{ background: baseColor, ...style }}
    >
      {showImage && (
        <>
          <img
            src={b.imagen_url}
            alt={b.titulo || ''}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ zIndex: 0 }}
            onError={() => setImgError(true)}
          />
          {/* Overlay solo si hay texto para mostrar */}
          {(b.titulo || b.subtitulo || b.boton) && (
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.0) 100%)',
                zIndex: 1,
              }}
            />
          )}
        </>
      )}

      {!showImage && (
        <div className="absolute inset-0 opacity-10" style={{ zIndex: 1 }}>
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white translate-x-20 -translate-y-20" />
          <div className="absolute left-0 bottom-0 w-48 h-48 rounded-full bg-white -translate-x-10 translate-y-10" />
        </div>
      )}

      {/* Texto — solo si hay algo que mostrar */}
      {(b.titulo || b.subtitulo || b.boton) && (
        <div className="relative z-10 p-5 h-full flex flex-col justify-end">
          {b.titulo && (
            <h2 className="text-white font-black leading-tight drop-shadow-md text-lg sm:text-xl lg:text-2xl mb-1">
              {b.titulo}
            </h2>
          )}
          {b.subtitulo && (
            <p className="text-white/85 text-xs sm:text-sm drop-shadow line-clamp-2 mb-3">
              {b.subtitulo}
            </p>
          )}
          {b.boton && (
            <div className="inline-flex">
              <span className="bg-white text-gray-900 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-gray-100 transition-colors shadow-lg">
                {b.boton} →
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HERO BANNER PRINCIPAL
   Layout: grilla tipo Farmacity
   - 1 banner grande en el centro (carrusel si hay varios "principales")
   - 2 columnas laterales con banners secundarios (estáticos, hasta 4 banners)
   
   Cada banner puede tener un campo "tipo":
     "principal" → va al carrusel central grande
     "secundario" → va a los slots laterales
     (si no tiene tipo, se distribuye automáticamente)
══════════════════════════════════════════════════════ */
export default function HeroBanner() {
  const { state, dispatch } = useStore();
  const [mainIndex, setMainIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused]       = useState(false);

  const allActive = state.banners.filter(b => (b.activo || 'SI').toUpperCase() === 'SI');

  // Separar banners principales y secundarios
  const mainBanners = allActive.filter(b => !b.tipo || b.tipo === 'principal');
  const sideBanners = allActive.filter(b => b.tipo === 'secundario');

  // Si no hay tipo definido y hay más de 1 banner, el primero es principal y el resto secundarios
  const principals = mainBanners.length > 0 ? mainBanners : allActive.slice(0, 1);
  const secondaries = sideBanners.length > 0 ? sideBanners : allActive.slice(1, 5);

  const goTo = useCallback((i) => {
    if (animating || principals.length <= 1) return;
    setAnimating(true);
    setMainIndex(i);
    setTimeout(() => setAnimating(false), 400);
  }, [animating, principals.length]);

  const goNext = useCallback(() => goTo((mainIndex + 1) % principals.length), [goTo, mainIndex, principals.length]);
  const goPrev = useCallback(() => goTo((mainIndex - 1 + principals.length) % principals.length), [goTo, mainIndex, principals.length]);

  useEffect(() => {
    if (paused || principals.length <= 1) return;
    const t = setInterval(goNext, 5000);
    return () => clearInterval(t);
  }, [paused, principals.length, goNext]);

  const navTo = (link) => {
    if (link) dispatch({ type: 'SET_SECTION', payload: link });
  };

  // Skeleton mientras carga
  if (!state.dbLoaded) return <BannerSkeleton />;
  if (allActive.length === 0) return null;

  // ── Layout: solo 1 banner (full width) ──
  if (allActive.length === 1) {
    return (
      <div className="mx-3 sm:mx-4 mt-4">
        <BannerCard
          banner={allActive[0]}
          onClick={() => navTo(allActive[0].link)}
          style={{ height: '280px' }}
        />
      </div>
    );
  }

  // ── Layout: 2 banners (mitad + mitad) ──
  if (allActive.length === 2) {
    return (
      <div className="mx-3 sm:mx-4 mt-4 grid grid-cols-2 gap-3" style={{ height: '280px' }}>
        {allActive.map((b, i) => (
          <BannerCard key={i} banner={b} onClick={() => navTo(b.link)} className="h-full" />
        ))}
      </div>
    );
  }

  // ── Layout: 3+ banners — grilla tipo Farmacity ──
  // [col izq: 2 chicos] [col centro: 1 grande carrusel] [col der: 2 chicos]
  const leftBanners  = secondaries.slice(0, 2);
  const rightBanners = secondaries.slice(2, 4);

  // Si no hay suficientes secundarios, los sacamos de todos
  const totalSide = leftBanners.length + rightBanners.length;
  const hasLeft   = leftBanners.length > 0;
  const hasRight  = rightBanners.length > 0;

  return (
    <div className="mx-3 sm:mx-4 mt-4">
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: hasLeft && hasRight
            ? '1fr 2fr 1fr'
            : hasLeft || hasRight
              ? '1fr 2fr'
              : '1fr',
          height: '340px',
        }}
      >
        {/* Columna izquierda */}
        {hasLeft && (
          <div className="flex flex-col gap-3 hidden sm:flex">
            {leftBanners.map((b, i) => (
              <BannerCard
                key={i}
                banner={b}
                onClick={() => navTo(b.link)}
                className="flex-1"
              />
            ))}
          </div>
        )}

        {/* Banner principal — carrusel */}
        <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '220px' }}>
          {principals.map((b, i) => {
            const isTransparent = !b.color || b.color === 'transparent';
            const baseColor = isTransparent ? '#1a1a2e' : b.color;
            const [imgErr, setImgErr] = [false, () => {}]; // handled inside

            return (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-400"
                style={{
                  opacity: i === mainIndex && !animating ? 1 : 0,
                  pointerEvents: i === mainIndex ? 'auto' : 'none',
                  background: baseColor,
                  zIndex: i === mainIndex ? 1 : 0,
                }}
                onClick={() => navTo(b.link)}
              >
                {b.imagen_url && (
                  <>
                    <img
                      src={b.imagen_url}
                      alt={b.titulo || ''}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ zIndex: 0 }}
                    />
                    {(b.titulo || b.subtitulo || b.boton) && (
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,0.60) 0%,rgba(0,0,0,0.15) 60%,rgba(0,0,0,0.02) 100%)', zIndex: 1 }} />
                    )}
                  </>
                )}
                {!b.imagen_url && (
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-white translate-x-32 -translate-y-32" />
                    <div className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-white -translate-x-16 translate-y-16" />
                  </div>
                )}
                {(b.titulo || b.subtitulo || b.boton) && (
                  <div className="relative z-10 px-8 py-10 h-full flex flex-col justify-end cursor-pointer">
                    {b.titulo && <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-2 drop-shadow-md">{b.titulo}</h1>}
                    {b.subtitulo && <p className="text-white/85 text-sm sm:text-base mb-5 drop-shadow">{b.subtitulo}</p>}
                    {b.boton && (
                      <div className="inline-flex">
                        <span className="bg-white text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-lg">
                          {b.boton} <span className="text-[#C8102E]">→</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Controles del carrusel */}
          {principals.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors backdrop-blur-sm z-20">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors backdrop-blur-sm z-20">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {principals.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-300 ${i === mainIndex ? 'bg-white w-5 h-2' : 'bg-white/50 w-2 h-2'}`} />
                ))}
                <button onClick={() => setPaused(p => !p)} className="ml-1 bg-black/25 hover:bg-black/45 text-white p-1 rounded-full transition-colors">
                  {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Columna derecha */}
        {hasRight && (
          <div className="flex flex-col gap-3 hidden sm:flex">
            {rightBanners.map((b, i) => (
              <BannerCard
                key={i}
                banner={b}
                onClick={() => navTo(b.link)}
                className="flex-1"
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile: secundarios debajo del principal en scroll horizontal */}
      {secondaries.length > 0 && (
        <div className="sm:hidden mt-3 flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
          {secondaries.map((b, i) => (
            <div key={i} className="snap-start flex-shrink-0" style={{ width: '60vw', height: '130px' }}>
              <BannerCard banner={b} onClick={() => navTo(b.link)} className="w-full h-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
