import { motion } from 'framer-motion';
import { DoorOpen, Home, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCount } from '../utils/dashboardFormat';

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const RoomStatusChart = ({ totalRooms, occupiedRooms, emptyRooms }) => {
  const maintenanceRooms = Math.max(totalRooms - occupiedRooms - emptyRooms, 0);
  const segments = [
    {
      label: 'dang-cho-thue',
      displayLabel: 'Đang cho thuê',
      value: occupiedRooms,
      color: '#6fa12a',
      softColor: '#e7f6d5',
      icon: Home,
      to: '/rooms?view=table&status=occupied',
    },
    {
      label: 'phong-trong',
      displayLabel: 'Phòng trống',
      value: emptyRooms,
      color: '#d89b36',
      softColor: '#ffefcf',
      icon: DoorOpen,
      to: '/rooms?view=table&status=vacant',
    },
    {
      label: 'bao-tri',
      displayLabel: 'Bảo trì',
      value: maintenanceRooms,
      color: '#7b6cf5',
      softColor: '#eef1ff',
      icon: Wrench,
      to: '/rooms?view=table&status=maintenance',
    },
  ].map((segment) => ({
    ...segment,
    percentage: totalRooms > 0 ? Math.round((segment.value / totalRooms) * 100) : 0,
  }));

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const ringBackground = (() => {
    if (totalRooms <= 0) {
      return 'conic-gradient(#eceaf3 0deg 360deg)';
    }

    let currentDegree = 0;
    const parts = segments
      .filter((segment) => segment.value > 0)
      .map((segment) => {
        const segmentDegree = (segment.value / totalRooms) * 360;
        const start = currentDegree;
        const end = currentDegree + segmentDegree;
        currentDegree = end;
        return `${segment.color} ${start}deg ${end}deg`;
      });

    if (currentDegree < 360) {
      parts.push(`#eceaf3 ${currentDegree}deg 360deg`);
    }

    return `conic-gradient(${parts.join(', ')})`;
  })();

  return (
    <motion.section variants={itemVariants} className="dashboard-section-card">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#eef1ff] p-3 text-accent-violet">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-ink-deep">Biểu đồ lấp đầy phòng</h3>
          </div>
        </div>
        <Link to="/rooms?view=table&status=all" className="text-sm font-bold text-accent-violet-deep">
          Tất cả phòng
        </Link>
      </div>

      <div className="dashboard-ring-layout">
        <div className="dashboard-ring-panel">
          <div
            className="dashboard-donut-chart"
            style={{ background: ringBackground }}
            role="img"
            aria-label={`Tỷ lệ lấp đầy ${occupancyRate} phần trăm`}
          >
            <div className="dashboard-donut-chart__center">
              <span className="dashboard-donut-chart__value">{occupancyRate}%</span>
              <span className="dashboard-donut-chart__label">đang thuê</span>
            </div>
          </div>
          <p className="dashboard-ring-caption">
            {totalRooms > 0
              ? `${formatCount(occupiedRooms)}/${formatCount(totalRooms)} phòng đang tạo doanh thu`
              : 'Chưa có dữ liệu phòng để hiển thị biểu đồ'}
          </p>
        </div>

        <div className="space-y-3">
          {segments.map((segment) => {
            const Icon = segment.icon;

            return (
              <Link key={segment.label} to={segment.to} className="dashboard-legend-card dashboard-stat-card--link">
                <div className="flex items-center gap-3">
                  <span
                    className="dashboard-progress-icon"
                    style={{ background: segment.softColor, color: segment.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-ink-deep">{segment.displayLabel}</p>
                    <p className="text-sm text-muted">{formatCount(segment.value)} phòng</p>
                  </div>
                </div>
                <p className="text-lg font-bold" style={{ color: segment.color }}>
                  {segment.percentage}%
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default RoomStatusChart;
