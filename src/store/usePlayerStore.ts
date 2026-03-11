import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Station } from '@/lib/radioBrowser';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

interface PlayerState {
    currentStation: Station | null;
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;
    eqSettings: number[];
    history: Station[];
    favorites: Station[];
    queue: Station[];

    // Actions
    play: (station: Station, queue?: Station[]) => void;
    togglePlayPause: () => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    setEqSettings: (settings: number[]) => void;
    setEqBand: (index: number, value: number) => void;
    toggleFavorite: (station: Station) => void;
    playNext: () => void;
    playPrevious: () => void;
    syncWithSupabase: (userId?: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            currentStation: null,
            isPlaying: false,
            volume: 0.8,
            isMuted: false,
            eqSettings: new Array(10).fill(0),
            history: [],
            favorites: [],
            queue: [],

            play: (station, queue) => {
                const { history, queue: currentQueue } = get();
                // Add to history without duplicates
                const newHistory = [station, ...history.filter(s => s.stationuuid !== station.stationuuid)].slice(0, 20);

                set({
                    currentStation: station,
                    isPlaying: true,
                    history: newHistory,
                    queue: queue || currentQueue,
                });
            },

            togglePlayPause: () => {
                const { currentStation, isPlaying } = get();
                if (currentStation) {
                    set({ isPlaying: !isPlaying });
                }
            },

            setVolume: (volume) => {
                set({ volume, isMuted: volume === 0 });
            },

            toggleMute: () => {
                set({ isMuted: !get().isMuted });
            },

            setEqSettings: (settings) => {
                set({ eqSettings: settings });
                const userId = useAuthStore.getState().user?.id;
                if (userId) {
                    supabase.from('profiles').update({ eq_settings: settings }).eq('id', userId).then();
                }
            },

            setEqBand: (index, value) => {
                set((state) => {
                    const newEq = Array.isArray(state.eqSettings) ? [...state.eqSettings] : new Array(10).fill(0);
                    newEq[index] = value;

                    const userId = useAuthStore.getState().user?.id;
                    if (userId) {
                        supabase.from('profiles').update({ eq_settings: newEq }).eq('id', userId).then();
                    }

                    return { eqSettings: newEq };
                });
            },

            toggleFavorite: (station) => {
                const { favorites } = get();
                const exists = favorites.find(s => s.stationuuid === station.stationuuid);

                let newFavorites;
                if (exists) {
                    newFavorites = favorites.filter(s => s.stationuuid !== station.stationuuid);
                } else {
                    newFavorites = [station, ...favorites];
                }

                set({ favorites: newFavorites });

                const userId = useAuthStore.getState().user?.id;
                if (userId) {
                    supabase.from('profiles').update({ favorites: newFavorites }).eq('id', userId).then();
                }
            },

            playNext: () => {
                const { currentStation, queue, play } = get();
                if (!currentStation || queue.length === 0) return;

                const currentIndex = queue.findIndex(s => s.stationuuid === currentStation.stationuuid);
                if (currentIndex !== -1 && currentIndex < queue.length - 1) {
                    play(queue[currentIndex + 1], queue);
                } else if (queue.length > 0) {
                    play(queue[0], queue); // loop back
                }
            },

            playPrevious: () => {
                const { currentStation, queue, play } = get();
                if (!currentStation || queue.length === 0) return;

                const currentIndex = queue.findIndex(s => s.stationuuid === currentStation.stationuuid);
                if (currentIndex > 0) {
                    play(queue[currentIndex - 1], queue);
                } else if (queue.length > 0) {
                    play(queue[queue.length - 1], queue); // loop back
                }
            },

            syncWithSupabase: async (userId?: string) => {
                if (!userId) return;
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('favorites, eq_settings')
                        .eq('id', userId)
                        .single();

                    if (data && !error) {
                        set((state) => ({
                            favorites: data.favorites || state.favorites,
                            eqSettings: data.eq_settings || state.eqSettings,
                        }));
                    }
                } catch (err) {
                    console.error('Failed to sync from Supabase', err);
                }
            }
        }),
        {
            name: 'radyo-player-storage',
            partialize: (state) => ({
                currentStation: state.currentStation, // Also persist current station
                volume: state.volume,
                isMuted: state.isMuted,
                eqSettings: state.eqSettings,
                history: state.history,
                favorites: state.favorites,
                queue: state.queue
            }),
        }
    )
);
