import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Loader, ArrowUpDown } from 'lucide-react';
import { useTenants } from '../../tenants';
import { useRooms } from '../../rooms';
import { useContracts } from '../hooks/useContracts';
import ContractReminders from './ContractReminders';
import {
  getContractStatusLabel,
  getContractStatusColor,
  resolveContractStatus,
  formatDate,
  formatCurrency,
} from '../utils/contractHelpers';

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Còn hiệu lực' },
  { value: 'expiring', label: 'Sắp hết hạn' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'terminated', label: 'Đã chấm dứt' },
];

const ContractsPage = () => {
  const navigate = useNavigate();
  const { tenants } = useTenants();
  const { rooms } = useRooms();
  const { contracts, reminders, loading, error, fetchContracts } = useContracts();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('endDate');
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContracts({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy,
        sortDesc,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, sortBy, sortDesc, fetchContracts]);

  const tenantMap = useMemo(
    () => Object.fromEntries(tenants.map((t) => [String(t.id), t])),
    [tenants]
  );
  const roomMap = useMemo(
    () => Object.fromEntries(rooms.map((r) => [String(r.id), r])),
    [rooms]
  );

  const resolveName = (contract) => {
    const tenant = tenantMap[contract.tenantId] || {};
    const room = roomMap[contract.roomId] || {};
    return {
      tenantName: contract.tenantName || tenant.fullName || '—',
      roomName: contract.roomName || room.roomName || room.roomNumber || '—',
    };
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDesc((v) => !v);
    else {
      setSortBy(field);
      setSortDesc(true);
    }
  };

  if (loading && contracts.length === 0) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-surface-light">
        <Loader className="animate-spin text-accent-violet" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hợp đồng</h1>
          <p className="mt-1 text-gray-600">Theo dõi, gia hạn và chấm dứt hợp đồng thuê</p>
        </div>
        <Link
          to="/contracts/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90"
        >
          <Plus size={20} /> Tạo hợp đồng
        </Link>
      </div>

      <ContractReminders reminders={reminders} onSelect={(id) => navigate(`/contracts/${id}`)} />

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo phòng, khách thuê..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="text-sm text-gray-500 self-center">{contracts.length} hợp đồng</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Khách thuê</th>
                <th className="px-4 py-3">Phòng</th>
                <th className="px-4 py-3">Giá thuê</th>
                <th className="px-4 py-3">
                  <button type="button" onClick={() => toggleSort('endDate')} className="inline-flex items-center gap-1">
                    Ngày hết hạn <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contracts.map((contract) => {
                const { tenantName, roomName } = resolveName(contract);
                const status = resolveContractStatus(contract);
                return (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{tenantName}</td>
                    <td className="px-4 py-3">{roomName}</td>
                    <td className="px-4 py-3">{formatCurrency(contract.rentPrice)}/tháng</td>
                    <td className="px-4 py-3">{formatDate(contract.endDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getContractStatusColor(status)}`}>
                        {getContractStatusLabel(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/contracts/${contract.id}`} className="font-medium text-primary hover:underline">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!contracts.length && (
          <p className="py-10 text-center text-gray-500">Không có hợp đồng phù hợp</p>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
      )}
    </div>
  );
};

export default ContractsPage;
