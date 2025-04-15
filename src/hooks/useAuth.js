// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create and export the Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create a React Context for authentication state and actions
const AuthContext = createContext();

// AuthProvider component wraps the application to provide authentication context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effect hook runs once on mount to check initial session and set up listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
        console.error("Error getting initial session:", error);
        setLoading(false);
    });


    // Listen for changes in authentication state (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       setUser(session?.user ?? null);
    });

    // Cleanup function: Unsubscribe from the listener when the component unmounts
    return () => {
       subscription?.unsubscribe();
    };
  }, []);

  // Value object provided to the context consumers
  const value = {
    user,
    signUp: (email, password) => supabase.auth.signUp({ email, password }), 
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    setUser,
    supabase,
  };

  // Provide the authentication context value to child components
  // Do not render children until the initial loading is complete to prevent flicker
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
     throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};