import { motion } from 'framer-motion';
import {
  BarChart3,
  Building2,
  FileSpreadsheet,
  FileText,
  QrCode,
  Users,
  Wrench,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Building2,
    title: 'Quản lý phòng & tòa nhà',
    description:
      'Theo dõi trạng thái phòng trống, đang thuê, bản đồ tòa nhà và thông tin chi tiết từng căn.',
    tone: 'violet',
  },
  {
    icon: Users,
    title: 'Khách thuê & hợp đồng',
    description:
      'Lưu hồ sơ người thuê, tạo hợp đồng, gia hạn hoặc chấm dứt — mọi thứ có lịch sử rõ ràng.',
    tone: 'pink',
  },
  {
    icon: FileText,
    title: 'Hóa đơn thông minh',
    description:
      'Tạo hóa đơn tiền phòng, điện nước, dịch vụ. In phiếu thu hoặc gửi mã VietQR thanh toán nhanh.',
    tone: 'lime',
  },
  {
    icon: BarChart3,
    title: 'Dashboard trực quan',
    description:
      'Biểu đồ doanh thu, công nợ, tỷ lệ lấp đầy phòng — nắm tình hình kinh doanh trong vài giây.',
    tone: 'violet',
  },
  {
    icon: Wrench,
    title: 'Thiết bị & phương tiện',
    description: 'Quản lý đồ đạc trong phòng, xe của khách thuê và chi phí bảo trì liên quan.',
    tone: 'pink',
  },
  {
    icon: FileSpreadsheet,
    title: 'Import / Export Excel',
    description: 'Nhập dữ liệu hàng loạt từ file mẫu hoặc xuất báo cáo để chia sẻ với kế toán.',
    tone: 'lime',
  },
];

const HIGHLIGHTS = [
  { icon: QrCode, value: 'VietQR', label: 'Thanh toán tức thì' },
  { icon: BarChart3, value: 'Real-time', label: 'Cập nhật liên tục' },
  { icon: Building2, value: 'Multi', label: 'Nhiều tòa nhà' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomeFeatures() {
  return (
    <>
      <section id="features" className="home-section bg-surface-light px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-4">Tính năng nổi bật</p>
            <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl">
              Mọi công việc chủ trọ cần —{' '}
              <span className="text-accent-violet">trong một nơi</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Từ quản lý phòng đến thu tiền cuối tháng, Trọ EZ được thiết kế cho vận hành hàng ngày
              thực tế của chủ trọ Việt Nam.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((feature) => (
              <motion.article
                key={feature.title}
                variants={item}
                className={`home-feature-card home-feature-card--${feature.tone}`}
              >
                <div className={`home-feature-icon home-feature-icon--${feature.tone}`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="font-display text-lg font-bold text-ink-deep">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="benefits" className="home-section-dark px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {HIGHLIGHTS.map((highlight, index) => (
            <motion.div
              key={highlight.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-lime/15 text-accent-lime">
                <highlight.icon size={22} />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-on-primary">{highlight.value}</p>
                <p className="text-sm text-on-dark-muted">{highlight.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
