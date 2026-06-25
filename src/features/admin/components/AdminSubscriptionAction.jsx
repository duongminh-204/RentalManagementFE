const VARIANTS = {
  default: 'border-hairline-cloud bg-white text-muted hover:border-accent-violet hover:bg-accent-violet/5 hover:text-accent-violet',
  primary: 'border-accent-violet/30 bg-accent-violet text-white hover:bg-accent-violet-mid shadow-sm',
  success: 'border-[#c8ead6] bg-[#f0faf4] text-[#1f7a45] hover:border-[#1f7a45] hover:bg-[#e8f8ef]',
  warning: 'border-[#f0d9a8] bg-[#fffaf0] text-[#b26a00] hover:border-[#b26a00]',
  danger: 'border-[#f5d0d8] bg-[#fff6f9] text-[#b4234a] hover:border-[#b4234a] hover:bg-[#ffeff3]',
};

const AdminSubscriptionAction = ({
  title,
  label,
  onClick,
  disabled = false,
  children,
  variant = 'default',
  className = '',
}) => (
  <button
    type="button"
    title={title || label}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant] || VARIANTS.default} ${className}`}
  >
    {children}
    {label ? <span>{label}</span> : null}
  </button>
);

export default AdminSubscriptionAction;
