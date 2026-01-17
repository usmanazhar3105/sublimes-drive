import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file';
  metadata?: Record<string, any>;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  unread_count?: number;
}

export function useMessaging(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Fetch messages for a specific conversation
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [conversationId]);

  // Fetch all conversations
  useEffect(() => {
    fetchConversations();
    subscribeToConversations();
  }, []);

  async function fetchMessages() {
    if (!conversationId) return;

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessages([]);
        setError(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        if (fetchError.code === '42501' || fetchError.code === '42P01') {
          console.warn('⚠️ Messages table not available yet');
          setMessages([]);
          setError(null);
        } else {
          throw fetchError;
        }
      } else {
        setMessages(data || []);
        setError(null);
      }
    } catch (err: any) {
      // Silently handle network errors
      if (err?.message?.includes('Failed to fetch')) {
        setMessages([]);
        setError(null);
      } else {
        setError(err as Error);
        console.error('Error fetching messages:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchConversations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConversations([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [user.id])
        .order('updated_at', { ascending: false });

      if (fetchError) {
        if (fetchError.code === '42501' || fetchError.code === '42P01') {
          console.warn('⚠️ Conversations table not available yet');
          setConversations([]);
        } else {
          throw fetchError;
        }
      } else {
        setConversations(data || []);
      }
    } catch (err: any) {
      // Silently handle network errors
      if (!err?.message?.includes('Failed to fetch')) {
        console.error('Error fetching conversations:', err);
      }
    }
  }

  function subscribeToMessages() {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('💬 New message received:', payload);
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);

          // Show toast for new messages from others
          const userId = supabase.auth.getUser().then(({ data }) => data.user?.id);
          userId.then((id) => {
            if (newMessage.sender_id !== id) {
              toast.info('New message', {
                description: newMessage.content.substring(0, 50),
                duration: 3000,
              });
            }
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  function subscribeToConversations() {
    const channel = supabase
      .channel('conversations_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  async function sendMessage(content: string, messageType: 'text' | 'image' | 'file' = 'text', metadata?: Record<string, any>) {
    if (!conversationId || !content.trim()) {
      return { error: new Error('Invalid message or conversation') };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error('Not authenticated') };
      }

      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          metadata,
        })
        .select()
        .single();

      if (sendError) throw sendError;

      // Update conversation's last_message
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      return { data, error: null };
    } catch (err) {
      console.error('Error sending message:', err);
      return { error: err as Error };
    }
  }

  async function markMessagesAsRead(messageIds: string[]) {
    try {
      const { error: markError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);

      if (markError) throw markError;

      return { error: null };
    } catch (err) {
      console.error('Error marking messages as read:', err);
      return { error: err as Error };
    }
  }

  async function createOrGetConversation(participantIds: string[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error('Not authenticated') };
      }

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', participantIds)
        .eq('participant_ids', participantIds)
        .single();

      if (existing) {
        return { data: existing, error: null };
      }

      // Create new conversation
      const { data, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_ids: participantIds,
        })
        .select()
        .single();

      if (createError) throw createError;

      return { data, error: null };
    } catch (err) {
      console.error('Error creating conversation:', err);
      return { error: err as Error };
    }
  }

  return {
    messages,
    conversations,
    loading,
    error,
    typingUsers,
    sendMessage,
    markMessagesAsRead,
    createOrGetConversation,
    refetch: fetchMessages,
    refetchConversations: fetchConversations,
  };
}
