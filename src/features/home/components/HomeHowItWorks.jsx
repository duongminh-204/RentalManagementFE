import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ClipboardList, LayoutDashboard, UserPlus } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Tạo tài khoản chủ trọ',
    description: 'Đăng ký miễn phí trong vài phút. Không cần cài đặt phức tạp.',
  },
  {
    step: '02',
    icon: ClipboardList,
    title: 'Thêm tòa nhà & phòng',
    description: 'Nhập thông tin phòng trọ, giá thuê, khách thuê và hợp đồng hiện có.',
  },
  {
    step: '03',
    icon: LayoutDashboard,
    title: 'Vận hành mỗi ngày',
    description: 'Theo dõi dashboard, tạo hóa đơn, nhắc nợ và xem báo cáo doanh thu.',
  },
];

export default function HomeHowItWorks() {
  return (
    <section id="how-it-works" className="home-section bg-surface-light px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow mb-4">Cách hoạt động</p>
            <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl">
              Bắt đầu chỉ với{' '}
              <span className="chip-lime">3 bước</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
              Trọ EZ được thiết kế để bạn làm quen nhanh — dù bạn quản lý vài phòng hay cả dãy trọ
              lớn.
            </p>
            <Link to="/register" className="btn-primary mt-8 inline-flex px-6 py-3 text-sm no-underline">
              Tạo tài khoản miễn phí
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.5 }}
                className="home-step-card flex gap-5 rounded-2xl border border-hairline-cloud bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="font-display text-sm font-bold text-accent-violet">{step.step}</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-violet/10 text-accent-violet">
                    <step.icon size={20} />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="hidden h-10 w-px bg-hairline-cloud sm:block" aria-hidden />
                  )}
                </div>
                <div className="pt-1">
                  <h3 className="font-display text-lg font-bold text-ink-deep">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
