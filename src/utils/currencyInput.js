export function parseMoneyInput(value) {
  if (value === null || value === undefined || value === '') return '';
  const digits = String(value).replace(/\D/g, '');
  return digits;
}

export function parseMoneyInputNumber(value) {
  const digits = parseMoneyInput(value);
  if (digits === '') return 0;
  const number = Number(digits);
  return Number.isNaN(number) ? 0 : number;
}

export function formatMoneyInput(value) {
  const digits = parseMoneyInput(value);
  if (digits === '') return '';
  return Number(digits).toLocaleString('vi-VN');
}

export function toMoneyInputValue(value) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string' && /^\d{1,3}(\.\d{3})*$/.test(value.trim())) {
    return value.trim();
  }
  const number = Number(value);
  if (Number.isNaN(number)) return '';
  return number.toLocaleString('vi-VN');
}

export function createMoneyInputChangeHandler(onChange) {
  return (event) => {
    const { name, value } = event.target;
    onChange({
      target: {
        name,
        value: formatMoneyInput(value),
      },
    });
  };
}
