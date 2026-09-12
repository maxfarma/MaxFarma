'use client';
import { useStore } from '@/lib/store';
import { MessageCircle, Phone, ChevronRight, Shield, CheckCircle } from 'lucide-react';

const WA = '5493625298918';

const OBRAS_SOCIALES = [
  { nombre:'PAMI',            sigla:'PAMI',     color:'#0066CC', cobertura:'Hasta 100% según medicamento' },
  { nombre:'OSECAC',          sigla:'OSECAC',   color:'#CC0000', cobertura:'Cobertura según plan' },
  { nombre:'Galeno',          sigla:'GALENO',   color:'#004B8D', cobertura:'Cobertura según plan' },
  { nombre:'Swiss Medical',   sigla:'SWISS',    color:'#E30613', cobertura:'Cobertura según plan' },
  { nombre:'OSDE',            sigla:'OSDE',     color:'#006DB7', cobertura:'Cobertura según plan' },
  { nombre:'Medifé',          sigla:'MEDIFÉ',   color:'#00529B', cobertura:'Cobertura según plan' },
  { nombre:'Luis Pasteur',    sigla:'PASTEUR',  color:'#009688', cobertura:'Cobertura según plan' },
  { nombre:'IOMA',            sigla:'IOMA',     color:'#2E7D32', cobertura:'Cobertura según plan' },
  { nombre:'INSSJP',          sigla:'INSSJP',   color:'#1565C0', cobertura:'Medicamentos esenciales' },
  { nombre:'Sancor Salud',    sigla:'SANCOR',   color:'#F57C00', cobertura:'Cobertura según plan' },
  { nombre:'OSPRERA',         sigla:'OSPRERA',  color:'#6A1B9A', cobertura:'Cobertura según plan' },
  { nombre:'OSPACA',          sigla:'OSPACA',   color:'#00695C', cobertura:'Cobertura según plan' },
  { nombre:'OMINT',           sigla:'OMINT',    color:'#37474F', cobertura:'Cobertura según plan' },
  { nombre:'IOSPER',          sigla:'IOSPER',   color:'#283593', cobertura:'Cobertura según plan' },
  { nombre:'APROSS',          sigla:'APROSS',   color:'#558B2F', cobertura:'Cobertura según plan' },
  { nombre:'Particular',      sigla:'PART.',    color:'#424242', cobertura:'Sin cobertura — precio de lista' },
];

export default function ObrasSociales() {
  const { dispatch } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#C8102E] translate-x-32 -translate-y-32" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5"/> Obras sociales y prepagas
          </div>
          <h1 className="text-white text-4xl font-black tracking-tight mb-3">
            Obras sociales que atendemos
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed mb-6">
            Trabajamos con las principales obras sociales y prepagas del país.
            Si no encontrás la tuya, consultanos — probablemente también la atendemos.
          </p>
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola MaxFarma, quiero consultar si atienden mi obra social.')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#9B0D22] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg">
            <MessageCircle className="w-4 h-4"/> Consultar por WhatsApp
          </a>
        </div>
      </div>

      {/* Info rápida */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon:<CheckCircle className="w-5 h-5 text-green-600"/>, title:'Atención inmediata', sub:'Presentá tu credencial en la farmacia o consultá disponibilidad por WhatsApp antes de venir.' },
            { icon:<Shield className="w-5 h-5 text-blue-600"/>,       title:'Medicamentos de alto costo', sub:'Gestionamos medicamentos oncológicos, diabéticos y de alto costo con tu cobertura.' },
            { icon:<MessageCircle className="w-5 h-5 text-[#25D366]"/>, title:'Dudas por WhatsApp', sub:'Si no sabés si tu medicamento tiene cobertura, consultanos y te orientamos.' },
          ].map((b,i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">{b.icon}</div>
              <p className="font-bold text-gray-900 text-sm mb-1">{b.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{b.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de obras sociales */}
      <div className="max-w-5xl mx-auto px-4 mt-10">
        <h2 className="text-xl font-black text-gray-900 mb-5">Obras sociales y prepagas aceptadas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {OBRAS_SOCIALES.map((os, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
              {/* Badge con color de la obra social */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-white text-xs font-black"
                style={{ background: os.color }}>
                {os.sigla.slice(0,4)}
              </div>
              <p className="font-bold text-gray-900 text-sm mb-0.5">{os.nombre}</p>
              <p className="text-xs text-gray-400 leading-tight">{os.cobertura}</p>
            </div>
          ))}
        </div>

        {/* CTA consultar */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1">
            <p className="font-bold text-gray-900 mb-1">¿No encontrás tu obra social?</p>
            <p className="text-sm text-gray-500">Consultanos por WhatsApp o llamanos — atendemos la mayoría de las obras sociales y prepagas del país.</p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola MaxFarma, quiero consultar si atienden mi obra social.')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <MessageCircle className="w-4 h-4"/> WhatsApp
            </a>
            <a href="tel:+5493625298918"
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Phone className="w-4 h-4"/> Llamar
            </a>
          </div>
        </div>
      </div>

      {/* CTA volver */}
      <div className="max-w-5xl mx-auto px-4 mt-8 text-center">
        <button onClick={() => dispatch({ type:'SET_SECTION', payload:'productos' })}
          className="inline-flex items-center gap-2 text-[#C8102E] font-semibold text-sm hover:underline">
          Ver todos los productos <ChevronRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
}
