import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Button } from './button';
import { Badge } from './badge';
import { X } from 'lucide-react';
import { CAR_BRANDS, getCarBrandById } from '../../utils/carData';

interface CarFiltersProps {
  selectedBrand?: string;
  selectedModel?: string;
  onBrandChange: (brandId: string) => void;
  onModelChange: (modelId: string) => void;
  onClearFilters?: () => void;
  showClearButton?: boolean;
  className?: string;
  compact?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export function CarFilters({
  selectedBrand = 'all',
  selectedModel = 'all',
  onBrandChange,
  onModelChange,
  onClearFilters,
  showClearButton = true,
  className = '',
  compact = false,
  layout = 'horizontal'
}: CarFiltersProps) {
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  useEffect(() => {
    if (selectedBrand && selectedBrand !== 'all') {
      const brand = getCarBrandById(selectedBrand);
      if (brand) {
        setAvailableModels([{ id: 'all', name: 'All Models' }, ...brand.models]);
      }
    } else {
      setAvailableModels([{ id: 'all', name: 'All Models' }]);
    }
  }, [selectedBrand]);

  const handleBrandChange = (brandId: string) => {
    onBrandChange(brandId);
    // Reset model when brand changes
    onModelChange('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedBrand !== 'all') count++;
    if (selectedModel !== 'all') count++;
    return count;
  };

  const layoutClass = {
    horizontal: 'flex flex-wrap gap-2',
    vertical: 'space-y-2',
    grid: 'grid grid-cols-2 gap-2'
  }[layout];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Filters */}
      <div className={layoutClass}>
        {/* Brand Filter */}
        <div className={layout === 'horizontal' ? 'flex-1 min-w-32' : ''}>
          <Select value={selectedBrand} onValueChange={handleBrandChange}>
            <SelectTrigger className={compact ? 'h-9 text-xs' : ''}>
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="all">All Brands</SelectItem>
              {CAR_BRANDS.filter(brand => brand.id !== 'other').map(brand => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Model Filter */}
        {selectedBrand !== 'all' && (
          <div className={layout === 'horizontal' ? 'flex-1 min-w-32' : ''}>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className={compact ? 'h-9 text-xs' : ''}>
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {availableModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters Button */}
        {showClearButton && getActiveFiltersCount() > 0 && (
          <Button 
            variant="ghost" 
            size={compact ? 'sm' : 'default'}
            className={compact ? 'text-xs h-9' : ''}
            onClick={onClearFilters}
          >
            Clear Filters
            {getActiveFiltersCount() > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedBrand !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Brand: {getCarBrandById(selectedBrand)?.name || selectedBrand}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleBrandChange('all')}
              />
            </Badge>
          )}
          {selectedModel !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Model: {availableModels.find(m => m.id === selectedModel)?.name || selectedModel}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onModelChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}