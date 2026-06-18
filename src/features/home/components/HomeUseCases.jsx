import { motion } from 'framer-motion';
import { Building, Home, Layers } from 'lucide-react';

const USE_CASES = [
  {
    icon: Home,
    title: 'Chủ trọ cá nhân',
    subtitle: '5–15 phòng',
    description:
      'Phù hợp chủ trọ quản lý một nhà trọ nhỏ. Theo dõi phòng trống, thu tiền và hóa đơn điện nước mà không cần Excel phức tạp.',
    highlights: ['Setup nhanh trong 30 phút', 'Hóa đơn VietQR gửi khách thuê', 'Dashboard gọn, dễ hiểu'],
    tone: 'lime',
  },
  {
    icon: Building,
    title: 'Chủ nhiều tòa nhà',
    subtitle: '20–50+ phòng',
    description:
      'Quản lý nhiều dãy trọ hoặc chung cư mini. Tập trung dữ liệu từ nhiều tòa nhà, so sánh doanh thu và tỷ lệ lấp đầy.',
    highlights: ['Quản lý đa tòa nhà', 'Báo cáo doanh thu tổng hợp', 'Import Excel hàng loạt'],
    tone: 'violet',
  },
  {
    icon: Layers,
    title: 'Quản lý thuê hộ',
    subtitle: 'Nhiều chủ trọ',
    description:
      'Dành cho người quản lý trọ thay nhiều chủ nhà. Phân tách dữ liệu rõ ràng, theo dõi công nợ và báo cáo định kỳ.',
    highlights: ['Theo dõi công nợ chi tiết', 'Lịch sử hợp đồng đầy đủ', 'Export báo cáo cho chủ nhà'],
    tone: 'pink',
  },
];

export default function HomeUseCases() {
  return (
    <section id="use-cases" className="px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 text-accent-lime">Đối tượng sử dụng</p>
          <h2 className="font-display text-3xl font-bold text-on-primary sm:text-4xl">
            Phù hợp với{' '}
            <span className="text-accent-lime">mọi quy mô</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-on-dark-muted">
            Dù bạn có vài phòng hay cả hệ thống tòa nhà — Trọ EZ linh hoạt theo nhu cầu vận hành
            thực tế.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {USE_CASES.map((useCase, index) => (
            <motion.article
              key={useCase.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`home-usecase-card home-usecase-card--${useCase.tone}`}
            >
              <div className={`home-usecase-icon home-usecase-icon--${useCase.tone}`}>
                <useCase.icon size={24} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-on-dark-muted">
                {useCase.subtitle}
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-on-primary">{useCase.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-on-dark-muted">{useCase.description}</p>
              <ul className="mt-5 space-y-2 border-t border-white/10 pt-5">
                {useCase.highlights.map((h) => (
                  <li key={h} className="text-sm text-on-dark-muted">
                    <span className="mr-2 text-accent-lime">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
