import { ClipboardList } from 'lucide-react';

const pageContent = {
  overview: {
    title: 'Tổng quan hệ thống',
    description: 'Đây là trang tổng quan hệ thống, sẽ làm các chức năng này:',
    items: [
      'Theo dõi tổng số tài khoản, chủ trọ, khách thuê, tòa nhà và phòng trọ.',
      'Xem số người dùng mới theo ngày, tuần, tháng.',
      'Theo dõi tài khoản đang hoạt động, tài khoản bị khóa và tài khoản lâu không đăng nhập.',
      'Hiển thị cảnh báo nhanh về lỗi hệ thống, lỗi upload, lỗi AI hoặc lỗi thanh toán.',
    ],
  },
  users: {
    title: 'Người dùng',
    description: 'Đây là trang quản lý người dùng, sẽ làm các chức năng này:',
    items: [
      'Tìm kiếm người dùng theo tên, email, số điện thoại và vai trò.',
      'Xem chi tiết từng tài khoản: trạng thái, ngày tạo, lần đăng nhập gần nhất.',
      'Khóa hoặc mở khóa tài khoản khi cần hỗ trợ vận hành.',
      'Xem nhanh số tòa nhà, phòng, hợp đồng và hóa đơn thuộc từng chủ trọ.',
    ],
  },
  monitoring: {
    title: 'Giám sát dữ liệu',
    description: 'Đây là trang giám sát dữ liệu, sẽ làm các chức năng này:',
    items: [
      'Xem dữ liệu theo từng chủ trọ ở chế độ chỉ đọc.',
      'Lọc dữ liệu theo tài khoản, tòa nhà, phòng, hợp đồng và hóa đơn.',
      'Cảnh báo dữ liệu bất thường như hóa đơn quá hạn nhiều, phòng thiếu thông tin hoặc hợp đồng sắp hết hạn.',
      'Hỗ trợ admin nắm tình trạng sử dụng hệ thống mà không sửa trực tiếp dữ liệu của người dùng.',
    ],
  },
  tickets: {
    title: 'Ticket hỗ trợ',
    description: 'Đây là trang ticket hỗ trợ, sẽ làm các chức năng này:',
    items: [
      'Tạo và theo dõi yêu cầu hỗ trợ từ người dùng.',
      'Phân loại ticket theo trạng thái: mới, đang xử lý, cần gọi lại, đã hoàn tất.',
      'Ghi chú nội bộ cho từng ticket để các admin phối hợp xử lý.',
      'Liên kết ticket với hội thoại chat website hoặc tài khoản người dùng.',
    ],
  },
  plans: {
    title: 'Gói dịch vụ',
    description: 'Đây là trang quản lý gói dịch vụ, sẽ làm các chức năng này:',
    items: [
      'Quản lý các gói Free, Pro hoặc Enterprise nếu hệ thống triển khai trả phí.',
      'Cấu hình giới hạn số tòa nhà, phòng, tài khoản phụ hoặc dung lượng upload theo từng gói.',
      'Theo dõi trạng thái dùng thử, gia hạn, hủy gói và lịch sử thanh toán.',
      'Cấp quyền hoặc điều chỉnh gói cho từng tài khoản khi cần hỗ trợ.',
    ],
  },
  settings: {
    title: 'Cấu hình hệ thống',
    description: 'Đây là trang cấu hình hệ thống, sẽ làm các chức năng này:',
    items: [
      'Bật hoặc tắt các module như AI Decor, upload file, chat website hoặc xuất báo cáo.',
      'Cấu hình giới hạn file upload, loại file được phép và dung lượng tối đa.',
      'Quản lý thông báo hệ thống, FAQ và nội dung hướng dẫn chung.',
      'Cấu hình các tham số vận hành an toàn cho toàn bộ hệ thống.',
    ],
  },
  auditLogs: {
    title: 'Nhật ký hoạt động',
    description: 'Đây là trang nhật ký hoạt động, sẽ làm các chức năng này:',
    items: [
      'Theo dõi lịch sử đăng nhập và đăng xuất của tài khoản admin.',
      'Ghi nhận các thao tác quan trọng như khóa user, đổi gói, cập nhật mẫu Excel hoặc thay đổi cấu hình.',
      'Lọc nhật ký theo người thao tác, thời gian, loại hành động và địa chỉ IP.',
      'Hỗ trợ truy vết khi có sự cố bảo mật hoặc tranh chấp dữ liệu.',
    ],
  },
};

const AdminPlaceholderPage = ({ type = 'overview' }) => {
  const content = pageContent[type] || pageContent.overview;

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light">
      <div className="page-content page-content--wide">
        <section className="dashboard-section-card max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-bold text-accent-violet-deep">
            <ClipboardList className="h-4 w-4" />
            Khu vực quản trị
          </div>
          <h1 className="text-3xl font-bold text-ink-deep">{content.title}</h1>
          <p className="mt-3 text-base leading-7 text-muted">{content.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {content.items.map((item) => (
              <div key={item} className="dashboard-mini-card">
                <p className="text-sm font-semibold leading-6 text-ink-deep">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPlaceholderPage;
