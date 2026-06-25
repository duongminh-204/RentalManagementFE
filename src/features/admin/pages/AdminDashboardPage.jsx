import { useEffect, useState } from 'react';
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
import { LoaderCircle } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import { getAdminDashboardCharts } from '../api/adminApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
};

const AdminDashboardPage = () => {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const chartsData = await getAdminDashboardCharts();
        setCharts(chartsData);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const revenueGrowthData = {
    labels: charts?.revenueGrowth?.map((x) => x.label) || [],
    datasets: [{
      label: 'Doanh thu',
      data: charts?.revenueGrowth?.map((x) => x.value) || [],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.15)',
      fill: true,
      tension: 0.35,
    }],
  };

  const packageDistributionData = {
    labels: charts?.packageDistribution?.map((x) => x.label) || [],
    datasets: [{
      data: charts?.packageDistribution?.map((x) => x.count) || [],
      backgroundColor: ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#14b8a6'],
    }],
  };

  const ownerGrowthData = {
    labels: charts?.ownerGrowth?.map((x) => x.label) || [],
    datasets: [{
      label: 'Chủ trọ mới',
      data: charts?.ownerGrowth?.map((x) => x.count) || [],
      backgroundColor: '#22c55e',
      borderRadius: 8,
    }],
  };

  const subscriptionStatusData = {
    labels: charts?.subscriptionStatus?.map((x) => x.label) || [],
    datasets: [{
      data: charts?.subscriptionStatus?.map((x) => x.count) || [],
      backgroundColor: ['#22c55e', '#f97316', '#ef4444', '#6366f1'],
    }],
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader title="Admin Dashboard" />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-[#f3c3d3] bg-[#fff6f9] px-4 py-3 text-sm font-semibold">{error}</div>
      ) : null}

      {!loading && charts ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="dashboard-section-card">
            <h2 className="mb-4 text-lg font-bold text-ink-deep">Tăng trưởng doanh thu</h2>
            <div className="h-72">
              <Line data={revenueGrowthData} options={chartOptions} />
            </div>
          </section>
          <section className="dashboard-section-card">
            <h2 className="mb-4 text-lg font-bold text-ink-deep">Phân bổ gói dịch vụ</h2>
            <div className="mx-auto h-72 max-w-sm">
              <Doughnut data={packageDistributionData} options={chartOptions} />
            </div>
          </section>
          <section className="dashboard-section-card">
            <h2 className="mb-4 text-lg font-bold text-ink-deep">Tăng trưởng chủ trọ</h2>
            <div className="h-72">
              <Bar data={ownerGrowthData} options={chartOptions} />
            </div>
          </section>
          <section className="dashboard-section-card">
            <h2 className="mb-4 text-lg font-bold text-ink-deep">Trạng thái đăng ký</h2>
            <div className="mx-auto h-72 max-w-sm">
              <Doughnut data={subscriptionStatusData} options={chartOptions} />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboardPage;
