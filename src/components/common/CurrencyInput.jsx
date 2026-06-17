import { formatMoneyInput } from '../../utils/currencyInput';

export default function CurrencyInput({
  name,
  value,
  onChange,
  className = 'text-input',
  placeholder = '0',
  disabled = false,
  ...props
}) {
  const handleChange = (event) => {
    onChange?.({
      ...event,
      target: {
        ...event.target,
        name: event.target.name,
        value: formatMoneyInput(event.target.value),
      },
    });
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      name={name}
      value={value ?? ''}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  );
}
