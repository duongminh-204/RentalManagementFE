import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, LogIn, Menu, UserPlus, X } from 'lucide-react';
import AppLogo from '../../../components/common/AppLogo';
import { getStoredUser, isOwnerRole, isOwnerSubscriptionReady } from '../../../hooks/useAuth';

const NAV_LINKS = [
  { href: '#features', label: 'Tính năng' },
  { href: '#pricing', label: 'Bảng giá' },
  { href: '#modules', label: 'Module' },
  { href: '#how-it-works', label: 'Hướng dẫn' },
  { href: '#about-us', label: 'Về chúng tôi' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Liên hệ' },
];

export default function HomeNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getStoredUser();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isLoggedIn = Boolean(token);
  const isOwnerWithoutPlan = isLoggedIn && isOwnerRole(user?.role) && !isOwnerSubscriptionReady(user);

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <header className="home-nav sticky top-0 z-50 border-b border-white/10 bg-surface-night/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 lg:px-8">
        <Link to="/" className="flex min-w-0 shrink items-center no-underline" onClick={closeMobile}>
          <AppLogo className="h-10 w-auto max-w-[140px] rounded-lg bg-white object-contain px-1.5 py-0.5 sm:h-12 sm:max-w-none" />
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
          {isOwnerWithoutPlan ? (
            <>
              <Link
                to="/register/select-plan"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary no-underline transition hover:bg-white/10"
              >
                Chọn gói
              </Link>
              <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm no-underline">
                <LayoutDashboard className="h-4 w-4" />
                Vào hệ thống
              </Link>
            </>
          ) : isLoggedIn ? (
            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm no-underline">
              <LayoutDashboard className="h-4 w-4" />
              Vào hệ thống
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary no-underline transition hover:bg-white/10"
              >
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm no-underline">
                <UserPlus className="h-4 w-4" />
                Dùng thử miễn phí
              </Link>
            </>
          )}
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
            className="mobile-nav-scroll overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="safe-bottom flex flex-col gap-1 px-4 py-4 sm:px-5">
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
                {isOwnerWithoutPlan ? (
                  <>
                    <Link
                      to="/register/select-plan"
                      onClick={closeMobile}
                      className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-on-primary no-underline transition hover:bg-white/10"
                    >
                      Chọn gói
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={closeMobile}
                      className="btn-primary inline-flex items-center justify-center gap-2 py-3 text-center text-sm no-underline"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Vào hệ thống
                    </Link>
                  </>
                ) : isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    onClick={closeMobile}
                    className="btn-primary inline-flex items-center justify-center gap-2 py-3 text-center text-sm no-underline"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Vào hệ thống
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold text-on-primary no-underline transition hover:bg-white/10"
                    >
                      <LogIn className="h-4 w-4" />
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobile}
                      className="btn-primary inline-flex items-center justify-center gap-2 py-3 text-center text-sm no-underline"
                    >
                      <UserPlus className="h-4 w-4" />
                      Dùng thử miễn phí
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
