import { useCallback, useState } from 'react';
import {
  getLegalDashboard,
  getLegalAlerts,
  getTenantLegalSummaries,
  getTenantLegalDetail,
  updateTenantLegalProfile,
  uploadTenantLegalDocument,
  getRoomLegalSummaries,
  getRoomLegalDetail,
  updateRoomLegalProfile,
  uploadRoomHandover,
  getBuildingLegalDocuments,
  createBuildingLegalDocument,
  updateBuildingLegalDocument,
  deleteBuildingLegalDocument,
  uploadBuildingLegalDocumentFile,
  syncLegalNotifications,
} from '../api/legalApi';
import {
  normalizeDashboard,
  normalizeTenantSummary,
  normalizeTenantDetail,
  normalizeRoomSummary,
  normalizeRoomDetail,
  normalizeBuildingDocument,
} from '../utils/legalHelpers';
import { getApiErrorMessage, isForbiddenError, resolveForbiddenNotice } from '../../../utils/apiError';

export const useLegal = () => {
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessNotice, setAccessNotice] = useState(null);

  const handleError = useCallback((err, fallback) => {
    if (isForbiddenError(err)) {
      setAccessNotice(resolveForbiddenNotice(err, { path: '/legal', featureKey: 'legalChecklist' }));
      return;
    }
    setError(getApiErrorMessage(err, fallback));
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLegalDashboard();
      setDashboard(normalizeDashboard(data));
      setAlerts((data?.actionItems ?? []).length ? data.actionItems : await getLegalAlerts());
    } catch (err) {
      handleError(err, 'Không tải được dữ liệu pháp lý.');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTenantLegalSummaries();
      setTenants(data.map(normalizeTenantSummary));
    } catch (err) {
      handleError(err, 'Không tải được danh sách khách thuê.');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRoomLegalSummaries();
      setRooms(data.map(normalizeRoomSummary));
    } catch (err) {
      handleError(err, 'Không tải được danh sách phòng.');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchDocuments = useCallback(async (buildingId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBuildingLegalDocuments(buildingId);
      setDocuments(data.map(normalizeBuildingDocument));
    } catch (err) {
      handleError(err, 'Không tải được giấy tờ khu trọ.');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchTenantDetail = useCallback(async (tenantId) => {
    const data = await getTenantLegalDetail(tenantId);
    return normalizeTenantDetail(data);
  }, []);

  const fetchRoomDetail = useCallback(async (roomId) => {
    const data = await getRoomLegalDetail(roomId);
    return normalizeRoomDetail(data);
  }, []);

  const saveTenantProfile = useCallback(async (tenantId, payload) => {
    await updateTenantLegalProfile(tenantId, payload);
    await fetchTenants();
  }, [fetchTenants]);

  const uploadTenantDoc = useCallback(async (tenantId, docType, file) => {
    await uploadTenantLegalDocument(tenantId, docType, file);
    await fetchTenants();
  }, [fetchTenants]);

  const saveRoomProfile = useCallback(async (roomId, payload) => {
    await updateRoomLegalProfile(roomId, payload);
    await fetchRooms();
  }, [fetchRooms]);

  const uploadHandover = useCallback(async (roomId, file) => {
    await uploadRoomHandover(roomId, file);
    await fetchRooms();
  }, [fetchRooms]);

  const saveDocument = useCallback(async (buildingId, payload, documentId) => {
    if (documentId) {
      await updateBuildingLegalDocument(documentId, payload);
    } else {
      await createBuildingLegalDocument(buildingId, payload);
    }
    await fetchDocuments();
  }, [fetchDocuments]);

  const removeDocument = useCallback(async (documentId) => {
    await deleteBuildingLegalDocument(documentId);
    await fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocumentFile = useCallback(async (documentId, file) => {
    await uploadBuildingLegalDocumentFile(documentId, file);
    await fetchDocuments();
  }, [fetchDocuments]);

  const syncNotifications = useCallback(async () => {
    return syncLegalNotifications();
  }, []);

  return {
    dashboard,
    alerts,
    tenants,
    rooms,
    documents,
    loading,
    error,
    accessNotice,
    fetchDashboard,
    fetchTenants,
    fetchRooms,
    fetchDocuments,
    fetchTenantDetail,
    fetchRoomDetail,
    saveTenantProfile,
    uploadTenantDoc,
    saveRoomProfile,
    uploadHandover,
    saveDocument,
    removeDocument,
    uploadDocumentFile,
    syncNotifications,
  };
};
