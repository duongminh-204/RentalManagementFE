import { motion } from 'framer-motion';
import {
  BarChartLine,
  Bell,
  BoxArrowInDown,
  BoxArrowUp,
  BuildingAdd,
  Calculator,
  CarFront,
  CashCoin,
  ClockHistory,
  Cursor,
  DoorOpen,
  Download,
  FileEarmarkPdf,
  FileEarmarkText,
  Grid3x3Gap,
  Hammer,
  Link45deg,
  Palette,
  PersonLinesFill,
  PieChart,
  QrCode,
  Receipt,
  Tools,
  Trophy,
} from 'react-bootstrap-icons';
import {
  BarChart3,
  Building2,
  Car,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  Users,
  Wrench,
} from 'lucide-react';

const MODULES = [
  {
    icon: Building2,
    title: 'Tòa nhà & phòng trọ',
    description:
      'Quản lý nhiều tòa nhà, từng phòng với trạng thái trống/đang thuê, giá thuê và sơ đồ mặt bằng.',
    bullets: [
      { text: 'Thêm/sửa tòa nhà, địa chỉ trên bản đồ', icon: BuildingAdd },
      { text: 'Theo dõi phòng trống theo thời gian thực', icon: DoorOpen },
      { text: 'Xem chi tiết phòng và người đang thuê', icon: PersonLinesFill },
    ],
    tone: 'violet',
  },
  {
    icon: Users,
    title: 'Khách thuê & hợp đồng',
    description: 'Lưu trữ hồ sơ người thuê, CCCD, liên hệ và quản lý vòng đời hợp đồng thuê.',
    bullets: [
      { text: 'Tạo hợp đồng mới, gia hạn hoặc chấm dứt', icon: FileEarmarkText },
      { text: 'Lịch sử thanh toán và tiền cọc', icon: ClockHistory },
      { text: 'Nhắc hạn hợp đồng sắp hết', icon: Bell },
    ],
    tone: 'pink',
  },
  {
    icon: FileText,
    title: 'Hóa đơn & thu tiền',
    description: 'Lập hóa đơn tiền phòng, điện nước, dịch vụ — in phiếu thu hoặc tạo mã VietQR.',
    bullets: [
      { text: 'Tính tiền theo tháng, theo phòng', icon: Calculator },
      { text: 'In hóa đơn chuẩn A4', icon: FileEarmarkPdf },
      { text: 'Tích hợp VietQR cho chuyển khoản nhanh', icon: QrCode },
    ],
    tone: 'lime',
  },
  {
    icon: BarChart3,
    title: 'Dashboard & công nợ',
    description: 'Tổng quan doanh thu, tỷ lệ lấp đầy phòng và danh sách khách thuê còn nợ.',
    bullets: [
      { text: 'Biểu đồ doanh thu theo tháng', icon: BarChartLine },
      { text: 'Top khách nợ nhiều nhất', icon: Trophy },
      { text: 'Báo cáo trạng thái phòng trực quan', icon: PieChart },
    ],
    tone: 'violet',
  },
  {
    icon: Wrench,
    title: 'Thiết bị & dịch vụ',
    description: 'Theo dõi đồ đạc, thiết bị trong phòng và các khoản phí dịch vụ kèm theo.',
    bullets: [
      { text: 'Danh sách thiết bị theo phòng', icon: Tools },
      { text: 'Ghi nhận hư hỏng, bảo trì', icon: Hammer },
      { text: 'Tính phí dịch vụ vào hóa đơn', icon: Receipt },
    ],
    tone: 'pink',
  },
  {
    icon: Car,
    title: 'Quản lý xe',
    description: 'Đăng ký phương tiện của khách thuê, gắn với phòng và hợp đồng tương ứng.',
    bullets: [
      { text: 'Biển số, loại xe, chủ xe', icon: CarFront },
      { text: 'Liên kết xe với phòng đang thuê', icon: Link45deg },
      { text: 'Theo dõi phí gửi xe hàng tháng', icon: CashCoin },
    ],
    tone: 'lime',
  },
  {
    icon: FileSpreadsheet,
    title: 'Import / Export Excel',
    description: 'Nhập dữ liệu hàng loạt từ file mẫu hoặc xuất báo cáo cho kế toán.',
    bullets: [
      { text: 'Tải file mẫu chuẩn từ hệ thống', icon: Download },
      { text: 'Import phòng, khách thuê nhanh', icon: BoxArrowInDown },
      { text: 'Export báo cáo tổng hợp', icon: BoxArrowUp },
    ],
    tone: 'violet',
  },
  {
    icon: LayoutGrid,
    title: 'Sơ đồ mặt bằng',
    description: 'Xem trực quan bố cục tòa nhà, trạng thái từng phòng ngay trên sơ đồ.',
    bullets: [
      { text: 'Floor plan tương tác', icon: Grid3x3Gap },
      { text: 'Màu sắc theo trạng thái phòng', icon: Palette },
      { text: 'Click xem chi tiết nhanh', icon: Cursor },
    ],
    tone: 'pink',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function HomeModules() {
  return (
    <section id="modules" className="home-section-dark px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Hệ sinh thái quản lý</p>
          <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl">
            Mọi module bạn cần —{' '}
            <span className="text-accent-violet">liên kết chặt chẽ</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Không chỉ là phần mềm ghi chép — Trọ EZ kết nối phòng, khách thuê, hợp đồng, hóa đơn và
            báo cáo thành một luồng dữ liệu thống nhất.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-14 grid gap-5 md:grid-cols-2"
        >
          {MODULES.map((mod) => (
            <motion.article key={mod.title} variants={item} className="home-module-card">
              <div className="flex items-start gap-4">
                <div className={`home-feature-icon home-feature-icon--${mod.tone}`}>
                  <mod.icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-ink-deep">{mod.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{mod.description}</p>
                  <ul className="mt-4 space-y-2.5">
                    {mod.bullets.map((bullet) => (
                      <li key={bullet.text} className="flex items-start gap-2.5 text-sm text-ink-deep/80">
                        <span className={`home-module-bullet-icon home-module-bullet-icon--${mod.tone}`}>
                          <bullet.icon size={13} />
                        </span>
                        {bullet.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
