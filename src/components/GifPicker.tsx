import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Search, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
  trigger?: React.ReactNode;
}

interface Gif {
  id: string;
  url: string;
  title: string;
  preview: string;
}

export function GifPicker({ onGifSelect, trigger }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('trending');

  // Mock GIF data for demonstration
  const mockGifs: { [key: string]: Gif[] } = {
    trending: [
      {
        id: '1',
        url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
        title: 'Car Racing',
        preview: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/200.gif'
      },
      {
        id: '2',
        url: 'https://media.giphy.com/media/26FLgGTPUDH6UGAbm/giphy.gif',
        title: 'Thumbs Up',
        preview: 'https://media.giphy.com/media/26FLgGTPUDH6UGAbm/200.gif'
      },
      {
        id: '3',
        url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
        title: 'Fire',
        preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif'
      },
      {
        id: '4',
        url: 'https://media.giphy.com/media/l1ughbsd9qXz2s9SE/giphy.gif',
        title: 'Love',
        preview: 'https://media.giphy.com/media/l1ughbsd9qXz2s9SE/200.gif'
      },
      {
        id: '5',
        url: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif',
        title: 'Dance',
        preview: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/200.gif'
      },
      {
        id: '6',
        url: 'https://media.giphy.com/media/3o6MbdDgPPdxki4jm0/giphy.gif',
        title: 'Cool',
        preview: 'https://media.giphy.com/media/3o6MbdDgPPdxki4jm0/200.gif'
      }
    ],
    cars: [
      {
        id: '7',
        url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
        title: 'Fast Car',
        preview: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/200.gif'
      },
      {
        id: '8',
        url: 'https://media.giphy.com/media/l41YqKTI3pFKuI9CE/giphy.gif',
        title: 'Car Drifting',
        preview: 'https://media.giphy.com/media/l41YqKTI3pFKuI9CE/200.gif'
      },
      {
        id: '9',
        url: 'https://media.giphy.com/media/3o6gDWynAiIXkMFTQk/giphy.gif',
        title: 'Sports Car',
        preview: 'https://media.giphy.com/media/3o6gDWynAiIXkMFTQk/200.gif'
      }
    ],
    reactions: [
      {
        id: '10',
        url: 'https://media.giphy.com/media/26FLgGTPUDH6UGAbm/giphy.gif',
        title: 'Thumbs Up',
        preview: 'https://media.giphy.com/media/26FLgGTPUDH6UGAbm/200.gif'
      },
      {
        id: '11',
        url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
        title: 'Mind Blown',
        preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif'
      },
      {
        id: '12',
        url: 'https://media.giphy.com/media/l1ughbsd9qXz2s9SE/giphy.gif',
        title: 'Applause',
        preview: 'https://media.giphy.com/media/l1ughbsd9qXz2s9SE/200.gif'
      }
    ]
  };

  const categories = [
    { id: 'trending', name: 'Trending', icon: '🔥' },
    { id: 'cars', name: 'Cars', icon: '🚗' },
    { id: 'reactions', name: 'Reactions', icon: '😂' }
  ];

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      setGifs(mockGifs[selectedCategory]);
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would use GIPHY API
      // For now, we'll filter mock data
      const filtered = mockGifs[selectedCategory].filter(gif =>
        gif.title.toLowerCase().includes(query.toLowerCase())
      );
      setGifs(filtered);
    } catch (error) {
      console.error('GIF search failed:', error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setGifs(mockGifs[selectedCategory]);
  }, [selectedCategory]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchGifs(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Zap className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="flex flex-col h-96">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search GIFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-border">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                className="flex-1 rounded-none text-xs"
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
          
          {/* GIF Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sublimes-gold)]"></div>
              </div>
            ) : gifs.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => onGifSelect(gif.url)}
                    className="relative aspect-square overflow-hidden rounded-lg hover:opacity-75 transition-opacity group"
                  >
                    <ImageWithFallback
                      src={gif.preview}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                        {gif.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Zap className="h-8 w-8 mb-2" />
                <p className="text-sm">No GIFs found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-border p-2">
            <div className="text-xs text-muted-foreground text-center">
              Powered by GIPHY
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}