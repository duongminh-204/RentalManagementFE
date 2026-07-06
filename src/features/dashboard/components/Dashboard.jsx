import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CircleCheckBig,
  Download,
  FileUp,
  LoaderCircle,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import RoomStatusChart from './RoomStatusChart';
import DebtOverview from './DebtOverview';
import RevenueChart from './RevenueChart';
import MonthlyRevenueReport from './MonthlyRevenueReport';
import { useDashboard } from '../hooks/useDashboard';
import {
  downloadDashboardImportTemplate,
  exportDashboardExcel,
  importDashboardExcel,
} from '../api/dashboardApi';
import { formatCount, formatMonthLabel } from '../utils/dashboardFormat';
import FeatureLockedNotice from '../../../components/common/FeatureLockedNotice';
import { resolveForbiddenNotice } from '../../../utils/apiError';
import { getStoredUser, isOwnerSubscriptionActive } from '../../../hooks/useAuth';

const DOWNLOAD_ERROR_MESSAGE =
  'Chưa tải được file mẫu. Nếu backend vừa được cập nhật, hãy khởi động lại backend rồi thử lại.';


const TAGLINE_ITEMS = [
  { icon: Sparkles, text: 'Quản lý thông minh', tone: 'violet' },
  { icon: Zap, text: 'Vận hành dễ dàng', tone: 'lime' },
  { icon: TrendingUp, text: 'Tăng trưởng bền vững', tone: 'pink' },
];

const getApiErrorMessage = (err, fallbackMessage) => {
  const data = err.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  return data?.message || data?.title || data?.detail || fallbackMessage;
};


const Dashboard = () => {
  const { stats, roomStats, debtInfo, revenue, lockedFeatures, loading, error, refetch } = useDashboard();
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);

  const totalRooms = Number(stats?.totalRooms ?? roomStats?.totalRooms ?? 0);
  const occupiedRooms = Number(stats?.occupiedRooms ?? roomStats?.occupiedRooms ?? 0);
  const emptyRooms = Number(stats?.emptyRooms ?? roomStats?.emptyRooms ?? 0);
  const monthlyRevenue = Number(revenue?.monthlyRevenue ?? stats?.monthlyRevenue ?? 0);
  const unpaidTenantsCount = Number(debtInfo?.unpaidTenantsCount ?? stats?.unpaidTenantsCount ?? 0);
  const totalDebt = Number(debtInfo?.totalDebt ?? stats?.totalDebt ?? 0);
  const topDebtors = Array.isArray(debtInfo?.topDebtors) ? debtInfo.topDebtors : [];

  const hasActiveSubscription = isOwnerSubscriptionActive(getStoredUser());
  const hasLockedReports =
    hasActiveSubscription &&
    (lockedFeatures.includes('debtReports') || lockedFeatures.includes('revenueReports'));
  const debtNotice =
    hasActiveSubscription && lockedFeatures.includes('debtReports')
      ? resolveForbiddenNotice(
          { response: { status: 403 } },
          { featureLabel: 'Báo cáo công nợ', requiredPackage: 'PRO', featureKey: 'debtReports' },
        )
      : null;
  const revenueNotice =
    hasActiveSubscription && lockedFeatures.includes('revenueReports')
      ? resolveForbiddenNotice(
          { response: { status: 403 } },
          { featureLabel: 'Báo cáo doanh thu', requiredPackage: 'PRO', featureKey: 'revenueReports' },
        )
      : null;

  const currentDate = new Date();
  const currentMonthLabel = formatMonthLabel(currentDate);
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const hasAnyData =
    totalRooms > 0 ||
    occupiedRooms > 0 ||
    emptyRooms > 0 ||
    monthlyRevenue > 0 ||
    unpaidTenantsCount > 0 ||
    totalDebt > 0;

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      setImportError('');

      const { blob, fileName } = await downloadDashboardImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const backendMessage = err.response?.status === 404 ? DOWNLOAD_ERROR_MESSAGE : null;
      setImportError(backendMessage || 'Không thể tải file mẫu lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setImportError('');
      const { blob, fileName } = await exportDashboardExcel(currentMonth, currentYear);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setImportError(getApiErrorMessage(err, 'Không thể xuất file Excel lúc này. Vui lòng thử lại.'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setIsImporting(true);
      setImportError('');
      const result = await importDashboardExcel(file);
      setImportResult(result);
      await refetch();
    } catch (err) {
      if (err.response?.status === 404) {
        setImportError('Backend hiện chưa có API import Excel. Hãy khởi động lại backend rồi thử nhập lại.');
      } else {
        setImportError(getApiErrorMessage(err, 'Không thể nhập file Excel. Vui lòng kiểm tra lại mẫu file.'));
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="dashboard-shell min-h-screen w-full flex-1 bg-surface-light">
      <div className="page-content page-content--wide">
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="dashboard-hero-main"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <span className="dashboard-hero-badge">Tổng quan {currentMonthLabel}</span>
              <h1 className="mt-4 text-[clamp(1.5rem,5.5vw,2.25rem)] font-bold leading-tight text-ink-deep">
                Dashboard nhà trọ
              </h1>
              <p className="dashboard-hero-tagline" aria-label="Quản lý thông minh – Vận hành dễ dàng – Tăng trưởng bền vững">
                {TAGLINE_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.span
                      key={item.text}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.12 + index * 0.1 }}
                      className="dashboard-hero-tagline__group"
                    >
                      {index > 0 ? (
                        <span className="dashboard-hero-tagline__divider" aria-hidden="true">
                          –
                        </span>
                      ) : null}
                      <span className={`dashboard-hero-tagline__pill dashboard-hero-tagline__pill--${item.tone}`}>
                        <span className="dashboard-hero-tagline__icon">
                          <Icon className="h-4 w-4" strokeWidth={2.25} />
                        </span>
                        <span className="dashboard-hero-tagline__text">{item.text}</span>
                      </span>
                    </motion.span>
                  );
                })}
              </p>
            </div>

            <div className="dashboard-action-group">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting}
                className="dashboard-action-button"
              >
                {isExporting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isExporting ? 'Đang xuất Excel...' : 'Xuất Excel'}
              </button>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className="dashboard-action-button"
              >
                {isDownloadingTemplate ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloadingTemplate ? 'Đang tải file mẫu...' : 'Tải file mẫu'}
              </button>
              <button
                type="button"
                onClick={handleOpenFilePicker}
                disabled={isImporting}
                className="dashboard-action-button dashboard-action-button--primary"
              >
                {isImporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                {isImporting ? 'Đang nhập dữ liệu...' : 'Nhập Excel'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
          </div>
        </motion.section>

        {error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 mt-8 rounded-2xl border border-[#f3c3d3] bg-[#fff6f9] px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-pink" />
              <div>
                <p className="text-base font-bold text-ink-deep">Chưa tải được đầy đủ dữ liệu dashboard.</p>
                <p className="mt-1 text-sm leading-6 text-muted">Chi tiết lỗi: {error}</p>
              </div>
            </div>
          </motion.div>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-hairline-cloud border-t-primary" />
            <p className="mt-4 text-base font-semibold text-muted">Đang tải dữ liệu tổng quan...</p>
          </div>
        ) : (
          <>
            {hasLockedReports ? (
              <div className="mt-8 space-y-4">
                {debtNotice ? <FeatureLockedNotice {...debtNotice} compact /> : null}
                {revenueNotice ? <FeatureLockedNotice {...revenueNotice} compact /> : null}
              </div>
            ) : null}

            <section className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
              {!lockedFeatures.includes('revenueReports') ? (
                <RevenueChart monthlyRevenue={monthlyRevenue} totalDebt={totalDebt} />
              ) : null}
              {!lockedFeatures.includes('debtReports') ? (
                <DebtOverview
                  unpaidTenantsCount={unpaidTenantsCount}
                  totalDebt={totalDebt}
                  topDebtors={topDebtors}
                />
              ) : null}
              <RoomStatusChart
                totalRooms={totalRooms}
                occupiedRooms={occupiedRooms}
                emptyRooms={emptyRooms}
              />
            </section>

            {!lockedFeatures.includes('revenueReports') ? (
            <section className="mt-8">
              {importError ? (
                <div className="mb-5 rounded-2xl border border-[#f3c3d3] bg-[#fff6f9] px-4 py-3 text-sm text-ink-deep">
                  {importError}
                </div>
              ) : null}

              {importResult ? (
                <div className="mb-5 rounded-2xl border border-[#cfe7be] bg-[#f8fff0] px-4 py-4">
                  <p className="text-base font-bold text-ink-deep">{importResult.message}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="dashboard-import-chip">Phòng: {formatCount(importResult.roomsImported)}</div>
                    <div className="dashboard-import-chip">Khách: {formatCount(importResult.tenantsImported)}</div>
                    <div className="dashboard-import-chip">Hợp đồng: {formatCount(importResult.contractsImported)}</div>
                    <div className="dashboard-import-chip">Hóa đơn: {formatCount(importResult.invoicesImported)}</div>
                    <div className="dashboard-import-chip">Thanh toán: {formatCount(importResult.paymentsImported)}</div>
                  </div>
                  {Array.isArray(importResult.warnings) && importResult.warnings.length > 0 ? (
                    <div className="mt-3 rounded-2xl border border-[#f0d6a8] bg-[#fff9ee] px-4 py-3">
                      <p className="text-sm font-bold text-ink-deep">Lưu ý khi nhập</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                        {importResult.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <MonthlyRevenueReport />
            </section>
            ) : null}

            {!hasAnyData ? (
              <section className="dashboard-empty-state mt-8">
                <CircleCheckBig className="h-8 w-8 text-accent-violet" />
                <div>
                  <h2 className="text-xl font-bold text-ink-deep">Dashboard đã sẵn sàng</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                    Khi có thêm phòng, hóa đơn, thanh toán hoặc khoản cần thu, các khối số liệu sẽ tự cập nhật.
                  </p>
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
