import {
  AirVent,
  Armchair,
  Bath,
  BedDouble,
  Camera,
  Car,
  Cctv,
  CookingPot,
  Droplet,
  Fan,
  Flame,
  KeyRound,
  Lightbulb,
  Lock,
  Microwave,
  Monitor,
  Package,
  Plug,
  Refrigerator,
  Router,
  Shirt,
  ShieldCheck,
  ShowerHead,
  Snowflake,
  Sofa,
  Sparkles,
  Speaker,
  Table,
  Tv,
  Utensils,
  WashingMachine,
  Wifi,
  Zap,
} from 'lucide-react';
import { TYPE_ICON } from '../constants';

export const ICON_REGISTRY = {
  AirVent,
  Refrigerator,
  WashingMachine,
  Tv,
  Microwave,
  Fan,
  Lightbulb,
  BedDouble,
  Sofa,
  Armchair,
  Shirt,
  Flame,
  Cctv,
  Camera,
  Table,
  Lock,
  KeyRound,
  Wifi,
  Router,
  Sparkles,
  Car,
  Droplet,
  ShowerHead,
  Bath,
  Speaker,
  Monitor,
  Utensils,
  Zap,
  ShieldCheck,
  Plug,
  Snowflake,
  CookingPot,
  Package,
};

const KEYWORD_ICONS = [
  [['máy lạnh', 'điều hòa', 'điều hoà'], AirVent],
  [['tủ lạnh'], Refrigerator],
  [['máy giặt', 'giặt', 'ủi'], WashingMachine],
  [['tivi', 'ti vi', ' tv'], Tv],
  [['vi sóng', 'lò vi'], Microwave],
  [['quạt'], Fan],
  [['đèn'], Lightbulb],
  [['giường'], BedDouble],
  [['sofa'], Sofa],
  [['ghế'], Armchair],
  [['tủ quần áo', 'tủ áo', 'tủ đồ'], Shirt],
  [['internet', 'mạng', 'wifi', 'modem', 'router'], Wifi],
  [['camera'], Cctv],
  [['nóng lạnh', 'bình nóng'], Flame],
  [['vòi sen', 'sen tắm'], ShowerHead],
  [['bồn tắm', 'bồn'], Bath],
  [['bếp'], CookingPot],
  [['nồi'], Utensils],
  [['khóa', 'khoá'], Lock],
  [['loa'], Speaker],
  [['màn hình', 'máy tính', 'monitor'], Monitor],
  [['bàn'], Table],
  [['vệ sinh', 'dọn'], Sparkles],
  [['giữ xe', 'gửi xe', 'bãi xe', 'đỗ xe'], Car],
  [['nước uống', 'nước'], Droplet],
  [['điện'], Zap],
  [['bảo vệ', 'an ninh'], ShieldCheck],
];

/** Trả về component icon Lucide từ tên hoặc object catalog/item */
export const resolveItemIcon = (item) => {
  const iconKey = typeof item === 'string' ? null : item?.icon;
  if (iconKey && ICON_REGISTRY[iconKey]) return ICON_REGISTRY[iconKey];

  const name = (
    typeof item === 'string'
      ? item
      : item?.name || item?.deviceName || item?.serviceName || ''
  ).toLowerCase();

  for (const [keywords, Icon] of KEYWORD_ICONS) {
    if (keywords.some((kw) => name.includes(kw))) return Icon;
  }

  const type = typeof item === 'object' ? item?.type : null;
  return ICON_REGISTRY[TYPE_ICON[type]] || Package;
};
