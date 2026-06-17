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
