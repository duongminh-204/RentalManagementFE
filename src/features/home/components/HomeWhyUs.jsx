import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const PROBLEMS = [
  'Ghi chép sổ tay, Excel rời rạc — dễ thiếu sót cuối tháng',
  'Không biết ai đang nợ, nợ bao nhiêu, quá hạn bao lâu',
  'Hợp đồng, thông tin khách thuê nằm rải rác nhiều nơi',
  'Mất nhiều thời gian lập hóa đơn điện nước từng phòng',
];

const SOLUTIONS = [
  'Một dashboard tổng hợp phòng, khách thuê, doanh thu và công nợ',
  'Nhắc nợ tự động, danh sách nợ chi tiết theo từng phòng',
  'Hồ sơ khách thuê, hợp đồng, xe và thiết bị liên kết trực tiếp với phòng',
  'Tạo hóa đơn hàng loạt, in phiếu thu hoặc gửi mã VietQR thanh toán',
];

export default function HomeWhyUs() {
  return (
    <section id="why-us" className="home-section bg-surface-light px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Vì sao chọn Trọ EZ</p>
          <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl">
            Từ{' '}
            <span className="text-accent-pink">rối loạn</span> đến{' '}
            <span className="text-accent-violet">kiểm soát</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Nhiều chủ trọ vẫn quản lý thủ công — Trọ EZ được xây dựng để giải quyết đúng những
            pain point hàng ngày đó.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="home-compare-card home-compare-card--problem"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-pink/15 text-accent-pink">
                <XCircle size={20} />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-ink-deep">Trước khi có Trọ EZ</p>
                <p className="text-sm text-muted">Quản lý thủ công, dễ sai sót</p>
              </div>
            </div>
            <ul className="space-y-4">
              {PROBLEMS.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-pink" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="home-compare-card home-compare-card--solution"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-lime/25 text-[#4a6210]">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-ink-deep">Sau khi dùng Trọ EZ</p>
                <p className="text-sm text-muted">Tập trung, minh bạch, hiệu quả</p>
              </div>
            </div>
            <ul className="space-y-4">
              {SOLUTIONS.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#4a6210]" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
