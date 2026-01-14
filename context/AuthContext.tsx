// contexts/AuthContext.tsx
import { supabase } from '@/lib/supabase'; // ← Recommended path: put supabase client in lib/
import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define the shape of the context value
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
};

// Create context with proper type (never use null as default!)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook with safety check
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error fetching initial session:', error);
          setError(error);
        } else {
          setSession(session);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Unexpected error in getSession:', err);
        setError(err);
        setIsLoading(false);
      });

    // 2. Subscribe to auth changes (real-time)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setIsLoading(false);
      }
    );

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}