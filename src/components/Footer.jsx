'use client';
import { useStore } from '@/lib/store';
import { MapPin, Clock, Phone, Mail, Instagram, Facebook, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { state, dispatch } = useStore();
  const nav    = (s) => dispatch({ type: 'SET_SECTION', payload: s });
  const navPag = (slug) => dispatch({ type: 'SET_SECTION', payload: 'pagina-' + slug });
  const y      = new Date().getFullYear();

  const paymentMethods = [
    { name: 'VISA',      color: '#1A1F71', text: '#fff' },
    { name: 'MC',        color: '#EB001B', text: '#fff' },
    { name: 'AMEX',      color: '#007BC1', text: '#fff' },
    { name: 'NARANJA',   color: '#F37021', text: '#fff' },
    { name: 'CABAL',     color: '#00529B', text: '#fff' },
    { name: 'DÉBITO',    color: '#374151', text: '#fff' },
    { name: 'MP',        color: '#009EE3', text: '#fff' },
    { name: 'GO CUOTAS', color: '#00C16E', text: '#fff' },
    { name: 'EFECTIVO',  color: '#059669', text: '#fff' },
  ];

  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">
      {/* Trust bar */}
      <div className="border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:'🚚', title:'Envío a domicilio',      sub:'En tu zona' },
            { icon:'🔒', title:'Compra 100% segura',     sub:'Datos protegidos' },
            { icon:'💳', title:'Pagá con Go Cuotas',      sub:'Cuotas con tu débito' },
            { icon:'🏥', title:'Farmacia habilitada',    sub:'Disposición ANMAT' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-white text-xs font-semibold leading-tight">{b.title}</p>
                <p className="text-gray-600 text-xs">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <img src="/logo.png" alt="MaxFarma" className="h-9 w-auto object-contain mb-4 brightness-200"
            onError={e => { e.target.style.display='none'; }} />
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Tu farmacia de confianza en Ruta Nacional 6 Km 22,5. Salud, belleza y bienestar.
          </p>
          <div className="flex gap-2 mb-5">
            {[
              { icon: <Instagram className="w-4 h-4" />, href: '#', label: 'Instagram' },
              { icon: <Facebook className="w-4 h-4" />,  href: '#', label: 'Facebook' },
            ].map((s, i) => (
              <a key={i} href={s.href} aria-label={s.label}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#C8102E] flex items-center justify-center transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
          {/* AFIP Data Fiscal */}
          <a href="http://qr.afip.gob.ar/?qr=XXXX" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors border border-gray-800 rounded-lg px-2.5 py-1.5">
            <ExternalLink className="w-3 h-3" /> Data Fiscal AFIP
          </a>
        </div>

        {/* Tienda */}
        <div>
          <h4 className="text-white text-xs font-bold mb-4 uppercase tracking-widest">Tienda</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              ['inicio','Inicio'],
              ['productos','Todos los productos'],
              ['ofertas','Ofertas'],
              ['promos','Promos bancarias'],
              ['wishlist','Mis favoritos'],
            ].map(([k,l]) => (
              <li key={k}>
                <button onClick={() => nav(k)} className="hover:text-white transition-colors text-left">{l}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Ayuda */}
        <div>
          <h4 className="text-white text-xs font-bold mb-4 uppercase tracking-widest">Ayuda</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              ['preguntas-frecuentes', 'Preguntas frecuentes'],
              ['como-comprar',         'Cómo comprar'],
              ['envios',               'Envíos y entregas'],
              ['devoluciones',         'Cambios y devoluciones'],
              ['medios-de-pago',       'Medios de pago'],
              ['terminos',             'Términos y condiciones'],
            ].map(([slug, label]) => (
              <li key={slug}>
                <button onClick={() => navPag(slug)} className="hover:text-white transition-colors text-left">{label}</button>
              </li>
            ))}
          </ul>
          {/* Defensa del consumidor */}
          <a href="https://www.argentina.gob.ar/defensa-al-consumidor" target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors">
            <ExternalLink className="w-3 h-3" /> Defensa del Consumidor
          </a>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-white text-xs font-bold mb-4 uppercase tracking-widest">Contacto</h4>
          <ul className="flex flex-col gap-3 text-sm mb-5">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#C8102E]" />
              <span>Ruta Nacional 6 Km 22,5</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 flex-shrink-0 text-[#C8102E]" />
              <span>Lun – Sáb: 9:00 a 21:00</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 flex-shrink-0 text-[#C8102E]" />
              <a href="tel:+5493625298918" className="hover:text-white transition-colors">+54 9 362 529-8918</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 flex-shrink-0 text-[#C8102E]" />
              <a href="mailto:ventamaxfarma@gmail.com" className="hover:text-white transition-colors text-xs">ventamaxfarma@gmail.com</a>
            </li>
          </ul>

          {/* Medios de pago */}
          <p className="text-[10px] text-gray-700 mb-2 uppercase tracking-widest font-bold">Medios de pago</p>
          <div className="flex flex-wrap gap-1.5">
            {paymentMethods.map(m => (
              <span key={m.name}
                className="text-[9px] font-bold px-2 py-1 rounded"
                style={{ background: m.color, color: m.text }}>
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-footer */}
      <div className="border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-700">
          <p>© {y} MaxFarma. Todos los derechos reservados. Farmacia habilitada.</p>
          <div className="flex gap-4 flex-wrap">
            <button onClick={() => navPag('terminos')} className="hover:text-gray-400 transition-colors">Privacidad</button>
            <button onClick={() => navPag('terminos')} className="hover:text-gray-400 transition-colors">Términos</button>
            <button onClick={() => navPag('devoluciones')} className="hover:text-gray-400 transition-colors">Arrepentimiento</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
