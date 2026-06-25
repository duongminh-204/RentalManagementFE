import { useState, useCallback, useEffect } from 'react';
import {
  getContracts,
  getContractById,
  getContractDetail,
  createContract,
  updateContract,
  deleteContract,
  uploadContractFile,
  getExpiringContracts,
  getContractReminders,
  renewContract,
  terminateContract,
  updateContractDeposit,
  generateContractFromTemplate,
} from '../api/contractService';
import { normalizeContractFromApi, normalizeContractsList } from '../utils/contractHelpers';
import { openOrDownloadContractFile } from '../utils/contractFileHelpers';
import {
  isForbiddenError,
  resolveForbiddenNotice,
  resolveFeatureRouteNotice,
  getApiErrorMessage,
} from '../../../utils/apiError';

export const useContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessNotice, setAccessNotice] = useState(() => resolveFeatureRouteNotice('/contracts'));

  const fetchContracts = useCallback(async (params = {}) => {
    const routeNotice = resolveFeatureRouteNotice('/contracts');
    if (routeNotice) {
      setAccessNotice(routeNotice);
      setContracts([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAccessNotice(null);
      const data = await getContracts(params);
      setContracts(normalizeContractsList(data));
    } catch (err) {
      if (isForbiddenError(err)) {
        setAccessNotice(resolveForbiddenNotice(err, { path: '/contracts' }));
        setError(null);
      } else {
        setError(getApiErrorMessage(err, 'Lỗi khi tải dữ liệu hợp đồng'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getContract = useCallback(async (id) => {
    const data = await getContractById(id);
    return normalizeContractFromApi(data);
  }, []);

  const getDetail = useCallback(async (id) => {
    const data = await getContractDetail(id);
    return normalizeContractFromApi(data);
  }, []);

  const addContract = useCallback(async (contractData) => {
    const data = await createContract(contractData);
    const normalized = normalizeContractFromApi(data);
    setContracts((prev) => [...prev, normalized]);
    return normalized;
  }, []);

  const editContract = useCallback(async (id, contractData) => {
    const data = await updateContract(id, contractData);
    const normalized = normalizeContractFromApi(data);
    setContracts((prev) => prev.map((c) => (c.id === id ? normalized : c)));
    return normalized;
  }, []);

  const removeContract = useCallback(async (id) => {
    await deleteContract(id);
    setContracts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const uploadFile = useCallback(async (contractId, file) => {
    const data = await uploadContractFile(contractId, file);
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, fileUrl: data.fileUrl } : c))
    );
    return data;
  }, []);

  const downloadFile = useCallback(async (contract) => {
    const target = typeof contract === 'object' ? contract : { id: contract };
    await openOrDownloadContractFile(target);
  }, []);

  const fetchExpiringContracts = useCallback(async (days = 30) => {
    if (resolveFeatureRouteNotice('/contracts')) return [];
    const data = await getExpiringContracts(days);
    const normalized = normalizeContractsList(data);
    setExpiringContracts(normalized);
    return normalized;
  }, []);

  const fetchReminders = useCallback(async () => {
    if (resolveFeatureRouteNotice('/contracts')) return [];
    const data = await getContractReminders();
    setReminders(Array.isArray(data) ? data : []);
    return data;
  }, []);

  const renewContractFn = useCallback(async (contractId, renewalData) => {
    const data = await renewContract(contractId, renewalData);
    const normalized = normalizeContractFromApi(data);
    setContracts((prev) => {
      const filtered = renewalData?.cloneContract === false
        ? prev.map((c) => (c.id === contractId ? normalized : c))
        : prev.filter((c) => c.id !== contractId);
      return [...filtered, normalized];
    });
    return normalized;
  }, []);

  const terminateContractFn = useCallback(async (contractId, terminationData) => {
    const data = await terminateContract(contractId, terminationData);
    const normalized = normalizeContractFromApi(data);
    setContracts((prev) => prev.map((c) => (c.id === contractId ? normalized : c)));
    return normalized;
  }, []);

  const updateDepositFn = useCallback(async (contractId, depositData) => {
    const data = await updateContractDeposit(contractId, depositData);
    const normalized = normalizeContractFromApi(data);
    setContracts((prev) => prev.map((c) => (c.id === contractId ? normalized : c)));
    return normalized;
  }, []);

  const generateFromTemplate = useCallback(async (contractId, templateData) => {
    const data = await generateContractFromTemplate(contractId, templateData);
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, fileUrl: data.fileUrl } : c))
    );
    return data;
  }, []);

  useEffect(() => {
    fetchContracts();
    fetchExpiringContracts();
    fetchReminders();
  }, [fetchContracts, fetchExpiringContracts, fetchReminders]);

  return {
    contracts,
    expiringContracts,
    reminders,
    loading,
    error,
    accessNotice,
    fetchContracts,
    getContract,
    getDetail,
    addContract,
    editContract,
    removeContract,
    uploadFile,
    downloadFile,
    fetchExpiringContracts,
    fetchReminders,
    renewContractFn,
    terminateContractFn,
    updateDepositFn,
    generateFromTemplate,
  };
};
