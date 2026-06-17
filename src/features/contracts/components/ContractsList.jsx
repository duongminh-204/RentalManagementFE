import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, AlertTriangle, Loader } from 'lucide-react';
import ContractCard from './ContractCard';
import ContractForm from './ContractForm';
import { useContracts } from '../hooks/useContracts';
import { getContractStatus, prepareContractPayload } from '../utils/contractHelpers';

const ContractsList = ({ tenants = [], rooms = [] }) => {
  const {
    contracts,
    expiringContracts,
    loading,
    error,
    addContract,
    editContract,
    removeContract,
    uploadFile,
    downloadFile,
    renewContractFn,
  } = useContracts();

  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [renewingContractId, setRenewingContractId] = useState(null);

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    const tenant = tenants.find(t => t.id === contract.tenantId);
    const room = rooms.find(r => r.id === contract.roomId);
    
    const matchSearch = 
      contract.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.roomNumber?.includes(searchTerm);
    
    const status = getContractStatus(contract.startDate, contract.endDate, contract.status === 'terminated');
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const handleAddContract = async (formData) => {
    try {
      setFormLoading(true);
      setFormError(null);
      
      const { contractFile, ...contractData } = formData;
      const newContract = await addContract(prepareContractPayload(contractData));
      
      // Upload file if provided
      if (contractFile) {
        await uploadFile(newContract.id, contractFile);
      }
      
      setShowForm(false);
      setEditingContract(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi tạo hợp đồng');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditContract = async (formData) => {
    try {
      setFormLoading(true);
      setFormError(null);
      
      const { contractFile, ...contractData } = formData;
      await editContract(editingContract.id, prepareContractPayload(contractData));
      
      // Upload file if provided and it's a new file
      if (contractFile && typeof contractFile !== 'string') {
        await uploadFile(editingContract.id, contractFile);
      }
      
      setShowForm(false);
      setEditingContract(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi cập nhật hợp đồng');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setShowForm(true);
    setFormError(null);
  };

  const handleDelete = async (contractId) => {
    if (!window.confirm('Bạn có chắc muốn xóa hợp đồng này?')) return;
    try {
      await removeContract(contractId);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi xóa hợp đồng');
    }
  };

  const handleDownload = async (contract) => {
    try {
      await downloadFile(contract);
    } catch (err) {
      setFormError(err.message || err.response?.data?.message || 'Lỗi khi xem/tải file hợp đồng');
    }
  };

  const handleRenew = async (contract) => {
    setRenewingContractId(contract.id);
    try {
      const newEndDate = new Date(contract.endDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      
      await renewContractFn(contract.id, {
        newEndDate: newEndDate.toISOString().split('T')[0],
        renewalDate: new Date().toISOString().split('T')[0],
      });
      
      alert('Hợp đồng đã được gia hạn thành công');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi khi gia hạn hợp đồng');
    } finally {
      setRenewingContractId(null);
    }
  };

  const handleExport = () => {
    console.log('Exporting contracts data...');
    // TODO: Implement CSV/Excel export
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => getContractStatus(c.startDate, c.endDate, c.status === 'terminated') === 'active').length,
    expiring_soon: expiringContracts.length,
    expired: contracts.filter(c => getContractStatus(c.startDate, c.endDate, c.status === 'terminated') === 'expired').length,
  };

  const statCards = [
    { label: 'Tổng hợp đồng', value: stats.total, color: 'blue' },
    { label: 'Còn hiệu lực', value: stats.active, color: 'green' },
    { label: 'Sắp hết hạn', value: stats.expiring_soon, color: 'orange', highlight: true },
    { label: 'Hết hạn', value: stats.expired, color: 'red' },
  ];

  const getBgClass = (color, highlight = false) => {
    const map = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      orange: 'bg-orange-50 border-orange-200',
      red: 'bg-red-50 border-red-200',
    };
    return map[color] || 'bg-gray-50 border-gray-200';
  };

  const getTextClass = (color) => {
    const map = {
      blue: 'text-blue-700',
      green: 'text-green-700',
      orange: 'text-orange-700',
      red: 'text-red-700',
    };
    return map[color] || 'text-gray-700';
  };

  if (loading && contracts.length === 0) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto text-accent-violet animate-spin mb-3" size={32} />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light w-full flex-1 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý hợp đồng thuê</h1>
              <p className="text-gray-600 mt-1">Tạo, quản lý và theo dõi hợp đồng thuê phòng</p>
            </div>
            <button
              onClick={() => {
                setEditingContract(null);
                setShowForm(true);
                setFormError(null);
              }}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              <Plus size={20} /> Tạo hợp đồng
            </button>
          </div>

          {/* Alert for expiring contracts */}
          {stats.expiring_soon > 0 && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="text-orange-600 mt-0.5" size={24} />
              <div>
                <p className="font-semibold text-orange-900">
                  {stats.expiring_soon} hợp đồng sắp hết hạn
                </p>
                <p className="text-sm text-orange-800 mt-1">
                  Hãy chuẩn bị gia hạn các hợp đồng này để tránh gián đoạn thu nhập
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${getBgClass(card.color)} ${
                  card.highlight ? 'ring-2 ring-orange-400' : ''
                }`}
              >
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${getTextClass(card.color)}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm theo số HĐ, tên khách, phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Còn hiệu lực</option>
              <option value="expiring_soon">Sắp hết hạn</option>
              <option value="expired">Hết hạn</option>
              <option value="terminated">Đã chấm dứt</option>
            </select>

            {/* Export */}
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Download size={20} /> Xuất file
            </button>
          </div>
        </div>

        {/* Contracts Grid */}
        <AnimatePresence>
          {filteredContracts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContracts.map((contract) => {
                const tenant = tenants.find(t => t.id === contract.tenantId);
                const room = rooms.find(r => r.id === contract.roomId);
                
                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ContractCard
                      contract={contract}
                      tenant={tenant}
                      room={room}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onRenew={handleRenew}
                    />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">Không có hợp đồng nào</p>
              <p className="text-gray-400 mt-1">Bắt đầu bằng cách tạo hợp đồng mới</p>
            </div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ContractForm
          contract={editingContract}
          tenants={tenants}
          rooms={rooms}
          onSubmit={editingContract ? handleEditContract : handleAddContract}
          onCancel={() => {
            setShowForm(false);
            setEditingContract(null);
            setFormError(null);
          }}
          loading={formLoading}
          error={formError}
        />
      )}
    </div>
  );
};

export default ContractsList;
