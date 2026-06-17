import { format, parse, isValid } from 'date-fns';

export const DATE_DISPLAY_FORMAT = 'dd/MM/yyyy';
export const DATE_API_FORMAT = 'yyyy-MM-dd';

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = parse(str.slice(0, 10), DATE_API_FORMAT, new Date());
    return isValid(d) ? d : null;
  }
  const d = new Date(value);
  return isValid(d) ? d : null;
};

/** Hiển thị: dd/MM/yyyy */
export const formatDateDisplay = (value) => {
  const d = toDate(value);
  if (!d) return '';
  return format(d, DATE_DISPLAY_FORMAT);
};

/** Parse chuỗi dd/MM/yyyy → yyyy-MM-dd (API) hoặc null nếu không hợp lệ */
export const parseDateDisplay = (displayStr) => {
  const trimmed = String(displayStr ?? '').trim();
  if (!trimmed) return '';
  const parsed = parse(trimmed, DATE_DISPLAY_FORMAT, new Date());
  if (!isValid(parsed)) return null;
  return format(parsed, DATE_API_FORMAT);
};

/** Giá trị API / Date → yyyy-MM-dd */
export const toApiDate = (value) => {
  const d = toDate(value);
  if (!d) return '';
  return format(d, DATE_API_FORMAT);
};

/** Alias tương thích form (giữ yyyy-MM-dd nội bộ) */
export const toInputDate = toApiDate;

/** yyyy-MM → nhãn tiếng Việt, ví dụ "tháng 6 năm 2025" */
export const formatMonthYearLabel = (monthYear) => {
  const normalized = String(monthYear ?? '').trim();
  if (!/^\d{4}-\d{2}$/.test(normalized)) {
    return normalized || '—';
  }

  const [year, month] = normalized.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (!isValid(date)) {
    return normalized;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

/** Tách yyyy-MM thành { month: 1-12, year } */
export const parseMonthYear = (value) => {
  const normalized = String(value ?? '').trim();
  if (/^\d{4}-\d{2}$/.test(normalized)) {
    const [year, month] = normalized.split('-');
    return { month: Number(month), year: Number(year) };
  }

  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

/** Ghép tháng + năm → yyyy-MM (định dạng API) */
export const toMonthYearApi = (month, year) =>
  `${year}-${String(month).padStart(2, '0')}`;
