import { useState, useCallback, useEffect } from 'react';
import * as tenantsApi from '../api/tenantsApi';
import {
  normalizeTenantFromApi,
  normalizeTenantsList,
  resolveMediaUrl,
} from '../utils/tenantHelpers';
import {
  isForbiddenError,
  resolveForbiddenNotice,
  getApiErrorMessage,
} from '../../../utils/apiError';

export const useTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessNotice, setAccessNotice] = useState(null);

  const fetchTenants = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      setAccessNotice(null);
      const data = await tenantsApi.getTenants(params);
      setTenants(normalizeTenantsList(data));
    } catch (err) {
      if (isForbiddenError(err)) {
        setAccessNotice(resolveForbiddenNotice(err, { path: '/tenants' }));
        setError(null);
      } else {
        setError(getApiErrorMessage(err, 'Lỗi khi tải dữ liệu khách thuê'));
      }
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTenant = useCallback(async (id) => {
    const data = await tenantsApi.getTenantById(id);
    return normalizeTenantFromApi(data?.data ?? data);
  }, []);

  const addTenant = useCallback(async (tenantData) => {
    const data = await tenantsApi.createTenant(tenantData);
    const normalized = normalizeTenantFromApi(data?.data ?? data);
    setTenants((prev) => [...prev, normalized]);
    return normalized;
  }, []);

  const editTenant = useCallback(async (id, tenantData) => {
    const data = await tenantsApi.updateTenant(id, tenantData);
    const normalized = normalizeTenantFromApi(data?.data ?? data);
    setTenants((prev) => prev.map((t) => (String(t.id) === String(id) ? normalized : t)));
    return normalized;
  }, []);

  const removeTenant = useCallback(async (id) => {
    await tenantsApi.deleteTenant(id);
    setTenants((prev) => prev.filter((t) => String(t.id) !== String(id)));
  }, []);

  // ==================== UPLOAD CCCD ====================
  const uploadIDCard = useCallback(async (tenantId, file) => {
    const data = await tenantsApi.uploadIdCardImage(tenantId, file);
    const raw = data?.idCardImage ?? data?.IdCardImage ?? data;
    const imageUrl = resolveMediaUrl(raw);

    setTenants((prev) =>
      prev.map((t) => (String(t.id) === String(tenantId) ? { ...t, idCardImage: imageUrl } : t))
    );
    return data;
  }, []);

  // ==================== UPLOAD AVATAR ====================
  const uploadAvatar = useCallback(async (tenantId, file) => {
    const data = await tenantsApi.uploadAvatarImage(tenantId, file);
    const raw = data?.avatar ?? data?.Avatar ?? data?.imageUrl ?? data;
    const imageUrl = resolveMediaUrl(raw);
    setTenants((prev) =>
      prev.map((t) => (String(t.id) === String(tenantId) ? { ...t, avatar: imageUrl } : t))
    );

    return data;
  }, []);

  const removeIdCardImage = useCallback(async (tenantId) => {
    await tenantsApi.deleteIdCardImage(tenantId);
    setTenants((prev) =>
      prev.map((t) => (String(t.id) === String(tenantId) ? { ...t, idCardImage: null } : t))
    );
  }, []);

  const fetchTenantHistory = useCallback(async (tenantId) => {
    const data = await tenantsApi.getTenantHistory(tenantId);
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list;
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return {
    tenants,
    loading,
    error,
    accessNotice,
    fetchTenants,
    getTenant,
    addTenant,
    editTenant,
    removeTenant,
    uploadIDCard,
    uploadAvatar,
    removeIdCardImage,
    fetchTenantHistory,
  };
};