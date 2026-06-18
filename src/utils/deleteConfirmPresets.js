import { formatMonthYearLabel } from './dateHelpers';

export const deleteConfirmPresets = {
  invoice(invoice) {
    const invoiceId = invoice?.invoiceId ?? invoice?.InvoiceId;
    const roomName = invoice?.roomName ?? invoice?.RoomName ?? '—';
    const monthYear = invoice?.monthYear ?? invoice?.MonthYear ?? '';
    return {
      title: 'Xóa hóa đơn',
      targetLabel: `#${invoiceId} · ${roomName} · ${formatMonthYearLabel(monthYear)}`,
      description: 'Bạn sắp xóa hóa đơn này khỏi hệ thống.',
      consequences: [
        'Chi tiết các khoản phí trên hóa đơn',
        'Lịch sử thanh toán gắn với hóa đơn này',
      ],
    };
  },

  room(room) {
    const label = room?.roomName ?? room?.roomNumber ?? room?.RoomName ?? 'Phòng';
    return {
      title: 'Xóa phòng',
      targetLabel: label,
      description: 'Bạn sắp xóa phòng này và toàn bộ dữ liệu liên quan.',
      consequences: [
        'Tất cả hóa đơn của phòng (chi tiết và thanh toán)',
        'Tất cả hợp đồng của phòng',
        'Ảnh phòng, thiết bị và dịch vụ gắn với phòng',
        'Chỉ số điện, nước theo tháng',
        'Bài đăng liên quan đến phòng',
      ],
      note: 'Xe đỗ gắn với phòng sẽ được giữ nhưng bỏ liên kết phòng.',
    };
  },

  building(building) {
    const name = building?.buildingName ?? building?.name ?? 'Tòa nhà';
    return {
      title: 'Xóa tòa nhà',
      targetLabel: name,
      description: 'Bạn sắp xóa tòa nhà này và mọi dữ liệu bên trong.',
      consequences: [
        'Tất cả phòng trong tòa nhà',
        'Hóa đơn, hợp đồng và chỉ số điện nước của các phòng',
        'Chi phí vận hành (expense) gắn với tòa nhà',
      ],
    };
  },

  tenant(tenant) {
    const name = tenant?.fullName ?? tenant?.name ?? 'Khách thuê';
    return {
      title: 'Xóa khách thuê',
      targetLabel: name,
      description: 'Bạn sắp xóa vĩnh viễn khách thuê này.',
      consequences: [
        'Tất cả hợp đồng của khách thuê',
        'Ảnh đại diện và ảnh CCCD (nếu có)',
      ],
      note: 'Hóa đơn đã tạo vẫn được giữ trong hệ thống.',
    };
  },

  tenantIdCard(tenant) {
    const name = tenant?.fullName ?? tenant?.name ?? 'Khách thuê';
    return {
      title: 'Xóa ảnh CCCD',
      targetLabel: name,
      description: 'Chỉ xóa ảnh CCCD/CMND của khách thuê.',
      consequences: ['Ảnh CCCD/CMND đã lưu trên máy chủ'],
      note: 'Thông tin khách thuê và hợp đồng vẫn được giữ nguyên.',
      confirmLabel: 'Xóa ảnh',
    };
  },

  vehicle(vehicle) {
    const plate = vehicle?.licensePlate ?? vehicle?.licensePlateNumber ?? 'Xe';
    return {
      title: 'Xóa xe',
      targetLabel: plate,
      description: 'Bạn sắp xóa thông tin xe này.',
      consequences: [
        'Thông tin đăng ký xe và phí gửi xe',
        'Ảnh xe (nếu có)',
      ],
      note: 'Hóa đơn đã tạo trước đó không bị thay đổi.',
    };
  },

  contract(contract) {
    const label = contract?.contractNumber
      ? `Hợp đồng ${contract.contractNumber}`
      : `Hợp đồng #${contract?.id ?? contract?.contractId ?? ''}`;
    return {
      title: 'Xóa hợp đồng',
      targetLabel: label,
      description: 'Bạn sắp xóa hợp đồng này.',
      consequences: [
        'Bản ghi hợp đồng và lịch sử gia hạn/chấm dứt trong hệ thống',
        'File hợp đồng đã tải lên (nếu có)',
      ],
      note: 'Hóa đơn đã phát sinh trước đó vẫn được giữ.',
    };
  },

  roomTenant(tenant) {
    const name = tenant?.fullName ?? tenant?.name ?? 'Khách thuê';
    return {
      title: 'Gỡ khách thuê khỏi phòng',
      targetLabel: name,
      description: 'Hủy liên kết hợp đồng giữa khách thuê và phòng này.',
      consequences: [
        'Hợp đồng hiện tại giữa khách và phòng sẽ bị xóa',
      ],
      note: 'Khách thuê vẫn còn trong danh sách quản lý khách thuê.',
      confirmLabel: 'Gỡ khỏi phòng',
    };
  },

  roomImage() {
    return {
      title: 'Xóa ảnh phòng',
      description: 'Bạn sắp xóa ảnh này khỏi album phòng.',
      consequences: ['Ảnh phòng đã lưu trên máy chủ'],
      confirmLabel: 'Xóa ảnh',
    };
  },

  catalogItem(item) {
    const name = item?.name ?? 'Mục';
    const category = item?.category === 'service' ? 'dịch vụ' : 'thiết bị';
    return {
      title: 'Xóa khỏi danh mục',
      targetLabel: name,
      description: `Xóa mục ${category} này khỏi danh sách dùng chung.`,
      consequences: [
        `Liên kết ${category} trên mọi phòng đang sử dụng mục này`,
      ],
      note: 'Phòng và các dữ liệu khác không bị xóa.',
    };
  },

  roomAssignment(item) {
    const isService = Boolean(item?.roomServiceId ?? item?.category === 'service');
    const type = isService ? 'dịch vụ' : 'thiết bị';
    const name = item?.name ?? 'Mục';
    return {
      title: `Gỡ ${type} khỏi phòng`,
      targetLabel: name,
      description: `Bạn sắp gỡ ${type} này khỏi phòng hiện tại.`,
      consequences: [`Liên kết ${type} "${name}" trên phòng này`],
      note: 'Danh mục dùng chung và các phòng khác không bị ảnh hưởng.',
      confirmLabel: 'Gỡ khỏi phòng',
    };
  },

  paymentMethod(method, count = 1) {
    const title = count > 1 ? `Xóa ${count} tài khoản thanh toán` : 'Xóa tài khoản thanh toán';
    const targetLabel =
      count > 1
        ? `${count} tài khoản đã chọn`
        : method?.accountName || method?.bankName || method?.type || 'Tài khoản';
    return {
      title,
      targetLabel,
      description: 'Tài khoản sẽ bị gỡ khỏi cấu hình thanh toán.',
      consequences: [
        'Thông tin tài khoản và ảnh QR thanh toán (nếu có)',
      ],
      note: 'Hóa đơn đã tạo trước đó không bị ảnh hưởng.',
      confirmLabel: count > 1 ? `Xóa ${count} tài khoản` : 'Xóa tài khoản',
    };
  },

  paymentQrImage(method) {
    const title = method?.type === 'momo' ? 'MoMo' : method?.type === 'zalopay' ? 'ZaloPay' : 'Thanh toán';
    return {
      title: 'Xóa ảnh QR',
      targetLabel: title,
      description: 'Xóa ảnh QR đã upload cho tài khoản này.',
      consequences: ['Ảnh QR thanh toán đã lưu'],
      note: 'Thông tin tài khoản vẫn được giữ, chỉ bỏ ảnh QR.',
      confirmLabel: 'Xóa ảnh QR',
    };
  },
};
