import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';

const parseJsonSafe = async (res) => {
  // 204 / 304 などボディ無しレスポンスはそのまま null を返す
  if (res.status === 204 || res.status === 304) return null;
  const contentLength = res.headers.get('content-length');
  if (contentLength === '0') return null;
  try {
    return await res.json();
  } catch (err) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'response is not valid JSON');
  }
};

/**
 * 共通ヘッダー生成。token / userId が足りない場合は null を返す。
 */
const useAuthHeaders = () => {
  const { session } = useUserProfile();
  const userId = session?.user?.id;

  const headers = useMemo(() => {
    const token = session?.access_token;
    if (!token || !userId) return null;
    return {
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId,
    };
  }, [session, userId]);

  return { headers, userId };
};

/**
 * すべてのチェックポイント（スタンプポイント）を取得
 */
export const useStampCheckpoints = () => {
  const { headers } = useAuthHeaders();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCheckpoints = useCallback(async () => {
    if (!headers) {
      setError(new Error('not authenticated'));
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/stamprally/api/checkpoints/', { headers });
      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const detail = await res.json();
          message = detail?.error || message;
        } catch (e) {
          message = e.message || message;
        }        throw new Error(message);
      }
      const json = await res.json();
      console.log('fetchCheckpoints json', json);
      setData(json);
      setError(null);
    } catch (err) {
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchCheckpoints();
  }, [fetchCheckpoints]);

  return { checkpoints: data, loading, error, refetch: fetchCheckpoints };
};

/**
 * ログインユーザーの取得済みスタンプ一覧を取得
 */
export const useUserStamps = () => {
  const { headers, userId } = useAuthHeaders();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStamps = useCallback(async () => {
    if (!headers) {
      setError(new Error('not authenticated'));
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/stamprally/api/stamps/', 
        { headers,
          method: 'GET',
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      
      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const detail = await res.text();
          message = detail?.error || message;
        } catch (e) {
          message = e.message || message;
        }
        throw new Error(message);
      }
      const json = await res.json();
      console.log('fetchStamps json', json);
      setData(Array.isArray(json) ? json : []);
      setError(null);
    } catch (err) {
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchStamps();
  }, [fetchStamps]);

  return { stamps: data, loading, error, refetch: fetchStamps };
};

/**
 * スタンプ取得を登録する
 */
export const useAcquireStamp = () => {
  const { headers, userId } = useAuthHeaders();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const acquire = useCallback(
    async (checkpointId) => {
      if (!headers || !userId) {
        throw new Error('not authenticated');
      }
      if (!checkpointId) {
        throw new Error('checkpointId is required');
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/stamprally/api/stamps/create/', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkpoint: checkpointId, userid: userId }),
        });
        if (!res.ok) {
          let message = `HTTP ${res.status}`;
          try {
            const detail = await res.json();
            message = detail?.error || message;
          } catch (e) {
            message = e.message || message;
          }
          throw new Error(message);
        }
        const json = await res.json();
        return json;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [headers, userId],
  );

  return { acquireStamp: acquire, loading, error };
};

