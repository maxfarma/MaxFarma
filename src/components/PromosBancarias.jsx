'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { CreditCard, ChevronRight, MessageCircle } from 'lucide-react';

const WA = '5493625298918';

// Logos SVG de bancos/tarjetas como componentes
const LOGOS = {
  'Visa': () => (
    <svg viewBox="0 0 48 16" className="h-5 w-auto">
      <text x="0" y="13" fontSize="14" fontWeight="bold" fill="#1A1F71" fontFamily="Arial">VISA</text>
    </svg>
  ),
  'Mastercard': () => (
    <div className="flex items-center gap-0.5">
      <div className="w-5 h-5 rounded-full bg-[#EB001B] opacity-90" />
      <div className="w-5 h-5 rounded-full bg-[#F79E1B] opacity-90 -ml-2" />
    </div>
  ),
  'Naranja': () => (
    <div className="flex items-center gap-1">
      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
        <span className="text-white text-[8px] font-black">N</span>
      </div>
      <span className="text-sm font-bold text-orange-500">Naranja</span>
    </div>
  ),
  'MODO': () => <span className="text-lg font-black text-[#9B2FE6]">MODO</span>,
  'Mercado Pago': () => <span className="text-sm font-black text-[#009EE3]">Mercado Pago</span>,
  'American Express': () => <span className="text-sm font-bold text-blue-700">AMEX</span>,
  'Cabal': () => <span className="text-sm font-bold text-[#1B3A7B]">Cabal</span>,
  'default': ({ nombre }) => (
    <div className="w-8 h-8 rounded-full bg-[#C8102E]/10 flex items-center justify-center">
      <CreditCard className="w-4 h-4 text-[#C8102E]" />
    </div>
  ),
};

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

export default function PromosBancarias() {
  const { state, dispatch } = useStore();
  const [filtroDia,  setFiltroDia]  = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('dia'); // 'dia' | 'tarjeta'

  const promos = state.promos.filter(p => (p.activa||'SI').toUpperCase() === 'SI');
  const programas = (state.programas||[]).filter(p => (p.activo||'SI').toUpperCase() === 'SI');

  const promasFiltradas = useMemo(() => {
    if (filtroDia === 'Todos') return promos;
    return promos.filter(p => !p.dia || p.dia === '' || p.dia === 'Todos los días' || p.dia?.includes(filtroDia));
  }, [promos, filtroDia]);

  const tarjetasUnicas = [...new Set(promos.map(p => p.tarjeta).filter(Boolean))];

  const LogoComp = ({ nombre }) => {
    const Comp = LOGOS[nombre] || LOGOS['default'];
    return <Comp nombre={nombre} />;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Promociones bancarias</h1>
            <p className="text-gray-400 text-sm mt-0.5">Descuentos y cuotas con tus tarjetas favoritas</p>
          </div>
        </div>

        {/* Link a programas */}
        <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-purple-700">¿Buscás descuentos de laboratorios como Andrómaco o Roemmers?</p>
          <button onClick={() => dispatch({ type:'SET_SECTION', payload:'promos' })}
            className="flex items-center gap-1.5 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors whitespace-nowrap">
            Ver programas <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {promos.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">Sin promociones bancarias vigentes</p>
          <p className="text-sm text-gray-400 mt-1">Consultanos por WhatsApp para más información</p>
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola MaxFarma, quiero consultar sobre promociones bancarias.')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-xl text-sm">
            <MessageCircle className="w-4 h-4"/> Consultar por WhatsApp
          </a>
        </div>
      ) : (
        <>
          {/* Selector de filtro */}
          <div className="flex gap-3 mb-5">
            <button onClick={() => setFiltroTipo('dia')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                filtroTipo==='dia' ? 'bg-[#C8102E] text-white border-[#C8102E]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Por día
            </button>
            <button onClick={() => setFiltroTipo('tarjeta')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                filtroTipo==='tarjeta' ? 'bg-[#C8102E] text-white border-[#C8102E]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              <CreditCard className="w-4 h-4"/>
              Por banco o tarjeta
            </button>
          </div>

          {/* Filtros por día */}
          {filtroTipo === 'dia' && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
              {['Todos', ...DIAS].map(dia => (
                <button key={dia} onClick={() => setFiltroDia(dia)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    filtroDia === dia
                      ? 'bg-[#C8102E] text-white border-[#C8102E]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  {dia}
                </button>
              ))}
            </div>
          )}

          {/* Filtros por tarjeta */}
          {filtroTipo === 'tarjeta' && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
              {['Todos', ...tarjetasUnicas].map(t => (
                <button key={t} onClick={() => setFiltroDia(t === 'Todos' ? 'Todos' : t)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    (t === 'Todos' && filtroDia === 'Todos') || filtroDia === t
                      ? 'bg-[#C8102E] text-white border-[#C8102E]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Grid de promos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {(filtroTipo === 'tarjeta' && filtroDia !== 'Todos'
              ? promos.filter(p => p.tarjeta === filtroDia)
              : promasFiltradas
            ).map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                {/* Logo */}
                <div className="h-10 flex items-center mb-3">
                  {p.imagen_url
                    ? <img src={p.imagen_url} alt={p.tarjeta} className="h-8 object-contain"
                        onError={e => e.target.style.display='none'} />
                    : <LogoComp nombre={p.tarjeta} />
                  }
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">{p.tarjeta}</p>

                {/* Beneficio principal — grande */}
                <div className="my-2">
                  {p.descuento > 0 && (
                    <p className="text-4xl font-black text-gray-900 leading-none">
                      {p.descuento > 0 && p.cuotas > 0
                        ? `-${p.descuento}%`
                        : `-${p.descuento}%`
                      }
                    </p>
                  )}
                  {p.cuotas > 0 && (
                    <p className={`font-black leading-none ${p.descuento > 0 ? 'text-2xl text-gray-700 mt-1' : 'text-4xl text-gray-900'}`}>
                      {p.cuotas} {p.descuento > 0 ? '' : <span className="text-sm font-semibold">CUOTAS</span>}
                    </p>
                  )}
                  {p.cuotas > 0 && (
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">
                      {p.descuento > 0 ? `+ ${p.cuotas} CUOTAS` : 'CUOTAS SIN INTERÉS'}
                    </p>
                  )}
                  {p.descuento > 0 && !p.cuotas && (
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">DE DESCUENTO</p>
                  )}
                </div>

                {p.dia && (
                  <span className="inline-block text-xs bg-[#FFF0F3] text-[#C8102E] font-semibold px-2 py-0.5 rounded-full mt-1">
                    {p.dia}
                  </span>
                )}
                {p.detalle && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{p.detalle}</p>
                )}
                {p.vigencia && (
                  <p className="text-xs text-gray-400 mt-1">Hasta {p.vigencia}</p>
                )}
              </div>
            ))}
          </div>

          {/* Programas de laboratorio */}
          {programas.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Programas de descuento de laboratorios</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {programas.map((prog, i) => (
                  <button key={i}
                    onClick={() => dispatch({ type:'SET_PROGRAMA', payload:prog })}
                    className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 text-left group">
                    {prog.imagen_url && (
                      <img src={prog.imagen_url} alt={prog.nombre} className="w-12 h-12 object-contain rounded-xl flex-shrink-0"
                        onError={e => e.target.style.display='none'} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 group-hover:text-[#C8102E] transition-colors">{prog.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{prog.descripcion}</p>
                      <p className="text-xs text-[#C8102E] font-semibold mt-1">{(prog.productos||[]).length} producto(s) con descuento</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#C8102E] transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
