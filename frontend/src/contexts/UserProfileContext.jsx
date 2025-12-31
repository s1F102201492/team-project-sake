import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const UserProfileContext = createContext({
  session: null,
  profile: null,
  loading: true,
  error: null,
  refreshProfile: async () => {},
  logout: async () => {},
});

export const UserProfileProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return null;
    }
    
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('Users')
        .select('id, email, username, prefecture, avatar_url')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Failed to fetch profile', fetchError);
        setError(fetchError);
        setProfile(null);
        return null;
      }

      setError(null);
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Unexpected error while fetching profile', err);
      setError(err);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const logAuthState = (nextSession) => {
      if (nextSession?.user) {
        console.log(`ログイン状態: ログイン中 (userId=${nextSession.user.id})`);
      } else {
        console.log('ログイン状態: 未ログイン');
      }
    };

    const syncSession = async () => {
      try {
        setLoading(true);

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (sessionError) {
          setError(sessionError);
          setSession(null);
          setProfile(null);
          setLoading(false);
          logAuthState(null);
          return;
        }

        setSession(data.session);
        logAuthState(data.session);
        console.log("datasessionuser:",data.session?.user)
        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error while syncing session', err);
        setError(err);
        setSession(null);
        setProfile(null);
        setLoading(false);
        logAuthState(null);
      } finally {
        setLoading(false);
      }
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      console.log('[auth change]', event, nextSession);
      setSession(nextSession);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (nextSession?.user) {
          await fetchProfile(nextSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      // グローバルなリフレッシュトークンも無効化
      const { error: globalError } = await supabase.auth.signOut({ scope: 'global' });
      if (globalError) {
        setError(globalError);
        return false;
      }
      // ローカルのセッションキャッシュも確実に削除
      await supabase.auth.signOut({ scope: 'local' });
      setSession(null);
      setProfile(null);
      setError(null);
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    session,
    profile,
    loading,
    error,
    refreshProfile: () => fetchProfile(session?.user?.id),
    logout,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};

export const useUserProfile = () => useContext(UserProfileContext);

