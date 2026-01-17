/**
 * Map Component - Google Maps Integration
 * Displays a map with markers for locations
 */

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Loader2 } from 'lucide-react';

interface MapProps {
  center: { lat: number; lng: number };
  markers?: Array<{ 
    lat: number; 
    lng: number; 
    title: string;
    description?: string;
  }>;
  zoom?: number;
  height?: string;
  onClick?: (lat: number, lng: number) => void;
  className?: string;
}

export function Map({ 
  center, 
  markers = [], 
  zoom = 12,
  height = '400px',
  onClick,
  className = ''
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API key not configured');
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
        if (!mapRef.current) return;

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              elementType: 'geometry',
              stylers: [{ color: '#0B1426' }],
            },
            {
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#0B1426' }],
            },
            {
              elementType: 'labels.text.fill',
              stylers: [{ color: '#8B92A7' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#1A2332' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#1A2332' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#2A3442' }],
            },
          ],
        });

        googleMapRef.current = map;

        // Add markers
        markers.forEach((marker) => {
          const googleMarker = new google.maps.Marker({
            position: { lat: marker.lat, lng: marker.lng },
            map,
            title: marker.title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#D4AF37',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            },
          });

          // Add info window if description exists
          if (marker.description) {
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="color: #0B1426; padding: 8px;">
                  <h3 style="font-weight: 600; margin-bottom: 4px;">${marker.title}</h3>
                  <p style="font-size: 14px; color: #666;">${marker.description}</p>
                </div>
              `,
            });

            googleMarker.addListener('click', () => {
              infoWindow.open(map, googleMarker);
            });
          }
        });

        // Add click listener if provided
        if (onClick) {
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map');
        setLoading(false);
      });
  }, [center, markers, zoom, onClick]);

  if (error) {
    return (
      <div 
        className={`bg-[#1A2332] rounded-xl border border-[#2A3442] flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-[#8B92A7]">
          <MapPin className="mx-auto mb-2" size={32} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-[#1A2332] rounded-xl border border-[#2A3442] flex items-center justify-center z-10">
          <div className="text-center text-[#8B92A7]">
            <Loader2 className="mx-auto mb-2 animate-spin" size={32} />
            <p>Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ minHeight: height }}
      />
    </div>
  );
}
