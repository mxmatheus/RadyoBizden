'use client';

import { RadioGrid } from '@/components/RadioGrid';
import { Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

function RadyolarContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [inputValue, setInputValue] = useState('');

    const q = searchParams.get('q');
    const tag = searchParams.get('tag');

    useEffect(() => {
        if (q) setInputValue(q);
        else setInputValue('');
    }, [q]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            router.push(`/radyolar?q=${encodeURIComponent(inputValue.trim())}`);
        } else {
            router.push(`/radyolar`);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 border-b border-[var(--glass-border)]">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {q ? `Arama: ${q}` : tag ? `Kategori: ${tag.toUpperCase()}` : "Tüm Radyolar"}
                    </h1>
                    <p className="text-white/60">
                        {q || tag ? "Arama sonuçlarınızı aşağıda görebilirsiniz." : "Türkiye'nin popüler radyo istasyonlarını keşfedin."}
                    </p>
                </div>

                <form onSubmit={handleSearch} className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={18} className="text-white/50" />
                    </div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="İstasyon ara..."
                        className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] block pl-10 p-2.5 text-white placeholder-white/50 outline-none transition-all shadow-[0_0_15px_rgba(0,0,0,0.1)] focus:shadow-[0_0_15px_var(--glow-color)]"
                    />
                </form>
            </div>

            <RadioGrid searchQuery={q} tag={tag} />
        </div>
    );
}

export default function Radyolar() {
    return (
        <Suspense fallback={<div className="w-full py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-t border-white border-2 animate-spin bg-transparent"></div></div>}>
            <RadyolarContent />
        </Suspense>
    );
}
