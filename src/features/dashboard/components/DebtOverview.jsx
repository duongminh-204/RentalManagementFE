import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CircleCheckBig, Mail, MapPin, Phone, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCount, formatCurrency } from '../utils/dashboardFormat';

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const formatMonthYearLabel = (monthYear) => {
  if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
    return 'Chưa rõ tháng';
  }

  const [year, month] = monthYear.split('-');
  return `Tháng ${month}/${year}`;
};

const formatDueDate = (dueDate) => {
  if (!dueDate) {
    return null;
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString('vi-VN');
};

const renderContactValue = (value, fallback) => value || <span className="text-muted">{fallback}</span>;

const DebtOverview = ({ unpaidTenantsCount, totalDebt, topDebtors }) => {
  const [selectedDebtor, setSelectedDebtor] = useState(null);

  const hasDebt = unpaidTenantsCount > 0 || totalDebt > 0;
  const rankedDebtors = Array.isArray(topDebtors) ? topDebtors.slice(0, 5) : [];
  const maxAmount = Math.max(...rankedDebtors.map((debtor) => Number(debtor.amount) || 0), 0);

  return (
    <>
      <motion.section variants={itemVariants} className="dashboard-section-card">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#fff1f6] p-3 text-accent-pink">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink-deep">Phòng cần thanh toán</h3>
            </div>
          </div>
          <Link to="/debts" className="text-sm font-bold text-accent-violet-deep">
            Xem chi tiết
          </Link>
        </div>

        {hasDebt ? (
          <>
            <div className="dashboard-callout dashboard-callout--danger">
              <p className="text-sm font-semibold text-muted">Tổng cần thu</p>
              <p className="mt-2 text-2xl font-bold text-accent-pink">{formatCurrency(totalDebt)}</p>
              <p className="mt-1 text-sm text-muted">{formatCount(unpaidTenantsCount)} khách cần theo dõi trong kỳ này</p>
            </div>

            <div className="mt-5 space-y-3">
              {rankedDebtors.length ? (
                rankedDebtors.map((debtor, index) => {
                  const amount = Number(debtor.amount) || 0;
                  const barWidth = maxAmount > 0 ? Math.max((amount / maxAmount) * 100, 8) : 0;

                  return (
                    <button
                      key={`${debtor.tenantId ?? debtor.name}-${debtor.room}-${index}`}
                      type="button"
                      onClick={() => setSelectedDebtor(debtor)}
                      className="dashboard-debt-row w-full text-left transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(246,106,156,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f66a9c] focus-visible:ring-offset-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffe0ea] text-base font-bold text-[#b33f69]">
                          {debtor.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-ink-deep">{debtor.name || 'Chưa có tên'}</p>
                          <p className="text-sm text-muted">Phòng {debtor.room || 'chưa rõ'}</p>
                        </div>
                      </div>

                      <div className="dashboard-debt-row__content">
                        <div className="dashboard-debt-row__bar">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.7 }}
                            className="dashboard-debt-row__fill"
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-accent-pink">{formatCurrency(amount)}</p>
                          <p className="mt-1 text-xs font-medium text-muted">Bấm để xem chi tiết</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-[#f3c3d3] bg-[#fff8fb] px-4 py-5">
                  <p className="text-sm leading-6 text-muted">Hiện chưa có danh sách chi tiết cần thu cho kỳ này.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-[#cfe7be] bg-[#f8fff0] px-4 py-5">
            <div className="flex items-start gap-3">
              <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-[#4d7a14]" />
              <div>
                <p className="text-base font-bold text-ink-deep">Hiện chưa có khoản cần xử lý.</p>
                <p className="mt-1 text-sm leading-6 text-muted">Khi có phòng chưa thanh toán, danh sách ưu tiên nhắc sẽ hiện tại đây.</p>
              </div>
            </div>
          </div>
        )}
      </motion.section>

      <AnimatePresence>
        {selectedDebtor ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,18,43,0.42)] px-4 py-6"
            onClick={() => setSelectedDebtor(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(32,28,79,0.2)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe0ea] text-xl font-bold text-[#b33f69]">
                    {selectedDebtor.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-ink-deep">{selectedDebtor.name || 'Chưa có tên'}</h4>
                    <p className="mt-1 text-sm text-muted">Phòng {selectedDebtor.room || 'chưa rõ'} • Cần thu {formatCurrency(selectedDebtor.amount)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDebtor(null)}
                  className="rounded-full border border-[#eadff2] p-2 text-muted transition-colors hover:bg-[#f8f4fc] hover:text-ink-deep"
                  aria-label="Đóng chi tiết khách cần thu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[#f1d5e2] bg-[#fff8fb] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                    <Phone className="h-4 w-4 text-accent-pink" />
                    Liên hệ
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink-deep">{renderContactValue(selectedDebtor.phoneNumber, 'Chưa có số điện thoại')}</p>
                </div>

                <div className="rounded-2xl border border-[#e3dbf3] bg-[#faf8ff] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                    <Mail className="h-4 w-4 text-accent-violet-deep" />
                    Email
                  </div>
                  <p className="mt-2 break-all text-sm font-medium text-ink-deep">{renderContactValue(selectedDebtor.email, 'Chưa có email')}</p>
                </div>

                <div className="rounded-2xl border border-[#d7ebc9] bg-[#f8fff0] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                    <MapPin className="h-4 w-4 text-[#4d7a14]" />
                    Địa chỉ
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink-deep">{renderContactValue(selectedDebtor.address, 'Chưa có địa chỉ')}</p>
                </div>
              </div>

              <div className="mt-6 rounded-[26px] border border-[#f2d6e1] bg-[#fffafc] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h5 className="text-lg font-bold text-ink-deep">Các tháng còn phải thu</h5>
                    <p className="mt-1 text-sm text-muted">Danh sách này giúp bạn biết nên nhắc tiền cho kỳ nào trước.</p>
                  </div>
                  <div className="rounded-full bg-[#ffe6f0] px-3 py-1 text-sm font-semibold text-accent-pink">
                    {Array.isArray(selectedDebtor.debtMonths) ? selectedDebtor.debtMonths.length : 0} kỳ
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {Array.isArray(selectedDebtor.debtMonths) && selectedDebtor.debtMonths.length ? (
                    selectedDebtor.debtMonths.map((debtMonth, index) => {
                      const dueDate = formatDueDate(debtMonth.dueDate);

                      return (
                        <div
                          key={`${selectedDebtor.tenantId ?? selectedDebtor.name}-${debtMonth.monthYear}-${index}`}
                          className="rounded-2xl border border-[#f3dbe5] bg-white px-4 py-3"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-base font-semibold text-ink-deep">{formatMonthYearLabel(debtMonth.monthYear)}</p>
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                                <span>Trạng thái: {debtMonth.status || 'Chưa rõ'}</span>
                                <span>Đến hạn: {dueDate || 'Chưa đặt hạn'}</span>
                              </div>
                            </div>
                            <p className="text-base font-bold text-accent-pink">{formatCurrency(debtMonth.outstandingAmount)}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted">Chưa có chi tiết theo tháng cho khách này.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default DebtOverview;
