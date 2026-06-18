import { useCallback, useEffect, useState } from 'react';
import { generateRoomDecor, getDecorStatus, getDecorStyles } from '../api/roomDecorApi';

export const useRoomDecor = () => {
  const [styles, setStyles] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
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
      setLoading(true);
      setError(null);
      try {
        const [stylesData, statusData] = await Promise.all([getDecorStyles(), getDecorStatus()]);
        if (!active) return;
        setStyles(Array.isArray(stylesData) ? stylesData : []);
        setStatus(statusData);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Không tải được cấu hình AI decor.');
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
      const message =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'AI xử lý quá lâu. Hãy thử lại hoặc kiểm tra ComfyUI.'
          : 'Không tạo được ảnh decor.');
      setError(message);
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
    result,
    generate,
    refreshStatus,
    setError,
    setResult,
  };
};
