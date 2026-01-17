/**
 * ConversationsPage - Wired with Real-time Messaging
 * Uses: useProfile, useAnalytics, useMessaging
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Search, MessageSquare, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile, useAnalytics, useMessaging } from '../../src/hooks';

interface ConversationsPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

export function ConversationsPage({ onNavigate }: ConversationsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { profile } = useProfile();
  const analytics = useAnalytics();
  const { conversations, loading, error, refetchConversations } = useMessaging();

  useEffect(() => {
    analytics.trackPageView('/conversations');
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    // Filter logic can be enhanced based on participant names
    return conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl text-[#E8EAED]">Messages</h1>
            <Button className="bg-[#D4AF37] text-[#0B1426]">
              <Plus size={20} className="mr-2" />
              New Chat
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="mx-auto mb-4 text-[#8B92A7]" size={64} />
            <h3 className="text-xl text-[#E8EAED] mb-2">No conversations yet</h3>
            <p className="text-[#8B92A7] mb-6">Start chatting with other members</p>
            <Button className="bg-[#D4AF37] text-[#0B1426]">
              Start a Conversation
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Card 
                key={conv.id}
                className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                onClick={() => onNavigate?.(`chat-${conv.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conv.avatar} />
                      <AvatarFallback className="bg-[#D4AF37] text-[#0B1426]">
                        {conv.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[#E8EAED]">{conv.name}</h3>
                        <span className="text-xs text-[#8B92A7]">{conv.time}</span>
                      </div>
                      <p className="text-sm text-[#8B92A7] line-clamp-1">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge className="bg-[#D4AF37] text-[#0B1426] border-0">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
