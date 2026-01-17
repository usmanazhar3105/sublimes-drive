import { useState, useEffect } from 'react';
import { supabase, publicApiCall, apiCall } from '../../utils/supabase/client';

export interface Event {
  id: string;
  title?: string;
  title_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  cover_image_url?: string;
  organizer_id?: string;
  creator_id?: string;
  community_id?: string;
  location_id?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  start_time?: string;
  end_time?: string | null;
  max_attendees?: number | null;
  attendee_count?: number | null;
  rsvp_yes_count?: number | null;
  rsvp_maybe_count?: number | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RSVP {
  id: string;
  event_id: string;
  user_id: string;
  response: 'going' | 'maybe' | 'declined';
  created_at: string;
  updated_at: string;
}

export function useEvents(initial?: {
  upcoming?: boolean;
  community?: string;
  location?: string;
  featured?: boolean;
  search?: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<typeof initial | undefined>(initial);

  const fetchEvents = async (filters?: {
    upcoming?: boolean;
    community?: string;
    location?: string;
    featured?: boolean;
    search?: string;
  }) => {
    try {
      setLoading(true);
      const res = await publicApiCall('/events');
      let list: any[] = res?.events || [];
      if (filters?.upcoming !== false) {
        const now = Date.now();
        list = list.filter(e => e.start_time ? new Date(e.start_time).getTime() >= now : true);
      }
      if (filters?.community) list = list.filter(e => e.community_id === filters.community);
      if (filters?.location) list = list.filter(e => e.location_id === filters.location);
      if (filters?.featured !== undefined) list = list.filter(e => !!e.is_featured === !!filters.featured);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(e => (e.title || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q));
      }
      setEvents(list);
      setError(null);
    } catch (err: any) {
      setEvents([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(activeFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(activeFilters)]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent: async (eventData: Partial<Event>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Must be logged in to create an event');
      
      // Ensure required fields are provided
      const locationValue = (eventData as any).location ?? (eventData as any).address;
      if (!locationValue || locationValue.trim() === '') {
        throw new Error('Location is required for event creation');
      }

      const payload: any = {
        creator_id: user.user.id,
        title: eventData.title,
        description: eventData.description ?? null,
        event_type: (eventData as any).event_type ?? 'meetup',
        location: locationValue,
        address: (eventData as any).address ?? null,
        start_time: (eventData as any).start_time ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Default to 1 hour from now
        end_time: (eventData as any).end_time ?? null,
        location_id: (eventData as any).location_id ?? null,
        cover_image_url: (eventData as any).cover_image_url ?? null,
        is_featured: !!(eventData as any).is_featured,
        is_active: (eventData as any).is_active ?? true,
      };
      const { data, error: err } = await (supabase as any)
        .from('events')
        .insert(payload)
        .select('*')
        .single();
      if (err) throw err;
      return data;
    },
    rsvpToEvent: async (
      eventId: string,
      status: 'going' | 'interested' | 'not_going' | 'maybe' | 'declined'
    ) => {
      try {
        const mapped = status === 'maybe' ? 'interested' : status === 'declined' ? 'not_going' : status;
        const res = await apiCall(`/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify({ status: mapped }) }, true);
        return { rsvp: res?.rsvp ?? null, error: null };
      } catch (err: any) {
        return { rsvp: null, error: err as Error };
      }
    },
    cancelRSVP: async (eventId: string) => {
      try {
        await apiCall(`/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify({ status: 'not_going' }) }, true);
        return { error: null };
      } catch (err: any) {
        return { error: err as Error };
      }
    },
    likeEvent: async (eventId: string) => {
      try {
        const res = await apiCall(`/events/${eventId}/like`, { method: 'POST' }, true);
        return { liked: !!res?.liked, error: null };
      } catch (err: any) {
        return { liked: false, error: err as Error };
      }
    },
    viewEvent: async (eventId: string, payload?: { user_id?: string; session_id?: string }) => {
      try {
        await publicApiCall(`/events/${eventId}/view`, { method: 'POST', body: JSON.stringify(payload || {}) });
      } catch {}
    },
    getEventAttendees: async (eventId: string) => {
      try {
        const res = await publicApiCall(`/events/${eventId}/attendees`);
        return { attendees: res?.attendees || [], error: null };
      } catch (err: any) {
        return { attendees: [], error: err as Error };
      }
    },
    getUserRSVPs: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return { data: [] };
        const { data, error: e } = await supabase
          .from('event_attendees')
          .select('event_id, status')
          .eq('user_id', user.user.id);
        if (e) return { data: [] };
        return { data } as any;
      } catch {
        return { data: [] } as any;
      }
    },
    refetch: fetchEvents,
  };
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setEvent(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
}

export function useCreateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (eventData: Partial<Event>) => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Must be logged in to create an event');
      }

      // Ensure required fields are provided
      const locationValue = (eventData as any).location ?? (eventData as any).address;
      if (!locationValue || locationValue.trim() === '') {
        throw new Error('Location is required for event creation');
      }

      const payload: any = {
        creator_id: user.user.id,
        title: eventData.title,
        description: eventData.description ?? null,
        event_type: (eventData as any).event_type ?? 'meetup',
        location: locationValue,
        address: (eventData as any).address ?? null,
        start_time: (eventData as any).start_time ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Default to 1 hour from now
        end_time: (eventData as any).end_time ?? null,
        location_id: (eventData as any).location_id ?? null,
        cover_image_url: (eventData as any).cover_image_url ?? null,
        is_featured: !!(eventData as any).is_featured,
        is_active: (eventData as any).is_active ?? true,
      };
      const { data, error: createError } = await (supabase as any)
        .from('events')
        .insert(payload)
        .select('*')
        .single();

      if (createError) throw createError;

      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEvent,
    loading,
    error,
  };
}

export function useEventRSVP(eventId: string) {
  const [rsvp, setRsvp] = useState<RSVP | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRSVP = async () => {
    if (!eventId) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      setRsvp(null);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching RSVP:', err);
      setError(err.message);
    }
  };

  const submitRSVP = async (response: 'going' | 'maybe' | 'declined') => {
    try {
      setLoading(true);
      const res = await (apiCall as any)(`/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify({ status: response === 'maybe' ? 'interested' : response === 'declined' ? 'not_going' : 'going' }) }, true);
      setRsvp(res?.rsvp ? { id: 'tmp', event_id: eventId, user_id: 'me', response, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } : null);
      setError(null);
      return res;
    } catch (err: any) {
      console.error('Error submitting RSVP:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRSVP = async () => {
    try {
      setLoading(true);
      await (apiCall as any)(`/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify({ status: 'not_going' }) }, true);
      setRsvp(null);
      setError(null);
    } catch (err: any) {
      console.error('Error deleting RSVP:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRSVP();
  }, [eventId]);

  return {
    rsvp,
    loading,
    error,
    submitRSVP,
    deleteRSVP,
    refetch: fetchRSVP,
  };
}
