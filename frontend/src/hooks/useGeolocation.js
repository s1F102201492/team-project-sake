import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const defaultOptions = {
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 60000,
};

/**
 * ブラウザの Geolocation API をラップするカスタムフック。
 * - requestLocation: 現在地を一度だけ取得
 * - startWatch: 位置の監視を開始（移動時も更新）
 * - stopWatch: 監視停止
 *
 * 返却値:
 * - position: { lat, lng, accuracy, timestamp } | null
 * - error: string
 * - loading: boolean
 * - isSupported: boolean
 */
const useGeolocation = (options = {}) => {
  const mergedOptions = useMemo(() => ({ ...defaultOptions, ...options }), [options]);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef(null);

  const isSupported = typeof navigator !== 'undefined' && !!navigator.geolocation;

  const clearWatch = useCallback(() => {
    if (watchIdRef.current != null && navigator?.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback((pos) => {
    const { latitude, longitude, accuracy } = pos.coords;
    setPosition({
      lat: latitude,
      lng: longitude,
      accuracy,
      timestamp: pos.timestamp,
    });
    setError('');
    setLoading(false);
  }, []);

  const handleError = useCallback((err) => {
    setError(err?.message || '位置情報の取得に失敗しました');
    setLoading(false);
  }, []);

  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setError('このブラウザは位置情報に対応していません');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, mergedOptions);
  }, [handleError, handleSuccess, isSupported, mergedOptions]);

  const startWatch = useCallback(() => {
    if (!isSupported) {
      setError('このブラウザは位置情報に対応していません');
      return;
    }
    clearWatch();
    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, mergedOptions);
    watchIdRef.current = id;
  }, [clearWatch, handleError, handleSuccess, isSupported, mergedOptions]);

  const stopWatch = useCallback(() => {
    clearWatch();
  }, [clearWatch]);

  useEffect(() => () => clearWatch(), [clearWatch]);

  return {
    position,
    error,
    loading,
    isSupported,
    requestLocation,
    startWatch,
    stopWatch,
  };
};

export default useGeolocation;

