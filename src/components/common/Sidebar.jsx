import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { OWNER_ACCOUNT_NAV, OWNER_NAV_SECTIONS } from '../../utils/ownerNavConfig';

import {
  Activity,
  BarChart3,
  Building,
  Building2,
  Car,
  ClipboardList,
  Cpu,
  FileSpreadsheet,
  FileText,
  HandCoins,
  Home,
  LifeBuoy,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Settings,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import { getRoleHomePath, getRoleLabel, getStoredUser, isAdminRole } from '../../hooks/useAuth';

import UserAvatar from './UserAvatar';
import OwnerPackageBadge from './OwnerPackageBadge';
import AppLogo from './AppLogo';


const ownerNavItems = [
  { label: 'Tổng quan', path: '/dashboard', icon: Home },
  { label: 'Quản lý tòa nhà', path: '/buildings', icon: Building },
  { label: 'Phòng trọ', path: '/rooms', icon: Building2 },
  { label: 'AI Decor phòng', path: '/rooms/decor', icon: Sparkles },
  { label: 'Khách thuê', path: '/tenants', icon: Users },
  { label: 'Hợp đồng', path: '/contracts', icon: FileText },
  { label: 'Phương tiện', path: '/vehicles', icon: Car },
  { label: 'Thiết bị & Dịch vụ', path: '/devices', icon: Cpu },
  { label: 'Hoá đơn', path: '/invoices', icon: HandCoins },
  { label: 'Hồ sơ', path: '/profile', icon: User },
];

const adminNavItems = [
  { label: 'Tổng quan hệ thống', path: '/admin/overview', icon: BarChart3 },
  { label: 'Người dùng', path: '/admin/users', icon: Users },
  { label: 'Giám sát dữ liệu', path: '/admin/monitoring', icon: Activity },
  { label: 'Chat website', path: '/admin/chat', icon: MessageCircle },
  { label: 'Ticket hỗ trợ', path: '/admin/tickets', icon: LifeBuoy },
  { label: 'Gói dịch vụ', path: '/admin/plans', icon: Package },
  { label: 'Mẫu Excel', path: '/admin/excel-template', icon: FileSpreadsheet },
  { label: 'Cấu hình hệ thống', path: '/admin/settings', icon: Settings },
  { label: 'Nhật ký hoạt động', path: '/admin/audit-logs', icon: ClipboardList },
  { label: 'Hồ sơ admin', path: '/profile', icon: User },
];


const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-on-primary' : 'text-ink-deep hover:bg-surface-press'
  }`;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const navigate = useNavigate();

  const role = user?.role || '';
  const isAdmin = isAdminRole(role);
  const displayName = user?.fullName || user?.FullName || 'Tài khoản';
  const roleLabel = getRoleLabel(role);
  const homePath = getRoleHomePath(role);
  const navItems = isAdmin ? adminNavItems : ownerNavItems;

  useEffect(() => {
    const refreshUser = () => setUser(getStoredUser());

    window.addEventListener('storage', refreshUser);
    window.addEventListener('user-updated', refreshUser);

    return () => {
      window.removeEventListener('storage', refreshUser);
      window.removeEventListener('user-updated', refreshUser);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth-changed'));
    navigate('/');
  };

  const sidebarBody = (
    <div className="flex h-full flex-col">
      <Link
        to={homePath}
        onClick={close}
        className="flex items-center gap-3 border-b border-hairline-cloud px-4 py-4 sm:gap-4 sm:px-5 sm:py-6"
      >
        <AppLogo variant="icon" className="h-12 w-12 sm:h-14 sm:w-14" />
        <div className="min-w-0">
          <p className="font-display text-base font-semibold tracking-tight text-ink-deep">TROEZ</p>
          <p className="text-xs font-semibold uppercase tracking-[0.25px] text-accent-violet-mid">
            {isAdmin ? 'Quản trị hệ thống' : 'Quản lý phòng trọ'}
          </p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        {isAdmin ? (
          <div className="flex flex-col gap-1">
            {adminNavItems.map(({ label, path, icon: Icon }) => (
              <NavLink key={path} to={path} onClick={close} className={navLinkClass}>
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </div>
        ) : (
          OWNER_NAV_SECTIONS.map((section) => (
            <div key={section.tier} className="owner-nav-section">
              <div className="owner-nav-section__header">
                <span className={`owner-nav-section__badge ${section.badgeClass}`}>{section.label}</span>
                <span className="owner-nav-section__hint">{section.hint}</span>
              </div>
              <div className="flex flex-col gap-1">
                {section.items.map(({ label, path, icon: Icon }) => (
                  <NavLink key={path} to={path} onClick={close} className={navLinkClass}>
                    <Icon size={20} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))
        )}
      </nav>

      <div className="border-t border-hairline-cloud px-3 py-4">
        <div className="mb-2 flex flex-col gap-1">
          {!isAdmin && OWNER_ACCOUNT_NAV.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} onClick={close} className={navLinkClass}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
        <Link
          to="/profile"
          onClick={close}
          className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-press"
        >
          <div className="flex shrink-0 items-center gap-2">
            <UserAvatar user={user} size="md" />
            <OwnerPackageBadge user={user} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-deep">{displayName}</p>
            <p className="truncate text-xs font-medium uppercase tracking-wide text-accent-violet-mid">
              {roleLabel}
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-accent-pink transition-colors hover:bg-surface-press"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="safe-top sticky top-0 z-40 flex items-center justify-between border-b border-hairline-cloud bg-surface-light px-3 py-2.5 sm:px-4 sm:py-3 lg:hidden">
        <Link to="/profile" className="flex min-w-0 items-center gap-2.5">
          <div className="flex shrink-0 items-center gap-1.5">
            <UserAvatar user={user} size="sm" />
            <OwnerPackageBadge user={user} className="owner-package-badge--compact" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-ink-deep">{displayName}</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-accent-violet-mid">
              {roleLabel}
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-ink-deep hover:bg-surface-press"
          aria-label="Mở menu"
        >
          <Menu size={22} />
        </button>
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-hairline-cloud bg-surface-light lg:block">
        {sidebarBody}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-deep/40" onClick={close} aria-hidden="true" />
          <aside className="safe-top safe-bottom absolute inset-y-0 left-0 flex w-[min(18rem,calc(100vw-2rem))] max-w-[85%] flex-col bg-surface-light shadow-[var(--shadow-card)]">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-ink-deep hover:bg-surface-press"
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
            {sidebarBody}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
