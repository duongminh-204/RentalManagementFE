import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  Package,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import { getAdminDashboardCharts, getAdminDashboardSummary } from '../api/adminApi';
import { formatVnd, subscriptionStatusLabel } from '../utils/adminHelpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const CHART_COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#14b8a6', '#8b5cf6'];

const PAYMENT_METHOD_LABELS = {
  banktransfer: 'Chuyển khoản',
  vietqr: 'VietQR',
  manual: 'Thủ công',
  cash: 'Tiền mặt',
};

const ALERT_STYLES = {
  pending: { icon: Clock3, accent: 'text-[#b26a00]', bg: 'bg-[#fffaf0]', border: 'border-[#f0d9a8]' },
  expiring: { icon: AlertTriangle, accent: 'text-[#b26a00]', bg: 'bg-[#fffaf0]', border: 'border-[#f0d9a8]' },
  overlimit: { icon: Building2, accent: 'text-[#b4234a]', bg: 'bg-[#fff6f9]', border: 'border-[#f5d0d8]' },
  payment: { icon: CreditCard, accent: 'text-[#b4234a]', bg: 'bg-[#fff6f9]', border: 'border-[#f5d0d8]' },
};

const formatPaymentMethod = (label) =>
  PAYMENT_METHOD_LABELS[String(label || '').toLowerCase()] || label || 'Khác';

const formatShortVnd = (value) => {
  const num = Number(value || 0);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}tr`;
  if (num >= 1_000) return `${Math.round(num / 1_000)}k`;
  return String(num);
};

const ChartPanel = ({ icon: Icon, title, description, children, className = '' }) => (
  <section className={`dashboard-section-card ${className}`}>
    <div className="mb-5 flex items-start gap-3">
      <div className="rounded-2xl bg-[#eef1ff] p-3 text-accent-violet">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-ink-deep">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
    </div>
    {children}
  </section>
);

const RevenueSection = ({ rows, summary }) => {
  const visibleRows = useMemo(() => {
    const first = rows.findIndex((r) => Number(r.value) > 0);
    return first === -1 ? rows : rows.slice(first);
  }, [rows]);

  const latest = visibleRows.at(-1);
  const previous = visibleRows.length > 1 ? visibleRows.at(-2) : null;
  const best = visibleRows.reduce((acc, row) =>
    (!acc || Number(row.value) > Number(acc.value) ? row : acc), null);
  const total = visibleRows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const changePct = previous && Number(previous.value) > 0
    ? ((Number(latest?.value || 0) - Number(previous.value)) / Number(previous.value)) * 100
    : Number(latest?.value || 0) > 0 ? 100 : 0;
  const isGrowth = changePct >= 0;
  const maxAmount = Math.max(...visibleRows.map((r) => Number(r.value || 0)), 1);

  if (!visibleRows.length) {
    return (
      <ChartPanel icon={BarChart3} title="Doanh thu SaaS" description="Thu từ thanh toán gói đăng ký theo tháng.">
        <div className="rounded-2xl border border-dashed border-hairline-cloud px-4 py-8 text-center text-sm text-muted">
          Chưa có dữ liệu doanh thu để hiển thị.
        </div>
      </ChartPanel>
    );
  }

  return (
    <ChartPanel
      icon={BarChart3}
      title="Doanh thu SaaS"
      description="Thu từ thanh toán gói đăng ký — theo dõi xu hướng 6 tháng gần nhất."
    >
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
        <div className="rounded-2xl border border-[#d8e8c6] bg-gradient-to-br from-[#f7fff0] to-white p-5">
          <p className="text-sm font-semibold text-muted">Tháng {latest?.label}</p>
          <p className="mt-2 text-3xl font-bold text-[#2f7f32]">{formatVnd(latest?.value)}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold shadow-sm">
            {isGrowth ? (
              <TrendingUp className="h-4 w-4 text-[#2f7f32]" />
            ) : (
              <TrendingDown className="h-4 w-4 text-[#b4234a]" />
            )}
            <span className={isGrowth ? 'text-[#2f7f32]' : 'text-[#b4234a]'}>
              {previous
                ? `${isGrowth ? 'Tăng' : 'Giảm'} ${Math.abs(changePct).toFixed(0)}% so với ${previous.label}`
                : 'Tháng đầu tiên có doanh thu'}
            </span>
          </div>
        </div>
        <div className="dashboard-legend-card">
          <p className="text-sm font-semibold text-muted">MRR ước tính</p>
          <p className="mt-2 text-xl font-bold text-ink-deep">{formatVnd(summary?.mrr)}</p>
          <p className="mt-1 text-xs text-muted">Tổng giá gói đang active</p>
        </div>
        <div className="dashboard-legend-card">
          <p className="text-sm font-semibold text-muted">Tổng 6 tháng</p>
          <p className="mt-2 text-xl font-bold text-ink-deep">{formatVnd(total)}</p>
          <p className="mt-1 text-xs text-muted">
            Cao nhất: {best?.label} ({formatShortVnd(best?.value)})
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-hairline-cloud bg-[#f9f9fc] px-4 py-5 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink-deep">Biểu đồ theo tháng</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted shadow-sm">VNĐ</span>
        </div>
        <div className="relative h-64">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map((line) => (
              <div key={line} className="border-t border-dashed border-[#e3e1ec]" />
            ))}
          </div>
          <div className="relative flex h-full items-end justify-between gap-2 pt-4">
            {visibleRows.map((row) => {
              const amount = Number(row.value || 0);
              const height = Math.max((amount / maxAmount) * 100, amount > 0 ? 8 : 0);
              const isLatest = row.label === latest?.label;
              const isBest = row.label === best?.label;

              return (
                <div key={row.label} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                  <p className="mb-2 text-center text-[10px] font-semibold text-muted">
                    {amount > 0 ? formatShortVnd(amount) : '—'}
                  </p>
                  <div
                    className={`mx-auto w-full max-w-[52px] rounded-t-2xl transition-all ${
                      isLatest
                        ? 'bg-gradient-to-t from-[#6366f1] to-[#a5b4fc] shadow-[0_8px_20px_rgba(99,102,241,0.25)]'
                        : isBest
                          ? 'bg-gradient-to-t from-[#4f46e5] to-[#818cf8]'
                          : 'bg-gradient-to-t from-[#c7d2fe] to-[#e0e7ff]'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <p className="mt-2 text-center text-xs font-semibold text-ink-deep">{row.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ChartPanel>
  );
};

const AlertsPanel = ({ alerts }) => {
  if (!alerts?.length) {
    return (
      <ChartPanel
        icon={CheckCircle2}
        title="Tình trạng hệ thống"
        description="Không có việc cần xử lý gấp."
      >
        <div className="flex items-center gap-3 rounded-2xl border border-[#c8ead6] bg-[#f8fff9] px-4 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1f7a45]" />
          <p className="text-sm text-[#1f7a45]">Mọi thứ ổn định — không có cảnh báo nào.</p>
        </div>
      </ChartPanel>
    );
  }

  return (
    <ChartPanel
      icon={AlertTriangle}
      title="Cần chú ý"
      description="Các việc admin nên xử lý sớm."
    >
      <ul className="space-y-3">
        {alerts.map((alert) => {
          const style = ALERT_STYLES[alert.type] || ALERT_STYLES.pending;
          const Icon = style.icon;
          const content = (
            <div
              className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition ${style.bg} ${style.border} ${
                alert.actionPath ? 'hover:shadow-sm' : ''
              }`}
            >
              <div className={`rounded-xl bg-white p-2.5 shadow-sm ${style.accent}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-deep">{alert.title}</p>
                <p className="mt-0.5 text-sm text-muted">{alert.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full bg-white px-3 py-1 text-sm font-bold ${style.accent}`}>
                  {alert.count}
                </span>
                {alert.actionPath ? <ArrowRight className="h-4 w-4 text-muted" /> : null}
              </div>
            </div>
          );

          return (
            <li key={`${alert.type}-${alert.title}`}>
              {alert.actionPath ? (
                <Link to={alert.actionPath} className="block no-underline">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </ChartPanel>
  );
};

const AdminDashboardPage = () => {
  const [charts, setCharts] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [chartsData, summaryData] = await Promise.all([
          getAdminDashboardCharts(),
          getAdminDashboardSummary(),
        ]);
        setCharts(chartsData);
        setSummary(summaryData);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const platformAdoptionData = useMemo(() => ({
    labels: charts?.platformAdoption?.map((x) => x.label) || [],
    datasets: [
      {
        label: 'Phòng mới',
        data: charts?.platformAdoption?.map((x) => x.value) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.35,
        yAxisID: 'y',
      },
      {
        label: 'Khách thuê mới',
        data: charts?.platformAdoption?.map((x) => x.count) || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.35,
        yAxisID: 'y1',
      },
    ],
  }), [charts]);

  const packageDistributionData = useMemo(() => ({
    labels: charts?.packageDistribution?.map((x) => x.label) || [],
    datasets: [{
      data: charts?.packageDistribution?.map((x) => x.count) || [],
      backgroundColor: CHART_COLORS,
      borderWidth: 0,
    }],
  }), [charts]);

  const subscriptionStatusData = useMemo(() => ({
    labels: charts?.subscriptionStatus?.map((x) => subscriptionStatusLabel(x.label)) || [],
    datasets: [{
      data: charts?.subscriptionStatus?.map((x) => x.count) || [],
      backgroundColor: ['#22c55e', '#f97316', '#ef4444', '#6366f1', '#94a3b8'],
      borderWidth: 0,
    }],
  }), [charts]);

  const paymentMethodsData = useMemo(() => {
    const items = charts?.paymentMethods || [];
    return {
      labels: items.map((x) => formatPaymentMethod(x.label)),
      datasets: [{
        label: 'Số giao dịch',
        data: items.map((x) => x.count),
        backgroundColor: '#6366f1',
        borderRadius: 8,
      }],
    };
  }, [charts]);

  const ownerGrowthData = useMemo(() => ({
    labels: charts?.ownerGrowth?.map((x) => x.label) || [],
    datasets: [{
      label: 'Chủ trọ mới',
      data: charts?.ownerGrowth?.map((x) => x.count) || [],
      backgroundColor: '#22c55e',
      borderRadius: 8,
    }],
  }), [charts]);

  const expiringData = useMemo(() => ({
    labels: charts?.expiringTimeline?.map((x) => x.label) || [],
    datasets: [{
      label: 'Gói hết hạn',
      data: charts?.expiringTimeline?.map((x) => x.count) || [],
      backgroundColor: ['#f97316', '#fb923c', '#fdba74', '#fed7aa'],
      borderRadius: 8,
    }],
  }), [charts]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } } },
  };

  const platformOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Phòng' } },
      y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Khách thuê' } },
    },
  };

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: 'y',
    plugins: { ...chartOptions.plugins, legend: { display: false } },
    scales: { x: { beginAtZero: true } },
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader
        title="Tổng quan Admin"
        description="Theo dõi doanh thu SaaS, tăng trưởng nền tảng và các việc cần xử lý."
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-[#f3c3d3] bg-[#fff6f9] px-4 py-3 text-sm font-semibold text-[#b4234a]">
          {error}
        </div>
      ) : null}

      {!loading && charts ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <RevenueSection rows={charts.revenueGrowth || []} summary={summary} />
            <AlertsPanel alerts={charts.alerts} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartPanel
              icon={Users}
              title="Mức độ sử dụng nền tảng"
              description="Số phòng và khách thuê mới được tạo mỗi tháng."
            >
              <div className="h-72">
                <Line data={platformAdoptionData} options={platformOptions} />
              </div>
            </ChartPanel>

            <ChartPanel
              icon={CreditCard}
              title="Kênh thanh toán"
              description="Phân bổ giao dịch thành công 6 tháng gần đây."
            >
              {(charts.paymentMethods || []).length === 0 ? (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-hairline-cloud text-sm text-muted">
                  Chưa có giao dịch thanh toán.
                </div>
              ) : (
                <div className="h-72">
                  <Bar data={paymentMethodsData} options={horizontalBarOptions} />
                </div>
              )}
            </ChartPanel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartPanel
              icon={Users}
              title="Tăng trưởng chủ trọ"
              description="Số chủ trọ đăng ký mới theo tháng."
            >
              <div className="h-64">
                <Bar data={ownerGrowthData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
              </div>
            </ChartPanel>

            <ChartPanel
              icon={Clock3}
              title="Gói sắp hết hạn"
              description="Đăng ký active sẽ hết hạn trong 4 tuần tới."
            >
              <div className="h-64">
                <Bar data={expiringData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
              </div>
            </ChartPanel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartPanel
              icon={Package}
              title="Phân bổ gói đang dùng"
              description="Số đăng ký active theo từng gói dịch vụ."
            >
              {(charts.packageDistribution || []).length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-hairline-cloud text-sm text-muted">
                  Chưa có gói nào đang active.
                </div>
              ) : (
                <div className="mx-auto h-64 max-w-xs">
                  <Doughnut
                    data={packageDistributionData}
                    options={{
                      ...chartOptions,
                      cutout: '62%',
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12 } },
                      },
                    }}
                  />
                </div>
              )}
            </ChartPanel>

            <ChartPanel
              icon={Package}
              title="Trạng thái đăng ký"
              description="Toàn bộ bản ghi đăng ký trong hệ thống."
            >
              <div className="mx-auto h-64 max-w-xs">
                <Doughnut
                  data={subscriptionStatusData}
                  options={{
                    ...chartOptions,
                    cutout: '62%',
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                  }}
                />
              </div>
            </ChartPanel>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboardPage;
