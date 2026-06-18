import fullLogo from '../../assets/LOGOEXE.png';
import iconLogo from '../../assets/troez-icon.png';

export default function AppLogo({
  variant = 'full',
  className = 'h-10 w-auto object-contain',
  alt = 'TROEZ',
}) {
  const src = variant === 'icon' ? iconLogo : fullLogo;
  return <img src={src} alt={alt} className={className} draggable={false} />;
}
