'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Remove all previous theme classes
        const themeClasses = [
            'theme-neon-ates',
            'theme-orman-yesili',
            'theme-gece-moru',
            'theme-gumus-karanlik',
            'theme-gunes-batimi',
            'theme-okyanus-derin',
        ];
        document.body.classList.remove(...themeClasses);

        // Add current theme class if not default
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }
    }, [theme, mounted]);

    // Prevent flash of incorrect theme
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return <>{children}</>;
}
