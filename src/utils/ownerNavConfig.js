import {
  Building,
  Building2,
  Car,
  ClipboardCheck,
  Cpu,
  FileText,
  HandCoins,
  Home,
  Sparkles,
  User,
  Users,
  Wallet,
} from 'lucide-react';

/** Sidebar menu grouped by subscription tier (Starter → PRO → PREMIUM). */
export const OWNER_NAV_SECTIONS = [
  {
    tier: 'Starter',
    label: 'Starter',
    hint: 'Quản lý cơ bản',
    badgeClass: 'owner-nav-section__badge--starter',
    items: [
      { label: 'Tổng quan', path: '/dashboard', icon: Home },
      { label: 'Quản lý tòa nhà', path: '/buildings', icon: Building },
      { label: 'Phòng trọ', path: '/rooms', icon: Building2 },
      { label: 'Khách thuê', path: '/tenants', icon: Users },
      { label: 'Hợp đồng', path: '/contracts', icon: FileText },
      { label: 'Thiết bị & Dịch vụ', path: '/devices', icon: Cpu },
      { label: 'Hoá đơn', path: '/invoices', icon: HandCoins },
    ],
  },
  {
    tier: 'PRO',
    label: 'PRO',
    hint: 'Báo cáo & mở rộng',
    badgeClass: 'owner-nav-section__badge--pro',
    items: [
      { label: 'Công nợ chi tiết', path: '/debts', icon: Wallet },
      { label: 'Phương tiện', path: '/vehicles', icon: Car },
    ],
  },
  {
    tier: 'PREMIUM',
    label: 'PREMIUM',
    hint: 'Tính năng cao cấp',
    badgeClass: 'owner-nav-section__badge--premium',
    items: [
      { label: 'AI Decor phòng', path: '/rooms/decor', icon: Sparkles },
      { label: 'Checklist pháp lý', path: '/legal', icon: ClipboardCheck },
    ],
  },
];

export const OWNER_ACCOUNT_NAV = [{ label: 'Hồ sơ', path: '/profile', icon: User }];
