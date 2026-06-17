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

// Phân loại mục quản lý: thiết bị hoặc dịch vụ
export const ITEM_CATEGORIES = {
  device: { value: 'device', label: 'Thiết bị' },
  service: { value: 'service', label: 'Dịch vụ' },
};

export const ITEM_CATEGORY_OPTIONS = Object.values(ITEM_CATEGORIES);

export const getCategory = (item) =>
  (item?.category === 'service' ? 'service' : 'device');

export const DEVICE_TYPES = [
  'Điện lạnh',
  'Điện gia dụng',
  'Nội thất',
  'An ninh',
  'Nhà bếp',
  'Khác',
];

export const SERVICE_TYPES = [
  'Internet',
  'Vệ sinh',
  'Giữ xe',
  'Giặt ủi',
  'Nước uống',
  'An ninh',
  'Điện nước',
  'Khác',
];

export const getTypesByCategory = (category) =>
  category === 'service' ? SERVICE_TYPES : DEVICE_TYPES;

// Tên icon Lucide tương ứng từng loại (resolve trong component)
export const TYPE_ICON = {
  // Thiết bị
  'Điện lạnh': 'Snowflake',
  'Điện gia dụng': 'Plug',
  'Nội thất': 'Sofa',
  'Nhà bếp': 'CookingPot',
  // Dịch vụ
  Internet: 'Wifi',
  'Vệ sinh': 'Sparkles',
  'Giữ xe': 'Car',
  'Giặt ủi': 'WashingMachine',
  'Nước uống': 'Droplet',
  'Điện nước': 'Zap',
  // Dùng chung
  'An ninh': 'ShieldCheck',
  Khác: 'Package',
};

// Giữ lại tên cũ để tương thích
export const DEVICE_TYPE_ICON = TYPE_ICON;

export const getStatusConfig = (status) =>
  DEVICE_STATUS[status] || DEVICE_STATUS.active;
