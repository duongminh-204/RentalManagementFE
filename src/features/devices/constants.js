// Trạng thái thiết bị + cấu hình màu sắc badge (Tailwind)
export const DEVICE_STATUS = {
  active: {
    value: 'active',
    label: 'Đang hoạt động',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  maintenance: {
    value: 'maintenance',
    label: 'Đang bảo trì',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  broken: {
    value: 'broken',
    label: 'Hỏng / Ngừng dùng',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
};

export const DEVICE_STATUS_OPTIONS = Object.values(DEVICE_STATUS);

export const DEVICE_TYPES = [
  'Điện lạnh',
  'Điện gia dụng',
  'Nội thất',
  'An ninh',
  'Nhà bếp',
  'Khác',
];

// Tên icon Lucide tương ứng từng loại thiết bị (resolve trong component)
export const DEVICE_TYPE_ICON = {
  'Điện lạnh': 'Snowflake',
  'Điện gia dụng': 'Plug',
  'Nội thất': 'Sofa',
  'An ninh': 'ShieldCheck',
  'Nhà bếp': 'CookingPot',
  Khác: 'Package',
};

export const getStatusConfig = (status) =>
  DEVICE_STATUS[status] || DEVICE_STATUS.active;
