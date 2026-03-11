'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore, UserProfile } from '../store/useAuthStore';

export function AuthModal() {
    const { isAuthModalOpen, closeAuthModal, authAction, user, profile, setProfile } = useAuthStore();
    const [mode, setMode] = useState<'login' | 'register' | 'setup_profile'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to handle state changes when modal opens or user logs in
    useEffect(() => {
        if (isAuthModalOpen) {
            if (user) {
                if (!profile?.username) {
                    setMode('setup_profile');
                } else {
                    closeAuthModal(); // Already fully logged in and profile setup
                }
            } else {
                setMode('login');
            }
        }
    }, [isAuthModalOpen, user, profile, closeAuthModal]);

    if (!isAuthModalOpen) return null;

    const calculatePasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length > 5) score += 20;
        if (pass.length > 8) score += 20;
        if (/[A-Z]/.test(pass)) score += 20;
        if (/[0-9]/.test(pass)) score += 20;
        if (/[^A-Za-z0-9]/.test(pass)) score += 20;
        return Math.min(100, score);
    };

    const passwordStrength = calculatePasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === 'register' && password !== confirmPassword) {
            setError('Şifreler eşleşmiyor!');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'setup_profile' && user) {
                // Check if username is already taken
                const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', usernameInput.trim()).single();
                if (existingUser && existingUser.id !== user.id) {
                    throw new Error('Bu kullanıcı adı maalesef alınmış. Lütfen başka bir tane deneyin.');
                }

                const { error: updateError } = await supabase.from('profiles').update({ username: usernameInput.trim() }).eq('id', user.id);
                if (updateError) throw updateError;

                // Fetch profile again to update store immediately
                const { data: newProfile } = await supabase.from('profiles').select('id, email, username, role').eq('id', user.id).single();
                if (newProfile) setProfile(newProfile as UserProfile);

                closeAuthModal();
                setMode('login'); // Reset for next time
            } else if (mode === 'register') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: window.location.origin }
                });
                if (error) throw error;
                setError('Kayıt başarılı! Giriş yapabilirsiniz. (E-posta doğrulaması gerekebilir)');
                setMode('login');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                if (data.user) {
                    const { data: profileData } = await supabase.from('profiles').select('username').eq('id', data.user.id).single();
                    if (!profileData?.username) {
                        setMode('setup_profile');
                    } else {
                        closeAuthModal();
                    }
                } else {
                    closeAuthModal();
                }
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleModeChange = (newMode: 'login' | 'register') => {
        setMode(newMode);
        setError(null);
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 sm:p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {mode === 'login' && 'Giriş Yap'}
                                    {mode === 'register' && 'Kayıt Ol'}
                                    {mode === 'setup_profile' && 'Profilini Tamamla'}
                                </h2>
                                <p className="text-white/60 text-sm">
                                    {mode === 'setup_profile' && 'Toplulukta seni nasıl tanıyacağımızı belirle!'}
                                    {mode !== 'setup_profile' && authAction === 'eq' && 'Ekolayzer ayarlarını kaydetmek için giriş yapmalısınız.'}
                                    {mode !== 'setup_profile' && authAction === 'favorite' && 'Favori istasyon eklemek için giriş yapmalısınız.'}
                                    {mode !== 'setup_profile' && !authAction && 'RadyoBizden hesabınıza erişin.'}
                                </p>
                            </div>
                            <button
                                onClick={closeAuthModal}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className={`p-4 mb-6 rounded-xl flex items-start gap-3 text-sm ${error.includes('başarılı') ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 'bg-red-500/20 text-red-200 border border-red-500/30'}`}>
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'setup_profile' ? (
                                <div>
                                    <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Kullanıcı Adı</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                        <input
                                            type="text"
                                            value={usernameInput}
                                            onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            required
                                            maxLength={20}
                                            minLength={3}
                                            placeholder="sadece_harf_ve_sayi"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-white/40 mt-1.5 ml-2">Sadece küçük harf, rakam ve altçizgi (_)</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">E-posta</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                placeholder="ornek@mail.com"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Şifre</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                minLength={6}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                            />
                                        </div>
                                        {mode === 'register' && password.length > 0 && (
                                            <div className="mt-2 ml-1">
                                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                                                    <div className={`h-full transition-all duration-300 ${passwordStrength >= 20 ? (passwordStrength >= 80 ? 'bg-green-500' : passwordStrength >= 60 ? 'bg-yellow-500' : 'bg-red-500') : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                    <div className={`h-full transition-all duration-300 ${passwordStrength >= 40 ? (passwordStrength >= 80 ? 'bg-green-500' : passwordStrength >= 60 ? 'bg-yellow-500' : 'bg-red-500') : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                    <div className={`h-full transition-all duration-300 ${passwordStrength >= 60 ? (passwordStrength >= 80 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                    <div className={`h-full transition-all duration-300 ${passwordStrength >= 80 ? 'bg-green-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                </div>
                                                <p className="text-[10px] text-white/40 mt-1 flex justify-between">
                                                    <span>Güvenlik Seviyesi</span>
                                                    <span>{passwordStrength >= 80 ? 'Güçlü' : passwordStrength >= 60 ? 'Orta' : 'Zayıf'}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {mode === 'register' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1 mt-4">Şifre Tekrar</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                    minLength={6}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={loading || (mode === 'setup_profile' && usernameInput.length < 3)}
                                className="w-full mt-6 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_var(--glow-color)] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Hesap Oluştur' : 'Profilimi Kaydet')}
                            </button>
                        </form>

                        {mode !== 'setup_profile' && (
                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
                                    className="text-sm text-white/70 hover:text-white transition-colors"
                                >
                                    {mode === 'login' ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
