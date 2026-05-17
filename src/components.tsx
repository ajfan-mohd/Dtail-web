import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Instagram, Facebook, ChevronDown } from 'lucide-react';
import { logoUrl } from './data';

export const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 w-8 h-8 border-2 border-brand rounded-full pointer-events-none z-[100] hidden md:block mix-blend-difference will-change-transform"
        />
    );
};

export const Navbar = ({
  onCategoryClick,
  onHomeClick,
  onAboutClick,
  categories,
}: {
  onCategoryClick: (c: string) => void;
  onHomeClick: () => void;
  onAboutClick: () => void;
  categories: string[];
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
    const servicesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Only lock scroll when menu is open AND no lightbox is open
        // We check by looking for the lightbox backdrop (z-index 99999)
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setIsMenuOpen(false); setServicesOpen(false); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
                setServicesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCategoryNavigate = (cat: string) => {
        window.location.href = `/category/${cat}`;
        setIsMenuOpen(false);
        setServicesOpen(false);
        setMobileServicesOpen(false);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setMobileServicesOpen(false);
    };

    return (
        <>
        <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-white/10' : 'border-transparent py-6 md:py-8'}`}>
            <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
                <button onClick={() => { onHomeClick(); closeMenu(); }} className="hover:opacity-80 transition-opacity duration-300 block">
                    <img src={logoUrl} alt="DTAIL Agency" className="h-8 md:h-10 w-auto object-contain" />
                </button>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-12">
                    <button
                        onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-sm font-bold tracking-[0.2em] hover:text-brand transition-colors"
                    >
                        WORK
                    </button>

                    <div className="relative" ref={servicesRef}>
                        <button
                            onClick={() => setServicesOpen(v => !v)}
                            className="flex items-center gap-1.5 text-sm font-bold tracking-[0.2em] hover:text-brand transition-colors"
                        >
                            SERVICES
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-300 ${servicesOpen ? 'rotate-180 text-brand' : ''}`}
                            />
                        </button>

                        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-6 w-56 bg-[#0f0f0f] border border-white/10 transition-all duration-300 origin-top ${servicesOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'}`}>
                            <div className="py-2">
                                {categories.map((cat, i) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryNavigate(cat)}
                                        className="w-full text-left px-5 py-3 text-sm font-bold tracking-widest uppercase text-gray-300 hover:text-brand hover:bg-white/5 transition-all duration-150 border-b border-white/5 last:border-none"
                                    >
                                        <span className="text-brand/40 text-xs mr-3">0{i + 1}</span>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onAboutClick}
                        className="text-sm font-bold tracking-[0.2em] hover:text-brand transition-colors uppercase"
                    >
                        ABOUT
                    </button>

                    <button
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-3 bg-brand text-black font-extrabold hover:bg-white transition-colors uppercase tracking-widest text-sm"
                    >
                        Let's Talk
                    </button>
                </div>

                {/* Hamburger */}
                <button
                    className="md:hidden flex flex-col gap-[5px] p-1"
                    onClick={() => setIsMenuOpen(v => !v)}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    <span className={`block w-6 h-[2px] bg-white transition-all duration-300 origin-center ${isMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                    <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                    <span className={`block w-6 h-[2px] bg-white transition-all duration-300 origin-center ${isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
                </button>
            </div>
        </nav>

        {/* Mobile overlay — z-[9000] so lightbox (z-99999) always wins */}
        <div
            style={{ visibility: isMenuOpen ? 'visible' : 'hidden' }}
            className={`fixed inset-0 z-[9000] bg-[#0a0a0a] flex flex-col md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            role="dialog"
            aria-modal="true"
        >
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-white/10">
                <button onClick={() => { onHomeClick(); closeMenu(); }}>
                    <img src={logoUrl} alt="DTAIL Agency" className="h-8 w-auto object-contain" />
                </button>
                <button
                    onClick={closeMenu}
                    aria-label="Close menu"
                    className="text-white hover:text-brand transition-colors p-2"
                >
                    <X size={30} />
                </button>
            </div>

            <div className="flex flex-col flex-1 px-6 pt-8 pb-10 overflow-y-auto">

                {/* Work */}
                <button
                    onClick={() => {
                        closeMenu();
                        onHomeClick();
                        setTimeout(() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}
                    className="group flex items-baseline gap-3 text-left border-b border-white/10 py-6"
                >
                    <span className="text-xs font-bold text-white/25 tracking-widest w-6">01</span>
                    <span className="text-4xl font-black tracking-tight text-white group-hover:text-brand transition-colors leading-none font-display">Work</span>
                </button>

                {/* Services accordion */}
                <div className="border-b border-white/10">
                    <button
                        onClick={() => setMobileServicesOpen(v => !v)}
                        className="group flex items-center justify-between w-full text-left py-6"
                    >
                        <div className="flex items-baseline gap-3">
                            <span className="text-xs font-bold text-white/25 tracking-widest w-6">02</span>
                            <span className="text-4xl font-black tracking-tight text-white group-hover:text-brand transition-colors leading-none font-display">Services</span>
                        </div>
                        <ChevronDown
                            size={20}
                            className={`text-white/40 transition-transform duration-300 shrink-0 ${mobileServicesOpen ? 'rotate-180 text-brand' : ''}`}
                        />
                    </button>

                    {mobileServicesOpen && (
                        <div className="flex flex-col pb-4 pl-9">
                            {(categories ?? []).length === 0 ? (
                                <p className="text-white/30 text-sm py-2">No services found</p>
                            ) : (
                                (categories ?? []).map((cat, i) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryNavigate(cat)}
                                        className="flex items-center gap-3 text-left py-3 px-3 rounded hover:bg-white/5 transition-colors group/cat"
                                    >
                                        <span className="text-brand/50 text-xs font-bold w-5 shrink-0">0{i + 1}</span>
                                        <span className="text-sm font-bold tracking-widest uppercase text-gray-400 group-hover/cat:text-brand transition-colors">{cat}</span>
                                        <span className="ml-auto text-white/20 group-hover/cat:text-brand transition-colors text-sm">→</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* About */}
                <button
                    onClick={() => { onAboutClick(); closeMenu(); }}
                    className="group flex items-baseline gap-3 text-left border-b border-white/10 py-6"
                >
                    <span className="text-xs font-bold text-white/25 tracking-widest w-6">03</span>
                    <span className="text-4xl font-black tracking-tight text-white group-hover:text-brand transition-colors leading-none font-display">About</span>
                </button>

                {/* Let's Talk */}
                <button
                    onClick={() => {
                        closeMenu();
                        setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}
                    className="group flex items-baseline gap-3 text-left py-6"
                >
                    <span className="text-xs font-bold text-brand/30 tracking-widest w-6">04</span>
                    <span className="text-4xl font-black tracking-tight text-brand group-hover:text-white transition-colors leading-none font-display">Let's Talk</span>
                </button>

                {/* Footer */}
                <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-6">
                    <div className="flex gap-3">
                        {[Instagram, Facebook].map((Icon, i) => (
                            <a key={i} href="https://www.instagram.com/dtail.agency/" className="h-12 w-12 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-brand hover:text-black hover:border-brand transition-all duration-300">
                                <Icon size={22} />
                            </a>
                        ))}
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] tracking-widest text-white/30 uppercase mb-1">Based in</p>
                        <p className="text-sm font-bold text-brand tracking-widest uppercase">Dubai, UAE</p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export const Footer = () => (
    <section className="bg-neutral-900 pt-16 pb-12 md:pt-32 px-6 md:px-12 border-t border-white/10 relative z-10" id="contact">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 md:gap-16 md:mb-24">
                <div>
                    <h2 style={{ letterSpacing: "0.05em" }} className="text-6xl md:text-[10rem] font-display font-black leading-[0.8] mb-8 md:mb-12 tracking-tighter text-white">
                        LET'S<br />TALK<span className="text-brand">.</span>
                    </h2>
                    <p className="text-xl md:text-3xl text-gray-400 max-w-xl leading-relaxed">
                        Have an idea? We would love to hear about it. Drop us a line and let's create something extraordinary together.
                    </p>
                </div>

                <div className="flex flex-col justify-end lg:items-end">
                    <a href="mailto:info@dtailhub.com" className="text-2xl md:text-7xl font-bold text-white hover:text-brand border-b-4 md:border-b-8 border-white/20 hover:border-brand pb-4 md:pb-6 mb-6 md:mb-8 transition-all inline-block break-all leading-tight">
                        info@dtailhub.com
                    </a>
                    <a href="tel:+971527885798" className="text-xl md:text-4xl font-bold text-gray-300 hover:text-brand mb-12 md:mb-16 block transition-colors">
                        +971 52 788 5798
                    </a>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-2xl">
                        <div>
                            <h4 className="text-brand font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">Visit Us</h4>
                            <p className="text-xl md:text-2xl font-medium text-gray-300">Dubai, UAE</p>
                        </div>
                        <div>
                            <h4 className="text-brand font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">Follow Us</h4>
                            <div className="flex gap-4 md:gap-6">
                                {[Instagram, Facebook].map((Icon, i) => (
                                    <a key={i} href="https://www.instagram.com/dtail.agency/" className="h-12 w-12 md:h-16 md:w-16 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-brand hover:text-black hover:border-brand transition-all duration-300">
                                        <Icon size={24} className="md:w-[28px] md:h-[28px]" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 pt-8 md:pt-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
                <p className="text-gray-500 text-sm md:text-lg text-center md:text-left">© 2024 DTAIL Agency. All Rights Reserved.</p>
            </div>
        </div>
    </section>
);