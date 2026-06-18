import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Anh Tuấn',
    role: 'Chủ nhà trọ — Quận 7, TP.HCM',
    quote:
      'Trước đây cuối tháng phải ngồi vài tiếng để lập hóa đơn từng phòng. Giờ tạo hàng loạt và gửi VietQR cho khách thuê, tiết kiệm rất nhiều thời gian.',
    rating: 5,
  },
  {
    name: 'Chị Lan',
    role: 'Quản lý 3 dãy trọ — Bình Dương',
    quote:
      'Dashboard cho mình biết ngay phòng nào trống, ai đang nợ. Không còn phải lật sổ tay hay nhắn tin hỏi từng khách nữa.',
    rating: 5,
  },
  {
    name: 'Anh Hưng',
    role: 'Chủ chung cư mini — Đà Nẵng',
    quote:
      'Import Excel giúp mình đưa toàn bộ dữ liệu phòng cũ vào hệ thống nhanh. Giao diện dễ dùng, không cần biết nhiều về công nghệ.',
    rating: 5,
  },
];

export default function HomeTestimonials() {
  return (
    <section id="testimonials" className="home-section bg-surface-light px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Phản hồi người dùng</p>
          <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl">
            Chủ trọ nói gì về{' '}
            <span className="text-accent-violet">Trọ EZ</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Những chia sẻ thực tế từ chủ trọ đã chuyển sang quản lý số hóa với Trọ EZ.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <motion.blockquote
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="home-testimonial-card"
            >
              <Quote size={28} className="text-accent-violet/40" aria-hidden />
              <div className="mt-4 flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-accent-lime text-accent-lime" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-6 border-t border-hairline-cloud pt-4">
                <p className="font-display text-sm font-bold text-ink-deep">{item.name}</p>
                <p className="mt-0.5 text-xs text-muted">{item.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
