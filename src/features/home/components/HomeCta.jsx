import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomeCta() {
  return (
    <section className="px-5 py-20 lg:px-8 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="home-cta mx-auto max-w-6xl overflow-hidden rounded-[32px] px-6 py-14 text-center sm:px-12 lg:py-16"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-lime/15 text-accent-lime">
          <Sparkles size={26} />
        </div>
        <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-bold text-on-primary sm:text-4xl">
          Sẵn sàng quản lý trọ{' '}
          <span className="text-accent-lime">thông minh hơn?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-on-dark-muted">
          Tham gia Trọ EZ hôm nay — tập trung vào phát triển dãy trọ, để hệ thống lo phần còn lại.
        </p>
        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link to="/register" className="btn-primary w-full px-8 py-3.5 text-center text-sm no-underline sm:w-auto">
            Đăng ký miễn phí
            <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-ghost-dark w-full px-8 py-3.5 text-center text-sm no-underline sm:w-auto">
            Đăng nhập
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
