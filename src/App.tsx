import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategories, getProjects, getClients } from './lib/portfolioApi';
import { supabase } from './lib/supabase';
import AdminLogin from './AdminLogin';
import { getSession } from './lib/auth';
import { logoUrl } from './data';
import { CustomCursor, Navbar, Footer } from './components';
import AboutPage from './AboutPage';
import { Dashboard, Project, Client } from './Dashboard';

// ─────────────────────────────────────────────────────────────
//  LIGHTBOX — uses createPortal so it renders directly inside
//  <body>, completely outside every stacking context. Nothing
//  can ever overlap it.
// ─────────────────────────────────────────────────────────────

const BRAND_COLOR = '#c8a96e'; // match your --color-brand / tailwind brand color

const Lightbox = ({ images, onClose }: { images: string[]; onClose: () => void }) => {
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const touchStartX = React.useRef<number | null>(null);

  const next = useCallback(() => {
    setLoaded(false);
    setIdx(i => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setLoaded(false);
    setIdx(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // keyboard nav + scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, next, prev]);

  const modal = (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2147483647,           // absolute maximum z-index
        backgroundColor: 'rgba(0,0,0,0.96)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        touchStartX.current = null;
      }}
    >
      {/* ── backdrop: clicking here closes ── */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* ── CLOSE button ── */}
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          background: BRAND_COLOR,
          color: '#000',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2147483647,
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          flexShrink: 0,
        }}
      >
        <X size={24} strokeWidth={2.5} />
      </button>

      {/* ── counter ── */}
      {images.length > 1 && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 14px',
            borderRadius: 999,
            letterSpacing: '0.12em',
            pointerEvents: 'none',
            zIndex: 2147483647,
            whiteSpace: 'nowrap',
          }}
        >
          {idx + 1} / {images.length}
        </div>
      )}

      {/* ── PREV button ── */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          aria-label="Previous image"
          style={{
            position: 'fixed',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2147483647,
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
      )}

      {/* ── NEXT button ── */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          aria-label="Next image"
          style={{
            position: 'fixed',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2147483647,
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ChevronRight size={26} strokeWidth={2.5} />
        </button>
      )}

      {/* ── image wrapper ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 2147483646,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '72px 80px 56px',
          maxWidth: '100vw',
          maxHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* spinner */}
        {!loaded && (
          <>
            <style>{`
              @keyframes _lb_spin { to { transform: rotate(360deg); } }
            `}</style>
            <div style={{
              position: 'absolute',
              width: 36, height: 36,
              border: `3px solid ${BRAND_COLOR}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: '_lb_spin 0.7s linear infinite',
            }} />
          </>
        )}

        <img
          key={images[idx]}
          src={images[idx]}
          alt={`Image ${idx + 1}`}
          onLoad={() => setLoaded(true)}
          draggable={false}
          style={{
            display: 'block',
            maxHeight: 'calc(100vh - 130px)',
            maxWidth: 'calc(100vw - 160px)',
            objectFit: 'contain',
            userSelect: 'none',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        />
      </div>

      {/* ── dot indicators ── */}
      {images.length > 1 && images.length <= 12 && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          pointerEvents: 'none',
          zIndex: 2147483647,
        }}>
          {images.map((_, i) => (
            <div key={i} style={{
              height: 6,
              width: i === idx ? 18 : 6,
              borderRadius: 999,
              background: i === idx ? BRAND_COLOR : 'rgba(255,255,255,0.25)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      )}
    </div>
  );

  // Portal renders into document.body — completely outside React tree stacking
  return createPortal(modal, document.body);
};

// ─────────────────────────────────────────────────────────────
//  CATEGORY PAGE
// ─────────────────────────────────────────────────────────────

const CategoryPage = ({
  category, onBack, projects, covers, brochures,
}: {
  category: string;
  onBack: () => void;
  projects: Project[];
  covers: Record<string, string>;
  brochures: Record<string, string>;
}) => {
  const safeProjects = useMemo(
    () => (projects || []).filter(p => p && p.category === category),
    [category, projects]
  );

  const coverImage = covers[category];
  const brochureUrl = brochures[category];
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [category]);

  const handleProjectClick = (project: Project) => {
    const imgs = [project.img, ...(project.gallery || [])].filter(Boolean);
    if (imgs.length) setLightboxImages(imgs);
  };

  return (
    <div className="min-h-screen bg-dark text-white selection:bg-brand selection:text-black animate-fade-in">
      <CustomCursor />

      {lightboxImages && (
        <Lightbox images={lightboxImages} onClose={() => setLightboxImages(null)} />
      )}

      {/* Nav */}
      <nav className="fixed w-full z-50 py-5 md:py-8 bg-dark/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <button
            onClick={onBack}
            className="group flex items-center gap-3 md:gap-4 text-white hover:text-brand transition-colors"
          >
            <ArrowLeft className="group-hover:-translate-x-2 transition-transform duration-300" size={22} />
            <span className="font-bold tracking-[0.2em] uppercase text-sm md:text-base">Back</span>
          </button>
          <img src={logoUrl} alt="DTAIL" className="h-8 md:h-10 w-auto object-contain" />
        </div>
      </nav>

      <main className="relative">
        {/* Hero */}
        <div className="relative pt-28 md:pt-40 pb-10 md:pb-20 px-6 md:px-12 min-h-[40vh] md:min-h-[60vh] flex flex-col justify-center">
          {coverImage && (
            <div className="absolute inset-0 w-full h-full z-0">
              <img src={coverImage} className="w-full h-full object-cover opacity-60" alt={category + ' Cover'} />
              <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/50 to-dark" />
            </div>
          )}
          <div className="container mx-auto relative z-10 text-center">
            <h1 className="text-[14vw] md:text-[12vw] leading-[0.85] font-black font-display uppercase mb-3 md:mb-8 text-transparent text-stroke text-stroke-hover">
              {category}
            </h1>
            <p className="text-sm md:text-2xl text-gray-200 mb-6 md:mb-12 max-w-2xl mx-auto font-light px-2">
              Curated selection of our finest work in {category.toLowerCase()}.
            </p>
            {category.toLowerCase() === 'corporate gifts' && brochureUrl && (
              <div className="mt-4">
                <a
                  href={brochureUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-brand text-black px-6 py-3 md:px-8 md:py-4 font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all text-xs md:text-sm"
                >
                  Download Brochure
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="px-4 md:px-12 container mx-auto pb-16 md:pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {safeProjects.map(project => (
              <div
                key={project.id}
                className="group cursor-pointer"
                onClick={() => handleProjectClick(project)}
              >
                <div className="relative overflow-hidden border-2 border-transparent group-hover:border-brand transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={project.img} alt={project.title} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 px-4">
                        <h2 className="text-lg md:text-3xl font-display font-bold uppercase text-white mb-2">{project.title}</h2>
                        <div className="inline-block bg-brand text-black px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs uppercase tracking-widest">
                          View Images
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {safeProjects.length === 0 && (
            <div className="py-16 md:py-20 text-center border-y border-white/10">
              <h3 className="text-xl md:text-4xl font-display text-gray-600 uppercase">More projects coming soon.</h3>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  HOME PAGE
// ─────────────────────────────────────────────────────────────

const HomePage = ({
  onCategoryClick, onAboutClick, categories, clients, covers,
}: {
  onCategoryClick: (c: string) => void;
  onAboutClick: () => void;
  categories: string[];
  clients: Client[];
  covers: Record<string, string>;
}) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand selection:text-black relative animate-fade-in">
      <CustomCursor />
      <Navbar
        categories={categories}
        onCategoryClick={onCategoryClick}
        onHomeClick={() => window.scrollTo(0, 0)}
        onAboutClick={onAboutClick}
      />

      {/* HERO */}
      <section className="relative pt-24 pb-14 px-6 md:px-14 min-h-[90vh] md:min-h-[95vh] flex flex-col justify-center border-b border-white/10">
        <div className="container mx-auto">
         <h1
  className="text-[18vw] md:text-[11vw] leading-[0.92] md:leading-[0.9] font-black tracking-[-0.01em] break-words z-10 relative uppercase pt-6 md:pt-8 max-w-[90vw]"
>
  DREAM<br />
  <span className="text-stroke text-stroke-hover transition-all duration-500 cursor-default">
    DESIGN
  </span>
  <br />
  DEFINE<span className="text-brand">.</span>
</h1>
          <div className="mt-8 md:mt-32 flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-12">
            <p className="text-sm md:text-3xl max-w-2xl font-light leading-relaxed text-gray-400">
              We are a creative agency obsessed with the{' '}
              <span className="font-bold text-brand">details</span>. We build brands, platforms, and experiences that define tomorrow.
            </p>
            <div className="flex items-center gap-3 md:gap-6 shrink-0 animate-bounce duration-[2000ms]">
              <div className="h-11 w-11 md:h-20 md:w-20 rounded-full border-[3px] md:border-4 border-brand text-brand flex items-center justify-center bg-brand/5 backdrop-blur-sm">
                <ArrowDownRight size={20} className="md:w-[40px] md:h-[40px]" strokeWidth={3} />
              </div>
              <span className="font-bold tracking-[0.25em] text-[10px] md:text-sm text-brand uppercase">Scroll Down</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -z-10 w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] bg-brand/5 rounded-full blur-[100px] md:blur-[150px] pointer-events-none" />
      </section>

      {/* CATEGORIES */}
      <section className="py-10 md:py-24 bg-white text-black relative" id="agency">
        <div className="container mx-auto px-5 md:px-12">
          <div className="mb-7 md:mb-20 flex items-center gap-3 md:gap-4">
            <div className="h-4 w-4 md:h-8 md:w-8 bg-brand shrink-0" />
            <h2 className="text-[10px] md:text-sm font-extrabold tracking-[0.3em] uppercase">Select a Category</h2>
          </div>
          <div className="flex flex-col">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => onCategoryClick(category)}
                className="group border-b-[3px] md:border-b-[6px] border-black py-5 md:py-16 flex justify-between items-center transition-all duration-500 hover:bg-brand hover:px-5 md:hover:px-8 cursor-pointer relative overflow-hidden"
              >
                <h3 className="text-3xl md:text-8xl font-display font-black uppercase tracking-tight group-hover:translate-x-2 md:group-hover:translate-x-4 transition-transform duration-300 relative z-10 leading-none">
                  {category}
                </h3>
                <span className="flex h-9 w-9 md:h-24 md:w-24 rounded-full border-[2px] md:border-4 border-black items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 rotate-[-45deg] group-hover:rotate-0 transition-all duration-500 bg-black text-brand relative z-10 shrink-0">
                  <ArrowRight size={16} className="md:w-12 md:h-12" strokeWidth={3} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORK */}
      <section className="py-12 md:py-32 px-5 md:px-12 bg-dark" id="work">
       <div className="container mx-auto flex items-center min-h-[70vh]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-32 border-b border-white/20 pb-6 md:pb-12">
            <h2 className="text-4xl md:text-[10vw] leading-[0.9] md:leading-[0.8] font-display font-extrabold uppercase">
              Explore<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-white">Work</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-x-16 md:gap-y-32">
            {categories.map((category, idx) => (
              <div
                key={category}
                className={`group cursor-pointer ${idx % 2 !== 0 ? 'md:mt-32' : ''}`}
                onClick={() => onCategoryClick(category)}
              >
                <div className="relative overflow-hidden mb-3 md:mb-8 border-2 border-transparent group-hover:border-brand transition-all duration-300">
                  <div className="aspect-[4/3] md:aspect-[4/5] overflow-hidden relative">
                    <img
                      src={covers[category] || 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop'}
                      alt={category}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply" />
                  </div>
                  <div className="absolute bottom-0 right-0 overflow-hidden">
                    <div className="h-8 w-8 md:h-20 md:w-20 bg-brand flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <ArrowDownRight className="text-black w-4 h-4 md:w-10 md:h-10" strokeWidth={3} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 md:gap-2">
                  <h3 className="text-sm md:text-5xl font-display font-bold uppercase leading-tight">{category}</h3>
                  <p className="text-brand font-mono uppercase tracking-widest text-[9px] md:text-xs font-bold">View Category →</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTS */}
     {/* ── CLIENTS ── */}
<section className="py-14 md:py-32 border-t border-white/10 bg-dark relative z-10 overflow-hidden">
  <div className="container mx-auto px-5 md:px-12 mb-8 md:mb-20">
    <h2 className="text-3xl md:text-7xl font-display font-black uppercase">
      Selected Partners
    </h2>
  </div>

  {clients.length === 0 ? (
    <div className="px-5 md:px-12">
      <p className="text-gray-500 text-sm md:text-base">
        No clients added yet.
      </p>
    </div>
  ) : (
    <div className="relative w-full flex overflow-hidden group">
      <div className="flex animate-marquee whitespace-nowrap">
        {clients.concat(clients).map((client, index) => (
          <div
            key={index}
            className="w-36 h-16 md:w-80 md:h-40 flex-shrink-0 flex items-center justify-center mx-5 md:mx-8"
          >
            <img
              src={client.logo}
              alt={client.name}
              className="max-h-full max-w-full object-contain opacity-80 hover:opacity-100 transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  )}
</section>

      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  ROUTE WRAPPERS
// ─────────────────────────────────────────────────────────────

type PortfolioState = {
  projects: Project[];
  setProjects: (p: Project[]) => void;
  categories: string[];
  setCategories: (c: string[]) => void;
  clients: Client[];
  setClients: (cl: Client[]) => void;
  covers: Record<string, string>;
  setCovers: (cv: Record<string, string>) => void;
  handleReset: () => void;
  categoryMap: Record<string, string>;
  brochures: Record<string, string>;
};

const HomeRoute = ({ categories, clients, covers }: PortfolioState) => {
  const navigate = useNavigate();
  return (
    <HomePage
      categories={categories} clients={clients} covers={covers}
      onAboutClick={() => navigate('/about')}
      onCategoryClick={cat => navigate(`/category/${encodeURIComponent(cat)}`)}
    />
  );
};

const CategoryRoute = ({ projects, covers, brochures }: PortfolioState) => {
  const navigate = useNavigate();
  const { category = '' } = useParams();
  return (
    <CategoryPage
      category={decodeURIComponent(category)}
      onBack={() => navigate('/')}
      projects={projects} covers={covers} brochures={brochures}
    />
  );
};

const AboutRoute = () => {
  const navigate = useNavigate();
  return <AboutPage onBack={() => navigate('/')} />;
};

const DashboardRoute = ({
  categories, categoryMap, projects, clients, covers,
  setCategories, setProjects, setClients, setCovers, handleReset,
}: PortfolioState) => {
  const navigate = useNavigate();
  return (
    <Dashboard
      categories={categories} categoryMap={categoryMap}
      projects={projects} clients={clients} categoryCovers={covers}
      setCategories={setCategories} setProjects={setProjects}
      setClients={setClients} setCategoryCovers={setCovers}
      onBack={() => navigate('/')} onReset={handleReset}
    />
  );
};

// ─────────────────────────────────────────────────────────────
//  PROTECTED ROUTE
// ─────────────────────────────────────────────────────────────

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    getSession().then(({ data }) => setAllowed(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAllowed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (allowed === null)
    return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Checking access...</div>;
  if (!allowed) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────
//  APP
// ─────────────────────────────────────────────────────────────

const App = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [brochures, setBrochures] = useState<Record<string, string>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  useEffect(() => {
    getProjects().then(({ data, error }) => {
      if (error) { console.error(error); return; }
      if (data) setProjects(data.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        category: item.categories?.name || '',
        img: item.image_url,
        gallery: item.thumbnail_url ? [item.thumbnail_url] : [],
      })));
    });
  }, []);

  useEffect(() => {
    getCategories().then(({ data, error }) => {
      if (error) { console.error(error); return; }
      if (data) {
        setCategories(data.map((item: any) => item.name));
        const brochureMap: Record<string, string> = {};
        const map: Record<string, string> = {};
        const coverMap: Record<string, string> = {};
        data.forEach((item: any) => {
          map[item.name] = item.id;
          if (item.cover_url) coverMap[item.name] = item.cover_url;
          if (item.brochure_url) brochureMap[item.name] = item.brochure_url;
        });
        setCategoryMap(map);
        setCovers(prev => ({ ...prev, ...coverMap }));
        setBrochures(brochureMap);
      }
    });
  }, []);

  useEffect(() => {
    getClients().then(({ data, error }) => {
      if (error) { console.error(error); return; }
      if (data) setClients(data.map((item: any) => ({
        id: item.id,
        name: item.name || 'Client',
        logo: item.logo_url,
      })));
    });
  }, []);

  const handleReset = () => {
    if (confirm('This will restore initial demo data and clear your changes. Continue?')) {
      localStorage.clear();
      window.location.href = import.meta.env.BASE_URL || '/';
    }
  };

  const state: PortfolioState = {
    projects, setProjects,
    categories, setCategories,
    clients, setClients,
    covers, setCovers,
    handleReset, categoryMap, brochures,
  };

  return (
    <div className="bg-dark text-white min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<HomeRoute {...state} />} />
        <Route path="/about" element={<AboutRoute />} />
        <Route path="/category/:category" element={<CategoryRoute {...state} />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/dtail-admin"
          element={
            <ProtectedAdminRoute>
              <DashboardRoute {...state} />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;