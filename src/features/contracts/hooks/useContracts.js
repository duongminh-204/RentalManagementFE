import { useState, useCallback, useEffect } from 'react';
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  uploadContractFile,
  getExpiringContracts,
  renewContract,
  terminateContract,
} from '../api/contractsApi';
import { normalizeContractsList } from '../utils/contractHelpers';
import { openOrDownloadContractFile } from '../utils/contractFileHelpers';

export const useContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all contracts
  const fetchContracts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContracts(params);
      setContracts(normalizeContractsList(data));
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu hợp đồng');
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single contract
  const getContract = useCallback(async (id) => {
    try {
      setError(null);
      const data = await getContractById(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải chi tiết hợp đồng');
      throw err;
    }
  }, []);

  // Add new contract
  const addContract = useCallback(async (contractData) => {
    try {
      setError(null);
      const data = await createContract(contractData);
      setContracts((prevContracts) => [...prevContracts, data]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi thêm hợp đồng');
      throw err;
    }
  }, []);

  // Edit contract
  const editContract = useCallback(async (id, contractData) => {
    try {
      setError(null);
      const data = await updateContract(id, contractData);
      setContracts((prevContracts) =>
        prevContracts.map((c) => (c.id === id ? data : c))
      );
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật hợp đồng');
      throw err;
    }
  }, []);

  // Remove contract
  const removeContract = useCallback(async (id) => {
    try {
      setError(null);
      await deleteContract(id);
      setContracts((prevContracts) => prevContracts.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa hợp đồng');
      throw err;
    }
  }, []);

  // Upload contract file
  const uploadFile = useCallback(async (contractId, file) => {
    try {
      setError(null);
      const data = await uploadContractFile(contractId, file);
      setContracts((prevContracts) =>
        prevContracts.map((c) => (c.id === contractId ? { ...c, fileUrl: data.fileUrl } : c))
      );
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi upload file hợp đồng');
      throw err;
    }
  }, []);

  // Download contract file
  const downloadFile = useCallback(async (contract) => {
    try {
      setError(null);
      const target =
        typeof contract === 'object'
          ? contract
          : { id: contract };
      await openOrDownloadContractFile(target);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Lỗi khi xem/tải file hợp đồng');
      throw err;
    }
  }, []);

  // Get expiring contracts
  const fetchExpiringContracts = useCallback(async (days = 30) => {
    try {
      setError(null);
      const data = await getExpiringContracts(days);
      setExpiringContracts(normalizeContractsList(data));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải hợp đồng sắp hết hạn');
      throw err;
    }
  }, []);

  // Renew contract
  const renewContractFn = useCallback(async (contractId, renewalData) => {
    try {
      setError(null);
      const data = await renewContract(contractId, renewalData);
      setContracts((prevContracts) =>
        prevContracts.map((c) => (c.id === contractId ? data : c))
      );
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gia hạn hợp đồng');
      throw err;
    }
  }, []);

  // Terminate contract
  const terminateContractFn = useCallback(async (contractId, terminationData) => {
    try {
      setError(null);
      const data = await terminateContract(contractId, terminationData);
      setContracts((prevContracts) =>
        prevContracts.map((c) => (c.id === contractId ? data : c))
      );
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi chấm dứt hợp đồng');
      throw err;
    }
  }, []);

  // Load contracts on mount
  useEffect(() => {
    fetchContracts();
    fetchExpiringContracts();
  }, [fetchContracts, fetchExpiringContracts]);

  return {
    contracts,
    expiringContracts,
    loading,
    error,
    fetchContracts,
    getContract,
    addContract,
    editContract,
    removeContract,
    uploadFile,
    downloadFile,
    fetchExpiringContracts,
    renewContractFn,
    terminateContractFn,
  };
};
