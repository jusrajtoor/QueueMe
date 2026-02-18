import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

interface AuthResult {
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toErrorMessage = (message: string) => ({ error: message });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error('Failed to restore auth session', error);
      }

      setSession(data.session ?? null);
      setIsLoading(false);
    };

    void initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (!mounted) {
        return;
      }

      setSession(newSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return toErrorMessage('Email and password are required.');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return toErrorMessage(error.message);
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return toErrorMessage('Email and password are required.');
    }

    if (password.length < 6) {
      return toErrorMessage('Password must be at least 6 characters.');
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return toErrorMessage(error.message);
    }

    return { error: null };
  };

  const signOut = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return toErrorMessage(error.message);
    }

    return { error: null };
  };

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
