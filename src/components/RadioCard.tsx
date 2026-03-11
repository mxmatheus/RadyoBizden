'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Users } from 'lucide-react';
import type { Station } from '@/lib/radioBrowser';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';

interface RadioCardProps {
    station: Station;
    onPlay: (station: Station) => void;
}

export function RadioCard({ station, onPlay }: RadioCardProps) {
    const [imgError, setImgError] = useState(false);
    const { favorites, toggleFavorite } = usePlayerStore();
    const { user, openAuthModal } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const isFavorite = mounted && favorites.some(s => s.stationuuid === station.stationuuid);

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-4 flex flex-col gap-4 relative group cursor-pointer overflow-hidden"
            onClick={() => onPlay(station)}
        >
            {/* Background Glow on Hover */}
            <div className="absolute inset-0 bg-[var(--primary)] opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-[var(--glass-border)] shadow-inner overflow-hidden">
                    {station.favicon && !imgError ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={station.favicon}
                            alt={`${station.name} logo`}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="text-2xl font-bold text-white/40">
                            {station.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Live Badge */}
                <div className="flex items-center gap-1.5 bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
                    <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-red-500"
                    />
                    <span className="text-[10px] font-bold text-red-100 uppercase tracking-wider">CANLI</span>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-[var(--primary)] transition-colors">
                    {station.name}
                </h3>

                {/* We would fetch the currently playing song here via stream metadata polling, but for now just showing genre/tags */}
                <p className="text-sm text-white/60 truncate flex items-center gap-1.5">
                    <Users size={12} /> {station.clickcount.toLocaleString()} dinlenme
                </p>
            </div>

            <div className="flex items-center justify-between mt-2 pt-3 border-t border-[var(--glass-border)]">
                <div className="flex flex-wrap gap-1 overflow-hidden h-6">
                    {station.tags.split(',').slice(0, 2).map((tag, idx) => tag.trim() && (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white/70">
                            {tag.trim()}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2 shrink-0">
                    <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/20 text-white/50 hover:text-red-400 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (user) {
                                toggleFavorite(station);
                            } else {
                                openAuthModal('favorite');
                            }
                        }}
                    >
                        <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'text-red-500' : ''} />
                    </button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--primary)] text-white shadow-[0_0_10px_var(--glow-color)] group-hover:scale-110 transition-transform">
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
