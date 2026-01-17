/**
 * Logo Component - Sublimes Drive Official Logo
 */

import logoImage from '../../assets/Sublimesdrive-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
  };

  return (
    <img 
      src={logoImage} 
      alt="Sublimes Drive" 
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
}
