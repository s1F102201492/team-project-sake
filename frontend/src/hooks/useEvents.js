import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const buildHeaders = (userId) => {
  const headers = { 'Content-Type': 'application/json' };
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  return headers;
};

/**
 * event テーブルからイベント一覧を取得するフック
 *
 * @param {Object} options
 * @param {boolean} [options.enabled=true] - 初期マウント時に自動取得するか
 * @param {string|null} [options.orderBy='start_date'] - 並び替え対象カラム。null で並び替え無し
 */
export const useEvents = (options = {}) => {
  const { enabled = true, orderBy = 'start_date' } = options;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/event/api/events/');
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const sorted = orderBy
        ? [...(data || [])].sort((a, b) => {
            if (a[orderBy] == null) return 1;
            if (b[orderBy] == null) return -1;
            return a[orderBy] > b[orderBy] ? 1 : -1;
          })
        : data || [];
      setEvents(sorted);
      setError(null);
    } catch (err) {
      setError(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [orderBy]);

  useEffect(() => {
    if (enabled) {
      fetchEvents();
    }
  }, [enabled, fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
};

/**
 * ログインユーザーが予約したイベントを取得するフック
 */
export const useUserReservedEvents = (options = {}) => {
  const { enabled = true } = options;
  const { session } = useUserProfile();
  const userId = useMemo(() => session?.user?.id || null, [session]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservedEvents = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      setError(new Error('not authenticated'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/event/api/events/?reserved_user_id=${encodeURIComponent(userId)}`, {
        headers: buildHeaders(userId),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setEvents(data || []);
      setError(null);
    } catch (err) {
      setError(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (enabled) {
      fetchReservedEvents();
    }
  }, [enabled, fetchReservedEvents]);

  return { events, loading, error, refetch: fetchReservedEvents, userId };
};

/**
 * イベントを予約済みにする（reserved_user_ids にユーザーIDを追加）
 */
export const useReserveEvent = () => {
  const { session } = useUserProfile();
  const userId = useMemo(() => session?.user?.id || null, [session]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reserve = useCallback(
    async (eventId) => {
      if (!userId) {
        const authError = new Error('not authenticated');
        setError(authError);
        throw authError;
      }
      if (!eventId) {
        const idError = new Error('eventId is required');
        setError(idError);
        throw idError;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/event/api/events/${eventId}/reserve/`, {
          method: 'POST',
          headers: buildHeaders(userId),
          body: JSON.stringify({ user_id: userId }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `HTTP ${res.status}`);
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
    [userId],
  );

  return { reserveEvent: reserve, loading, error, userId };
};

