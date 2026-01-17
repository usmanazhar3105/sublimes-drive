import { useState, useEffect } from 'react';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { CAR_BRANDS, getCarBrandById, CarBrand, CarModel } from '../../utils/carData';

interface CarBrandModelSelectorProps {
  selectedBrand?: string;
  selectedModel?: string;
  customModel?: string;
  onBrandChange: (brandId: string) => void;
  onModelChange: (modelId: string) => void;
  onCustomModelChange?: (customModel: string) => void;
  brandLabel?: string;
  modelLabel?: string;
  brandPlaceholder?: string;
  modelPlaceholder?: string;
  className?: string;
  required?: boolean;
}

export function CarBrandModelSelector({
  selectedBrand,
  selectedModel,
  customModel,
  onBrandChange,
  onModelChange,
  onCustomModelChange,
  brandLabel = "Car Brand",
  modelLabel = "Car Model",
  brandPlaceholder = "Select car brand",
  modelPlaceholder = "Select car model",
  className = "",
  required = false
}: CarBrandModelSelectorProps) {
  const [availableModels, setAvailableModels] = useState<CarModel[]>([]);
  const [showCustomModel, setShowCustomModel] = useState(false);

  useEffect(() => {
    if (selectedBrand) {
      const brand = getCarBrandById(selectedBrand);
      if (brand) {
        setAvailableModels(brand.models);
        // Check if selected model is "custom" to show custom input
        if (selectedModel === 'custom') {
          setShowCustomModel(true);
        } else {
          setShowCustomModel(false);
        }
      }
    } else {
      setAvailableModels([]);
      setShowCustomModel(false);
    }
  }, [selectedBrand, selectedModel]);

  const handleBrandChange = (brandId: string) => {
    onBrandChange(brandId);
    // Reset model when brand changes
    onModelChange('');
    setShowCustomModel(false);
    if (onCustomModelChange) {
      onCustomModelChange('');
    }
  };

  const handleModelChange = (modelId: string) => {
    onModelChange(modelId);
    if (modelId === 'custom') {
      setShowCustomModel(true);
    } else {
      setShowCustomModel(false);
      if (onCustomModelChange) {
        onCustomModelChange('');
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="car-brand">
          {brandLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select value={selectedBrand || ''} onValueChange={handleBrandChange}>
          <SelectTrigger id="car-brand">
            <SelectValue placeholder={brandPlaceholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {CAR_BRANDS.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedBrand && (
        <div>
          <Label htmlFor="car-model">
            {modelLabel}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select value={selectedModel || ''} onValueChange={handleModelChange}>
            <SelectTrigger id="car-model">
              <SelectValue placeholder={modelPlaceholder} />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showCustomModel && onCustomModelChange && (
        <div>
          <Label htmlFor="custom-model">
            Custom Model Name
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id="custom-model"
            value={customModel || ''}
            onChange={(e) => onCustomModelChange(e.target.value)}
            placeholder="Enter your car model"
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
}