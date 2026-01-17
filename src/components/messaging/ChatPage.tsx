import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Send, MoreVertical, Phone, Video, Paperclip, Smile, Camera, MapPin, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface ChatPageProps {
  onNavigate: (page: string) => void;
  conversationId?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'listing' | 'location' | 'system';
  isMe: boolean;
  isRead: boolean;
  listing?: {
    title: string;
    price: string;
    image: string;
  };
}

export function ChatPage({ onNavigate, conversationId = '1' }: ChatPageProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'user1',
      senderName: 'Ahmad Al Rashid',
      content: 'Hi! I saw your BYD Seal listing. Is it still available?',
      timestamp: '10:30 AM',
      type: 'text',
      isMe: false,
      isRead: true
    },
    {
      id: '2',
      senderId: 'me',
      senderName: 'You',
      content: 'Yes, it\'s still available! Are you interested in viewing it?',
      timestamp: '10:32 AM',
      type: 'text',
      isMe: true,
      isRead: true
    },
    {
      id: '3',
      senderId: 'user1',
      senderName: 'Ahmad Al Rashid',
      content: 'Definitely! Can you share more photos of the interior?',
      timestamp: '10:35 AM',
      type: 'text',
      isMe: false,
      isRead: true
    },
    {
      id: '4',
      senderId: 'me',
      senderName: 'You',
      content: 'Sure! Let me send you some photos.',
      timestamp: '10:36 AM',
      type: 'text',
      isMe: true,
      isRead: true
    },
    {
      id: '5',
      senderId: 'me',
      senderName: 'You',
      content: 'Interior photos of the BYD Seal',
      timestamp: '10:37 AM',
      type: 'image',
      isMe: true,
      isRead: true
    },
    {
      id: '6',
      senderId: 'user1',
      senderName: 'Ahmad Al Rashid',
      content: 'Looks great! What\'s your best price?',
      timestamp: '10:40 AM',
      type: 'text',
      isMe: false,
      isRead: true
    },
    {
      id: '7',
      senderId: 'me',
      senderName: 'You',
      content: 'I can do AED 95,000. The car is in excellent condition.',
      timestamp: '10:42 AM',
      type: 'text',
      isMe: true,
      isRead: false
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isMe: true,
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate other user typing
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate response
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'user1',
          senderName: 'Ahmad Al Rashid',
          content: 'That sounds reasonable. Can we meet tomorrow to see the car?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          isMe: false,
          isRead: true
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const otherUser = {
    name: 'Ahmad Al Rashid',
    avatar: '/placeholder-avatar.jpg',
    isOnline: true,
    lastSeen: 'Active now'
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('conversations')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUser.avatar} />
                <AvatarFallback>
                  {otherUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {otherUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            
            <div>
              <h2 className="font-semibold text-sm">{otherUser.name}</h2>
              <p className="text-xs text-muted-foreground">
                {isTyping ? 'Typing...' : otherUser.lastSeen}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                <DropdownMenuItem>Search in Chat</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.isMe ? 'order-2' : 'order-1'}`}>
              {msg.type === 'text' && (
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.isMe
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted mr-12'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              )}
              
              {msg.type === 'image' && (
                <div className={`${msg.isMe ? 'ml-12' : 'mr-12'}`}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <p className="text-xs text-muted-foreground mt-1">{msg.content}</p>
                </div>
              )}

              <div className={`flex items-center mt-1 text-xs text-muted-foreground ${
                msg.isMe ? 'justify-end' : 'justify-start'
              }`}>
                <span>{msg.timestamp}</span>
                {msg.isMe && (
                  <span className="ml-1">
                    {msg.isRead ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>

            {!msg.isMe && (
              <Avatar className="w-8 h-8 order-1 mr-2">
                <AvatarImage src={otherUser.avatar} />
                <AvatarFallback className="text-xs">
                  {otherUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={otherUser.avatar} />
                <AvatarFallback className="text-xs">
                  {otherUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-10"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            onClick={sendMessage}
            disabled={!message.trim()}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}