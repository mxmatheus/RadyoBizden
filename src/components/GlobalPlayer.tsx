'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Settings, Maximize2, Radio, Timer, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { EQModal } from './EQModal';
import { AnimatedBackground } from './AnimatedBackground';

export function GlobalPlayer() {
    const { currentStation, isPlaying, volume, isMuted, togglePlayPause, setVolume, toggleMute, playNext, playPrevious, eqSettings } = usePlayerStore();
    const { user, openAuthModal } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const soundRef = useRef<Howl | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const filtersRef = useRef<BiquadFilterNode[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const [imgError, setImgError] = useState(false);
    const [streamFailed, setStreamFailed] = useState(false);

    // Sleep Timer & UI State
    const [sleepTimer, setSleepTimer] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [showTimerMenu, setShowTimerMenu] = useState(false);
    const [isEqModalOpen, setIsEqModalOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackDuration, setPlaybackDuration] = useState(0);

    // Handle Station Change
    useEffect(() => {
        setImgError(false);
        if (soundRef.current) {
            const oldSound = soundRef.current;
            oldSound.fade(oldSound.volume(), 0, 1000);
            setTimeout(() => {
                oldSound.unload();
            }, 1000);
        }

        if (!currentStation) return;

        setLoading(true);
        setStreamFailed(false);

        const createHowl = (url: string, isFallback: boolean = false) => {
            const newSound = new Howl({
                src: [url],
                html5: true, // Force HTML5 Audio so we don't download the whole stream
                format: ['mp3', 'aac'],
                volume: 0, // Start at 0 for fade in
                onplay: () => {
                    newSound.fade(0, isMuted ? 0 : volume, 1000);
                    setLoading(false);
                    setStreamFailed(false);
                    setupVisualizer();
                },
                onloaderror: () => {
                    console.error('Failed to load stream:', url);
                    if (!isFallback && currentStation.url && currentStation.url !== currentStation.url_resolved) {
                        console.log('Attempting fallback URL...');
                        newSound.unload();
                        createHowl(currentStation.url, true);
                    } else {
                        setLoading(false);
                        setStreamFailed(true);
                    }
                },
                onplayerror: () => {
                    console.error('Playback error, trying to resume');
                    newSound.once('unlock', () => newSound.play());
                }
            });

            // Set crossOrigin to allow Web Audio API EQ processing
            const audioNode = (newSound as any)._sounds[0]?._node;
            if (audioNode) {
                audioNode.crossOrigin = 'anonymous';
            }

            soundRef.current = newSound;

            if (isPlaying) {
                newSound.play();
            }
        };

        createHowl(currentStation.url_resolved || currentStation.url);

        // Media Session API for lock screen
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentStation.name,
                artist: 'RadyoBizden Canlı',
                album: 'RadyoBizden',
                artwork: currentStation.favicon ? [
                    { src: currentStation.favicon, sizes: '512x512', type: 'image/png' }
                ] : []
            });
            navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
            navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
        }

        // Reset duration
        setPlaybackDuration(0);

        return () => {
            if (soundRef.current) soundRef.current.unload();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [currentStation?.stationuuid]);

    // Handle Playback Duration Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && currentStation) {
            interval = setInterval(() => {
                setPlaybackDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStation]);

    // Handle Play/Pause Toggle
    useEffect(() => {
        if (!soundRef.current) return;

        if (isPlaying && !soundRef.current.playing()) {
            soundRef.current.play();
        } else if (!isPlaying && soundRef.current.playing()) {
            soundRef.current.pause();
        }
    }, [isPlaying]);

    // Handle Volume Change
    useEffect(() => {
        if (soundRef.current) {
            soundRef.current.volume(isMuted ? 0 : volume);
        }
    }, [volume, isMuted]);

    // Handle EQ Change
    useEffect(() => {
        filtersRef.current.forEach((filter, i) => {
            if (filter) {
                filter.gain.value = eqSettings[i] || 0;
            }
        });
    }, [eqSettings]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'KeyM':
                    toggleMute();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(Math.min(1, volume + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(Math.max(0, volume - 0.1));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlayPause, toggleMute, setVolume, volume]);

    // Handle Sleep Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timeLeft !== null && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev! - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (isPlaying) togglePlayPause();
            setTimeLeft(null);
            setSleepTimer(null);
        }
        return () => clearInterval(interval);
    }, [timeLeft, isPlaying, togglePlayPause]);

    const handleSetTimer = (minutes: number) => {
        setSleepTimer(minutes);
        setTimeLeft(minutes * 60);
        setShowTimerMenu(false);
    };

    const cancelTimer = () => {
        setSleepTimer(null);
        setTimeLeft(null);
        setShowTimerMenu(false);
    };

    const formatTimeLeft = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleShare = async () => {
        if (navigator.share && currentStation) {
            try {
                await navigator.share({
                    title: `${currentStation.name} - RadyoBizden`,
                    text: `${currentStation.name} radyosunu RadyoBizden'de dinliyorum!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing', error);
            }
        }
    };

    const toggleFullScreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Setup Visualizer
    const setupVisualizer = () => {
        try {
            if (!Howler.ctx) return; // AudioContext isn't available yet

            if (!analyserRef.current && Howler.masterGain) {
                const analyser = Howler.ctx.createAnalyser();
                analyser.fftSize = 256;

                // Create 10-Band EQ Filters
                const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
                const filters = frequencies.map((freq, i) => {
                    const filter = Howler.ctx!.createBiquadFilter();
                    filter.type = i === 0 ? 'lowshelf' : i === frequencies.length - 1 ? 'highshelf' : 'peaking';
                    filter.frequency.value = freq;
                    if (filter.type === 'peaking') filter.Q.value = 1;
                    filter.gain.value = eqSettings[i] || 0;
                    return filter;
                });
                filtersRef.current = filters;

                // Connect: MediaElementSource -> Analyser -> filters[0]...filters[n] -> Destination
                const audioNode = (soundRef.current as any)?._sounds[0]?._node;
                let sourceNode;

                if (audioNode) {
                    // Avoid recreating MediaElementSource for the same audio element
                    if (!(audioNode as any)._mediaSource) {
                        (audioNode as any)._mediaSource = Howler.ctx!.createMediaElementSource(audioNode);
                    }
                    sourceNode = (audioNode as any)._mediaSource;
                } else {
                    sourceNode = Howler.masterGain;
                }

                sourceNode.disconnect();
                sourceNode.connect(analyser);
                analyser.connect(filters[0]);
                for (let i = 0; i < filters.length - 1; i++) {
                    filters[i].connect(filters[i + 1]);
                }
                filters[filters.length - 1].connect(Howler.ctx!.destination);

                analyserRef.current = analyser;
            }

            const drawVisualizer = () => {
                const canvas = canvasRef.current;
                const analyser = analyserRef.current;
                if (!canvas || !analyser) return;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(dataArray);

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const width = canvas.width;
                const height = canvas.height;

                ctx.clearRect(0, 0, width, height);

                const barWidth = (width / bufferLength) * 2.5;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * height;

                    // Theme primary color from CSS var
                    const rootStyle = getComputedStyle(document.body);
                    const rawColor = rootStyle.getPropertyValue('--primary').trim() || '#5b21b6';

                    let transparentColor = rawColor;
                    if (rawColor.startsWith('#')) {
                        transparentColor = `${rawColor}33`; // simple hex opacity
                    } else if (rawColor.startsWith('rgb(')) {
                        transparentColor = rawColor.replace('rgb(', 'rgba(').replace(')', ', 0.2)');
                    } else if (rawColor.startsWith('rgba(')) {
                        transparentColor = rawColor.replace(/[\d.]+\)$/, '0.2)');
                    } else {
                        transparentColor = 'transparent';
                    }

                    const gradient = ctx.createLinearGradient(0, height, 0, 0);
                    gradient.addColorStop(0, transparentColor); // 20% opacity using proper rgba
                    gradient.addColorStop(1, rawColor);

                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }

                animationFrameRef.current = requestAnimationFrame(drawVisualizer);
            };

            drawVisualizer();
        } catch (e) {
            console.error('Visualizer error:', e);
        }
    };

    if (!currentStation) return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-[var(--glass-bg)] backdrop-blur-2xl border-t border-[var(--glass-border)] z-50 transition-all">
                <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">

                    {/* Left: Station Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden relative">
                            {currentStation.favicon && !imgError ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={currentStation.favicon} alt={currentStation.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                            ) : (
                                <Radio size={24} className="text-white/50" />
                            )}

                            {loading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col min-w-0">
                            <h4 className="text-sm md:text-base font-bold text-white truncate">{currentStation.name}</h4>
                            <p className="text-xs text-white/60 truncate flex items-center gap-2 mt-0.5">
                                {streamFailed ? (
                                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold text-[10px] uppercase border border-red-500/30">Bağlantı Hatası</span>
                                ) : (
                                    <span className="flex items-center gap-1 bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        CANLI {playbackDuration > 0 ? `(${formatDuration(playbackDuration)})` : ''}
                                    </span>
                                )}
                                <span className="hidden md:inline text-[10px] uppercase tracking-wider">{currentStation.tags.split(',')[0]}</span>
                            </p>
                        </div>
                    </div>

                    {/* Center: Controls */}
                    <div className="flex flex-col items-center justify-center flex-1 max-w-sm">
                        <div className="flex items-center gap-4 md:gap-6">
                            <button onClick={playPrevious} className="text-white/50 hover:text-white transition-colors p-2 hidden sm:block">
                                <SkipBack size={20} />
                            </button>
                            <button
                                onClick={togglePlayPause}
                                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-[0_0_15px_var(--glow-color)] transition-transform hover:scale-105 active:scale-95"
                            >
                                {isPlaying && !loading ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                            <button onClick={playNext} className="text-white/50 hover:text-white transition-colors p-2 hidden sm:block">
                                <SkipForward size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Right: Visualizer & Volume */}
                    <div className="flex items-center justify-end gap-4 flex-1">
                        <canvas
                            ref={(el) => { if (el) { (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el; } }}
                            width={120}
                            height={40}
                            className="hidden lg:block opacity-70"
                        />

                        <div className="flex items-center gap-2 pr-2 hidden md:flex">
                            <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-20 md:w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                            />
                        </div>

                        <div className="flex items-center gap-2 border-l border-[var(--glass-border)] pl-4 relative">
                            {/* Share */}
                            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                <button onClick={handleShare} className="text-white/50 hover:text-white transition-colors hidden sm:block p-1" title="Paylaş">
                                    <Share2 size={18} />
                                </button>
                            )}

                            {/* Timer */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowTimerMenu(!showTimerMenu)}
                                    className={`transition-colors p-1 flex items-center gap-1 ${timeLeft !== null ? 'text-[var(--primary)]' : 'text-white/50 hover:text-white'}`}
                                    title="Uyku Zamanlayıcısı"
                                >
                                    <Timer size={18} />
                                    {timeLeft !== null && <span className="text-[10px] hidden lg:block font-bold">{formatTimeLeft(timeLeft)}</span>}
                                </button>

                                {/* Timer Menu Dropdown */}
                                {showTimerMenu && (
                                    <div className="absolute bottom-full right-0 mb-4 w-40 bg-black/80 backdrop-blur-3xl border border-[var(--glass-border)] rounded-2xl shadow-xl overflow-hidden py-1 z-50">
                                        <div className="px-3 py-2 border-b border-[var(--glass-border)] flex items-center justify-between">
                                            <span className="text-xs font-bold text-white/70">Uyku Modu</span>
                                            <button onClick={() => setShowTimerMenu(false)} className="text-white/50 hover:text-white"><X size={14} /></button>
                                        </div>
                                        <div className="flex flex-col">
                                            {[15, 30, 45, 60, 90, 120].map(mins => (
                                                <button
                                                    key={mins}
                                                    onClick={() => handleSetTimer(mins)}
                                                    className={`text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${sleepTimer === mins ? 'text-[var(--primary)] font-bold' : 'text-white'}`}
                                                >
                                                    {mins} Dakika
                                                </button>
                                            ))}
                                            {timeLeft !== null && (
                                                <button onClick={cancelTimer} className="text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors border-t border-[var(--glass-border)] mt-1">
                                                    İptal Et
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* EQ / Settings */}
                            <div className="relative">
                                <button
                                    onClick={() => user ? setIsEqModalOpen(true) : openAuthModal('eq')}
                                    className={`transition-colors p-1 ${isEqModalOpen ? 'text-[var(--primary)]' : 'text-white/50 hover:text-white'} hidden sm:block`}
                                    title="Ekolayzer"
                                >
                                    <Settings size={18} />
                                </button>
                            </div>
                            <button onClick={toggleFullScreen} className={`text-white/50 hover:text-white transition-colors p-1 ${isFullscreen ? 'text-[var(--primary)]' : ''}`} title="Tam Ekran">
                                <Maximize2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Overlay */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                        className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col pt-12"
                    >
                        {/* Solid Animated Background */}
                        <div className="absolute inset-0 z-0 opacity-50">
                            <AnimatedBackground />
                        </div>

                        {/* Top Bar */}
                        <div className="relative z-10 flex justify-between items-center px-8 py-6">
                            <div className="flex items-center gap-4">
                                <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" onError={(e) => e.currentTarget.style.display = 'none'} />
                                <span className="text-white font-bold tracking-widest text-sm opacity-80">RADYOBIZDEN</span>
                            </div>
                            <button onClick={() => setIsFullscreen(false)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="relative z-10 flex-1 flex flex-col h-full container mx-auto px-6 pb-12 pt-4">
                            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
                                {/* Artwork */}
                                <div className="w-64 h-64 md:w-[450px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 shrink-0 group relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md">
                                    {imgError || !currentStation.favicon ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Radio size={100} className="text-white/20" />
                                        </div>
                                    ) : (
                                        <img
                                            src={currentStation.favicon}
                                            alt={currentStation.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            onError={() => setImgError(true)}
                                        />
                                    )}

                                    {/* Visualizer Overlay anchored to bottom 1/3 inside artwork */}
                                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center mix-blend-screen opacity-60 group-hover:opacity-100 transition-opacity pb-2">
                                        <canvas ref={(el) => { if (el) { (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el; } }} className="w-full h-16" />
                                    </div>
                                </div>

                                {/* Controls & Info */}
                                <div className="flex flex-col w-full max-w-xl text-center lg:text-left">
                                    {/* Tags */}
                                    <span className="text-[var(--primary)] font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-4 drop-shadow-md">
                                        {currentStation.tags ? currentStation.tags.split(',').slice(0, 3).join(' • ') : 'GENEL'}
                                    </span>

                                    {/* Title */}
                                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-xl tracking-tight line-clamp-2">
                                        {currentStation.name}
                                    </h2>

                                    {/* Live Indicator & Duration */}
                                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-12">
                                        {streamFailed ? (
                                            <span className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 font-bold text-sm flex items-center gap-2 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                                BAĞLANTI HATASI
                                            </span>
                                        ) : (
                                            <>
                                                <span className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-500 font-bold text-sm flex items-center gap-2 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                                    CANLI YAYIN
                                                </span>
                                                <span className="text-white/60 font-mono text-lg tracking-widest">{formatDuration(playbackDuration)}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Playback Controls */}
                                    <div className="flex flex-col w-full gap-8">
                                        <div className="flex items-center justify-between xl:px-4">
                                            <button onClick={() => user ? setIsEqModalOpen(true) : openAuthModal('eq')} className="text-white/50 hover:text-white transition-all p-4 hover:bg-white/10 rounded-full hover:scale-110 active:scale-95" title="Ekolayzer Ayarları">
                                                <Settings size={28} />
                                            </button>

                                            <div className="flex items-center gap-6 md:gap-10">
                                                <button onClick={playPrevious} className="text-white/60 hover:text-white transition-all hover:scale-110 active:scale-95">
                                                    <SkipBack size={42} fill="currentColor" opacity={0.8} />
                                                </button>

                                                <button
                                                    onClick={togglePlayPause}
                                                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)]"
                                                >
                                                    {loading ? (
                                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-black/20 border-t-black animate-spin" />
                                                    ) : isPlaying ? (
                                                        <Pause size={40} className="md:w-[48px] md:h-[48px]" fill="currentColor" />
                                                    ) : (
                                                        <Play size={40} className="md:w-[48px] md:h-[48px] ml-2" fill="currentColor" />
                                                    )}
                                                </button>

                                                <button onClick={playNext} className="text-white/60 hover:text-white transition-all hover:scale-110 active:scale-95">
                                                    <SkipForward size={42} fill="currentColor" opacity={0.8} />
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <button onClick={() => setShowTimerMenu(!showTimerMenu)} className={`transition-all p-4 hover:bg-white/10 rounded-full hover:scale-110 active:scale-95 ${timeLeft !== null ? 'text-[var(--primary)]' : 'text-white/50 hover:text-white'}`} title="Uyku Zamanlayıcısı">
                                                    <Timer size={28} />
                                                    {timeLeft !== null && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-black/50 px-1 rounded-sm">{formatTimeLeft(timeLeft)}</span>}
                                                </button>

                                                {/* In-Fullscreen Timer Menu */}
                                                {showTimerMenu && (
                                                    <div className="absolute bottom-full right-0 mb-4 w-48 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                                                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                                            <span className="text-sm font-bold text-white/90">Uyku Modu</span>
                                                            <button onClick={() => setShowTimerMenu(false)} className="text-white/50 hover:text-white"><X size={16} /></button>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            {[15, 30, 45, 60, 90].map(mins => (
                                                                <button
                                                                    key={mins}
                                                                    onClick={() => handleSetTimer(mins)}
                                                                    className={`text-left px-5 py-3 text-sm hover:bg-white/10 transition-colors ${sleepTimer === mins ? 'text-[var(--primary)] font-bold bg-white/5' : 'text-white'}`}
                                                                >
                                                                    {mins} Dakika
                                                                </button>
                                                            ))}
                                                            {timeLeft !== null && (
                                                                <button onClick={cancelTimer} className="text-left px-5 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors border-t border-white/10 mt-1">
                                                                    Zamanlayıcıyı Kapat
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Volume Slider */}
                                        <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 backdrop-blur-xl border border-white/5 shadow-inner hidden md:flex">
                                            <button onClick={toggleMute} className="text-white/50 hover:text-white transition-colors">
                                                {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={isMuted ? 0 : volume}
                                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <EQModal isOpen={isEqModalOpen} onClose={() => setIsEqModalOpen(false)} />
        </>
    );
}
