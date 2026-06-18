import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logo from '../../../assets/LOGOEXE.png';

const NAV_LINKS = [
  { href: '#features', label: 'Tính năng' },
  { href: '#modules', label: 'Module' },
  { href: '#how-it-works', label: 'Hướng dẫn' },
  { href: '#about-us', label: 'Về chúng tôi' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Liên hệ' },
];

export default function HomeNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="home-nav sticky top-0 z-50 border-b border-white/10 bg-surface-night/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 no-underline" onClick={closeMobile}>
          <img src={logo} alt="Trọ EZ" className="h-9 w-9 rounded-lg object-contain" />
          <span className="font-display text-xl font-bold text-on-primary">
            Trọ <span className="text-accent-lime">EZ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-2 text-sm font-medium text-on-dark-muted no-underline transition hover:bg-white/10 hover:text-on-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary no-underline transition hover:bg-white/10"
          >
            Đăng nhập
          </Link>
          <Link to="/register" className="btn-primary px-5 py-2.5 text-sm no-underline">
            Dùng thử miễn phí
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2 text-on-primary md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-on-dark-muted no-underline transition hover:bg-white/10 hover:text-on-primary"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-on-primary no-underline transition hover:bg-white/10"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="btn-primary py-3 text-center text-sm no-underline"
                >
                  Dùng thử miễn phí
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
