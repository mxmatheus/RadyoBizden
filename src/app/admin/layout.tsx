import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Paneli | RadyoBizden',
    description: 'Yönetici paneli',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen pt-24 pb-12 bg-[var(--background)]">
            {children}
        </div>
    );
}
