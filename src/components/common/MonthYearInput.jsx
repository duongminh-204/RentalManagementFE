import { useMemo } from 'react';
import { parseMonthYear, toMonthYearApi } from '../../utils/dateHelpers';

const VI_MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

/**
 * Chọn kỳ hóa đơn (tháng/năm) hiển thị tiếng Việt; value/onChange dùng yyyy-MM cho API.
 */
const MonthYearInput = ({ name, value = '', onChange, className = '' }) => {
  const { month, year } = parseMonthYear(value);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 5; y <= currentYear + 2; y += 1) {
      years.push(y);
    }
    return years;
  }, []);

  const emitChange = (nextMonth, nextYear) => {
    onChange?.({
      target: { name, value: toMonthYearApi(nextMonth, nextYear), type: 'month' },
    });
  };

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <select
        value={month}
        onChange={(event) => emitChange(Number(event.target.value), year)}
        className="text-input"
        aria-label="Chọn tháng"
      >
        {VI_MONTHS.map((label, index) => (
          <option key={label} value={index + 1}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(event) => emitChange(month, Number(event.target.value))}
        className="text-input"
        aria-label="Chọn năm"
      >
        {yearOptions.map((optionYear) => (
          <option key={optionYear} value={optionYear}>
            Năm {optionYear}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthYearInput;
