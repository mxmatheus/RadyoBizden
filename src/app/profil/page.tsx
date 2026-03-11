'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, User, Mail, Lock, AlertCircle, Save } from 'lucide-react';

export default function ProfileSettingsPage() {
    const { user, profile, setProfile } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!user || user === undefined) {
            router.push('/');
        } else {
            setUsername(profile?.username || '');
            setLoading(false);
        }
    }, [user, profile, router]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) return;
        setSaving(true);

        try {
            // Update Username
            if (username.trim() && username.trim() !== profile?.username) {
                const newUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

                // Check if username taken
                const { data: existing } = await supabase.from('profiles').select('id').eq('username', newUsername).single();
                if (existing && existing.id !== user.id) {
                    throw new Error('Bu kullanıcı adı alınmış.');
                }

                const { error: updateError } = await supabase.from('profiles').update({ username: newUsername }).eq('id', user.id);
                if (updateError) throw updateError;

                if (profile) {
                    setProfile({ ...profile, username: newUsername });
                }
            }

            // Update Password if provided
            if (password) {
                if (password !== confirmPassword) {
                    throw new Error('Şifreler eşleşmiyor!');
                }
                const { error: passError } = await supabase.auth.updateUser({ password });
                if (passError) throw passError;

                setPassword('');
                setConfirmPassword('');
            }

            setSuccess('Profiliniz başarıyla güncellendi.');
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
                <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-12 bg-[var(--background)] px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Profil Ayarları</h1>
                    <p className="text-white/60">Kişisel bilgilerinizi ve hesap güvenliğinizi yönetin.</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 text-red-200 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 mb-6">
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/20 text-green-200 border border-green-500/30 p-4 rounded-xl flex items-center gap-3 mb-6">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                            <span className="text-black text-xs font-bold">✓</span>
                        </div>
                        <p>{success}</p>
                    </div>
                )}

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
                    <form onSubmit={handleSaveProfile} className="space-y-6">

                        <div>
                            <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">E-posta Adresi (Değiştirilemez)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ''}
                                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white/50 cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Kullanıcı Adı</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    maxLength={20}
                                    minLength={3}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-white/40 mt-1.5 ml-2">Diğer kullanıcılar sizi bu isimle bulabilir.</p>
                        </div>

                        <div className="pt-6 border-t border-white/10 mt-6 space-y-6">
                            <h3 className="text-lg font-bold text-white">Şifre Değiştir</h3>
                            <p className="text-sm text-white/40 -mt-4">Şifrenizi değiştirmek istemiyorsanız boş bırakın.</p>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Yeni Şifre</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={6}
                                        placeholder="Yeni şifrenizi girin"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {password && (
                                <div>
                                    <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Yeni Şifre Tekrar</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            minLength={6}
                                            placeholder="Şifreyi onaylayın"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full mt-8 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl hover:opacity-90 flex items-center justify-center gap-2 shadow-[0_0_15px_var(--glow-color)] transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span>Değişiklikleri Kaydet</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
