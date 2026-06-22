'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search, ShoppingCart, Menu, X, Heart, ChevronDown,
  Phone, MapPin, Clock,
  Droplets, Wind, Baby, Brush, Dumbbell, Sparkles,
  Home as HomeIcon, Smile, Ribbon, Users, ShoppingBag, Pill, Zap
} from 'lucide-react';
import { useStore, formatPrice } from '@/lib/store';
import ObfuscatedEmail from '@/components/ObfuscatedEmail';

/* ── Mapa de iconos SVG por clave de categoría ── */
function CatIcon({ catKey, className = "w-5 h-5" }) {
  const icons = {
    todos:              <ShoppingBag className={className} />,
    dermocosmetica:     <Droplets className={className} />,
    perfumes:           <Wind className={className} />,
    bebe:               <Baby className={className} />,
    'cuidado-personal': <Brush className={className} />,
    nutricion:          <Dumbbell className={className} />,
    maquillaje:         <Sparkles className={className} />,
    electro:            <Zap className={className} />,
    hogar:              <HomeIcon className={className} />,
    infantiles:         <Smile className={className} />,
    'salud-sexual':     <Ribbon className={className} />,
    'adultos-mayores':  <Users className={className} />,
    medicamentos:       <Pill className={className} />,
  };
  return icons[catKey] || <ShoppingBag className={className} />;
}

export default function Header() {
  const { state, dispatch } = useStore();
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [megaOpen, setMegaOpen]           = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery]                 = useState('');
  const searchRef  = useRef(null);
  const debounceRef= useRef(null);
  const cartCount  = state.cart.reduce((s, i) => s + i.qty, 0);
  const wishCount  = state.wishlist?.length || 0;

  // Categorías dinámicas desde Firestore
  const cats = state.categorias && state.categorias.length > 0
    ? state.categorias
    : [];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Ctrl+Shift+A → panel admin
  useEffect(() => {
    const fn = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') navTo('admin');
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => {
    const fn = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const navTo = (section) => {
    dispatch({ type:'SET_SECTION', payload:section });
    setMobileOpen(false);
    setMegaOpen(false);
  };

  const handleSearch = useCallback((val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch({ type:'SET_SEARCH', payload: val, saveToHistory: false });
    }, 150);
  }, [dispatch]);

  const confirmSearch = useCallback((val) => {
    if (!val.trim()) return;
    dispatch({ type:'SET_SEARCH', payload: val, saveToHistory: true });
    setSearchFocused(false);
  }, [dispatch]);

  const pickSuggestion = (p) => {
    setQuery(p.nombre);
    confirmSearch(p.nombre);
  };

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return state.products
      .filter(p => p.nombre.toLowerCase().includes(q) || (p.marca||'').toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, state.products]);

  return (
    <>
      {/* ── Topbar ── */}
      <div className="bg-gray-900 text-gray-400 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Ruta Nacional 6 Km 22,5</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Lun–Sáb: 9:00–21:00</span>
          </div>
          <div className="flex gap-5 items-center">
            <a href="tel:+5493625298918" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3 h-3" /> Llamanos
            </a>
            <ObfuscatedEmail className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <header className={`sticky top-0 z-50 border-b border-gray-100 transition-all duration-200 ${scrolled ? 'navbar-scroll shadow-md' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-3">

          {/* Logo */}
          <button onClick={() => navTo('inicio')} className="flex-shrink-0 mr-2">
            <img src="/logo.png" alt="MaxFarma"
              style={{ height:'72px', width:'auto', minWidth:'140px', maxWidth:'220px' }}
              className="object-contain"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <span className="hidden font-black text-[#C8102E] text-3xl tracking-tight">MaxFarma</span>
          </button>

          {/* ── Mega menu categorías ── */}
          <div className="hidden lg:block relative" onMouseLeave={() => setMegaOpen(false)}>
            <button
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => setMegaOpen(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                megaOpen ? 'bg-[#FFF0F3] text-[#C8102E]' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              <Menu className="w-4 h-4" /> Categorías
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
            </button>

            {megaOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50"
                onMouseEnter={() => setMegaOpen(true)}>
                {/* "Todos" primero */}
                <button
                  onClick={() => { dispatch({ type:'SET_CATEGORY', payload:'todos' }); setMegaOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#C8102E] flex items-center justify-center transition-colors flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#C8102E] transition-colors">
                    Todos los productos
                  </span>
                </button>

                {/* Separador */}
                <div className="mx-4 my-1 border-t border-gray-100" />

                {/* Categorías dinámicas */}
                {cats.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => { dispatch({ type:'SET_CATEGORY', payload:cat.key }); setMegaOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#C8102E] flex items-center justify-center transition-colors flex-shrink-0">
                      <CatIcon catKey={cat.key} className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#C8102E] transition-colors">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Buscador ── */}
          <div className="flex-1 relative hidden sm:block" ref={searchRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscá productos, marcas, laboratorios..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={e => { if (e.key === 'Enter') confirmSearch(query); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:bg-white transition-all"
            />

            {/* Dropdown sugerencias */}
            {searchFocused && (suggestions.length > 0 || state.searchHistory?.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                {suggestions.length > 0 ? (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-1">Sugerencias</p>
                    {suggestions.map(p => {
                      const price = p.precio_oferta && parseFloat(p.precio_oferta) > 0
                        ? parseFloat(p.precio_oferta) : parseFloat(p.precio);
                      return (
                        <button key={p.codigo} onClick={() => pickSuggestion(p)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.imagen_url
                              ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain p-0.5" />
                              : <CatIcon catKey={p.categoria} className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{p.nombre}</p>
                            <p className="text-xs text-gray-400">{p.marca}</p>
                          </div>
                          <span className="text-sm font-bold text-[#C8102E]">${formatPrice(price)}</span>
                        </button>
                      );
                    })}
                  </>
                ) : state.searchHistory?.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-1">Búsquedas recientes</p>
                    {state.searchHistory.map((h, i) => (
                      <button key={i} onClick={() => { setQuery(h); confirmSearch(h); }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm text-gray-600 transition-colors">
                        <Search className="w-3.5 h-3.5 text-gray-300" /> {h}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Nav desktop ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {[['inicio','Inicio'],['productos','Productos'],['ofertas','Ofertas'],['promos','Promos']].map(([k,l]) => (
              <button key={k} onClick={() => navTo(k)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state.currentSection === k
                    ? 'text-[#C8102E] bg-[#FFF0F3]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                {l}
              </button>
            ))}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
            <button onClick={() => navTo('wishlist')}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors hidden sm:flex">
              <Heart className="w-5 h-5 text-gray-600" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C8102E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {wishCount}
                </span>
              )}
            </button>
            <button onClick={() => dispatch({ type:'TOGGLE_CART' })}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5 pr-3 border border-gray-200 hover:border-gray-300">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0
                ? <span className="text-sm font-bold text-[#C8102E]">{cartCount}</span>
                : <span className="text-sm font-medium text-gray-500 hidden sm:block">Carrito</span>}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile search ── */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Buscá productos..." value={query}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') confirmSearch(query); }}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]" />
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-0.5 mb-3">
              {[
                ['inicio',   'Inicio'],
                ['productos','Productos'],
                ['ofertas',  'Ofertas'],
                ['promos',   'Promos Bancarias'],
                ['wishlist', '❤️ Favoritos'],
              ].map(([k,l]) => (
                <button key={k} onClick={() => navTo(k)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  {l}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 mb-2">Categorías</p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => { dispatch({ type:'SET_CATEGORY', payload:'todos' }); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <ShoppingBag className="w-4 h-4 text-gray-400" /> Todos
                </button>
                {cats.map((cat) => (
                  <button key={cat.key}
                    onClick={() => { dispatch({ type:'SET_CATEGORY', payload:cat.key }); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    <CatIcon catKey={cat.key} className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
