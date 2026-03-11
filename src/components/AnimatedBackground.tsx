'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[var(--background)] transition-colors duration-700">
            {/* Aurora effect blobs */}
            <motion.div
                animate={{
                    x: ['0%', '20%', '-10%', '0%'],
                    y: ['0%', '-20%', '10%', '0%'],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 mix-blend-screen"
                style={{ background: 'var(--blob-color-1)' }}
            />

            <motion.div
                animate={{
                    x: ['0%', '-30%', '20%', '0%'],
                    y: ['0%', '30%', '-20%', '0%'],
                    scale: [1, 1.1, 0.8, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-30 mix-blend-screen"
                style={{ background: 'var(--blob-color-2)' }}
            />

            <motion.div
                animate={{
                    x: ['0%', '40%', '-20%', '0%'],
                    y: ['0%', '-10%', '30%', '0%'],
                    scale: [1, 1.3, 0.9, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[130px] opacity-30 mix-blend-screen"
                style={{ background: 'var(--blob-color-3)' }}
            />

            {/* Grid overlay for texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>
    );
}
