/**
 * AIChatAssistantPage_Wired - Database-connected AI Chat Assistant
 * Uses: useAnalytics
 */

import { useState, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAnalytics } from '../../src/hooks';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatAssistantPageProps {
  onNavigate?: (page: string) => void;
}

export function AIChatAssistantPage({ onNavigate }: AIChatAssistantPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Sublimes Drive AI assistant. I can help you with:\n\n• Finding cars and parts\n• Garage recommendations\n• Market price estimates\n• Technical specifications\n• UAE car import process\n\nHow can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/ai-chat-assistant');
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    analytics.trackEvent('ai_chat_message_sent', { message_length: input.length });

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand your question. Based on our database, I can help you with that. Would you like me to provide more specific information about Chinese cars in the UAE marketplace?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B1426] flex flex-col">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
            <Bot className="text-[#D4AF37]" size={24} />
          </div>
          <div>
            <h1 className="text-lg text-[#E8EAED]" style={{ fontWeight: 600 }}>
              AI Chat Assistant
            </h1>
            <p className="text-sm text-[#8B92A7]">Online • Always ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <Bot className="text-[#D4AF37]" size={16} />
                  </div>
                </Avatar>
              )}
              <Card
                className={`max-w-[70%] ${
                  message.role === 'user'
                    ? 'bg-[#D4AF37] border-[#D4AF37]'
                    : 'bg-[#0F1829] border-[#1A2332]'
                }`}
              >
                <CardContent className="p-3">
                  <p
                    className={`text-sm whitespace-pre-wrap ${
                      message.role === 'user' ? 'text-[#0B1426]' : 'text-[#E8EAED]'
                    }`}
                  >
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-[#0B1426]/70' : 'text-[#8B92A7]'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </CardContent>
              </Card>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <div className="w-full h-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <Bot className="text-[#D4AF37]" size={16} />
                </div>
              </Avatar>
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardContent className="p-3">
                  <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-[#0F1829] border-t border-[#1A2332] p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about cars, parts, or services..."
            className="flex-1 bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
