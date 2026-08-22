'use client';
import { useStore } from '@/lib/store';
import {
  MapPin, Clock, Phone, Mail, Instagram, Shield, Award,
  Heart, Users, Pill, ChevronRight, MessageCircle
} from 'lucide-react';

const WA = '5493625298918';

export default function QuienesSomos() {
  const { dispatch } = useStore();

  const valores = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Vocación de servicio',
      desc: 'Más de 15 años cuidando la salud de nuestra comunidad con dedicación y compromiso.',
      color: 'bg-red-50 text-[#C8102E]',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Farmacia habilitada',
      desc: 'Habilitados por ANMAT y el Colegio de Farmacéuticos. Todos nuestros productos son originales y trazables.',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: <Pill className="w-6 h-6" />,
      title: 'Medicamentos especiales',
      desc: 'Especializados en oncológicos, diabéticos y medicamentos de alto costo con programas de laboratorio.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Equipo profesional',
      desc: 'Farmacéuticos matriculados y personal capacitado para asesorarte en cada consulta.',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const timeline = [
    { year: '2008', title: 'Apertura de MaxFarma', desc: 'Abrimos nuestras puertas en Ruta Nacional 6 Km 22,5 con el objetivo de brindar salud y bienestar a toda la comunidad.' },
    { year: '2015', title: 'Especialización oncológica', desc: 'Comenzamos a trabajar con medicamentos de alto costo, oncológicos y programas de laboratorios nacionales e internacionales.' },
    { year: '2020', title: 'Servicio a domicilio', desc: 'Implementamos el servicio de entrega a domicilio para llegar a más familias, especialmente en los momentos más difíciles.' },
    { year: '2024', title: 'MaxFarma Online', desc: 'Lanzamos nuestra tienda digital para que puedas hacer tus compras desde cualquier lugar, con la misma confianza de siempre.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#C8102E] translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#C8102E] -translate-x-20 translate-y-20" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" /> Desde 2008 · Ruta Nacional 6 Km 22,5
          </div>
          <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Somos <span className="text-[#C8102E]">MaxFarma</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Una farmacia familiar con más de 15 años cuidando la salud de nuestra comunidad. 
            Especializados en medicamentos de alto costo, oncológicos y diabéticos.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => dispatch({ type:'SET_SECTION', payload:'productos' })}
              className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#9B0D22] text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg text-sm">
              Ver catálogo <ChevronRight className="w-4 h-4" />
            </button>
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola MaxFarma, quisiera hacer una consulta.')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-white/20">
              <MessageCircle className="w-4 h-4" /> Consultanos
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val:'+15',   label:'Años de experiencia' },
            { val:'+2000', label:'Productos disponibles' },
            { val:'100%',  label:'Productos originales' },
            { val:'24/7',  label:'Consultas WhatsApp' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-black text-[#C8102E]">{s.val}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Misión ── */}
      <div className="max-w-5xl mx-auto px-4 mt-14">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs font-bold text-[#C8102E] uppercase tracking-widest mb-2">Nuestra misión</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4 leading-tight">
              Tu salud es nuestra prioridad
            </h2>
            <div className="w-12 h-1 bg-[#C8102E] rounded-full mb-6" />
            <p className="text-gray-600 leading-relaxed mb-4">
              En MaxFarma trabajamos todos los días para que vos y tu familia tengan acceso a los mejores 
              medicamentos y productos de salud, con el asesoramiento de profesionales capacitados.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Somos una farmacia especializada en medicamentos de alto costo, oncológicos y para diabéticos. 
              Trabajamos con los principales laboratorios nacionales e internacionales y sus programas de descuento.
            </p>
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola MaxFarma, necesito asesoramiento sobre un medicamento.')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <MessageCircle className="w-4 h-4" /> Solicitar asesoramiento
            </a>
          </div>

          {/* Foto del local / placeholder profesional */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border border-gray-100 shadow-lg flex items-center justify-center">
              <img
                src="/foto-farmacia.jpg"
                alt="MaxFarma — Farmacia"
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full flex-col items-center justify-center gap-3 text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-[#C8102E]/10 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#C8102E]" />
                </div>
                <p className="text-gray-500 text-sm font-medium">Ruta Nacional 6 Km 22,5</p>
                <p className="text-gray-400 text-xs">Subí una foto del local en <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">/public/foto-farmacia.jpg</span></p>
              </div>
            </div>
            {/* Badge flotante */}
            <div className="absolute -bottom-4 -right-4 bg-[#C8102E] text-white rounded-2xl px-4 py-3 shadow-xl">
              <p className="text-2xl font-black leading-none">+15</p>
              <p className="text-xs text-white/70 mt-0.5">años</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Valores ── */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-[#C8102E] uppercase tracking-widest mb-2">Nuestros valores</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Por qué elegirnos</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {valores.map((v, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className={`w-12 h-12 rounded-xl ${v.color} flex items-center justify-center mb-4`}>
                {v.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Historia / Timeline ── */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-[#C8102E] uppercase tracking-widest mb-2">Nuestra historia</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Más de 15 años creciendo</h2>
        </div>
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-px" />
          <div className="flex flex-col gap-8">
            {timeline.map((item, i) => (
              <div key={i} className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                {/* Año — punto en la línea */}
                <div className="absolute left-4 sm:left-1/2 w-8 h-8 -translate-x-4 bg-[#C8102E] text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 shadow-md z-10">
                  {item.year.slice(2)}
                </div>
                {/* Card */}
                <div className={`ml-14 sm:ml-0 sm:w-[45%] ${i % 2 === 0 ? 'sm:mr-auto sm:pr-8' : 'sm:ml-auto sm:pl-8'}`}>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                    <p className="text-xs font-bold text-[#C8102E] mb-1">{item.year}</p>
                    <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contacto ── */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Info */}
            <div className="p-8">
              <p className="text-xs font-bold text-[#C8102E] uppercase tracking-widest mb-2">Visitanos</p>
              <h2 className="text-2xl font-black text-gray-900 mb-6">Dónde encontrarnos</h2>
              <ul className="flex flex-col gap-4">
                {[
                  { icon:<MapPin className="w-5 h-5 text-[#C8102E]"/>, label:'Dirección', val:'Ruta Nacional 6 Km 22,5' },
                  { icon:<Clock className="w-5 h-5 text-[#C8102E]"/>, label:'Horario', val:'Lun–Sáb: 9:00 a 21:00 hs' },
                  { icon:<Phone className="w-5 h-5 text-[#C8102E]"/>, label:'Teléfono', val:'+54 9 362 529-8918', href:'tel:+5493625298918' },
                  { icon:<Mail className="w-5 h-5 text-[#C8102E]"/>, label:'Email', val:'ventamaxfarma@gmail.com', href:'mailto:ventamaxfarma@gmail.com' },
                  { icon:<Instagram className="w-5 h-5 text-[#C8102E]"/>, label:'Instagram', val:'@maxfarma.chaco', href:'https://www.instagram.com/maxfarma.chaco' },
                ].map((c, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] flex items-center justify-center flex-shrink-0">
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{c.label}</p>
                      {c.href
                        ? <a href={c.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-800 hover:text-[#C8102E] transition-colors">{c.val}</a>
                        : <p className="text-sm font-semibold text-gray-800">{c.val}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mapa embebido */}
            <div className="bg-gray-100 min-h-[300px] relative overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3537.0!2d-58.95!3d-34.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDMz!5e0!3m2!1ses!2sar!4v1234567890"
                className="absolute inset-0 w-full h-full"
                style={{ border:0, filter:'grayscale(20%)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="MaxFarma — Ubicación"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA final ── */}
      <div className="max-w-5xl mx-auto px-4 mt-10">
        <div className="bg-gradient-to-r from-[#C8102E] to-[#9B0D22] rounded-2xl p-8 text-center">
          <h3 className="text-white text-2xl font-black mb-2">¿Tenés alguna consulta?</h3>
          <p className="text-white/70 mb-6 text-sm">Estamos para ayudarte. Escribinos por WhatsApp y te respondemos a la brevedad.</p>
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola MaxFarma, quisiera hacer una consulta.')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-white text-[#C8102E] font-black px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg">
            <MessageCircle className="w-5 h-5" /> Escribirnos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
