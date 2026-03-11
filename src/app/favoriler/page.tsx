'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { RadioCard } from '@/components/RadioCard';
import { Heart, History } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Favoriler() {
    const { favorites, history, play } = usePlayerStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // Prevent hydration mismatch due to persisted store

    return (
        <div className="flex flex-col gap-12 pb-12 w-full">
            {/* Favoriler Bölümü */}
            <div>
                <div className="py-6 border-b border-[var(--glass-border)] flex flex-col gap-2 mb-6">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Heart className="text-red-500" size={28} />
                        Favorilerim
                    </h1>
                    <p className="text-white/60">Beğendiğiniz radyo istasyonları burada saklanır.</p>
                </div>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((station) => (
                            <RadioCard key={`fav-${station.stationuuid}`} station={station} onPlay={(s) => play(s, favorites)} />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-white/20">
                        <Heart size={48} className="text-white/20" />
                        <p className="text-white/50">Henüz favorilere eklenmiş bir radyo bulunmuyor.</p>
                    </div>
                )}
            </div>

            {/* Son Dinlenenler Bölümü */}
            <div>
                <div className="py-6 border-b border-[var(--glass-border)] flex flex-col gap-2 mb-6">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <History className="text-[var(--primary)]" size={24} />
                        Son Dinlenenler
                    </h1>
                    <p className="text-white/60">Yakın zamanda dinlediğiniz radyolar geçmişi.</p>
                </div>

                {history.length > 0 ? (
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                        {history.map((station) => (
                            <div key={`hist-${station.stationuuid}`} className="min-w-[280px] w-[280px] snap-start shrink-0">
                                <RadioCard station={station} onPlay={(s) => play(s, history)} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-white/20">
                        <History size={48} className="text-white/20" />
                        <p className="text-white/50">Yakın zamanda dinlediğiniz bir radyo bulunmuyor.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
