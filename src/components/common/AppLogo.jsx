import fullLogo from '../../assets/LOGOEXE.png';
import iconLogo from '../../assets/troez-icon.png';

export default function AppLogo({
  variant = 'full',
  className = '',
  alt = 'TROEZ',
}) {
  const src = variant === 'icon' ? iconLogo : fullLogo;

  if (variant === 'icon') {
    return (
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ${className}`}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-contain p-0.5"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className || 'h-10 w-auto object-contain'}
      draggable={false}
    />
  );
}
