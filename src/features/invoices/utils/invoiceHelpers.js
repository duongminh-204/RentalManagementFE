import { parseMonthYear } from '../../../utils/dateHelpers';

const sanitizeFileNamePart = (value, fallback) => {
  const cleaned = String(value ?? '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-');

  return cleaned || fallback;
};

/** Tên file xuất PDF: Phòng - Khách thuê - Hóa Đơn Tiền Phòng Tháng X - YYYY */
export const buildInvoiceExportFileName = (invoice) => {
  if (!invoice) {
    return 'Hóa Đơn Tiền Phòng';
  }

  const roomName = sanitizeFileNamePart(invoice.roomName || invoice.RoomName, 'Phòng');
  const tenantName = sanitizeFileNamePart(invoice.tenantName || invoice.TenantName, 'Khách thuê');
  const { month, year } = parseMonthYear(invoice.monthYear || invoice.MonthYear);

  return `${roomName} - ${tenantName} - Hóa Đơn Tiền Phòng Tháng ${month} - ${year}`;
};
