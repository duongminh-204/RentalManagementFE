import { useState, useCallback, useEffect } from 'react';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadVehicleImage,
  searchVehiclesByLicensePlate,
  getVehiclesByRoom,
  getVehiclesByTenant,
  getUnknownVehicles,
  getParkingFeeSummary,
} from '../api/vehiclesApi';
import {
  normalizeVehicleFromApi,
  normalizeVehiclesList,
} from '../utils/vehicleHelpers';
import { resolveMediaUrl } from '../../rooms/utils/roomHelpers';
import { isForbiddenError, resolveForbiddenNotice, getApiErrorMessage, getOwnerSubscriptionNotice } from '../../../utils/apiError';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [unknownVehicles, setUnknownVehicles] = useState([]);
  const [parkingFeeSummary, setParkingFeeSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessNotice, setAccessNotice] = useState(() => getOwnerSubscriptionNotice());

  const fetchVehicles = useCallback(async (params = {}) => {
    const subscriptionNotice = getOwnerSubscriptionNotice();
    if (subscriptionNotice) {
      setAccessNotice(subscriptionNotice);
      setVehicles([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAccessNotice(null);
      const data = await getVehicles(params);
      setVehicles(normalizeVehiclesList(data));
    } catch (err) {
      if (isForbiddenError(err)) {
        setAccessNotice(resolveForbiddenNotice(err, { path: '/vehicles' }));
        setError(null);
      } else {
        setError(getApiErrorMessage(err, 'Lỗi khi tải dữ liệu xe'));
      }
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getVehicle = useCallback(async (id) => {
    try {
      setError(null);
      const data = await getVehicleById(id);
      return normalizeVehicleFromApi(data?.data ?? data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải chi tiết xe');
      throw err;
    }
  }, []);

  const addVehicle = useCallback(async (vehicleData) => {
    try {
      setError(null);
      const data = await createVehicle(vehicleData);
      const normalized = normalizeVehicleFromApi(data?.data ?? data);
      setVehicles((prev) => [...prev, normalized]);
      return normalized;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi thêm xe');
      throw err;
    }
  }, []);

  const editVehicle = useCallback(async (id, vehicleData) => {
    try {
      setError(null);
      const data = await updateVehicle(id, vehicleData);
      const normalized = normalizeVehicleFromApi(data?.data ?? data);
      setVehicles((prev) => prev.map((v) => (v.id === id ? normalized : v)));
      return normalized;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật xe');
      throw err;
    }
  }, []);

  const removeVehicle = useCallback(async (id) => {
    try {
      setError(null);
      await deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa xe');
      throw err;
    }
  }, []);

  const uploadImage = useCallback(async (vehicleId, file) => {
    try {
      setError(null);
      const data = await uploadVehicleImage(vehicleId, file);
      const path = data?.imageUrl ?? data?.data?.imageUrl;
      const imageUrl = resolveMediaUrl(path);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, imageUrl } : v))
      );
      return { imageUrl };
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi upload ảnh xe');
      throw err;
    }
  }, []);

  const searchByLicensePlate = useCallback(async (licensePlate) => {
    try {
      setError(null);
      const data = await searchVehiclesByLicensePlate(licensePlate);
      return normalizeVehiclesList(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tìm kiếm xe');
      throw err;
    }
  }, []);

  const fetchVehiclesByTenant = useCallback(async (tenantId) => {
    try {
      setError(null);
      const data = await getVehiclesByTenant(tenantId);
      return normalizeVehiclesList(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải xe của khách');
      throw err;
    }
  }, []);

  const fetchUnknownVehicles = useCallback(async () => {
    try {
      setError(null);
      const data = await getUnknownVehicles();
      setUnknownVehicles(normalizeVehiclesList(data));
      return normalizeVehiclesList(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải xe lạ');
      throw err;
    }
  }, []);

  const fetchParkingFeeSummary = useCallback(async () => {
    try {
      setError(null);
      const data = await getParkingFeeSummary();
      setParkingFeeSummary(data?.data ?? data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tính tổng phí gửi xe');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchUnknownVehicles();
    fetchParkingFeeSummary();
  }, [fetchVehicles, fetchUnknownVehicles, fetchParkingFeeSummary]);

  return {
    vehicles,
    unknownVehicles,
    parkingFeeSummary,
    loading,
    error,
    accessNotice,
    fetchVehicles,
    getVehicle,
    addVehicle,
    editVehicle,
    removeVehicle,
    uploadImage,
    searchByLicensePlate,
    fetchVehiclesByTenant,
    fetchUnknownVehicles,
    fetchParkingFeeSummary,
  };
};
