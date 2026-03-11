'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Edit2, Trash2, Search, Save, X, AlertCircle, DownloadCloud, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomStation {
    id: string;
    stationuuid: string;
    name: string;
    url: string;
    url_resolved: string;
    homepage: string | null;
    favicon: string | null;
    tags: string | null;
    countrycode: string | null;
    codec: string | null;
    bitrate: number | null;
    is_active: boolean;
    clickcount: number;
}

export default function AdminPage() {
    const { user, profile } = useAuthStore();
    const router = useRouter();
    const [stations, setStations] = useState<CustomStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [migrating, setMigrating] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStation, setEditingStation] = useState<CustomStation | null>(null);

    // Pagination & Sorting State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [sortStrategy, setSortStrategy] = useState<'likes_desc' | 'likes_asc' | 'name_asc' | 'name_desc'>('likes_desc');

    const [formData, setFormData] = useState<Partial<CustomStation>>({
        name: '',
        url: '',
        url_resolved: '',
        favicon: '',
        tags: '',
        stationuuid: '',
        clickcount: 0
    });

    useEffect(() => {
        if (!user || user === undefined) return;
        if (profile?.role !== 'admin') {
            router.push('/');
        } else {
            fetchStations();
        }
    }, [user, profile, router]);

    const fetchStations = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('stations').select('*').order('clickcount', { ascending: false });
        if (error) {
            setError(error.message);
        } else {
            setStations(data || []);
        }
        setLoading(false);
    };

    const handleOpenModal = (station?: CustomStation) => {
        if (station) {
            setEditingStation(station);
            setFormData(station);
        } else {
            setEditingStation(null);
            setFormData({
                name: '',
                url: '',
                url_resolved: '',
                favicon: '',
                tags: '',
                stationuuid: crypto.randomUUID(),
                clickcount: 0
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingStation) {
                const { error } = await supabase.from('stations').update(formData).eq('id', editingStation.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('stations').insert([formData]);
                if (error) throw error;
            }
            setShowModal(false);
            fetchStations();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu istasyonu silmek istediğinize emin misiniz?')) return;
        try {
            const { error } = await supabase.from('stations').delete().eq('id', id);
            if (error) throw error;
            fetchStations();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleMigrate = async () => {
        if (!confirm('RadioBrowser dan yaklaşık 500+ istasyon çekilecek ve veritabanına eklenecek. Onaylıyor musunuz?')) return;

        setMigrating(true);
        setError('');

        try {
            // Fetch via our Next.js backend to bypass CORS blocking RadioBrowser directly
            const response = await fetch('/api/proxy-rb');

            if (!response.ok) throw new Error('RadioBrowser API erişim hatası / CORS engeli');
            const rbStations = await response.json();

            if (!rbStations || rbStations.length === 0) throw new Error('İstasyon bulunamadı veya Proxy cevap vermedi');

            const stationsToInsert = rbStations.map((s: any) => ({
                stationuuid: s.id,
                name: s.name,
                url: s.url,
                url_resolved: s.urlResolved || s.url,
                homepage: s.homepage || '',
                favicon: s.favicon || '',
                tags: (s.tags || '').toString(),
                countrycode: s.countryCode || 'TR',
                codec: s.codec || 'MP3',
                bitrate: s.bitrate || 128,
                is_active: true,
                clickcount: parseInt(s.clickCount) || 0
            }));

            // Insert in chunks of 100 to avoid request size limits
            const chunkSize = 100;
            let successCount = 0;

            for (let i = 0; i < stationsToInsert.length; i += chunkSize) {
                const chunk = stationsToInsert.slice(i, i + chunkSize);
                const { error: upsertError } = await supabase
                    .from('stations')
                    .upsert(chunk, { onConflict: 'stationuuid' });

                if (upsertError) throw upsertError;
                successCount += chunk.length;
            }

            alert(`Başarılı! ${successCount} istasyon içeri aktarıldı.`);
            fetchStations();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setMigrating(false);
        }
    };

    // --- Computed Values for Sorting & Pagination ---
    const sortedStations = [...stations].sort((a, b) => {
        switch (sortStrategy) {
            case 'likes_desc': return (b.clickcount || 0) - (a.clickcount || 0);
            case 'likes_asc': return (a.clickcount || 0) - (b.clickcount || 0);
            case 'name_asc': return a.name.localeCompare(b.name);
            case 'name_desc': return b.name.localeCompare(a.name);
            default: return 0;
        }
    });

    const totalPages = Math.ceil(sortedStations.length / itemsPerPage) || 1;
    const paginatedStations = sortedStations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Fix current page if list length decreases
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [sortedStations.length, totalPages, currentPage]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
            </div>
        );
    }

    if (profile?.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Paneli</h1>
                    <p className="text-white/60">Özel radyo istasyonlarını ve RadioBrowser override'larını yönetin.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleMigrate}
                        disabled={migrating}
                        className="flex items-center gap-2 bg-white/5 text-white border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all font-medium disabled:opacity-50"
                    >
                        {migrating ? <Loader2 className="animate-spin" size={18} /> : <DownloadCloud size={18} />}
                        <span className="hidden sm:inline">{migrating ? 'Aktarılıyor...' : 'Radyoları İçe Aktar'}</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all font-medium shadow-[0_0_15px_var(--glow-color)]"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Yeni İstasyon</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/20 text-red-200 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 mb-6">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* Sorting Toolbar */}
            <div className="flex justify-between items-center mb-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                    <span className="bg-white/10 px-3 py-1.5 rounded-lg text-white font-medium">Toplam {stations.length} İstasyon</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2"><ArrowUpDown size={14} /> Sıralama:</span>
                    <select 
                        value={sortStrategy} 
                        onChange={(e) => {
                            setSortStrategy(e.target.value as any);
                            setCurrentPage(1); // Reset to page 1 on sort change
                        }}
                        className="bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-white"
                    >
                        <option value="likes_desc">En Çok Dinlenenler İlk</option>
                        <option value="likes_asc">En Az Dinlenenler İlk</option>
                        <option value="name_asc">A'dan Z'ye Temiz İsim</option>
                        <option value="name_desc">Z'den A'ya Ters Sıra</option>
                    </select>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white">
                        <thead className="bg-white/5 text-white/60 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Tür</th>
                                <th className="px-6 py-4 font-medium">İstasyon Adı</th>
                                <th className="px-6 py-4 font-medium">UUID</th>
                                <th className="px-6 py-4 font-medium text-right">Popülerlik</th>
                                <th className="px-6 py-4 font-medium text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStations.map(station => (
                                <tr key={station.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30">
                                            Radyo
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                                        {station.favicon ? (
                                            <img src={station.favicon} alt={station.name} className="w-8 h-8 rounded-full object-cover bg-white/10" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-bold text-xs">
                                                {station.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        {station.name}
                                    </td>
                                    <td className="px-6 py-4 text-white/40 text-xs font-mono">{station.stationuuid}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="bg-white/10 px-2 py-1 rounded-md text-xs font-medium border border-white/5">
                                            {station.clickcount?.toLocaleString('tr-TR') || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(station)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(station.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {stations.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-white/40">
                                        Hiç istasyon bulunamadı. Yeni bir tane ekleyerek başlayın.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/20">
                        <span className="text-sm text-white/50">
                            Sayfa <strong className="text-white">{currentPage}</strong> / {totalPages}
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 sm:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white">
                                        {editingStation ? 'İstasyonu Düzenle' : 'Yeni İstasyon Ekle'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">İstasyon Adı <span className="text-red-400">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Etiketler (Virgülle ayırın)</label>
                                            <input
                                                type="text"
                                                value={formData.tags || ''}
                                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                placeholder="pop, rock, haber"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Yayın URL'si (url) <span className="text-red-400">*</span></label>
                                            <input
                                                type="url"
                                                required
                                                value={formData.url}
                                                onChange={(e) => setFormData({ ...formData, url: e.target.value, url_resolved: formData.url_resolved || e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Çözümlenmiş URL (url_resolved) <span className="text-red-400">*</span></label>
                                            <input
                                                type="url"
                                                required
                                                value={formData.url_resolved}
                                                onChange={(e) => setFormData({ ...formData, url_resolved: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Sıra / Popülerlik (Dinlenme)</label>
                                            <input
                                                type="number"
                                                value={formData.clickcount || 0}
                                                onChange={(e) => setFormData({ ...formData, clickcount: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white/80 text-sm font-medium mb-1.5 ml-1">Logo URL'si (Favicon)</label>
                                            <input
                                                type="url"
                                                value={formData.favicon || ''}
                                                onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full mt-6 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        <span>Kaydet</span>
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
