import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { getRoleLabel, getStoredUser } from '../../../hooks/useAuth';
import UserAvatar from '../../../components/common/UserAvatar';
import AppLogo from '../../../components/common/AppLogo';

const navItems = [
  { label: 'Tổng quan', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Chủ trọ', path: '/admin/owners', icon: Users },
  { label: 'Gói dịch vụ', path: '/admin/packages', icon: Package },
  { label: 'Đăng ký', path: '/admin/subscriptions', icon: RefreshCw },
  { label: 'Thanh toán', path: '/admin/payments', icon: CreditCard },
  { label: 'Người dùng', path: '/admin/users', icon: ShieldCheck },
  { label: 'Nhật ký', path: '/admin/audit-logs', icon: ClipboardList },
  { label: 'Mẫu Excel', path: '/admin/excel-template', icon: FileSpreadsheet },
];

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-on-primary' : 'text-ink-deep hover:bg-surface-press'
  }`;

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const navigate = useNavigate();

  useEffect(() => {
    const refreshUser = () => setUser(getStoredUser());
    window.addEventListener('storage', refreshUser);
    window.addEventListener('user-updated', refreshUser);
    return () => {
      window.removeEventListener('storage', refreshUser);
      window.removeEventListener('user-updated', refreshUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const sidebarBody = (
    <div className="flex h-full flex-col">
      <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-5" onClick={() => setIsOpen(false)}>
        <AppLogo compact />
        <div>
          <p className="text-sm font-bold text-ink-deep">Admin Panel</p>
          <p className="text-xs text-muted">Quản trị hệ thống</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={navLinkClass} onClick={() => setIsOpen(false)}>
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-hairline-cloud p-4">
        <div className="mb-3 flex items-center gap-3">
          <UserAvatar name={user?.fullName || user?.FullName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-deep">{user?.fullName || user?.FullName}</p>
            <p className="text-xs text-muted">{getRoleLabel(user?.role)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-deep hover:bg-surface-press"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 rounded-xl bg-white p-2 shadow-md lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen ? (
        <button type="button" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsOpen(false)} aria-label="Đóng menu" />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-hairline-cloud bg-white transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          className="absolute right-3 top-3 rounded-lg p-1 hover:bg-surface-press lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarBody}
      </aside>
    </>
  );
};

export default AdminSidebar;
