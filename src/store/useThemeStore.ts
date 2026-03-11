import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 
  | 'default'
  | 'neon-ates'
  | 'orman-yesili'
  | 'gece-moru'
  | 'gumus-karanlik'
  | 'gunes-batimi'
  | 'okyanus-derin';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'radyo-theme-storage',
    }
  )
);
