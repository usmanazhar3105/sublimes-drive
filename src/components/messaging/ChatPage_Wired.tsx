/**
 * ChatPage - Wired with Supabase Real-time Messaging
 * Uses: useProfile, useAnalytics, useMessaging, useImageUpload
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Image as ImageIcon, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile, useAnalytics, useMessaging, useImageUpload } from '../../src/hooks';

interface ChatPageProps {
  onNavigate?: (page: string) => void;
  conversationId?: string;
  recipientId?: string;
}

export function ChatPage({ onNavigate, conversationId: initialConversationId, recipientId }: ChatPageProps) {
  const [message, setMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(initialConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profile: currentUser } = useProfile();
  const { profile: recipient } = useProfile(recipientId);
  const analytics = useAnalytics();
  const { messages, loading, error, sendMessage, createOrGetConversation, refetch } = useMessaging(currentConversationId);
  const { uploading, uploadImage } = useImageUpload();

  // Create or get conversation if we only have recipientId
  useEffect(() => {
    if (!currentConversationId && recipientId && currentUser?.id) {
      createOrGetConversation([currentUser.id, recipientId]).then(({ data, error }) => {
        if (data) {
          setCurrentConversationId((data as any).id);
        } else if (error) {
          console.error('Error creating conversation:', error);
        }
      });
    }
  }, [recipientId, currentUser?.id, currentConversationId]);

  useEffect(() => {
    analytics.trackPageView(`/chat/${currentConversationId || recipientId}`);
  }, [currentConversationId, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [messagingLocked, setMessagingLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');

  // Check if messaging is unlocked for this conversation
  useEffect(() => {
    const checkMessagingUnlock = async () => {
      if (!currentConversationId) return;
      
      try {
        const { supabase } = await import('../../utils/supabase/client');
        // Try to get bid_id from conversation or thread_id
        // This is a simplified check - in production, you'd get the actual bid_id
        const { data: conversation } = await supabase
          .from('conversations')
          .select('thread_id, bid_id')
          .eq('id', currentConversationId)
          .single();
        
        if (conversation?.bid_id || conversation?.thread_id) {
          const bidId = conversation.bid_id || conversation.thread_id;
          const { data: unlocked } = await supabase.rpc('fn_is_messaging_unlocked', {
            bid_id_param: bidId
          });
          
          if (!unlocked) {
            setMessagingLocked(true);
            setLockReason('Messaging is locked until the bid is accepted or closed. This protects both parties.');
          } else {
            setMessagingLocked(false);
            setLockReason('');
          }
        }
      } catch (err) {
        console.error('Error checking messaging unlock:', err);
        // If check fails, allow messaging (RLS will enforce)
        setMessagingLocked(false);
      }
    };
    
    checkMessagingUnlock();
  }, [currentConversationId]);

  const handleSend = async () => {
    if (!message.trim() || !currentConversationId) return;

    // 🔥 MESSAGING UNLOCK: Check if messaging is allowed (RLS will also enforce)
    if (messagingLocked) {
      toast.error(lockReason || 'Messaging is locked until the bid is accepted or closed.');
      return;
    }

    const { error } = await sendMessage(message);
    if (!error) {
      setMessage('');
      analytics.trackEvent('message_sent', { 
        conversation_id: currentConversationId,
        recipient_id: recipientId 
      });
    } else {
      // RLS will block if bid not accepted/closed
      const errorMsg = error.message || 'Failed to send message';
      if (errorMsg.includes('locked') || errorMsg.includes('accepted')) {
        toast.error('Messaging is locked until the bid is accepted or closed.');
        setMessagingLocked(true);
      } else {
        toast.error('Failed to send message: ' + errorMsg);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentConversationId) return;

    const { url } = await uploadImage(file, 'messages', 'community');
    if (url) {
      await sendMessage(url, 'image');
      analytics.trackEvent('image_message_sent', { conversation_id: currentConversationId });
    }
  };

  return (
    <div className="h-screen bg-[#0B1426] flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onNavigate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('messages')}
                className="text-[#E8EAED] hover:bg-[#1A2332]"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <Avatar className="w-10 h-10">
              <AvatarImage src={recipient?.avatar_url} />
              <AvatarFallback className="bg-[#D4AF37] text-[#0B1426]">
                {recipient?.display_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg text-[#E8EAED]">{recipient?.display_name || 'User'}</h2>
              <p className="text-sm text-[#8B92A7]">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[#E8EAED] hover:bg-[#1A2332]">
              <Phone size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="text-[#E8EAED] hover:bg-[#1A2332]">
              <Video size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="text-[#E8EAED] hover:bg-[#1A2332]">
              <MoreVertical size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-[#8B92A7]">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-400 mb-2">Error loading messages</p>
            <Button onClick={refetch} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-[#8B92A7]">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === currentUser?.id;
            const isImage = msg.message_type === 'image';
            
            return (
              <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md ${isOwnMessage ? 'bg-[#D4AF37] text-[#0B1426]' : 'bg-[#1A2332] text-[#E8EAED]'} rounded-lg px-4 py-2`}>
                  {isImage ? (
                    <img src={msg.content} alt="Shared image" className="rounded-lg max-w-xs" />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-[#0B1426]/70' : 'text-[#8B92A7]'}`}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                    {msg.read_at && ' • Read'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Messaging Locked Banner */}
      {messagingLocked && (
        <div className="bg-yellow-900/20 border-t border-yellow-700/50 px-6 py-3">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>{lockReason || 'Messaging is locked until the bid is accepted or closed.'}</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-[#0F1829] border-t border-[#1A2332] p-4">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#E8EAED] hover:bg-[#1A2332]"
            disabled={uploading}
          >
            <Paperclip size={20} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-[#E8EAED] hover:bg-[#1A2332]"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={messagingLocked ? "Messaging locked until bid is accepted..." : "Type a message..."}
            className="flex-1 bg-[#1A2332] border-[#2A3342] text-[#E8EAED] placeholder:text-[#8B92A7]"
            disabled={!currentConversationId || messagingLocked}
          />
          <Button variant="ghost" size="sm" className="text-[#E8EAED] hover:bg-[#1A2332]" disabled={messagingLocked}>
            <Smile size={20} />
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || !currentConversationId || messagingLocked}
            className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E] disabled:opacity-50"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
