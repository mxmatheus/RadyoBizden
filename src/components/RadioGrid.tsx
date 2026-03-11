'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RadioCard } from './RadioCard';
import type { Station } from '@/lib/radioBrowser';

import { usePlayerStore } from '../store/usePlayerStore';

interface RadioGridProps {
    searchQuery?: string | null;
    tag?: string | null;
    limit?: number;
    showPagination?: boolean;
    predefinedStations?: Station[];
    random?: boolean;
}

export function RadioGrid({ searchQuery, tag, limit, showPagination = true, predefinedStations, random = false }: RadioGridProps = {}) {
    const [stations, setStations] = useState<Station[]>(predefinedStations || []);
    const [loading, setLoading] = useState(!predefinedStations);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const itemsPerPage = 20;

    const { currentStation, isPlaying, togglePlayPause, play } = usePlayerStore();

    useEffect(() => {
        if (predefinedStations) {
            setStations(predefinedStations);
            setTotalPages(Math.ceil(predefinedStations.length / itemsPerPage));
            setLoading(false);
            return;
        }

        const fetchStations = async () => {
            setLoading(true);
            try {
                let url = '/api/stations';

                const params = new URLSearchParams();
                if (searchQuery) params.append('name', searchQuery);
                if (tag) params.append('tag', tag);
                if (limit) params.append('limit', limit.toString());
                else params.append('limit', '300'); // phase 14 isteği

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }

                const response = await fetch(url, { cache: 'no-store' });
                if (!response.ok) throw new Error('API Error');

                const data = await response.json();
                
                let finalData = data;
                if (random) {
                    finalData = finalData.sort(() => 0.5 - Math.random());
                }
                
                setStations(finalData);
                setTotalPages(Math.ceil(finalData.length / itemsPerPage));
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, [searchQuery, tag, limit, itemsPerPage, predefinedStations]);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, tag]);

    const handlePlay = (station: Station) => {
        play(station, stations);
    };

    const paginatedStations = stations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    } as any;

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    } as any;

    if (loading) {
        return (
            <div className="w-full py-12 flex items-center justify-center">
                <div className="flex space-x-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-4 h-4 rounded-full bg-[var(--primary)]"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-8">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {paginatedStations.map((station) => (
                    <motion.div key={station.stationuuid} variants={item}>
                        <RadioCard station={station} onPlay={handlePlay} />
                    </motion.div>
                ))}
            </motion.div>

            {showPagination && totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-2">
                    <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Önceki
                    </button>
                    <div className="flex items-center gap-2 hidden sm:flex">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = currentPage;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-10 h-10 rounded-lg border border-[var(--glass-border)] flex items-center justify-center transition-colors ${currentPage === pageNum ? 'bg-[var(--primary)] text-white shadow-[0_0_10px_var(--glow-color)]' : 'bg-[var(--glass-bg)] hover:bg-white/10 text-white/70 hover:text-white'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <span className="flex items-center justify-center px-4 sm:hidden text-white/70 text-sm">Sayfa {currentPage}</span>
                    <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    );
}
