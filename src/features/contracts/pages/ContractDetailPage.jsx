import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, RefreshCw, XCircle, Loader } from 'lucide-react';
import { useContracts } from '../hooks/useContracts';
import PaymentHistoryTable from '../components/PaymentHistoryTable';
import DepositPanel from '../components/DepositPanel';
import ContractRenewModal from '../components/ContractRenewModal';
import ContractTerminateModal from '../components/ContractTerminateModal';
import {
  formatCurrency,
  formatDate,
  getContractStatusLabel,
  getContractStatusColor,
  resolveContractStatus,
  getPaymentCycleLabel,
} from '../utils/contractHelpers';
import FeatureRouteLock from '../../../components/common/FeatureRouteLock';

const ContractDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getDetail,
    downloadFile,
    renewContractFn,
    terminateContractFn,
    updateDepositFn,
    generateFromTemplate,
  } = useContracts();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRenew, setShowRenew] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDetail(id);
      setContract(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleRenew = async (data) => {
    try {
      setActionLoading(true);
      const renewed = await renewContractFn(Number(id), data);
      setShowRenew(false);
      navigate(`/contracts/${renewed.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi gia hạn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async (data) => {
    try {
      setActionLoading(true);
      const updated = await terminateContractFn(Number(id), data);
      setContract(updated);
      setShowTerminate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi chấm dứt hợp đồng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDepositUpdate = async (data) => {
    try {
      setActionLoading(true);
      const updated = await updateDepositFn(Number(id), data);
      setContract(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi cập nhật cọc');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <FeatureRouteLock path="/contracts">
    {loading ? (
      <div className="flex min-h-screen items-center justify-center bg-surface-light">
        <Loader className="animate-spin text-accent-violet" size={32} />
      </div>
    ) : !contract ? (
      <div className="p-8 text-center">
        <p className="text-gray-600">{error || 'Không tìm thấy hợp đồng'}</p>
        <Link to="/contracts" className="mt-4 inline-block text-primary">Quay lại</Link>
      </div>
    ) : (
    (() => {
      const status = resolveContractStatus(contract);
      const canTerminate = !contract.isTerminated && status !== 'cancelled';
      return (
    <div className="min-h-screen bg-surface-light px-4 py-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate('/contracts')}
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} /> Danh sách hợp đồng
      </button>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hợp đồng #{contract.id} — {contract.tenant?.fullName || contract.tenantName}
          </h1>
          <p className="text-gray-600">Phòng {contract.room?.roomName || contract.roomName}</p>
          <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${getContractStatusColor(status)}`}>
            {getContractStatusLabel(status)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {contract.fileUrl && (
            <button
              type="button"
              onClick={() => downloadFile(contract)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <Download size={16} /> Tải file HĐ
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              await generateFromTemplate(contract.id);
              load();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <FileText size={16} /> Tạo từ mẫu
          </button>
          {canTerminate && (
            <>
              <button
                type="button"
                onClick={() => setShowRenew(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
              >
                <RefreshCw size={16} /> Gia hạn
              </button>
              <button
                type="button"
                onClick={() => setShowTerminate(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
              >
                <XCircle size={16} /> Chấm dứt
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">Thông tin khách thuê</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Họ tên</dt><dd>{contract.tenant?.fullName}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">SĐT</dt><dd>{contract.tenant?.phoneNumber || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd>{contract.tenant?.email || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">CCCD</dt><dd>{contract.tenant?.cccd || '—'}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">Thông tin phòng</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Tên phòng</dt><dd>{contract.room?.roomName}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Trạng thái</dt><dd>{contract.room?.status}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Diện tích</dt><dd>{contract.room?.area ? `${contract.room.area} m²` : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Giá phòng</dt><dd>{formatCurrency(contract.room?.price || 0)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-semibold">Điều khoản hợp đồng</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div><p className="text-gray-500">Bắt đầu</p><p className="font-medium">{formatDate(contract.startDate)}</p></div>
          <div><p className="text-gray-500">Kết thúc</p><p className="font-medium">{formatDate(contract.endDate)}</p></div>
          <div><p className="text-gray-500">Giá thuê</p><p className="font-medium">{formatCurrency(contract.rentPrice)}</p></div>
          <div><p className="text-gray-500">Chu kỳ</p><p className="font-medium">{getPaymentCycleLabel(contract.paymentCycle)}</p></div>
        </div>
        {contract.terms && <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{contract.terms}</p>}
        {contract.notes && (
          <div className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-600">
            <p className="font-medium text-gray-700">Ghi chú</p>
            {contract.notes}
          </div>
        )}
      </div>

      <div className="mb-6 space-y-6">
        <DepositPanel contract={contract} onUpdateDeposit={handleDepositUpdate} loading={actionLoading} />
        <PaymentHistoryTable payments={contract.paymentHistory} />
      </div>

      {contract.renewalHistory?.length > 0 && (
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">Lịch sử gia hạn</h3>
          <ul className="space-y-2 text-sm">
            {contract.renewalHistory.map((r, i) => (
              <li key={i} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                {formatDate(r.renewedAt)} — {r.extendMonths} tháng · {formatCurrency(r.oldRentPrice)} → {formatCurrency(r.newRentPrice)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showRenew && (
        <ContractRenewModal
          contract={contract}
          onSubmit={handleRenew}
          onCancel={() => setShowRenew(false)}
          loading={actionLoading}
        />
      )}
      {showTerminate && (
        <ContractTerminateModal
          contract={contract}
          onSubmit={handleTerminate}
          onCancel={() => setShowTerminate(false)}
          loading={actionLoading}
        />
      )}
    </div>
      );
    })()
    )}
    </FeatureRouteLock>
  );
};

export default ContractDetailPage;
