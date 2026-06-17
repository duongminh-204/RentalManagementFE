import { useState, useEffect } from 'react';
import { formatDateDisplay, parseDateDisplay } from '../../utils/dateHelpers';

/**
 * Ô nhập ngày định dạng dd/MM/yyyy; value/onChange dùng yyyy-MM-dd cho API.
 */
const DateInput = ({
  name,
  value = '',
  onChange,
  className = '',
  disabled = false,
  required = false,
  placeholder = 'dd/mm/yyyy',
  id,
}) => {
  const [display, setDisplay] = useState(() => formatDateDisplay(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDisplay(formatDateDisplay(value));
    setInvalid(false);
  }, [value]);

  const emitChange = (apiValue) => {
    onChange?.({
      target: { name, value: apiValue, type: 'date' },
    });
  };

  const handleBlur = () => {
    if (!display.trim()) {
      setInvalid(false);
      emitChange('');
      return;
    }
    const api = parseDateDisplay(display);
    if (api === null) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setDisplay(formatDateDisplay(api));
    if (api !== value) emitChange(api);
  };

  return (
    <div>
      <input
        type="text"
        id={id}
        name={name}
        value={display}
        onChange={(e) => {
          setDisplay(e.target.value);
          setInvalid(false);
        }}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="off"
        className={`${className}${invalid ? ' border-accent-pink' : ''}`}
        aria-invalid={invalid}
      />
      {invalid && (
        <p className="mt-1 text-xs text-accent-pink">Ngày không hợp lệ (dd/mm/yyyy)</p>
      )}
    </div>
  );
};

export default DateInput;
