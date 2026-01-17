import { useRef } from 'react';
import { Card, CardContent } from './card';
import { FeaturedBadge } from './FeaturedBadge';
import { BoostTimer } from './BoostTimer';
import { Button } from './button';
import { ChevronLeft, ChevronRight, Eye, Heart, Share2 } from 'lucide-react';

interface FeaturedItem {
  id: string;
  title: string;
  image: string;
  price?: number;
  currency?: string;
  type: 'car' | 'part' | 'garage' | 'offer';
  boostEnd?: string;
  views?: number;
  likes?: number;
}

interface FeaturedRibbonProps {
  items: FeaturedItem[];
  title?: string;
  onItemClick?: (item: FeaturedItem) => void;
  className?: string;
}

export function FeaturedRibbon({ items, title = 'Featured', onItemClick, className = '' }: FeaturedRibbonProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center">
          <FeaturedBadge variant="prominent" className="mr-2" />
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <Card 
            key={item.id}
            className="min-w-[280px] md:min-w-[320px] snap-start cursor-pointer group hover:shadow-lg transition-all duration-200 border-[var(--sublimes-gold)]/30 bg-gradient-to-br from-[var(--sublimes-gold)]/5 to-transparent"
            onClick={() => onItemClick?.(item)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 left-2">
                  <FeaturedBadge />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70">
                    <Heart className="h-3 w-3" />
                  </Button>
                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-[var(--sublimes-gold)] transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  {item.price && (
                    <div className="text-lg font-bold text-[var(--sublimes-gold)]">
                      {item.price.toLocaleString()} {item.currency || 'AED'}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.views && (
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {item.views}
                      </div>
                    )}
                    {item.likes && (
                      <div className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {item.likes}
                      </div>
                    )}
                  </div>
                </div>

                {item.boostEnd && (
                  <BoostTimer endDate={item.boostEnd} />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}