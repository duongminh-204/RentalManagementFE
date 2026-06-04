import { useCallback, useEffect, useState } from 'react';
import * as profileApi from '../api/profileApi';
import { normalizeProfile, resolveMediaUrl, syncStoredUser } from '../utils/profileHelpers';

const extractError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await profileApi.getProfile();
      setProfile(normalizeProfile(data));
    } catch (err) {
      setError(extractError(err, 'Không tải được thông tin tài khoản.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = useCallback(async (form) => {
    const data = await profileApi.updateProfile({
      fullName: form.fullName?.trim(),
      email: form.email?.trim() || null,
      phoneNumber: form.phoneNumber?.trim() || null,
      cccd: form.cccd?.trim() || null,
      address: form.address?.trim() || null,
    });
    const normalized = normalizeProfile(data);
    setProfile(normalized);
    syncStoredUser(normalized);
    return normalized;
  }, []);

  const uploadAvatar = useCallback(async (file) => {
    const data = await profileApi.uploadAvatar(file);
    const raw = data?.avatar ?? data?.Avatar ?? data;
    const avatar = resolveMediaUrl(raw);
    setProfile((prev) => {
      const next = prev ? { ...prev, avatar } : prev;
      if (next) syncStoredUser(next);
      return next;
    });
    return avatar;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return profileApi.changePassword({ currentPassword, newPassword });
  }, []);

  return {
    profile,
    loading,
    error,
    reload: loadProfile,
    saveProfile,
    uploadAvatar,
    changePassword,
  };
};
