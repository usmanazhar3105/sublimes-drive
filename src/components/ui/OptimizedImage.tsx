/**
 * OPTIMIZED IMAGE COMPONENT
 * 
 * Features:
 * - Lazy loading with intersection observer
 * - Automatic WebP conversion via CDN
 * - Responsive srcset generation
 * - Blur placeholder while loading
 * - Error fallback handling
 * - Thumbnail support
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getOptimizedImageUrl } from '../../lib/uploadService';
import { cn } from '../../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  fallbackSrc?: string;
  onLoadComplete?: () => void;
  onError?: () => void;
  sizes?: string;
  aspectRatio?: string;
}

// ============================================================================
// DEFAULT FALLBACK
// ============================================================================

const DEFAULT_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%231A2332" width="400" height="300"/%3E%3Ctext fill="%23D4AF37" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';

// ============================================================================
// BLUR PLACEHOLDER
// ============================================================================

const BLUR_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Cfilter id="b" color-interpolation-filters="sRGB"%3E%3CfeGaussianBlur stdDeviation="20"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" fill="%231A2332" filter="url(%23b)"/%3E%3C/svg%3E';

// ============================================================================
// SRCSET WIDTHS FOR RESPONSIVE IMAGES
// ============================================================================

const SRCSET_WIDTHS = [320, 640, 768, 1024, 1280, 1536, 1920];

// ============================================================================
// COMPONENT
// ============================================================================

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  priority = false,
  placeholder = 'blur',
  fallbackSrc = DEFAULT_FALLBACK,
  onLoadComplete,
  onError,
  sizes = '100vw',
  aspectRatio,
  className,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized URL
  const optimizedSrc = useMemo(() => {
    if (!src || hasError) return fallbackSrc;
    return getOptimizedImageUrl(src, { width, height, quality });
  }, [src, width, height, quality, hasError, fallbackSrc]);

  // Generate srcset for responsive images
  const srcSet = useMemo(() => {
    if (!src || hasError) return undefined;
    
    return SRCSET_WIDTHS
      .filter(w => !width || w <= width * 2) // Don't go beyond 2x requested width
      .map(w => {
        const url = getOptimizedImageUrl(src, { width: w, quality });
        return `${url} ${w}w`;
      })
      .join(', ');
  }, [src, width, quality, hasError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView]);

  // Handle load complete
  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  // Handle error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Combined styles
  const combinedStyle: React.CSSProperties = {
    ...style,
    aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={combinedStyle}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && !hasError && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `url("${BLUR_PLACEHOLDER}")`,
            backgroundSize: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)', // Prevent blur edges from showing
          }}
        />
      )}

      {/* Main image */}
      {(isInView || priority) && (
        <img
          ref={imgRef}
          src={hasError ? fallbackSrc : optimizedSrc}
          srcSet={!hasError ? srcSet : undefined}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            hasError && 'opacity-100'
          )}
          {...props}
        />
      )}

      {/* Placeholder element for lazy loading measurement */}
      {!isInView && !priority && (
        <div 
          ref={imgRef as React.RefObject<HTMLDivElement>}
          className="absolute inset-0" 
        />
      )}
    </div>
  );
}

// ============================================================================
// AVATAR VARIANT
// ============================================================================

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

const AVATAR_SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export function AvatarImage({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}: AvatarImageProps) {
  const dimension = AVATAR_SIZES[size];
  const initials = alt
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const fallbackElement = (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-[#1A2332] text-[#D4AF37] font-medium',
        className
      )}
      style={{ width: dimension, height: dimension, fontSize: dimension * 0.4 }}
    >
      {initials || '?'}
    </div>
  );

  if (!src) {
    return fallbackElement;
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      quality={90}
      className={cn('rounded-full', className)}
      fallbackSrc={fallback}
      priority={size === 'xl' || size === 'lg'}
    />
  );
}

// ============================================================================
// GALLERY VARIANT
// ============================================================================

interface ImageGalleryProps {
  images: string[];
  alt: string;
  maxVisible?: number;
  onImageClick?: (index: number) => void;
  className?: string;
}

export function ImageGallery({
  images,
  alt,
  maxVisible = 4,
  onImageClick,
  className,
}: ImageGalleryProps) {
  const visibleImages = images.slice(0, maxVisible);
  const hiddenCount = Math.max(0, images.length - maxVisible);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className={cn('aspect-video rounded-lg overflow-hidden', className)}>
        <OptimizedImage
          src={images[0]}
          alt={`${alt} - Image 1`}
          className="w-full h-full cursor-pointer"
          onClick={() => onImageClick?.(0)}
        />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'grid gap-1 rounded-lg overflow-hidden',
        images.length === 2 && 'grid-cols-2',
        images.length === 3 && 'grid-cols-2',
        images.length >= 4 && 'grid-cols-2 grid-rows-2',
        className
      )}
    >
      {visibleImages.map((img, idx) => (
        <div
          key={idx}
          className={cn(
            'relative overflow-hidden cursor-pointer',
            images.length === 3 && idx === 0 && 'row-span-2',
            idx === maxVisible - 1 && hiddenCount > 0 && 'relative'
          )}
          style={{ aspectRatio: images.length === 3 && idx === 0 ? '1/2' : '1/1' }}
          onClick={() => onImageClick?.(idx)}
        >
          <OptimizedImage
            src={img}
            alt={`${alt} - Image ${idx + 1}`}
            className="w-full h-full"
          />
          
          {/* Overlay for remaining count */}
          {idx === maxVisible - 1 && hiddenCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                +{hiddenCount}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default OptimizedImage;

