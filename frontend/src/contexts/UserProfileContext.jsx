import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const UserProfileContext = createContext({
  session: null,
  profile: null,
  loading: false,
  error: null,
  refreshProfile: async () => {},
  logout: async () => {},
});

export const UserProfileProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    
    try {
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
    }
  }, []);

  const syncSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError);
        setSession(null);
        setProfile(null);
        return;
      }

      const currentSession = sessionData.session;
      setSession(currentSession);

      // 未ログインの場合はエラー扱いにせず終了（リダイレクトのみ行う）
      if (!currentSession) {
        setProfile(null);
        setError(null);
        return;
      }

      // getUser でユーザー情報を明示取得（セッションと併せて確認）
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError);
        setProfile(null);
        return;
      }

      setError(null);
      const supaUserId = userData.user?.id || currentSession?.user?.id;
      if (supaUserId) {
        await fetchProfile(supaUserId);
      } else {
        setProfile(null);
      }
    } catch (err) {
      setError(err);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const logAuthState = (nextSession) => {
      if (nextSession?.user) {
        console.log(`ログイン状態: ログイン中 (userId=${nextSession.user.id})`);
      } else {
        console.log('ログイン状態: 未ログイン');
      }
    };

    // 初期ロード時に getSession + getUser を実行（1回のみ）
    syncSession().then((res) => {
      logAuthState(res?.session);
    });
  }, [syncSession]);

  // ログイン状態変化を監視し、ログイン後すぐにセッションとプロフィールを同期
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      setLoading(true);
      setSession(authSession);

      if (authSession?.user) {
        await fetchProfile(authSession.user.id);
        setError(null);
      } else {
        setProfile(null);
        setError(null);
      }

      setLoading(false);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
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

