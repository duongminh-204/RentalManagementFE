import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import AppLogo from './AppLogo';

const SquiggleDivider = () => (
  <svg
    className="squiggle-divider"
    viewBox="0 0 1200 12"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M0 6 Q30 0 60 6 T120 6 T180 6 T240 6 T300 6 T360 6 T420 6 T480 6 T540 6 T600 6 T660 6 T720 6 T780 6 T840 6 T900 6 T960 6 T1020 6 T1080 6 T1140 6 T1200 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-hairline-cloud bg-surface-light text-ink-deep">
      <SquiggleDivider />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AppLogo variant="icon" />
              <div>
                <h3 className="font-display text-lg font-semibold">TROEZ</h3>
                <p className="text-sm text-muted">Quản lý phòng trọ</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Giải pháp quản lý phòng trọ toàn diện, chuyên nghiệp và hiệu quả cho các chủ phòng trọ.
            </p>
            <div className="flex gap-2 pt-1">
              {['f', '𝕏', 'in'].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline-cloud bg-surface-press text-sm font-bold transition-colors hover:border-hairline-violet hover:bg-primary hover:text-on-primary"
                >
                  {label}
                </a>
              ))}
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline-cloud bg-surface-press transition-colors hover:border-hairline-violet hover:bg-primary hover:text-on-primary"
                title="Github"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="eyebrow text-ink-deep">Truy cập nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="text-ink-deep underline-offset-2 hover:underline">Dashboard</Link></li>
              <li><Link to="/rooms" className="text-ink-deep underline-offset-2 hover:underline">Quản lý phòng</Link></li>
              <li><Link to="/tenants" className="text-ink-deep underline-offset-2 hover:underline">Khách thuê</Link></li>
              <li><Link to="/contracts" className="text-ink-deep underline-offset-2 hover:underline">Hợp đồng</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="eyebrow text-ink-deep">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="underline-offset-2 hover:underline">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="underline-offset-2 hover:underline">Liên hệ</a></li>
              <li><a href="#" className="underline-offset-2 hover:underline">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="underline-offset-2 hover:underline">Điều khoản sử dụng</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="eyebrow text-ink-deep">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <Phone size={18} className="shrink-0 text-accent-violet" />
                <span>+84 (0) 123 456 789</span>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="shrink-0 text-accent-violet" />
                <span>support@rentalpro.com</span>
              </li>
              <li className="flex gap-3">
                <MapPin size={18} className="shrink-0 text-accent-violet" />
                <span>123 Đường ABC, TP HCM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-hairline-cloud">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-muted md:flex-row">
          <p>© {currentYear} TROEZ. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <a href="#" className="underline-offset-2 hover:underline">Chính sách bảo mật</a>
            <a href="#" className="underline-offset-2 hover:underline">Điều khoản dịch vụ</a>
            <a href="#" className="underline-offset-2 hover:underline">Liên hệ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
