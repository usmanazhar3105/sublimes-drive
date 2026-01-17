/**
 * AddressAutocomplete Component - Google Places Autocomplete
 * Provides address search with autocomplete for UAE
 */

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from './input';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  onSelect: (place: { 
    address: string; 
    lat: number; 
    lng: number;
    city?: string;
    area?: string;
  }) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function AddressAutocomplete({ 
  onSelect, 
  placeholder = 'Enter address in UAE...',
  defaultValue = '',
  className = ''
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(defaultValue);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      setLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    loader
      .load()
      .then(() => {
        if (!inputRef.current) return;

        // Create autocomplete instance
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'ae' }, // Restrict to UAE
          fields: ['formatted_address', 'geometry', 'address_components', 'name'],
        });

        autocompleteRef.current = autocomplete;

        // Listen for place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.geometry?.location) {
            console.error('No location data in place');
            return;
          }

          // Extract city and area from address components
          let city = '';
          let area = '';

          place.address_components?.forEach((component) => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
              area = component.long_name;
            }
          });

          const selectedPlace = {
            address: place.formatted_address || place.name || '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            city,
            area,
          };

          setValue(selectedPlace.address);
          onSelect(selectedPlace);
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading Google Maps Autocomplete:', err);
        setLoading(false);
      });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onSelect]);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="animate-spin text-[#8B92A7]" size={16} />
        </div>
      )}
      
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B92A7]" size={20} />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className={`pl-11 ${className}`}
        />
      </div>

      <p className="text-xs text-[#8B92A7] mt-1">
        Start typing an address in UAE (Dubai, Abu Dhabi, Sharjah, etc.)
      </p>
    </div>
  );
}
