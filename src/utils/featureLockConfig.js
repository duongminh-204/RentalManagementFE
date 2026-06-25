import {
  Car,
  Clock3,
  LockKeyhole,
  Palette,
  PieChart,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export const FEATURE_LOCK_CONFIGS = {
  vehicles: {
    key: 'vehicles',
    label: 'Quản lý phương tiện',
    title: 'Quản lý xe người thuê',
    subtitle: 'Theo dõi biển số, phí gửi xe và liên kết phòng — tính năng này thuộc gói PRO.',
    description:
      'Ghi nhận xe máy, ô tô của khách thuê, phát hiện xe lạ và tính phí gửi xe tự động theo hợp đồng.',
    icon: Car,
    requiredPackage: 'PRO',
    previewItems: ['Biển số & loại xe', 'Phí gửi hàng tháng', 'Liên kết phòng & khách', 'Cảnh báo xe lạ'],
    accent: 'sky',
  },
  roomDecor: {
    key: 'roomDecor',
    label: 'AI Decor phòng',
    title: 'Trang trí phòng bằng AI',
    subtitle: 'Tạo concept decor từ ảnh phòng thật — tính năng cao cấp thuộc gói PREMIUM.',
    description:
      'Upload ảnh phòng, chọn phong cách và để AI tạo bản thiết kế giữ nguyên cấu trúc phòng gốc.',
    icon: Palette,
    requiredPackage: 'PREMIUM',
    previewItems: ['Upload ảnh phòng thật', 'Chọn phong cách decor', 'AI tạo concept', 'Lưu ảnh vào phòng'],
    accent: 'violet',
  },
  debtReports: {
    key: 'debtReports',
    label: 'Báo cáo công nợ',
    title: 'Báo cáo công nợ',
    subtitle: 'Theo dõi khách chưa thanh toán và tổng nợ — thuộc gói PRO.',
    description:
      'Xem danh sách phòng nợ tiền, số tháng chưa đóng và top khách nợ nhiều nhất ngay trên dashboard.',
    icon: Wallet,
    requiredPackage: 'PRO',
    previewItems: ['Tổng công nợ', 'Số phòng chưa thanh toán', 'Top khách nợ', 'Chi tiết từng tháng'],
    accent: 'amber',
  },
  revenueReports: {
    key: 'revenueReports',
    label: 'Báo cáo doanh thu',
    title: 'Báo cáo doanh thu',
    subtitle: 'Biểu đồ doanh thu và báo cáo tháng — thuộc gói PRO.',
    description:
      'Phân tích doanh thu theo tháng, xuất Excel và nhập dữ liệu hàng loạt để vận hành hiệu quả hơn.',
    icon: TrendingUp,
    requiredPackage: 'PRO',
    previewItems: ['Biểu đồ doanh thu', 'Báo cáo theo tháng', 'Xuất / nhập Excel', 'So sánh kỳ'],
    accent: 'lime',
  },
  debtPage: {
    key: 'debtPage',
    label: 'Báo cáo công nợ & doanh thu',
    title: 'Quản lý công nợ chi tiết',
    subtitle: 'Trang công nợ đầy đủ với thanh toán QR — thuộc gói PRO.',
    description:
      'Xem chi tiết từng phòng nợ, ghi nhận thanh toán, cấu hình phương thức thu tiền và quét mã QR.',
    icon: PieChart,
    requiredPackage: 'PRO',
    previewItems: ['Danh sách nợ theo phòng', 'Thanh toán & ghi nhận', 'Mã QR thu tiền', 'Lịch sử thanh toán'],
    accent: 'pink',
  },
  pending: {
    key: 'pending',
    label: 'Chờ kích hoạt gói',
    title: 'Gói đang chờ admin kích hoạt',
    subtitle: 'Yêu cầu gói đã được ghi nhận. Admin sẽ mở khóa tính năng sớm nhất.',
    description:
      'Bạn có thể theo dõi trạng thái kích hoạt. Hệ thống tự cập nhật khi admin duyệt gói.',
    icon: Clock3,
    requiredPackage: null,
    previewItems: ['Đăng ký & chọn gói', 'Admin xem xét', 'Kích hoạt tính năng'],
    accent: 'violet',
  },
  noPlan: {
    key: 'noPlan',
    label: 'Chưa có gói',
    title: 'Chưa có gói đang hoạt động',
    subtitle: 'Chọn gói dịch vụ và chờ admin kích hoạt trước khi sử dụng hệ thống.',
    description:
      'Mỗi gói mở khóa bộ tính năng khác nhau — xem bảng giá để chọn gói phù hợp quy mô trọ của bạn.',
    icon: LockKeyhole,
    requiredPackage: null,
    previewItems: ['Starter — cơ bản', 'PRO — mở rộng', 'PREMIUM — đầy đủ'],
    accent: 'violet',
  },
};

const PATH_FEATURE_KEYS = {
  '/vehicles': 'vehicles',
  '/rooms/decor': 'roomDecor',
  '/debts': 'debtPage',
};

const API_FEATURE_KEYS = [
  { pattern: /\/dashboard\/debt/i, key: 'debtReports' },
  { pattern: /\/dashboard\/revenue/i, key: 'revenueReports' },
  { pattern: /\/vehicles/i, key: 'vehicles' },
  { pattern: /\/room-decor|\/rooms\/decor/i, key: 'roomDecor' },
];

export const resolveFeatureKey = ({ path, requestUrl, featureLabel, lockedKey } = {}) => {
  if (lockedKey && FEATURE_LOCK_CONFIGS[lockedKey]) {
    return lockedKey;
  }

  if (path && PATH_FEATURE_KEYS[path]) {
    return PATH_FEATURE_KEYS[path];
  }

  if (requestUrl) {
    const match = API_FEATURE_KEYS.find(({ pattern }) => pattern.test(requestUrl));
    if (match) return match.key;
  }

  if (featureLabel) {
    const entry = Object.values(FEATURE_LOCK_CONFIGS).find((cfg) => cfg.label === featureLabel);
    if (entry) return entry.key;
  }

  return null;
};

export const getFeatureLockConfig = (featureKey) =>
  (featureKey && FEATURE_LOCK_CONFIGS[featureKey]) || null;
