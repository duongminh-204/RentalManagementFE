import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Building,
  Building2,
  Car,
  Cpu,
  FileText,
  HandCoins,
  Home,
  LogOut,
  Menu,
  User,
  Users,
  X,
} from 'lucide-react';
import { getRoleLabel, getStoredUser } from '../../hooks/useAuth';
import UserAvatar from './UserAvatar';

const navItems = [
  { label: 'Tổng quan', path: '/dashboard', icon: Home },
  { label: 'Quản lý tòa nhà', path: '/buildings', icon: Building },
  { label: 'Phòng trọ', path: '/rooms', icon: Building2 },
  { label: 'Khách thuê', path: '/tenants', icon: Users },
  { label: 'Hợp đồng', path: '/contracts', icon: FileText },
  { label: 'Phương tiện', path: '/vehicles', icon: Car },
  { label: 'Thiết bị & Dịch vụ', path: '/devices', icon: Cpu },
  { label: 'Hoá đơn', path: '/invoices', icon: HandCoins },
  { label: 'Hồ sơ', path: '/profile', icon: User },
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
  const displayName = user?.fullName || user?.FullName || 'Tài khoản';
  const roleLabel = getRoleLabel(role);

  useEffect(() => {
    const refreshUser = () => setUser(getStoredUser());

    window.addEventListener('storage', refreshUser);
    window.addEventListener('user-updated', refreshUser);

    return () => {
      window.removeEventListener('storage', refreshUser);
      window.removeEventListener('user-updated', refreshUser);
    };
  }, []);

  const close = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebarBody = (
    <div className="flex h-full flex-col">
      <Link
        to="/dashboard"
        onClick={close}
        className="flex items-center gap-3 border-b border-hairline-cloud px-5 py-5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Building2 className="text-on-primary" size={22} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold tracking-tight text-ink-deep">
            RentalManagement
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25px] text-accent-violet-mid">
            Quản lý phòng trọ
          </p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} onClick={close} className={navLinkClass}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-hairline-cloud px-3 py-4">
        <Link
          to="/profile"
          onClick={close}
          className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-press"
        >
          <UserAvatar user={user} size="md" />
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
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline-cloud bg-surface-light px-4 py-3 lg:hidden">
        <Link to="/profile" className="flex min-w-0 items-center gap-2.5">
          <UserAvatar user={user} size="sm" />
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

      {/* Desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-hairline-cloud bg-surface-light lg:block">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-deep/40" onClick={close} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-surface-light shadow-[var(--shadow-card)]">
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
