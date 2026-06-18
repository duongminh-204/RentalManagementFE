import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react';
import { getMonthlyRevenueSeries } from '../api/dashboardApi';
import { formatCurrency } from '../utils/dashboardFormat';

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const monthFormatter = new Intl.DateTimeFormat('vi-VN', { month: 'short' });

const periodOptions = [
  { value: 1, label: '1 tháng' },
  { value: 3, label: '3 tháng' },
  { value: 6, label: '6 tháng' },
  { value: 12, label: '1 năm' },
];

const buildRecentMonths = (count) => {
  const today = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (count - index - 1), 1);

    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: monthFormatter.format(date),
    };
  });
};

const formatMonthName = (row) => {
  if (!row) {
    return 'Chưa có dữ liệu';
  }

  return `Tháng ${row.month}/${row.year}`;
};

const formatPercentChange = (currentAmount, previousAmount) => {
  if (!previousAmount) {
    return currentAmount > 0 ? 100 : 0;
  }

  return ((currentAmount - previousAmount) / previousAmount) * 100;
};

const MonthlyRevenueReport = () => {
  const [period, setPeriod] = useState(6);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const months = buildRecentMonths(period);
        const responses = await getMonthlyRevenueSeries(months);

        if (isMounted) {
          setRows(responses);
        }
      } catch {
        if (isMounted) {
          setRows([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRevenue();

    return () => {
      isMounted = false;
    };
  }, [period]);

  const visibleRows = useMemo(() => {
    const firstActiveIndex = rows.findIndex((row) => row.amount > 0);
    if (firstActiveIndex === -1) {
      return rows;
    }

    return rows.slice(firstActiveIndex);
  }, [rows]);

  const maxAmount = Math.max(...visibleRows.map((row) => row.amount), 1);
  const latestRow = visibleRows.at(-1);
  const previousRow = visibleRows.length > 1 ? visibleRows.at(-2) : null;
  const bestRow = visibleRows.reduce((best, row) => (!best || row.amount > best.amount ? row : best), null);
  const totalAmount = visibleRows.reduce((sum, row) => sum + row.amount, 0);
  const changePercent = latestRow ? formatPercentChange(latestRow.amount, previousRow?.amount ?? 0) : 0;
  const isGrowth = changePercent >= 0;
  const selectedPeriodLabel = periodOptions.find((option) => option.value === period)?.label ?? '6 tháng';

  return (
    <motion.section variants={itemVariants} className="dashboard-section-card">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#eef1ff] p-3 text-accent-violet">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-deep">Báo cáo doanh thu theo tháng</h2>
            <p className="mt-1 text-sm text-muted">Xem nhanh tháng nào thu tốt, tháng nào giảm để dễ theo dõi.</p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full border border-[#dcd9ea] bg-white px-4 py-2 text-sm font-semibold text-ink-deep shadow-sm transition hover:border-accent-violet"
          >
            {selectedPeriodLabel}
            <ChevronDown className="h-4 w-4" />
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 z-10 mt-2 min-w-[140px] rounded-2xl border border-[#e7e4f0] bg-white p-2 shadow-[0_18px_40px_rgba(43,29,78,0.12)]">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setPeriod(option.value);
                    setIsMenuOpen(false);
                  }}
                  className={`flex w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                    option.value === period ? 'bg-[#eef1ff] text-accent-violet-deep' : 'text-ink-deep hover:bg-[#f6f5fb]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted">Đang tải báo cáo doanh thu...</div>
      ) : visibleRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline-cloud bg-surface-light px-4 py-5 text-sm text-muted">
          Chưa có dữ liệu doanh thu theo tháng để hiển thị.
        </div>
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-[1.25fr_0.95fr_0.95fr]">
            <div className="rounded-[24px] border border-[#d8e8c6] bg-[linear-gradient(135deg,#f7fff0_0%,#ffffff_100%)] p-5">
              <p className="text-sm font-semibold text-muted">{formatMonthName(latestRow)}</p>
              <p className="mt-2 text-[1.95rem] font-bold leading-tight text-[#2f7f32]">{formatCurrency(latestRow?.amount ?? 0)}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-muted shadow-sm">
                {isGrowth ? (
                  <TrendingUp className="h-4 w-4 text-[#2f7f32]" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-accent-pink" />
                )}
                {previousRow ? (
                  <span className={isGrowth ? 'text-[#2f7f32]' : 'text-accent-pink'}>
                    {isGrowth ? 'Tăng' : 'Giảm'} {Math.abs(changePercent).toFixed(0)}% so với {formatMonthName(previousRow).toLowerCase()}
                  </span>
                ) : (
                  <span>Đây là tháng đầu tiên có dữ liệu trong kỳ đang xem</span>
                )}
              </div>
            </div>

            <div className="dashboard-legend-card">
              <p className="text-sm font-semibold text-muted">Tháng thu cao nhất</p>
              <p className="mt-2 text-xl font-bold text-ink-deep">{bestRow ? formatMonthName(bestRow) : 'Chưa có dữ liệu'}</p>
              <p className="mt-2 text-base font-semibold text-accent-violet-deep">{formatCurrency(bestRow?.amount ?? 0)}</p>
            </div>

            <div className="dashboard-legend-card">
              <p className="text-sm font-semibold text-muted">Tổng doanh thu trong kỳ</p>
              <p className="mt-2 text-xl font-bold text-ink-deep">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#ebe9f2] bg-[#f9f9fc] px-4 py-5 sm:px-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-deep">Biểu đồ doanh thu</p>
                <p className="mt-1 text-xs text-muted">Cột cao hơn nghĩa là tháng đó thu tốt hơn.</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted shadow-sm">Đơn vị: đồng</div>
            </div>

            <div className="relative h-72">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3].map((line) => (
                  <div key={line} className="border-t border-dashed border-[#e3e1ec]" />
                ))}
              </div>

              <div className="relative flex h-full items-end justify-between gap-3 pt-4">
                {visibleRows.map((row) => {
                  const height = Math.max((row.amount / maxAmount) * 100, row.amount > 0 ? 10 : 0);
                  const isLatest = latestRow && row.month === latestRow.month && row.year === latestRow.year;
                  const isBest = bestRow && row.month === bestRow.month && row.year === bestRow.year;

                  return (
                    <div key={`${row.year}-${row.month}`} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                      <div className="mb-3 text-center text-[11px] font-semibold text-muted">
                        {row.amount > 0 ? formatCurrency(row.amount) : '0 đ'}
                      </div>

                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.7 }}
                        className={`mx-auto w-full max-w-[58px] rounded-t-[18px] shadow-[0_10px_24px_rgba(93,150,32,0.18)] ${
                          isLatest
                            ? 'bg-[linear-gradient(180deg,#7ac943_0%,#2f7f32_100%)]'
                            : isBest
                              ? 'bg-[linear-gradient(180deg,#9cd95b_0%,#467d19_100%)]'
                              : 'bg-[linear-gradient(180deg,#d7ebb1_0%,#77a83b_100%)]'
                        }`}
                      />

                      <div className="mt-3 text-center">
                        <p className="text-sm font-semibold text-ink-deep">{row.label}</p>
                        <p className="text-xs text-muted">{`${row.month.toString().padStart(2, '0')}/${row.year}`}</p>
                        {isLatest ? <p className="mt-1 text-[11px] font-semibold text-[#2f7f32]">Tháng hiện tại</p> : null}
                        {!isLatest && isBest ? <p className="mt-1 text-[11px] font-semibold text-accent-violet-deep">Cao nhất</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
};

export default MonthlyRevenueReport;
