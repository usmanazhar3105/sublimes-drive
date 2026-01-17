import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, ExternalLink, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { knowledgeBase, type KnowledgeBaseItem } from '../../utils/knowledgeBase';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  relatedArticles?: KnowledgeBaseItem[];
}

interface AIChatAssistantPageProps {
  onNavigate?: (page: string) => void;
}

export function AIChatAssistantPage({ onNavigate }: AIChatAssistantPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey there! 👋 I\'m your friendly Sublimes Drive assistant! \n\nI\'m here to help you navigate our awesome platform - whether you want to sell your car, find the perfect garage, join our amazing communities, or just learn how everything works. \n\nI love chatting about cars and I\'m here 24/7, so don\'t be shy! What would you like to explore today? 😊',
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        'How to post my car listing? 🚗',
        'Find garages near me 🔧', 
        'Join car communities 👥',
        'Learn about XP rewards ⭐'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Improved AI responses with better context awareness
  const getAIResponse = (userMessage: string): { content: string; suggestions?: string[]; relatedArticles?: KnowledgeBaseItem[] } => {
    const message = userMessage.toLowerCase();
    
    // Car listing related queries
    if (message.includes('listing') || message.includes('sell') || message.includes('post')) {
      return {
        content: '🚗 Great! I can help you list your car on our marketplace! Here\'s what you need to know:\n\n✅ Take high-quality photos from all angles\n✅ Write a detailed description including year, model, mileage\n✅ Set a competitive price based on market value\n✅ Choose the right category (cars/parts)\n\nWould you like me to guide you through creating your first listing?',
        suggestions: [
          'Start creating my listing 📝',
          'Photo tips for car listings 📸',
          'How to price my car? 💰',
          'Marketplace guidelines 📋'
        ]
      };
    }
    
    // Garage related queries
    if (message.includes('garage') || message.includes('service') || message.includes('repair')) {
      return {
        content: '🔧 Looking for reliable garage services? Our Garage Hub has verified partners across the UAE!\n\n🎯 Here\'s what we offer:\n• Trusted & verified garage partners\n• Competitive pricing with transparent quotes\n• Service history tracking\n• Emergency repair services\n• Specialized services for all car brands\n\nI can help you find the perfect garage for your needs!',
        suggestions: [
          'Find garages near me 📍',
          'Get repair quotes 💬',
          'Emergency services 🚨',
          'Garage verification info ✅'
        ]
      };
    }
    
    // Community related queries
    if (message.includes('community') || message.includes('groups') || message.includes('meet')) {
      return {
        content: '👥 Our communities are amazing! Connect with fellow car enthusiasts who share your passion!\n\n🌟 What you can do:\n• Join brand-specific groups (BMW, Mercedes, etc.)\n• Share photos and modifications\n• Get advice from experienced members\n• Attend car meets and events\n• Earn XP points for participation\n\nWhich type of community interests you most?',
        suggestions: [
          'Browse all communities 🏠',
          'Upcoming car meets 🚗',
          'Post in community 📝',
          'Community guidelines 📜'
        ]
      };
    }
    
    // XP and rewards queries
    if (message.includes('xp') || message.includes('points') || message.includes('reward')) {
      return {
        content: '⭐ XP Points are your gateway to exclusive benefits! Here\'s how our reward system works:\n\n🎯 Earn XP by:\n• Posting quality content (+50 XP)\n• Getting likes and comments (+10 XP each)\n• Completing daily challenges (+100 XP)\n• Verifying your profile (+200 XP)\n• Helping other members (+25 XP)\n\n🏆 Unlock benefits like priority listings, exclusive badges, and VIP events!',
        suggestions: [
          'Check my current XP 📊',
          'Daily challenges 🎯',
          'XP leaderboard 🏅',
          'Exclusive rewards 🎁'
        ]
      };
    }
    
    // Import car queries
    if (message.includes('import') || message.includes('overseas')) {
      return {
        content: '🌍 Importing your dream car to the UAE? We make it simple and stress-free!\n\n📋 Our import service includes:\n• Professional vehicle inspection\n• All paperwork and customs clearance\n• Shipping and logistics coordination\n• UAE registration assistance\n• Insurance setup\n\nGet a personalized quote in 24 hours!',
        suggestions: [
          'Start import process 🚢',
          'Import cost calculator 💰',
          'Required documents 📄',
          'Shipping timeline ⏰'
        ]
      };
    }
    
    // Offers and deals queries
    if (message.includes('offer') || message.includes('deal') || message.includes('discount')) {
      return {
        content: '💎 Exclusive offers await! We partner with top brands to bring you amazing deals:\n\n🔥 Current offers include:\n• Garage service discounts up to 50%\n• Car parts at wholesale prices\n• Free car washes with service\n• Insurance premium discounts\n\nOffers are updated weekly, so check back often!',
        suggestions: [
          'View all offers 🛍️',
          'My saved offers 💾',
          'Offer notifications 🔔',
          'Redeem offer codes 🎫'
        ]
      };
    }
    
    // Default friendly response
    return {
      content: '🤔 I\'m here to help with anything Sublimes Drive related! I can assist you with:\n\n🚗 Marketplace & Car Listings\n🔧 Garage Services & Repairs\n👥 Communities & Car Meets\n⭐ XP Points & Rewards\n🌍 Car Import Services\n💎 Exclusive Offers & Deals\n\nWhat would you like to know more about?',
      suggestions: [
        'How to use the app? 📱',
        'Account settings ⚙️',
        'Contact support 📞',
        'App features tour 🎯'
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse = getAIResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        relatedArticles: aiResponse.relatedArticles,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion.replace(/[🚗🔧👥⭐📝📸💰📋📍💬🚨✅🏠📜📊🎯🏅🎁🚢💰📄⏰🛍️💾🔔🎫📱⚙️📞]/g, '').trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => onNavigate?.('home')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--sublimes-gold)] to-yellow-500 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">AI Chat Assistant</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online • Instant responses</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/20">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Get instant help with car listings, garage services, communities, and more!
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender === 'user' 
                ? 'bg-[var(--sublimes-gold)] text-black' 
                : 'bg-gradient-to-r from-[var(--sublimes-gold)] to-yellow-500 text-black'
            }`}>
              {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            
            <div className={`flex-1 max-w-[80%] ${message.sender === 'user' ? 'flex justify-end' : ''}`}>
              <div className={`p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-[var(--sublimes-gold)] text-black ml-auto'
                  : 'bg-card border border-border'
              }`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 bg-background/50 hover:bg-[var(--sublimes-gold)]/10 hover:text-[var(--sublimes-gold)] border-border"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Related Articles */}
                {message.relatedArticles && message.relatedArticles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">Related Articles:</div>
                    {message.relatedArticles.slice(0, 2).map((article, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded border border-border">
                        <div>
                          <div className="text-xs font-medium">{article.title}</div>
                          <div className="text-xs text-muted-foreground">{article.category}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onNavigate?.('faq-knowledge-base')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className={`text-xs text-muted-foreground mt-1 ${
                message.sender === 'user' ? 'text-right' : ''
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--sublimes-gold)] to-yellow-500 flex items-center justify-center">
              <Bot className="h-4 w-4 text-black" />
            </div>
            <div className="bg-card border border-border p-3 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about Sublimes Drive..."
            className="flex-1 bg-background"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2 text-center">
          💡 Pro tip: I can help you navigate the app, answer questions, and provide personalized assistance!
        </div>
      </div>
    </div>
  );
}