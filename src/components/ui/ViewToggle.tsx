import { Button } from './button';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  view?: 'grid' | 'list';
  onViewChange?: (view: 'grid' | 'list') => void;
  // Support legacy prop names from admin components
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (view: 'grid' | 'list') => void;
  className?: string;
}

export function ViewToggle({ 
  view, 
  onViewChange, 
  viewMode, 
  onViewModeChange, 
  className = '' 
}: ViewToggleProps) {
  // Support both prop names for backwards compatibility
  const currentView = view || viewMode || 'grid';
  const handleViewChange = onViewChange || onViewModeChange || (() => {});
  
  // Safety check
  if (!handleViewChange || typeof handleViewChange !== 'function') {
    console.warn('ViewToggle: onViewChange or onViewModeChange prop is not a function');
    return null;
  }
  return (
    <div className={`flex items-center border border-border rounded-lg p-1 ${className}`}>
      <Button
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('grid')}
        className={`h-8 px-3 ${
          currentView === 'grid' 
            ? 'bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80' 
            : 'hover:bg-muted'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('list')}
        className={`h-8 px-3 ${
          currentView === 'list' 
            ? 'bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80' 
            : 'hover:bg-muted'
        }`}
      >
        <List className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">List</span>
      </Button>
    </div>
  );
}