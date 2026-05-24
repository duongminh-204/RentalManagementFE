import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  Car,
  FileSpreadsheet,
  HandCoins,
  Home,
  LogOut,
  Menu,
  User,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getStoredRole, getStoredUser, isAdminRole } from '../../hooks/useAuth';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const role = getStoredRole();
  const user = getStoredUser();
  const isAdmin = isAdminRole(role);
  const displayName = user?.fullName || user?.FullName || 'Tài khoản';

  const menuItems = isAdmin
    ? [
        { label: 'Mẫu Excel', path: '/admin/excel-template', icon: FileSpreadsheet },
        { label: 'Dashboard', path: '/dashboard', icon: Home },
      ]
    : [
        { label: 'Tổng quan', path: '/dashboard', icon: Home },
        { label: 'Phòng trọ', path: '/rooms', icon: Building2 },
        { label: 'Công nợ', path: '/debts', icon: HandCoins },
        { label: 'Khách thuê', path: '/tenants', icon: Users },
        { label: 'Phương tiện', path: '/vehicles', icon: Car },
      ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const homePath = isAdmin ? '/admin/excel-template' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-hairline-cloud bg-surface-light">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to={homePath} className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105">
              <Building2 className="text-on-primary" size={22} />
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-sm font-semibold tracking-tight text-ink-deep">
                RentalManagement
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25px] text-accent-violet-mid">
                {isAdmin ? 'Quản trị hệ thống' : 'Quản lý phòng trọ'}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'nav-link-active' : ''}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="nav-link border-0 bg-transparent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-press text-ink-deep">
                  <User size={18} />
                </div>
                <span className="text-sm font-medium">{displayName}</span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-hairline-cloud bg-surface-light shadow-[var(--shadow-card)]"
                  >
                    <div className="border-b border-hairline-cloud px-4 py-3">
                      <p className="text-sm font-semibold text-ink-deep">{displayName}</p>
                      <p className="text-xs font-medium uppercase tracking-wide text-accent-violet-mid">
                        {role || 'Chưa có quyền'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-accent-pink transition-colors hover:bg-surface-press"
                    >
                      <LogOut size={18} />
                      Đăng xuất
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-ink-deep hover:bg-surface-press lg:hidden"
              aria-label="Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 border-t border-hairline-cloud pb-4 pt-2 lg:hidden"
            >
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`nav-link w-full ${isActive(item.path) ? 'nav-link-active' : ''}`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="nav-link w-full text-accent-pink"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
