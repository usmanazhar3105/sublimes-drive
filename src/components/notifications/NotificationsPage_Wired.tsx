/**
 * NotificationsPage - Wired with Supabase Hooks
 * 
 * Uses: useNotifications, useRole, useAnalytics
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Bell, Check, Trash2, Settings, MessageSquare, ShoppingBag, Wrench, Users, Calendar, Trophy, AlertCircle, Loader2, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

// Import Supabase hooks
import { useNotifications, useRole, useAnalytics } from '../../src/hooks';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // 🔥 SUPABASE HOOKS
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refetch } = useNotifications();
  const { profile } = useRole();
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/notifications');
  }, []);

  const getIcon = (type: string) => {
    const iconProps = { size: 20 };
    switch (type) {
      case 'message': return <MessageSquare {...iconProps} />;
      case 'marketplace': return <ShoppingBag {...iconProps} />;
      case 'garage': return <Wrench {...iconProps} />;
      case 'community': return <Users {...iconProps} />;
      case 'event': return <Calendar {...iconProps} />;
      case 'achievement': return <Trophy {...iconProps} />;
      case 'system': return <Bell {...iconProps} />;
      default: return <AlertCircle {...iconProps} />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-400';
      case 'marketplace': return 'text-green-400';
      case 'garage': return 'text-orange-400';
      case 'community': return 'text-purple-400';
      case 'event': return 'text-pink-400';
      case 'achievement': return 'text-yellow-400';
      case 'system': return 'text-[#D4AF37]';
      default: return 'text-gray-400';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const { error } = await markAsRead(notificationId);
    if (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const { error } = await markAllAsRead();
    if (!error) {
      toast.success('All notifications marked as read');
      analytics.trackEvent('notifications_all_read');
    } else {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    const typeToPage: Record<string, string> = {
      message: 'messages',
      marketplace: 'marketplace',
      garage: 'garage-hub',
      community: 'communities',
      event: 'events',
      achievement: 'profile',
      system: 'profile',
    };

    const page = typeToPage[notification.type] || 'home';
    onNavigate(page);
    
    analytics.trackEvent('notification_clicked', {
      notification_id: notification.id,
      type: notification.type,
    });
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.is_read
  );

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('home')}
                className="text-[#E8EAED] hover:bg-[#1A2332]"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl text-[#E8EAED]">Notifications</h1>
                <p className="text-sm text-[#8B92A7]">
                  {loading ? 'Loading...' : `${unreadCount} unread`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332]"
                >
                  <Check size={16} className="mr-2" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('settings')}
                className="text-[#E8EAED] hover:bg-[#1A2332]"
              >
                <Settings size={20} />
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={
                filter === 'all'
                  ? 'bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]'
                  : 'border-[#2A3342] text-[#8B92A7] hover:bg-[#1A2332]'
              }
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className={
                filter === 'unread'
                  ? 'bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]'
                  : 'border-[#2A3342] text-[#8B92A7] hover:bg-[#1A2332]'
              }
            >
              Unread ({unreadCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-[#8B92A7]">Loading notifications...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-red-500/10 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <X className="text-red-400 mt-1" size={20} />
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Error Loading Notifications</h3>
                  <p className="text-sm text-red-300">{error.message}</p>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-400 text-red-400 hover:bg-red-400/10"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#1A2332] flex items-center justify-center">
              <Bell className="text-[#8B92A7]" size={32} />
            </div>
            <h3 className="text-xl text-[#E8EAED] mb-2">No notifications</h3>
            <p className="text-[#8B92A7]">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "When you get notifications, they'll show up here."}
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="space-y-2">
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id}>
                <Card 
                  className={`
                    cursor-pointer transition-all hover:bg-[#1A2332]
                    ${notification.is_read ? 'bg-[#0F1829] border-[#1A2332]' : 'bg-[#1A2332] border-[#D4AF37]/30'}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${notification.is_read ? 'bg-[#1A2332]' : 'bg-[#D4AF37]/20'}
                      `}>
                        <span className={getIconColor(notification.type)}>
                          {getIcon(notification.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-[#E8EAED] font-medium text-sm">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        
                        <p className="text-sm text-[#8B92A7] mb-2 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#8B92A7]">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>

                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="text-[#D4AF37] hover:bg-[#D4AF37]/10 h-auto p-1"
                            >
                              <Check size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
