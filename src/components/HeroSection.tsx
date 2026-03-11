'use client';

import { motion } from 'framer-motion';
import { Play, Music } from 'lucide-react';

export function HeroSection() {
    return (
        <div className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center text-center">
            {/* Floating Note Icons */}
            <motion.div
                animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-10 left-[20%] text-white/40 hidden md:block"
            >
                <Music size={32} />
            </motion.div>
            <motion.div
                animate={{ y: [0, 20, 0], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-10 right-[25%] text-[var(--primary)]/60 hidden md:block"
            >
                <Music size={40} />
            </motion.div>

            {/* Main Title Area */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
            >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[var(--primary)] drop-shadow-[0_0_25px_var(--glow-color)]">
                    Radyonun Yeni
                    <br className="hidden md:block" /> Boyutu
                </span>
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="glass-panel px-6 py-3 rounded-full mb-12 max-w-lg shadow-[0_0_20px_var(--glow-color)]"
            >
                <p className="text-sm md:text-base font-medium text-white/90">
                    Kesintisiz müzik, canlı istasyonlar ve premium deneyim.
                </p>
            </motion.div>

            {/* Big Play Button with Pulse/Waveform Effect */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative flex items-center justify-center"
            >
                {/* Outer pulse */}
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-[var(--primary)] blur-xl"
                />

                <button className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[var(--primary)] to-white/20 flex items-center justify-center border border-white/30 shadow-[0_0_40px_var(--glow-color)] group transition-transform hover:scale-105 active:scale-95">
                    <Play
                        className="w-10 h-10 md:w-12 md:h-12 ml-2 text-white group-hover:text-white transition-colors"
                        fill="currentColor"
                    />
                </button>

                {/* Decorative Waveforms on sides */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-32 hidden lg:flex items-center gap-1 opacity-70">
                    {[1, 2, 3, 2, 4, 2, 1].map((h, i) => (
                        <motion.div
                            key={`lh-${i}`}
                            animate={{ height: [`${h * 8}px`, `${h * 16}px`, `${h * 8}px`] }}
                            transition={{ duration: 1 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-1.5 rounded-full bg-gradient-to-t from-transparent via-[var(--primary)] to-white/50"
                        />
                    ))}
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-32 hidden lg:flex items-center gap-1 opacity-70">
                    {[1, 2, 4, 2, 3, 2, 1].map((h, i) => (
                        <motion.div
                            key={`rh-${i}`}
                            animate={{ height: [`${h * 8}px`, `${h * 16}px`, `${h * 8}px`] }}
                            transition={{ duration: 1 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-1.5 rounded-full bg-gradient-to-t from-transparent via-[var(--primary)] to-white/50"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
