import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Search, MoreVertical, MessageSquare, Edit, Archive, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface ConversationsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

interface Conversation {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isPinned: boolean;
  isArchived: boolean;
  messageType: 'text' | 'image' | 'listing';
}

export function ConversationsPage({ onNavigate }: ConversationsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      userName: 'Ahmad Al Rashid',
      userAvatar: '/placeholder-avatar.jpg',
      lastMessage: 'Is the BYD still available? I\'m very interested.',
      timestamp: '2m ago',
      unreadCount: 3,
      isOnline: true,
      isPinned: true,
      isArchived: false,
      messageType: 'text'
    },
    {
      id: '2',
      userName: 'Sarah Mohammed',
      userAvatar: '/placeholder-avatar.jpg',
      lastMessage: 'Thank you for the quick repair! Great service 👍',
      timestamp: '1h ago',
      unreadCount: 0,
      isOnline: false,
      isPinned: false,
      isArchived: false,
      messageType: 'text'
    },
    {
      id: '3',
      userName: 'AutoFix Garage',
      userAvatar: '/placeholder-avatar.jpg',
      lastMessage: 'Your car is ready for pickup. Total: AED 650',
      timestamp: '3h ago',
      unreadCount: 1,
      isOnline: true,
      isPinned: false,
      isArchived: false,
      messageType: 'text'
    },
    {
      id: '4',
      userName: 'Mohamed Hassan',
      userAvatar: '/placeholder-avatar.jpg',
      lastMessage: 'Sent a photo',
      timestamp: '1d ago',
      unreadCount: 0,
      isOnline: false,
      isPinned: false,
      isArchived: false,
      messageType: 'image'
    },
    {
      id: '5',
      userName: 'Ali Kumar',
      userAvatar: '/placeholder-avatar.jpg',
      lastMessage: 'Can you do AED 45,000 for the Camry?',
      timestamp: '2d ago',
      unreadCount: 0,
      isOnline: false,
      isPinned: false,
      isArchived: false,
      messageType: 'text'
    }
  ]);

  const filteredConversations = conversations.filter(conv => 
    !conv.isArchived && 
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const togglePin = (id: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv
      )
    );
  };

  const archiveConversation = (id: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, isArchived: true } : conv
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
  };

  // Sort conversations: pinned first, then by timestamp
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // Keep original order for same pin status
  });

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
              <h1 className="text-lg font-semibold">Messages</h1>
              {totalUnread > 0 && (
                <p className="text-sm text-muted-foreground">
                  {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No conversations</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery 
                ? "No conversations match your search."
                : "Start a conversation by messaging someone from the marketplace or communities."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedConversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className="transition-colors cursor-pointer hover:bg-muted/50 mx-4 mb-2"
                onClick={() => onNavigate('chat', { conversationId: conversation.id })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    {/* Avatar with Online Status */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.userAvatar} />
                        <AvatarFallback>
                          {conversation.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-sm truncate">
                            {conversation.userName}
                          </h3>
                          {conversation.isPinned && (
                            <div className="w-1 h-1 bg-primary rounded-full" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {conversation.timestamp}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => togglePin(conversation.id)}>
                                {conversation.isPinned ? 'Unpin' : 'Pin'} conversation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => archiveConversation(conversation.id)}>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteConversation(conversation.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.messageType === 'image' ? (
                            <span className="italic">📷 {conversation.lastMessage}</span>
                          ) : (
                            conversation.lastMessage
                          )}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
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