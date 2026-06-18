import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import AppLogo from '../../../components/common/AppLogo';
import { CONTACT_INFO } from '../constants/contact';

const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>
);

export default function HomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-white/10 bg-surface-night">
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link to="/" className="flex items-center no-underline">
            <AppLogo className="h-12 w-auto rounded-lg bg-white object-contain px-1 py-0.5" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm">
            <a href="#features" className="text-on-dark-muted no-underline transition hover:text-on-primary">
              Tính năng
            </a>
            <a href="#modules" className="text-on-dark-muted no-underline transition hover:text-on-primary">
              Module
            </a>
            <a href="#how-it-works" className="text-on-dark-muted no-underline transition hover:text-on-primary">
              Hướng dẫn
            </a>
            <a href="#about-us" className="text-on-dark-muted no-underline transition hover:text-on-primary">
              Về chúng tôi
            </a>
            <a href="#faq" className="text-on-dark-muted no-underline transition hover:text-on-primary">
              FAQ
            </a>
            <Link to="/login" className="text-on-dark-muted no-underline transition hover:text-on-primary">
              Đăng nhập
            </Link>
            <Link to="/register" className="text-on-dark-muted no-underline transition hover:text-on-primary">
              Đăng ký
            </Link>
          </div>
        </div>

        <div className="home-footer-contact mt-10 border-t border-white/10 pt-10">
          <div className="mb-8 text-center sm:text-left">
            <p className="eyebrow mb-2 text-accent-lime">Liên hệ</p>
            <h3 className="font-display text-2xl font-bold text-on-primary">Kết nối với Trọ EZ</h3>
            <p className="mt-2 text-sm text-on-dark-muted">
              Hỗ trợ, tư vấn hoặc theo dõi cập nhật mới qua các kênh bên dưới.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href={CONTACT_INFO.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="home-contact-item no-underline"
            >
              <span className="home-contact-icon home-contact-icon--facebook">
                <FacebookIcon />
              </span>
              <div>
                <p className="text-sm font-semibold text-on-primary">Facebook</p>
                <p className="mt-0.5 text-xs text-on-dark-muted">{CONTACT_INFO.facebookLabel}</p>
              </div>
            </a>

            <a
              href={CONTACT_INFO.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="home-contact-item no-underline"
            >
              <span className="home-contact-icon home-contact-icon--tiktok">
                <TikTokIcon />
              </span>
              <div>
                <p className="text-sm font-semibold text-on-primary">TikTok</p>
                <p className="mt-0.5 text-xs text-on-dark-muted">{CONTACT_INFO.tiktokLabel}</p>
              </div>
            </a>

            <a href={CONTACT_INFO.phoneHref} className="home-contact-item no-underline">
              <span className="home-contact-icon home-contact-icon--phone">
                <Phone size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-on-primary">Số điện thoại</p>
                <p className="mt-0.5 text-xs text-on-dark-muted">{CONTACT_INFO.phone}</p>
              </div>
            </a>

            <a href={CONTACT_INFO.emailHref} className="home-contact-item no-underline">
              <span className="home-contact-icon home-contact-icon--email">
                <Mail size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-on-primary">Email</p>
                <p className="mt-0.5 break-all text-xs text-on-dark-muted">{CONTACT_INFO.email}</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 lg:px-8">
        <p className="mx-auto max-w-6xl text-center text-sm text-on-dark-muted">
          © {year} Trọ EZ. Quản lý phòng trọ thông minh.
        </p>
      </div>
    </footer>
  );
}
