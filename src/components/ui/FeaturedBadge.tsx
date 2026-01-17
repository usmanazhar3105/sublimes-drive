import { Badge } from './badge';
import { Star, Zap } from 'lucide-react';

interface FeaturedBadgeProps {
  variant?: 'compact' | 'prominent';
  className?: string;
}

export function FeaturedBadge({ variant = 'compact', className = '' }: FeaturedBadgeProps) {
  if (variant === 'prominent') {
    return (
      <Badge 
        className={`
          bg-gradient-to-r from-[var(--sublimes-gold)] to-yellow-500 
          text-black font-semibold px-3 py-1 
          border border-[var(--sublimes-gold)]/30
          shadow-lg shadow-[var(--sublimes-gold)]/20
          ${className}
        `}
      >
        <Star className="w-3 h-3 mr-1 fill-current" />
        Featured
      </Badge>
    );
  }

  return (
    <Badge 
      className={`
        bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] 
        border border-[var(--sublimes-gold)]/30 font-medium
        ${className}
      `}
    >
      <Zap className="w-3 h-3 mr-1" />
      Featured
    </Badge>
  );
}