import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    email: string | null;
    username: string | null;
    role: string;
}

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    isAuthModalOpen: boolean;
    authAction: string | null; // e.g. 'eq', 'favorite' - why the modal was opened
    setUser: (user: User | null) => void;
    setProfile: (profile: UserProfile | null) => void;
    openAuthModal: (action?: string) => void;
    closeAuthModal: () => void;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    isAuthModalOpen: false,
    authAction: null,
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    openAuthModal: (action?: string) => set({ isAuthModalOpen: true, authAction: action || null }),
    closeAuthModal: () => set({ isAuthModalOpen: false, authAction: null }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    }
}));
