import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Trọ EZ có miễn phí không?',
    answer:
      'Trọ EZ hiện hỗ trợ đăng ký và sử dụng miễn phí cho chủ trọ. Bạn có thể tạo tài khoản, thêm phòng và trải nghiệm đầy đủ các tính năng cốt lõi mà không mất phí ban đầu.',
  },
  {
    question: 'Tôi quản lý bao nhiêu phòng cũng được?',
    answer:
      'Có. Hệ thống hỗ trợ từ vài phòng đến hàng chục, hàng trăm phòng trên nhiều tòa nhà. Bạn có thể bắt đầu nhỏ và mở rộng dần khi dãy trọ phát triển.',
  },
  {
    question: 'Có hỗ trợ thanh toán VietQR không?',
    answer:
      'Có. Khi tạo hóa đơn, hệ thống có thể sinh mã VietQR để khách thuê chuyển khoản nhanh. Bạn cũng có thể in phiếu thu hoặc gửi thông tin thanh toán trực tiếp.',
  },
  {
    question: 'Dữ liệu cũ trên Excel có import được không?',
    answer:
      'Có. Trọ EZ cung cấp file mẫu Excel chuẩn. Bạn tải mẫu, điền dữ liệu phòng và khách thuê rồi import vào hệ thống — không cần nhập tay từng dòng.',
  },
  {
    question: 'Tôi có thể dùng trên điện thoại không?',
    answer:
      'Trọ EZ là ứng dụng web responsive, truy cập được trên trình duyệt điện thoại, máy tính bảng và laptop. Chỉ cần kết nối internet là quản lý mọi lúc.',
  },
  {
    question: 'Ai có thể đăng ký tài khoản?',
    answer:
      'Hiện tại Trọ EZ dành cho chủ trọ (owner) — người trực tiếp quản lý phòng trọ. Sau khi đăng ký, bạn đăng nhập và bắt đầu thiết lập tòa nhà, phòng và khách thuê.',
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="home-faq-item">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display text-sm font-bold text-on-primary sm:text-base">{item.question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-accent-lime transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="border-t border-white/10 px-5 pb-4 pt-3 text-sm leading-relaxed text-on-dark-muted">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomeFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="eyebrow mb-4 text-accent-lime">Câu hỏi thường gặp</p>
          <h2 className="font-display text-3xl font-bold text-on-primary sm:text-4xl">
            Bạn thắc mắc?{' '}
            <span className="text-accent-lime">Chúng tôi giải đáp</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-on-dark-muted">
            Tổng hợp các câu hỏi phổ biến từ chủ trọ mới làm quen với Trọ EZ.
          </p>
        </div>

        <div className="home-faq-list mt-12">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        <div className="home-faq-help mt-8 flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <HelpCircle size={22} className="shrink-0 text-accent-lime" />
          <div>
            <p className="font-display text-sm font-bold text-on-primary">Vẫn còn thắc mắc?</p>
            <p className="mt-1 text-sm text-on-dark-muted">
              Liên hệ qua Facebook, TikTok, email hoặc số điện thoại ở cuối trang — chúng tôi sẵn
              sàng hỗ trợ bạn.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
