import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

interface EQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EQModal: React.FC<EQModalProps> = ({ isOpen, onClose }) => {
    const { eqSettings, setEqSettings, setEqBand } = usePlayerStore();

    // Local state for smooth drag experience without lagging the global store too much if needed.
    // Actually, wait, updating the global store directly is usually fine for Howler filters,
    // but the user's sample uses a local tracking and a "save" button. Let's do exactly that.
    const [localEq, setLocalEq] = useState<number[]>(eqSettings);

    useEffect(() => {
        // Sync when opened
        if (isOpen) {
            // Ensure it's an array of 10
            if (Array.isArray(eqSettings) && eqSettings.length === 10) {
                setLocalEq(eqSettings);
            } else {
                setLocalEq(new Array(10).fill(0));
            }
        }
    }, [isOpen, eqSettings]);

    if (!isOpen) return null;

    const frequencies = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

    const handleSliderChange = (index: number, value: number) => {
        const newEq = [...localEq];
        newEq[index] = value;
        setLocalEq(newEq);
        // Directly apply for realtime preview
        setEqBand(index, value);
    };

    const handleSave = () => {
        setEqSettings(localEq);
        onClose();
    };

    const handleReset = () => {
        let step = 0;
        const initialEq = [...localEq];
        const interval = setInterval(() => {
            step += 0.1;
            if (step >= 1) {
                clearInterval(interval);
                const flat = new Array(10).fill(0);
                setLocalEq(flat);
                flat.forEach((val, i) => setEqBand(i, val));
            } else {
                const currentEq = initialEq.map(val => val * (1 - step));
                setLocalEq(currentEq);
                currentEq.forEach((val, i) => setEqBand(i, val));
            }
        }, 20);
    };

    const handleClose = () => {
        let step = 0;
        const initialEq = [...localEq];
        // Revert back to original saved settings
        const interval = setInterval(() => {
            step += 0.1;
            if (step >= 1) {
                clearInterval(interval);
                setLocalEq(eqSettings);
                eqSettings.forEach((val, i) => setEqBand(i, val));
                onClose();
            } else {
                const currentEq = initialEq.map((val, i) => val + (eqSettings[i] - val) * step);
                setLocalEq(currentEq);
                currentEq.forEach((val, i) => setEqBand(i, val));
            }
        }, 20);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#050510] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col glass-card relative">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Ekolayzer</h2>
                    <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 flex-1 flex flex-col gap-8 relative z-10">
                    <div className="flex justify-between items-end h-64 gap-2 md:gap-4">
                        {frequencies.map((freq, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 flex-1 h-full">
                                <span className="text-[10px] text-white/50 font-mono hidden sm:inline-block">{localEq[i]?.toFixed(1)} dB</span>
                                <span className="text-[10px] text-white/50 font-mono sm:hidden">{Math.round(localEq[i] || 0)}</span>
                                <div className="relative flex-1 w-full flex justify-center py-2 h-full">
                                    {/* Track background */}
                                    <div className="absolute inset-y-0 w-1.5 bg-black/50 rounded-full border border-white/5" />
                                    {/* Zero line */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-0.5 bg-white/20" />

                                    <input
                                        type="range"
                                        min="-12"
                                        max="12"
                                        step="0.1"
                                        value={localEq[i] || 0}
                                        onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        style={{ writingMode: 'vertical-lr', direction: 'rtl', WebkitAppearance: 'slider-vertical' } as React.CSSProperties}
                                    />

                                    {/* Custom Thumb */}
                                    <div
                                        className="absolute w-4 h-4 bg-[var(--primary)] rounded-full shadow-[0_0_10px_var(--glow-color)] pointer-events-none transition-transform"
                                        style={{
                                            bottom: `${(((localEq[i] || 0) + 12) / 24) * 100}%`,
                                            transform: 'translateY(50%)'
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] font-medium text-[var(--primary)] font-mono">{freq}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-black/50 flex items-center justify-between">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                    >
                        <RefreshCw size={16} />
                        Sıfırla
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 rounded-xl text-sm font-bold bg-[var(--primary)] text-white hover:brightness-110 shadow-[0_0_15px_var(--glow-color)] transition-all"
                        >
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
