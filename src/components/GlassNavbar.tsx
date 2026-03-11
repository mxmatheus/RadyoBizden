'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Search, Menu, X, Heart, User, Radio, Settings2, Palette, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';

export function GlassNavbar() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useThemeStore();
    const pathname = usePathname();
    const favorites = usePlayerStore(state => state.favorites);
    const { user, profile, openAuthModal, signOut } = useAuthStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    const navLinks = [
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Radyolar', path: '/radyolar' },
        { name: 'Keşfet', path: '/kesfet' },
    ];

    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileThemeOpen, setIsMobileThemeOpen] = useState(false);
    const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

    // Theme names mapping
    const themeNames = {
        'default': 'Varsayılan',
        'neon-ates': 'Neon Ateş',
        'orman-yesili': 'Orman Yeşili',
        'gece-moru': 'Gece Moru',
        'gumus-karanlik': 'Gümüş Karanlık',
        'gunes-batimi': 'Gün Batımı',
        'okyanus-derin': 'Okyanus Derin'
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/radyolar?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] py-5"
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between gap-4">

                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-2 group relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_15px_var(--glow-color)] group-hover:shadow-[0_0_25px_var(--glow-color)] transition-all overflow-hidden relative">
                        <Radio className="text-white w-5 h-5 relative z-10" />
                        <div className="absolute inset-0 bg-white/20 blur-md rounded-full transform scale-0 group-hover:scale-150 transition-transform duration-500" />
                    </div>
                    <span className="text-white text-xl font-bold tracking-wide relative">
                        Radyo<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">Bizden</span>
                    </span>
                </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8 justify-center flex-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive
                                        ? 'bg-[var(--primary)] text-white shadow-[0_0_10px_var(--glow-color)]'
                                        : 'hover:bg-[var(--glass-bg)] text-white/80 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 md:gap-4">

                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative hidden md:block group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search size={16} className="text-white/50 group-focus-within:text-[var(--primary)] transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Radyo ara..."
                                className="w-48 lg:w-64 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm rounded-full focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] block pl-10 p-2 text-white placeholder-white/50 outline-none transition-all"
                            />
                        </form>
                        <button 
                            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-white/10 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>

                        {/* Favorites Badge */}
                        <Link href="/favoriler" className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-white/10 transition-colors">
                            <Heart size={18} />
                            {mounted && favorites.length > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[var(--primary)] rounded-full">
                                    {favorites.length}
                                </span>
                            )}
                        </Link>

                        {/* Theme Selector Dropdown */}
                        <div className="relative group hidden sm:block">
                            <button
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-white/10 transition-colors"
                                onClick={() => setShowThemeMenu(!showThemeMenu)}
                                title="Temayı Değiştir"
                                onBlur={() => setTimeout(() => setShowThemeMenu(false), 200)}
                            >
                                <Palette size={18} />
                            </button>

                            {showThemeMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-black/80 backdrop-blur-3xl border border-[var(--glass-border)] rounded-xl shadow-xl py-2 z-50">
                                    <div className="px-4 py-2 border-b border-[var(--glass-border)] mb-2">
                                        <span className="text-xs font-bold text-white/70">TEMA SEÇİMİ</span>
                                    </div>
                                    {Object.entries(themeNames).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setTheme(key as any);
                                                setShowThemeMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${theme === key ? 'text-[var(--primary)] font-bold' : 'text-white'}`}
                                        >
                                            {label}
                                            {theme === key && <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User / Login */}
                        {user ? (
                            <div className="hidden sm:flex items-center justify-center gap-2">
                                {profile?.role === 'admin' && (
                                    <Link href="/admin" className="hidden lg:flex items-center gap-2 text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-full hover:bg-[var(--primary)]/20 transition-colors uppercase tracking-wider border border-[var(--primary)]/20">
                                        Admin
                                    </Link>
                                )}

                                {/* User Dropdown */}
                                <div className="relative group/user">
                                    <button className="flex items-center gap-2 text-sm text-white/80 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-white/10 pr-4">
                                        {!profile ? (
                                            <Loader2 size={16} className="animate-spin text-white/50 m-1" />
                                        ) : profile.username ? (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_var(--glow-color)]">
                                                    {profile.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="max-w-[100px] truncate" title={profile.username}>@{profile.username}</span>
                                            </>
                                        ) : (
                                            <span className="text-yellow-400 flex items-center gap-2 whitespace-nowrap"><AlertCircle size={14} /> Profil Tamamla</span>
                                        )}
                                    </button>

                                    <div className="absolute top-full right-0 mt-2 w-48 bg-black/80 backdrop-blur-3xl border border-[var(--glass-border)] rounded-xl shadow-xl py-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 z-50">
                                        <div className="px-4 py-2 border-b border-[var(--glass-border)] mb-2">
                                            <span className="text-xs font-bold text-white/70">HESABIM</span>
                                        </div>

                                        {profile?.username ? (
                                            <Link href={`/u/${profile.username}`} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center text-white gap-2">
                                                <User size={14} /> Benim Radyolarım
                                            </Link>
                                        ) : (
                                            <button onClick={() => openAuthModal()} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center text-yellow-400 gap-2">
                                                <AlertCircle size={14} /> Profil Oluştur
                                            </button>
                                        )}

                                        <Link href="/profil" className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center text-white gap-2">
                                            <Settings2 size={14} /> Hesap Ayarları
                                        </Link>

                                        <button onClick={() => signOut()} className="w-full text-left px-4 py-3 text-sm hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-2 mt-2 border-t border-white/5">
                                            Çıkış Yap
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => openAuthModal()} className="hidden sm:flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full hover:bg-white/10 transition-colors gap-2">
                                <User size={16} />
                                <span>Giriş / Kayıt</span>
                            </button>
                        )}

                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden mt-4 pt-4 border-t border-[var(--glass-border)] flex flex-col gap-4">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search size={16} className="text-white/50 group-focus-within:text-[var(--primary)] transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Radyo ara..."
                                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm rounded-full focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] block pl-10 p-2 text-white placeholder-white/50 outline-none transition-all"
                            />
                        </form>
                        
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        href={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                            ? 'bg-[var(--primary)] text-white shadow-[0_0_10px_var(--glow-color)]'
                                            : 'hover:bg-[var(--glass-bg)] text-white/80 hover:text-white'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        
                        {/* Mobile User Section */}
                        <div className="flex sm:hidden flex-col gap-2 pt-4 border-t border-[var(--glass-border)]">
                            {user && profile ? (
                                <div className="flex flex-col">
                                    <button 
                                        onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_var(--glow-color)]">
                                                {profile.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-white truncate max-w-[120px]">@{profile.username}</span>
                                        </div>
                                        {isMobileProfileOpen ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                                    </button>

                                    {/* Accordion Content */}
                                    {isMobileProfileOpen && (
                                        <div className="flex flex-col gap-1 mt-2 px-2">
                                            <Link 
                                                href={`/u/${profile.username}`} 
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-2 text-sm text-white/80 hover:text-white py-3 px-3 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <User size={16} /> Benim Radyolarım
                                            </Link>
                                            
                                            {profile.role === 'admin' && (
                                                <Link 
                                                    href="/admin" 
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] py-3 px-3 rounded-lg hover:bg-[var(--primary)]/10 transition-colors"
                                                >
                                                    <Settings2 size={16} /> Admin Paneli
                                                </Link>
                                            )}
                                            
                                            <Link 
                                                href="/profil" 
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-2 text-sm text-white/80 hover:text-white py-3 px-3 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <Settings2 size={16} /> Hesap Ayarları
                                            </Link>
                                            
                                            <button 
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    signOut();
                                                }} 
                                                className="flex items-center w-full gap-2 text-sm text-red-400 hover:text-red-300 py-3 px-3 rounded-lg hover:bg-red-500/10 transition-colors"
                                            >
                                                <AlertCircle size={16} /> Çıkış Yap
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button 
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        openAuthModal();
                                    }} 
                                    className="flex w-full items-center justify-center px-4 py-3 text-sm font-medium text-white bg-[var(--primary)] rounded-xl shadow-[0_0_15px_var(--glow-color)] gap-2"
                                >
                                    <User size={16} />
                                    <span>Giriş Yap / Kayıt Ol</span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Theme Switcher Accordion */}
                        <div className="flex sm:hidden flex-col gap-2 pt-2 pb-4">
                            <button 
                                onClick={() => setIsMobileThemeOpen(!isMobileThemeOpen)}
                                className="flex items-center justify-between w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <span className="text-sm font-medium text-white flex items-center gap-2">
                                    <Palette size={16} /> Tema Seçimi
                                </span>
                                {isMobileThemeOpen ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                            </button>

                            {/* Accordion Content */}
                            {isMobileThemeOpen && (
                                <div className="grid grid-cols-2 gap-2 mt-2 px-2">
                                    {Object.entries(themeNames).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setTheme(key as any);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`px-3 py-3 text-xs rounded-lg text-left transition-colors border ${
                                                theme === key 
                                                ? 'bg-[var(--primary)]/20 border-[var(--primary)]/50 text-white font-medium shadow-[0_0_10px_var(--glow-color)]' 
                                                : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
