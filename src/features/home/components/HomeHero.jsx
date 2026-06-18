import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CircleCheckBig,
  Receipt,
  TrendingUp,
  Users,
} from 'lucide-react';

const PREVIEW_STATS = [
  { label: 'Phòng đang thuê', value: '24/28', icon: Building2, tone: 'violet' },
  { label: 'Doanh thu tháng', value: '48.5M', icon: TrendingUp, tone: 'lime' },
  { label: 'Khách thuê', value: '26', icon: Users, tone: 'pink' },
];

const TRUST_POINTS = [
  'Quản lý nhiều tòa nhà',
  'Hóa đơn & VietQR tự động',
  'Báo cáo doanh thu trực quan',
];

export default function HomeHero() {
  return (
    <section className="home-hero relative overflow-hidden px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
      <div className="home-hero-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow mb-5 text-accent-lime">Nền tảng quản lý phòng trọ</p>
          <h1 className="font-display text-4xl font-bold leading-[1.08] text-on-primary sm:text-5xl lg:text-[3.4rem]">
            Quản lý trọ{' '}
            <span className="relative inline-block">
              <span className="chip-lime">dễ hơn</span>
            </span>
            <br />
            mỗi ngày
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-dark-muted">
            Trọ EZ giúp chủ trọ theo dõi phòng, khách thuê, hợp đồng, hóa đơn và doanh thu — tất cả trên
            một bảng điều khiển gọn gàng, trực quan.
          </p>

          <ul className="mt-8 space-y-3">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-on-dark-muted">
                <CircleCheckBig size={18} className="shrink-0 text-accent-lime" />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/register" className="btn-primary px-7 py-3.5 text-sm no-underline">
              Bắt đầu ngay
              <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-ghost-dark px-7 py-3.5 text-sm no-underline">
              Tôi đã có tài khoản
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="home-preview-card relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-dark-muted">
                  Bảng điều khiển
                </p>
                <p className="font-display text-lg font-bold text-on-primary">Tổng quan tháng này</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-lime/15 px-3 py-1 text-xs font-bold text-accent-lime">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-lime" />
                Live
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {PREVIEW_STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.1 }}
                  className={`home-preview-stat home-preview-stat--${stat.tone}`}
                >
                  <stat.icon size={18} className="mb-3 opacity-80" />
                  <p className="font-display text-xl font-bold text-on-primary">{stat.value}</p>
                  <p className="mt-1 text-xs text-on-dark-muted">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-on-primary">Hóa đơn chờ thu</p>
                <Receipt size={16} className="text-accent-pink" />
              </div>
              <div className="space-y-2.5">
                {[
                  { room: 'P.201', amount: '2.800.000đ', status: 'Quá hạn 3 ngày' },
                  { room: 'P.305', amount: '3.200.000đ', status: 'Đến hạn hôm nay' },
                ].map((row) => (
                  <div
                    key={row.room}
                    className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-on-primary">{row.room}</p>
                      <p className="text-xs text-accent-pink">{row.status}</p>
                    </div>
                    <p className="text-sm font-bold text-accent-lime">{row.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="absolute -right-2 -top-4 hidden rounded-2xl border border-accent-lime/30 bg-accent-lime px-4 py-3 shadow-lg sm:block"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-ink-deep">+32%</p>
            <p className="text-xs font-medium text-ink-deep/70">Thu tiền nhanh hơn</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
