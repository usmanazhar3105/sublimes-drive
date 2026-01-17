import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 p-6 bg-[#1A2332] rounded-full">
        <Icon className="w-12 h-12 text-[#D4AF37]" />
      </div>
      
      <h3 className="text-[#E8EAED] text-xl font-semibold mb-2">
        {title}
      </h3>
      
      <p className="text-[#9CA3AF] max-w-md mb-6">
        {description}
      </p>
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
            >
              {actionLabel}
            </Button>
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
