import { motion } from 'framer-motion';
import { BellRing, CircleCheckBig, HandCoins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { formatCompactCurrency, formatCount, formatCurrency } from '../utils/dashboardFormat';

const DebtDetailsPage = () => {
  const { debtInfo, loading, error } = useDashboard();
  const unpaidTenantsCount = Number(debtInfo?.unpaidTenantsCount ?? 0);
  const totalDebt = Number(debtInfo?.totalDebt ?? 0);
  const topDebtors = Array.isArray(debtInfo?.topDebtors) ? debtInfo.topDebtors : [];
  const hasDebt = unpaidTenantsCount > 0 || totalDebt > 0;

  return (
    <div className="dashboard-shell min-h-screen w-full flex-1 bg-surface-light">
      <div className="page-content page-content--wide">
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="dashboard-hero-main"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="dashboard-hero-badge">Chi tiết cần thu</span>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-ink-deep sm:text-4xl">
                Danh sách cần nhắc thu tiền
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
                Trang này gom các khoản còn phải thu để chủ trọ biết nên ưu tiên nhắc ai trước.
              </p>
            </div>
            <Link to="/dashboard" className="dashboard-action-button">
              Quay lại dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="dashboard-hero-metric">
              <p className="text-sm font-semibold text-muted">Tổng cần thu</p>
              <p className="mt-2 text-2xl font-bold text-accent-pink">{formatCompactCurrency(totalDebt)}</p>
              <p className="mt-1 text-sm text-muted">{formatCurrency(totalDebt)}</p>
            </div>
            <div className="dashboard-hero-metric">
              <p className="text-sm font-semibold text-muted">Khách chưa trả đủ</p>
              <p className="mt-2 text-2xl font-bold text-ink-deep">{formatCount(unpaidTenantsCount)}</p>
              <p className="mt-1 text-sm text-muted">cần theo dõi trong kỳ này</p>
            </div>
            <div className="dashboard-hero-metric">
              <p className="text-sm font-semibold text-muted">Gợi ý xử lý</p>
              <p className="mt-2 text-2xl font-bold text-ink-deep">
                {hasDebt ? 'Nhắc theo thứ tự số tiền cao' : 'Chưa có khoản cần nhắc'}
              </p>
              <p className="mt-1 text-sm text-muted">
                {hasDebt ? 'Ưu tiên các phòng đang còn phải thu nhiều hơn trước.' : 'Hiện chưa có khoản nào cần xử lý.'}
              </p>
            </div>
          </div>
        </motion.section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-hairline-cloud border-t-primary" />
            <p className="mt-4 text-base font-semibold text-muted">Đang tải chi tiết cần thu...</p>
          </div>
        ) : (
          <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
            <article className="dashboard-section-card">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-[#fff1f6] p-3 text-accent-pink">
                  <HandCoins className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink-deep">Tổng quan nhanh</h2>
                  <p className="text-sm text-muted">Nhìn một lần để biết tình hình thu tiền hiện tại.</p>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-[#f3c3d3] bg-[#fff6f9] px-4 py-4 text-sm text-muted">
                  Không tải được dữ liệu cần thu. Chi tiết lỗi: {error}
                </div>
              ) : hasDebt ? (
                <div className="space-y-4">
                  <div className="dashboard-callout dashboard-callout--danger">
                    <p className="text-sm font-semibold text-muted">Tổng tiền còn phải thu</p>
                    <p className="mt-2 text-3xl font-bold text-accent-pink">{formatCompactCurrency(totalDebt)}</p>
                    <p className="mt-1 text-sm text-muted">{formatCurrency(totalDebt)}</p>
                  </div>
                  <div className="dashboard-callout">
                    <p className="text-sm font-semibold text-muted">Số khách / phòng chưa thanh toán đủ</p>
                    <p className="mt-2 text-3xl font-bold text-ink-deep">{formatCount(unpaidTenantsCount)}</p>
                    <p className="mt-1 text-sm text-muted">Nên đối chiếu trước khi đến hạn thu tiếp theo.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#cfe7be] bg-[#f8fff0] px-4 py-5">
                  <div className="flex items-start gap-3">
                    <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-[#4d7a14]" />
                    <div>
                      <p className="text-base font-bold text-ink-deep">Hiện chưa có khoản cần xử lý.</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        Khi có khách chưa thanh toán, danh sách cần nhắc sẽ xuất hiện ở đây.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>

            <article className="dashboard-section-card">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-[#fff1f6] p-3 text-accent-pink">
                  <BellRing className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink-deep">Danh sách cần nhắc trước</h2>
                  <p className="text-sm text-muted">Các phòng còn phải thu nhiều sẽ được xếp lên đầu để dễ theo dõi.</p>
                </div>
              </div>

              {topDebtors.length ? (
                <div className="space-y-3">
                  {topDebtors.map((debtor, index) => (
                    <div key={`${debtor.name}-${debtor.room}-${index}`} className="dashboard-list-row">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffe0ea] text-base font-bold text-[#b33f69]">
                          {debtor.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-ink-deep">{debtor.name || 'Chưa có tên'}</p>
                          <p className="text-sm text-muted">Phòng {debtor.room || 'chưa rõ'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-accent-pink">{formatCompactCurrency(debtor.amount)}</p>
                        <p className="text-xs text-muted">{formatCurrency(debtor.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#f3c3d3] bg-[#fff8fb] px-4 py-5">
                  <p className="text-sm leading-6 text-muted">Chưa có danh sách người cần nhắc nổi bật để hiển thị.</p>
                </div>
              )}
            </article>
          </section>
        )}
      </div>
    </div>
  );
};

export default DebtDetailsPage;
