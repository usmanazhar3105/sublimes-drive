import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Bell, Check, Trash2, Settings, MessageSquare, ShoppingBag, Wrench, Users, Calendar, Trophy, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

interface Notification {
  id: string;
  type: 'message' | 'marketplace' | 'garage' | 'community' | 'event' | 'system' | 'achievement';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  userName?: string;
  action?: {
    label: string;
    page: string;
  };
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'New message from Ahmad',
      description: 'Interested in your BYD listing. Is it still available?',
      time: '2 min ago',
      isRead: false,
      avatar: '/placeholder-avatar.jpg',
      userName: 'Ahmad',
      action: { label: 'Reply', page: 'messages' }
    },
    {
      id: '2',
      type: 'marketplace',
      title: 'Your listing has a new offer',
      description: 'Someone made an offer of AED 85,000 on your BYD Seal',
      time: '1 hour ago',
      isRead: false,
      action: { label: 'View Offer', page: 'marketplace' }
    },
    {
      id: '3',
      type: 'garage',
      title: 'Repair quote received',
      description: 'AutoFix Garage sent you a quote for brake service - AED 450',
      time: '3 hours ago',
      isRead: true,
      action: { label: 'View Quote', page: 'garage-hub' }
    },
    {
      id: '4',
      type: 'community',
      title: 'John liked your post',
      description: 'Your post "Weekend drive to Hatta" received 15 likes',
      time: '5 hours ago',
      isRead: true,
      avatar: '/placeholder-avatar.jpg',
      userName: 'John',
      action: { label: 'View Post', page: 'communities' }
    },
    {
      id: '5',
      type: 'event',
      title: 'Event reminder',
      description: 'Dubai Car Meet starts in 2 hours at Dubai Mall',
      time: '6 hours ago',
      isRead: false,
      action: { label: 'View Event', page: 'events' }
    },
    {
      id: '6',
      type: 'achievement',
      title: 'New badge earned!',
      description: 'You earned the "Community Helper" badge for helping 10 members',
      time: '1 day ago',
      isRead: true,
      action: { label: 'View Profile', page: 'profile' }
    },
    {
      id: '7',
      type: 'system',
      title: 'Verification approved',
      description: 'Your car owner verification has been approved. You now have a green shield!',
      time: '2 days ago',
      isRead: true,
      action: { label: 'View Profile', page: 'profile' }
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'marketplace':
        return ShoppingBag;
      case 'garage':
        return Wrench;
      case 'community':
        return Users;
      case 'event':
        return Calendar;
      case 'achievement':
        return Trophy;
      case 'system':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'text-blue-500';
      case 'marketplace':
        return 'text-green-500';
      case 'garage':
        return 'text-orange-500';
      case 'community':
        return 'text-purple-500';
      case 'event':
        return 'text-pink-500';
      case 'achievement':
        return 'text-yellow-500';
      case 'system':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('home')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="ml-4">
              <h1 className="text-lg font-semibold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('profile-settings')}
            >
              <Settings className="w-4 h-4" />
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-4">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="relative"
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground text-center">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {filteredNotifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);
              
              return (
                <Card 
                  key={notification.id}
                  className={`transition-colors cursor-pointer hover:bg-muted/50 ${
                    !notification.isRead ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.action) {
                      onNavigate(notification.action.page);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Icon or Avatar */}
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback>
                              {notification.userName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.time}
                            </p>
                          </div>
                          
                          {/* Unread indicator */}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>

                        {/* Action Button */}
                        {notification.action && (
                          <div className="mt-3 flex items-center justify-between">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                                onNavigate(notification.action!.page);
                              }}
                            >
                              {notification.action.label}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}