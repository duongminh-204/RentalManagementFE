import { motion } from 'framer-motion';
import { Building2, Clock3, Receipt, ShieldCheck } from 'lucide-react';

const STATS = [
  { icon: Building2, value: '10+', label: 'Module quản lý tích hợp', tone: 'violet' },
  { icon: Clock3, value: '70%', label: 'Tiết kiệm thời gian vận hành', tone: 'lime' },
  { icon: Receipt, value: 'VietQR', label: 'Thu tiền nhanh, minh bạch', tone: 'pink' },
  { icon: ShieldCheck, value: '24/7', label: 'Truy cập mọi lúc, mọi nơi', tone: 'violet' },
];

export default function HomeStats() {
  return (
    <section className="border-y border-white/10 bg-surface-night/60 px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="home-stat-card text-center"
          >
            <div className={`home-stat-icon home-stat-icon--${stat.tone}`}>
              <stat.icon size={20} />
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-on-primary">{stat.value}</p>
            <p className="mt-1 text-sm text-on-dark-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
