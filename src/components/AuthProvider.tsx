'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setProfile } = useAuthStore();
    const { syncWithSupabase } = usePlayerStore();

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase.from('profiles').select('id, email, username, role').eq('id', userId).single();
        if (data) {
            setProfile(data);
        }
    };

    useEffect(() => {
        // Check active session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                syncWithSupabase(session.user.id);
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                syncWithSupabase(session.user.id);
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [setUser]);

    return <>{children}</>;
}
