'use client';

import { RadioGrid } from '@/components/RadioGrid';
import { Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Kesfet() {
    return (
        <div className="flex flex-col gap-12 pb-12 w-full">
            <div className="py-6 border-b border-[var(--glass-border)] flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Sparkles className="text-[var(--primary)]" size={28} />
                    Keşfet
                </h1>
                <p className="text-white/60">Sizin için seçtiğimiz özel radyoları ve trendleri keşfedin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 flex flex-col justify-center gap-4 bg-gradient-to-br from-[var(--glass-bg)] to-[var(--primary)]/20 border border-[var(--primary)]/30"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-[0_0_15px_var(--glow-color)] text-white">
                            <TrendingUp size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Haftanın Yükselenleri</h2>
                    </div>
                    <p className="text-white/80">
                        Bu hafta en çok dinleyici kazanan ve trend olan radyo istasyonları.
                    </p>
                    <button className="mt-2 self-start px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-medium border border-[var(--glass-border)]">
                        Hemen Dinle
                    </button>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 flex flex-col justify-center gap-4 bg-gradient-to-tr from-[var(--glass-bg)] to-fuchsia-900/30 border border-fuchsia-500/30"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(192,38,211,0.5)] text-white">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Sizin İçin Önerilenler</h2>
                    </div>
                    <p className="text-white/80">
                        Müzik zevkinize ve daha önceki dinlemelerinize göre algoritmik tavsiyeler.
                    </p>
                    <button className="mt-2 self-start px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-medium border border-[var(--glass-border)]">
                        Tavsiyeleri Gör
                    </button>
                </motion.div>
            </div>

            <div className="pt-4 border-t border-[var(--glass-border)]">
                <RadioGrid limit={20} showPagination={false} random={true} />
            </div>
        </div>
    );
}
