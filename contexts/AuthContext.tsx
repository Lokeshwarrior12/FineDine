import { initializeFirebaseMessaging } from '@/lib/firebase';
import { getUserProfile, signIn, signOut, signUp, supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  user_type: 'customer' | 'restaurant_owner';
  points: number;
  avatar_url: string | null;
  referral_code: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: {
    full_name: string;
    phone: string;
    address: string;
    user_type: 'customer' | 'restaurant_owner';
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth
    initializeAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
        
        // Initialize Firebase messaging for notifications
        await initializeFirebaseMessaging();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const profileData = await getUserProfile(userId);
      setProfile(profileData as UserProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      if (data.user) {
        await loadUserProfile(data.user.id);
        
        // Initialize Firebase messaging after sign in
        await initializeFirebaseMessaging();
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    email: string, 
    password: string, 
    userData: {
      full_name: string;
      phone: string;
      address: string;
      user_type: 'customer' | 'restaurant_owner';
    }
  ) => {
    try {
      setLoading(true);
      const { data, error } = await signUp(email, password, userData);
      
      if (error) throw error;
      
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Clear any cached data
      await AsyncStorage.clear();
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;