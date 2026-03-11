import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import { User, Heart } from 'lucide-react';
import type { Station } from '../../../lib/radioBrowser';
import { RadioGrid } from '../../../components/RadioGrid';
import { Metadata } from 'next';

export const revalidate = 0; // Don't cache this page so it updates instantly

// Define proper type for PageProps based on Next.js 15+ patterns
interface PageProps {
    params: {
        username: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `@${username} | RadyoBizden Profil`,
        description: `@${username} kullanıcısının favori radyoları.`,
    };
}

export default async function ProfilePage({ params }: PageProps) {
    const { username } = await params;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, favorites')
        .eq('username', username)
        .single();

    if (error || !profile) {
        notFound();
    }

    const favorites: Station[] = profile.favorites || [];

    return (
        <main className="min-h-screen pt-24 pb-32">
            <div className="container mx-auto px-4 md:px-6">

                {/* Profile Header */}
                <div className="glass-card p-8 rounded-3xl mb-12 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent opacity-50" />

                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[var(--primary)] text-white shadow-[0_0_30px_var(--glow-color)] flex items-center justify-center text-4xl sm:text-6xl font-bold mb-6 relative z-10 border-4 border-white/10 group-hover:scale-105 transition-transform duration-500">
                        {profile.username.charAt(0).toUpperCase()}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black text-white relative z-10">
                        @{profile.username}
                    </h1>

                    <div className="flex items-center gap-2 mt-4 text-white/60 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm relative z-10 border border-white/5">
                        <Heart size={16} className="text-[var(--primary)]" />
                        <span>{favorites.length} Favori İstasyon</span>
                    </div>
                </div>

                {/* Favorites List */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-8">
                        <User className="text-[var(--primary)]" size={28} />
                        <h2 className="text-2xl font-bold text-white">Favori Radyolar</h2>
                    </div>

                    {favorites.length > 0 ? (
                        <RadioGrid predefinedStations={favorites} />
                    ) : (
                        <div className="text-center py-20 glass-card rounded-3xl">
                            <Heart size={48} className="mx-auto text-white/20 mb-4" />
                            <p className="text-xl text-white/50">Bu kullanıcının henüz favori radyosu yok.</p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
