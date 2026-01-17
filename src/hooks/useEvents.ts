import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  capacity: number;
  attendee_count: number;
  registration_deadline: string;
  entry_fee: number;
  currency: string;
  images: string[];
  status: string;
  is_featured: boolean;
  is_public: boolean;
  tags: string[];
  views_count: number;
  likes_count: number;
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UseEventsOptions {
  event_type?: string;
  status?: string;
  search?: string;
  upcoming?: boolean;
  limit?: number;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    event_type,
    status = 'published',
    search,
    upcoming = true,
    limit = 20,
  } = options;

  useEffect(() => {
    fetchEvents();
  }, [event_type, status, search, upcoming, limit]);

  async function fetchEvents() {
    try {
      setLoading(true);

      let query = supabase
        .from('events')
        .select('*')
        .limit(limit);

      if (event_type) query = query.eq('event_type', event_type);
      if (status) query = query.eq('status', status);
      if (upcoming) {
        query = query.gte('start_date', new Date().toISOString());
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      query = query.order('start_date', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setEvents(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(event: Partial<Event>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: createError } = await supabase
        .from('events')
        .insert({
          ...event,
          organizer_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (createError) throw createError;

      setEvents((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  }

  async function updateEvent(id: string, updates: Partial<Event>) {
    try {
      const { data, error: updateError } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setEvents((prev) =>
        prev.map((event) => (event.id === id ? data : event))
      );
      return data;
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  }

  async function rsvpEvent(eventId: string, status: 'going' | 'interested' | 'not_going' = 'going') {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_rsvp_event', {
        p_event_id: eventId,
        p_status: status,
      });

      if (rpcError) throw rpcError;

      await fetchEvents();
      return data;
    } catch (err) {
      console.error('Error RSVP event:', err);
      throw err;
    }
  }

  async function toggleLike(eventId: string) {
    try {
      const { data, error: rpcError } = await supabase.rpc('fn_toggle_event_like', {
        p_event_id: eventId,
      });

      if (rpcError) throw rpcError;

      await fetchEvents();
      return data;
    } catch (err) {
      console.error('Error toggling like:', err);
      throw err;
    }
  }

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    rsvpEvent,
    toggleLike,
    refresh: fetchEvents,
  };
}

