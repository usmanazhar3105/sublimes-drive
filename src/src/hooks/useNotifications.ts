import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title?: string;
  message?: string;
  payload: Record<string, any>;
  read_at: string | null;
  is_read?: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Subscribe to realtime notifications with toast alerts
    const subscription = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('🔔 New notification received:', payload);
          
          // Only show toast for current user's notifications
          const newNotification = payload.new as Notification;
          
          fetchNotifications();
          fetchUnreadCount();
          
          // Show toast notification
          const notificationTitle = newNotification.title || 
            newNotification.payload?.title || 
            'New Notification';
          const notificationMessage = newNotification.message || 
            newNotification.payload?.message || 
            'You have a new notification';
            
          toast.info(notificationTitle, {
            description: notificationMessage,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications();
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Poll unread count every 30 seconds as backup
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotifications([]);
        setError(null);
        setLoading(false);
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        // If permission error, log but don't crash
        if (fetchError.code === '42501') {
          console.warn('⚠️ Notifications permissions not set yet.');
          console.warn('👉 Fix: Run 🚨_FIX_ALL_PERMISSIONS_AND_TABLES.sql in Supabase');
          setNotifications([]);
          setError(null); // Don't show error to user
        } else {
          throw fetchError;
        }
      } else {
        // Map data to include is_read field
        const mappedData = (data || []).map(n => ({
          ...n,
          is_read: !!n.read_at,
          title: n.payload?.title || n.type,
          message: n.payload?.message || 'New notification',
        }));
        setNotifications(mappedData);
        setError(null);
      }
    } catch (err: any) {
      // Silently handle network errors
      if (err?.message?.includes('Failed to fetch')) {
        // Network error - fail silently
        setNotifications([]);
        setError(null);
      } else {
        setError(err as Error);
        console.error('Error fetching notifications:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCount() {
    try {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUnreadCount(0);
        return;
      }
      
      // Try using RPC function first
      const { data, error: fetchError } = await supabase
        .rpc('get_unread_notification_count');

      if (fetchError) {
        // If permission error or function doesn't exist, use fallback query
        // PGRST202 = function not found, 42501 = permission denied, 42883 = undefined function
        if (fetchError.code === '42501' || fetchError.code === '42883' || fetchError.code === 'PGRST202') {
          console.warn('⚠️ RPC function not available, using fallback query');
          
          // Fallback: Query notifications table directly
          const { count, error: countError } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .is('read_at', null);
          
          if (countError) {
            // If notifications table also has issues, default to 0 silently
            setUnreadCount(0);
          } else {
            setUnreadCount(count || 0);
          }
        } else {
          throw fetchError;
        }
      } else {
        setUnreadCount(data || 0);
      }
    } catch (err: any) {
      // Silently handle network errors (Failed to fetch)
      if (err?.message?.includes('Failed to fetch')) {
        // Network error - fail silently
        setUnreadCount(0);
      } else {
        console.error('Error fetching unread count:', err);
        setUnreadCount(0); // Default to 0 on error
      }
    }
  }

  async function markAsRead(notificationId: string | string[]) {
    try {
      const ids = Array.isArray(notificationId) ? notificationId : [notificationId];
      
      const { error: markError } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', ids);

      if (markError) throw markError;
      await fetchNotifications();
      await fetchUnreadCount();
      return { error: null };
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      return { error: err as Error };
    }
  }

  async function markAllAsRead() {
    try {
      const unreadIds = notifications
        .filter((n) => !n.read_at)
        .map((n) => n.id);
      
      if (unreadIds.length > 0) {
        await markAsRead(unreadIds);
      }
      return { error: null };
    } catch (err) {
      console.error('Error marking all as read:', err);
      return { error: err as Error };
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
