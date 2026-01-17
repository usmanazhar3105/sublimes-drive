import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition(prev => (prev + 1) % 200);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 relative overflow-hidden">
      <div 
        className="whitespace-nowrap animate-pulse"
        style={{ transform: `translateX(-${scrollPosition}%)` }}
      >
        <span className="mx-8">🚗 Drive! ✓ Check out the latest listings in the Marketplace and connect with fellow car enthusiasts!</span>
        <span className="mx-8">🔥 New garages joining daily - Find the best repair services in the UAE!</span>
        <span className="mx-8">💎 Premium features now available - Upgrade your Sublimes Drive experience!</span>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-white/20 rounded p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}