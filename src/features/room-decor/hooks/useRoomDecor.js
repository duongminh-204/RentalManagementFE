import { useCallback, useEffect, useState } from 'react';
import { generateRoomDecor, getDecorStatus, getDecorStyles } from '../api/roomDecorApi';
import { isForbiddenError, resolveForbiddenNotice, resolveFeatureRouteNotice, getApiErrorMessage } from '../../../utils/apiError';

export const useRoomDecor = () => {
  const [styles, setStyles] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [accessNotice, setAccessNotice] = useState(() => resolveFeatureRouteNotice('/rooms/decor'));
  const [result, setResult] = useState(null);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await getDecorStatus();
      setStatus(data);
    } catch {
      setStatus({ isAvailable: false, message: 'Không kiểm tra được trạng thái ComfyUI.' });
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const routeNotice = resolveFeatureRouteNotice('/rooms/decor');
      if (routeNotice) {
        if (!active) return;
        setAccessNotice(routeNotice);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setAccessNotice(null);
      try {
        const [stylesData, statusData] = await Promise.all([getDecorStyles(), getDecorStatus()]);
        if (!active) return;
        setStyles(Array.isArray(stylesData) ? stylesData : []);
        setStatus(statusData);
      } catch (err) {
        if (!active) return;
        if (isForbiddenError(err)) {
          setAccessNotice(resolveForbiddenNotice(err, { path: '/rooms/decor' }));
          setError(null);
        } else {
          setError(getApiErrorMessage(err, 'Không tải được cấu hình AI decor.'));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const generate = async (params) => {
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateRoomDecor(params);
      setResult(data);
      return data;
    } catch (err) {
      if (isForbiddenError(err)) {
        setAccessNotice(resolveForbiddenNotice(err, { path: '/rooms/decor' }));
        setError(null);
      } else {
        setError(
          getApiErrorMessage(
            err,
            err.code === 'ECONNABORTED'
              ? 'AI xử lý quá lâu. Hãy thử lại hoặc kiểm tra ComfyUI.'
              : 'Không tạo được ảnh decor.',
          ),
        );
      }
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  return {
    styles,
    status,
    loading,
    generating,
    error,
    accessNotice,
    result,
    generate,
    refreshStatus,
    setError,
    setResult,
  };
};
