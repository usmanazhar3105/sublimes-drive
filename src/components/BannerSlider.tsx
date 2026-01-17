/**
 * BannerSlider Component - Dynamic Banner System
 * Pulls banner data from Supabase and displays auto-sliding banners
 * Responsive: 16:5 desktop, 16:9 mobile
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabase/client';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_link: string;
  image_url: string;
  is_active?: boolean; // Support both 'active' and 'is_active'
  active?: boolean;
  order_index?: number; // Optional - may not exist in database yet
  created_at?: string;
}

export function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch banners from Supabase
  useEffect(() => {
    fetchBanners();

    // Setup realtime subscription
    const channel = supabase
      .channel('banners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        fetchBanners();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false }); // Use created_at instead of order_index

      if (error) {
        // Handle column missing error gracefully
        if (error.code === '42703' || error.code === '42501' || error.code === '42P01') {
          console.warn('⚠️ Banners table not set up properly. Showing empty state.');
          console.warn('👉 Fix: Run 🚨_FIX_ALL_PERMISSIONS_AND_TABLES.sql in Supabase');
          setBanners([]);
          setLoading(false);
          return;
        }
        throw error;
      }

      setBanners(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]); // Show empty instead of crashing
      setLoading(false);
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    const defaultBanners = [
      {
        id: 'default-1',
        title: '欢迎来到 Sublimes Drive',
        subtitle: '阿联酋首屈一指的中国汽车爱好者社区',
        cta_label: '探索社区',
        cta_link: '#communities',
        image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=400&fit=crop',
        is_active: true,
      },
      {
        id: 'default-2',
        title: 'Discover Chinese Cars in UAE',
        subtitle: 'Connect with fellow enthusiasts, share experiences, and find the perfect ride',
        cta_label: 'Explore Marketplace',
        cta_link: '#marketplace',
        image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=400&fit=crop',
        is_active: true,
      },
      {
        id: 'default-3',
        title: 'مجتمع سيارات صينية في الإمارات',
        subtitle: 'انضم إلى أكبر مجتمع لعشاق السيارات الصينية في الإمارات',
        cta_label: 'انضم الآن',
        cta_link: '#signup',
        image_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=400&fit=crop',
        is_active: true,
      },
    ];

    const activeBanners = banners.length > 0 ? banners : defaultBanners;
    
    if (activeBanners.length <= 1 || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000); // 6 seconds

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [banners.length, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="w-full aspect-[16/5] sm:aspect-[16/9] md:aspect-[16/5] bg-[#0F1829] rounded-2xl animate-pulse" />
    );
  }

  // Default banner when no banners in database
  const defaultBanners: Banner[] = [
    {
      id: 'default-1',
      title: '欢迎来到 Sublimes Drive',
      subtitle: '阿联酋首屈一指的中国汽车爱好者社区',
      cta_label: '探索社区',
      cta_link: '#communities',
      image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=400&fit=crop',
      is_active: true,
    },
    {
      id: 'default-2',
      title: 'Discover Chinese Cars in UAE',
      subtitle: 'Connect with fellow enthusiasts, share experiences, and find the perfect ride',
      cta_label: 'Explore Marketplace',
      cta_link: '#marketplace',
      image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=400&fit=crop',
      is_active: true,
    },
    {
      id: 'default-3',
      title: 'مجتمع سيارات صينية في الإمارات',
      subtitle: 'انضم إلى أكبر مجتمع لعشاق السيارات الصينية في الإمارات',
      cta_label: 'انضم الآن',
      cta_link: '#signup',
      image_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=400&fit=crop',
      is_active: true,
    },
  ];

  const activeBanners = banners.length > 0 ? banners : defaultBanners;
  const currentBanner = activeBanners[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Content */}
      <div className="relative aspect-[16/9] sm:aspect-[16/5]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={currentBanner.image_url}
                alt={currentBanner.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-fuchsia-900/70" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center p-6 sm:p-8 md:p-12 max-w-2xl">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-3 sm:mb-4"
                style={{ fontWeight: 700 }}
              >
                {currentBanner.title}
              </motion.h2>

              {currentBanner.subtitle && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 line-clamp-2"
                >
                  {currentBanner.subtitle}
                </motion.p>
              )}

              {(currentBanner.cta_label || currentBanner.cta_link) && (
                <motion.a
                  href={currentBanner.cta_link || '#'}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="inline-block bg-[#D4AF37] hover:bg-[#C9A332] text-[#0B1426] px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  style={{ fontWeight: 600 }}
                >
                  {currentBanner.cta_label || 'Learn More'}
                </motion.a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {(banners.length > 1 || banners.length === 0) && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
            aria-label="Previous banner"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
            aria-label="Next banner"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      {(banners.length > 1 || banners.length === 0) && (
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute bottom-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
          aria-label={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
        </button>
      )}

      {/* Navigation Dots */}
      {(banners.length > 1 || banners.length === 0) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {(banners.length > 0 ? banners : [1, 2, 3]).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-[#D4AF37]'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
