import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

export type UserRole = 'customer' | 'business';

export interface UserProfile {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

interface AuthResult {
  error: string | null;
}

interface ProfilePatch {
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  signIn: (email: string, password: string, role?: UserRole) => Promise<AuthResult>;
  signUp: (email: string, password: string, role: UserRole) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  updateProfile: (patch: ProfilePatch) => Promise<AuthResult>;
  setRole: (role: UserRole) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toErrorMessage = (message: string) => ({ error: message });

const normalizeRole = (value?: string | null): UserRole => {
  return value === 'business' ? 'business' : 'customer';
};

const mapProfile = (row: ProfileRow): UserProfile => ({
  userId: row.user_id,
  fullName: row.full_name,
  avatarUrl: row.avatar_url,
  role: normalizeRole(row.role),
});

const createFallbackProfile = (authUser: User, role?: UserRole): UserProfile => ({
  userId: authUser.id,
  fullName: typeof authUser.user_metadata?.full_name === 'string' ? authUser.user_metadata.full_name : null,
  avatarUrl: typeof authUser.user_metadata?.avatar_url === 'string' ? authUser.user_metadata.avatar_url : null,
  role: role ?? normalizeRole(typeof authUser.user_metadata?.role === 'string' ? authUser.user_metadata.role : 'customer'),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const loadProfileForUser = useCallback(async (authUser: User, preferredRole?: UserRole) => {
    setIsProfileLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, role')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const profileRow = data as ProfileRow | null;

      if (!profileRow) {
        const fallback = createFallbackProfile(authUser, preferredRole);

        const { data: insertedData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: authUser.id,
            full_name: fallback.fullName,
            avatar_url: fallback.avatarUrl,
            role: fallback.role,
            updated_at: new Date().toISOString(),
          })
          .select('user_id, full_name, avatar_url, role')
          .single();

        if (insertError) {
          throw insertError;
        }

        setProfile(mapProfile(insertedData as ProfileRow));
        return;
      }

      const mapped = mapProfile(profileRow);

      if (preferredRole && preferredRole !== mapped.role) {
        const { data: updatedData, error: updateError } = await supabase
          .from('profiles')
          .update({ role: preferredRole, updated_at: new Date().toISOString() })
          .eq('user_id', authUser.id)
          .select('user_id, full_name, avatar_url, role')
          .single();

        if (updateError) {
          throw updateError;
        }

        setProfile(mapProfile(updatedData as ProfileRow));
        return;
      }

      setProfile(mapped);
    } catch (error) {
      // Keep app functional even if profiles table is missing.
      if ((error as { code?: string } | null)?.code === '42P01') {
        setProfile(createFallbackProfile(authUser, preferredRole));
      } else {
        console.error('Failed to load profile', error);
        setProfile(createFallbackProfile(authUser, preferredRole));
      }
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

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

      const activeSession = data.session ?? null;
      setSession(activeSession);

      if (activeSession?.user) {
        await loadProfileForUser(activeSession.user);
      } else {
        setProfile(null);
        setIsProfileLoading(false);
      }

      setIsLoading(false);
    };

    void initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (!mounted) {
        return;
      }

      setSession(newSession);

      if (newSession?.user) {
        void loadProfileForUser(newSession.user);
      } else {
        setProfile(null);
        setIsProfileLoading(false);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfileForUser]);

  const signIn = async (email: string, password: string, role?: UserRole): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return toErrorMessage('Email and password are required.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return toErrorMessage(error.message);
    }

    if (data.user) {
      await loadProfileForUser(data.user, role);
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string, role: UserRole): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return toErrorMessage('Email and password are required.');
    }

    if (password.length < 6) {
      return toErrorMessage('Password must be at least 6 characters.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          role,
        },
      },
    });

    if (error) {
      return toErrorMessage(error.message);
    }

    if (data.user && data.session) {
      await loadProfileForUser(data.user, role);
    }

    return { error: null };
  };

  const signOut = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return toErrorMessage(error.message);
    }

    setProfile(null);
    return { error: null };
  };

  const updateProfile = async (patch: ProfilePatch): Promise<AuthResult> => {
    if (!session?.user) {
      return toErrorMessage('You must be logged in to update your profile.');
    }

    const fallback = createFallbackProfile(session.user);

    const nextProfile: UserProfile = {
      userId: session.user.id,
      fullName: patch.fullName !== undefined ? patch.fullName : (profile?.fullName ?? fallback.fullName),
      avatarUrl: patch.avatarUrl !== undefined ? patch.avatarUrl : (profile?.avatarUrl ?? fallback.avatarUrl),
      role: patch.role ?? profile?.role ?? fallback.role,
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: session.user.id,
            full_name: nextProfile.fullName,
            avatar_url: nextProfile.avatarUrl,
            role: nextProfile.role,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          },
        )
        .select('user_id, full_name, avatar_url, role')
        .single();

      if (error) {
        throw error;
      }

      setProfile(mapProfile(data as ProfileRow));
      return { error: null };
    } catch (error) {
      if ((error as { code?: string } | null)?.code === '42P01') {
        setProfile(nextProfile);
        return { error: null };
      }

      return toErrorMessage(error instanceof Error ? error.message : 'Failed to update profile.');
    }
  };

  const setRole = async (role: UserRole): Promise<AuthResult> => {
    return updateProfile({ role });
  };

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      setIsProfileLoading(false);
      return;
    }

    await loadProfileForUser(session.user);
  }, [loadProfileForUser, session?.user]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      isLoading,
      isProfileLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      setRole,
      refreshProfile,
    }),
    [session, profile, isLoading, isProfileLoading, refreshProfile],
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
