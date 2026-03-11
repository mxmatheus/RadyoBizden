'use client';

import { AnimatedBackground } from './AnimatedBackground';
import { GlassNavbar } from './GlassNavbar';
import { GlobalPlayer } from './GlobalPlayer';
import { ReactNode } from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col relative w-full">
            <AnimatedBackground />
            <GlassNavbar />

            {/* Main Content Area - padded for navbar and global player */}
            <main className="flex-1 w-full pt-24 pb-28 px-4 md:px-6 container mx-auto relative z-10 transition-all">
                {children}
            </main>

            <GlobalPlayer />
        </div>
    );
}
