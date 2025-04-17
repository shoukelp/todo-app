// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase URL or Anon Key is missing. Check your .env file.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    let mounted = true; // Prevent state updates on unmounted component

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }).catch(error => {
        console.error("Error getting initial session:", error);
        if (mounted) setLoading(false);
    });


    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
            setUser(session?.user ?? null);
        }
    });

    // Cleanup function
    return () => {
        mounted = false;
        subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    setUser,
    supabase,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};