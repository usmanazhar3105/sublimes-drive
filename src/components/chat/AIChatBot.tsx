import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Bot, User, ExternalLink, Minimize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { knowledgeBase, type KnowledgeBaseItem } from '../../utils/knowledgeBase';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  relatedArticles?: KnowledgeBaseItem[];
}

interface AIChatBotProps {
  onNavigate?: (page: string) => void;
}

export function AIChatBot({ onNavigate }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  const searchKnowledgeBase = (query: string): KnowledgeBaseItem[] => {
    const lowercaseQuery = query.toLowerCase();
    const keywords = lowercaseQuery.split(' ').filter(word => word.length > 2);
    
    return knowledgeBase.filter(item => {
      const itemText = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();
      return keywords.some(keyword => itemText.includes(keyword));
    }).slice(0, 3);
  };

  const generateResponse = (userMessage: string): { content: string; relatedArticles?: KnowledgeBaseItem[]; suggestions?: string[] } => {
    const lowercaseMessage = userMessage.toLowerCase();
    const relatedArticles = searchKnowledgeBase(userMessage);

    // Greeting responses - fixed to handle simple "hi"
    if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey') || lowercaseMessage === 'hi' || lowercaseMessage === 'hello' || lowercaseMessage === 'hey') {
      const greetings = [
        "Hey there! 👋 Great to see you on Sublimes Drive! I'm here to help you with anything you need. What can I assist you with today?",
        "Hello! 😊 Welcome to Sublimes Drive! I'm your personal assistant and I'd love to help you navigate our platform. What would you like to know?",
        "Hi! ✨ Nice to meet you! I'm here to make your Sublimes Drive experience amazing. How can I help you get started?"
      ];
      return {
        content: greetings[Math.floor(Math.random() * greetings.length)],
        suggestions: ['How to get verified? ✅', 'Post my first car listing 🚗', 'Join communities 👥', 'What is XP system? ⭐']
      };
    }

    // Thank you responses
    if (lowercaseMessage.includes('thank') || lowercaseMessage.includes('thanks')) {
      const thankYouResponses = [
        "You're absolutely welcome! 😊 I'm always here whenever you need help. Is there anything else I can assist you with?",
        "My pleasure! 🌟 That's what I'm here for! Feel free to ask me anything else about Sublimes Drive.",
        "Happy to help! 💫 Don't hesitate to reach out if you have more questions. I'm always ready to assist!"
      ];
      return {
        content: thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)],
        suggestions: ['Browse FAQ', 'Contact support', 'Learn about features']
      };
    }

    // XP System queries
    if (lowercaseMessage.includes('xp') || lowercaseMessage.includes('experience') || lowercaseMessage.includes('points') || lowercaseMessage.includes('level')) {
      return {
        content: 'Oh, the XP system! 🎯 It\'s one of my favorite features because it makes everything so rewarding! Think of it as your personal achievement tracker.\n\nHere\'s how you can earn XP and level up:\n\n🏆 **Daily Activities:**\n• Posting in communities (+10 XP)\n• Getting likes on your posts (+5 XP each)\n• Attending meetups (+25 XP - that\'s huge!)\n• Completing your profile (+50 XP one-time bonus)\n• Getting verified (+100 XP - totally worth it!)\n• Creating listings (+15 XP)\n\n✨ Your XP level unlocks special badges, better visibility for your listings, and exclusive community features. Plus, higher levels get priority support - that means faster help when you need it!\n\nThe best part? You can see your progress in real-time on your profile dashboard. Pretty cool, right? 😎',
        relatedArticles,
        suggestions: ['How to get verified for 100 XP?', 'What badges can I earn?', 'View community meetups']
      };
    }

    // Verification queries
    if (lowercaseMessage.includes('verification') || lowercaseMessage.includes('verified') || lowercaseMessage.includes('verify')) {
      return {
        content: 'Ah, verification! 🛡️ This is super important and honestly not as complicated as people think. Let me walk you through it!\n\n**For Car Owners (the most common):**\n• Take clear photos of your beautiful ride 📸\n• Upload your car registration (Mulkiya) - just a photo is fine\n• Verify with your UAE Emirates ID (for security, you know!)\n\n**For Garage Owners:**\n• Business license (shows you\'re legit)\n• Some facility photos (let people see your workspace!)\n• Professional verification process\n\n⏰ **Timeline:** Usually 24-48 hours - our team is pretty quick!\n\n🎁 **The Rewards:** You get that shiny verified badge ✅ PLUS a massive 100 XP boost!\n\n💡 **Pro tip:** The verified badge seriously increases trust with buyers and gets you higher visibility in search results. It\'s like having a VIP pass!',
        relatedArticles,
        suggestions: ['What documents do I need?', 'How long does it take?', 'Benefits of being verified']
      };
    }

    // Car listing queries
    if (lowercaseMessage.includes('listing') || lowercaseMessage.includes('sell car') || lowercaseMessage.includes('post car') || lowercaseMessage.includes('place ad')) {
      return {
        content: 'Awesome! 🚗 Selling your car on Sublimes Drive is super straightforward and we\'ve made it really user-friendly!\n\nHere\'s your step-by-step guide:\n\n**🎯 Quick Steps:**\n1. **Hit "Post Listing"** in the Marketplace (you can\'t miss it!)\n2. **Tell us about your ride** - make, model, year, mileage (the usual stuff)\n3. **Photos are KEY!** 📸 Upload at least 5 clear photos (trust me, good photos = faster sales!)\n4. **Price it right** - we even show market suggestions to help you\n5. **Pick your location** and contact preferences\n6. **Optional but recommended:** Add a boost for maximum visibility ⚡\n\n✨ **Pro Tips:**\n• Take photos during golden hour (just before sunset) for that premium look\n• Clean your car first - it makes a HUGE difference\n• Write an honest, detailed description\n\n📋 **Review Process:** Usually takes 2-4 hours, but premium members get priority review (just saying! 😉)\n\nReady to get started?',
        relatedArticles,
        suggestions: ['Photo tips for listings', 'How to price my car?', 'Boost my listing', 'What makes a good description?']
      };
    }

    // Garage registration queries
    if (lowercaseMessage.includes('garage') || lowercaseMessage.includes('mechanic') || lowercaseMessage.includes('workshop')) {
      return {
        content: 'Welcome to Garage Hub! To register your garage:\n\n1. **Complete verification** as a garage owner\n2. **Add garage details** (services, location, hours)\n3. **Upload facility photos** and certifications\n4. **Set service prices** and availability\n5. **Get approved** by our team\n\nGarage owners can bid on repair requests and offer services to our community!',
        relatedArticles,
        suggestions: ['Garage verification process', 'How to bid on repairs?', 'Service pricing guide']
      };
    }

    // Repair bid queries
    if (lowercaseMessage.includes('repair') || lowercaseMessage.includes('bid') || lowercaseMessage.includes('fix')) {
      return {
        content: 'The Repair Bid system connects you with verified garages! Here\'s how it works:\n\n**For Car Owners:**\n• Post your repair request with photos\n• Verified garages bid on your job\n• Compare prices and reviews\n• Choose the best garage\n\n**For Garages:**\n• Browse repair requests\n• Submit competitive bids\n• Build your reputation\n• Grow your business\n\nAll transactions are secure and protected!',
        relatedArticles,
        suggestions: ['How to post repair request?', 'Garage selection tips', 'Payment protection']
      };
    }

    // Import car queries
    if (lowercaseMessage.includes('import') || lowercaseMessage.includes('chinese car') || lowercaseMessage.includes('overseas')) {
      return {
        content: 'Importing your Chinese car to the UAE? We can help! Our Import Car service includes:\n\n• **Shipping coordination** from China to UAE\n• **Customs clearance** assistance\n• **RTA registration** support\n• **Insurance guidance**\n• **Local inspection** arrangements\n\nWe work with trusted partners to make your car import smooth and hassle-free!',
        relatedArticles,
        suggestions: ['Import requirements', 'Shipping costs', 'Registration process']
      };
    }

    // Payment queries
    if (lowercaseMessage.includes('payment') || lowercaseMessage.includes('pay') || lowercaseMessage.includes('refund') || lowercaseMessage.includes('billing')) {
      return {
        content: 'We accept various payment methods for your convenience:\n\n• **Credit/Debit Cards** (Visa, Mastercard)\n• **Apple Pay** and **Google Pay**\n• **Bank transfers** for large amounts\n• **Bid Wallet** for repair services\n\nAll payments are processed securely through Stripe. Check our Refund Policy for terms and conditions.',
        relatedArticles,
        suggestions: ['Payment methods', 'Refund policy', 'Bid wallet guide']
      };
    }

    // Community queries
    if (lowercaseMessage.includes('community') || lowercaseMessage.includes('post') || lowercaseMessage.includes('forum') || lowercaseMessage.includes('friends') || lowercaseMessage.includes('connect')) {
      return {
        content: 'Oh, the communities are honestly the BEST part of Sublimes Drive! 🤩 It\'s where all the car magic happens!\n\n**🔥 Our Amazing Communities:**\n• **BMW Enthusiasts** 🏎️ - Pure luxury discussions\n• **BYD Owners** ⚡ - Electric vehicle pioneers\n• **Geely Community** 🚗 - Reliable and innovative\n• **Track Day Groups** 🏁 - For the speed demons!\n• **Meetup Organizers** 👥 - Real-world connections\n• **Modification Masters** 🔧 - Show off your custom work\n• **Newbie Friendly** 🌟 - Everyone\'s welcome here!\n\n**💡 What You Can Do:**\n• Share your ride photos (we LOVE car pics!)\n• Ask questions - our community is super helpful\n• Organize weekend meetups and road trips\n• Get advice on purchases, maintenance, modifications\n• Make genuine friendships with fellow car lovers\n\n**🎁 Community Perks:**\n• Earn XP for every post and helpful comment\n• Get insider tips from experienced owners\n• First to know about exclusive events\n• Access to member-only deals\n\nReady to join the fun? The car community here is incredibly welcoming! 🚗💙',
        relatedArticles,
        suggestions: ['How to join communities?', 'Upcoming meetups', 'Community guidelines', 'Share my car photos']
      };
    }

    // Meetup queries
    if (lowercaseMessage.includes('meetup') || lowercaseMessage.includes('event') || lowercaseMessage.includes('meet')) {
      return {
        content: 'Sublimes Drive meetups are a great way to connect! Here\'s what you need to know:\n\n• **Join existing meetups** in your area\n• **Create your own events** and invite others\n• **Earn XP** for attending (+25 XP per meetup)\n• **Build connections** with local car enthusiasts\n• **Share experiences** and photos\n\nMeetups happen regularly across all seven emirates!',
        relatedArticles,
        suggestions: ['Upcoming meetups', 'How to organize meetup?', 'Meetup safety guidelines']
      };
    }

    // If no specific match found but we have related articles
    if (relatedArticles.length > 0) {
      const helpfulResponses = [
        "Great question! 🤔 I found some articles that should help you out. Take a look at these - they're quite comprehensive!",
        "I've got you covered! 📚 Found some really helpful articles that relate to what you're asking. Check them out below!",
        "Perfect timing! ✨ I have some detailed guides that should answer your question perfectly. Have a look!"
      ];
      return {
        content: helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)],
        relatedArticles,
        suggestions: ['Need more help?', 'Contact support', 'Ask something else']
      };
    }

    // Fallback response
    const fallbackResponses = [
      "Hmm, that's a great question! 🤔 I want to make sure I give you the best answer possible, but I don't have specific details on that right now. Let me connect you with our amazing support team who can help you properly!\n\n📧 **Email:** support@sublimesdrive.com\n📞 **Call:** +971 50 353 0121 \n💬 **WhatsApp:** Available 24/7\n\nThey typically respond within a few hours and they're super helpful! 😊",
      "I wish I had the perfect answer for you right now! 😅 But rather than guess, I'd love to connect you with our support experts who can give you the exact information you need.\n\n🌟 **Quick Contact Options:**\n• Email: support@sublimesdrive.com\n• Phone: +971 50 353 0121\n• Our FAQ section has tons of detailed guides too!\n\nIs there anything else about our main features I can help you with in the meantime?",
      "That's a really good question! 💭 I want to give you accurate information, so let me point you to our support team who are the real experts on this.\n\n✨ **Get Help Fast:**\n📨 support@sublimesdrive.com\n📱 +971 50 353 0121\n🕐 Usually respond within 24 hours\n\nAnything else about car listings, communities, or XP system I can help with right now?"
    ];
    return {
      content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      suggestions: ['Contact support', 'Browse FAQ', 'Ask about car listings', 'Learn about communities']
    };
  };

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(messageText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions,
        relatedArticles: response.relatedArticles
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleArticleClick = (article: KnowledgeBaseItem) => {
    if (onNavigate) {
      setIsOpen(false);
      onNavigate('faq-article');
    }
  };

  return (
    <>
      {/* Floating Chat Button - positioned above bottom nav on mobile */}
      {!isOpen && (
        <div className="fixed bottom-28 right-4 md:bottom-6 md:right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            data-chat-bot
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none hover:scale-110"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Chat Interface - positioned above bottom nav on mobile */}
      {isOpen && (
        <div className="fixed bottom-28 right-4 md:bottom-6 md:right-6 z-50">
          <Card className={`w-96 max-w-[calc(100vw-2rem)] transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[600px] max-h-[calc(100vh-2rem)]'
          } bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] shadow-2xl`}>
            {/* Header */}
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="w-5 h-5" />
                  Support Chat
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="w-8 h-8 p-0 text-white hover:bg-white/20"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 p-0 text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {!isMinimized && (
                <p className="text-sm opacity-90">Always ready to help! ✨</p>
              )}
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start space-x-2 max-w-[80%]">
                        {message.sender === 'bot' && (
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div>
                          <div
                            className={`p-3 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]'
                                : 'bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-light-text)] border border-[var(--sublimes-border)]'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                          </div>
                          
                          {/* Related Articles */}
                          {message.relatedArticles && message.relatedArticles.length > 0 && (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-400">Related articles:</p>
                              {message.relatedArticles.map((article) => (
                                <button
                                  key={article.id}
                                  onClick={() => handleArticleClick(article)}
                                  className="block w-full p-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded text-left hover:bg-[var(--sublimes-card-bg)] transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-xs font-medium text-[var(--sublimes-light-text)]">{article.title}</p>
                                      <p className="text-xs text-gray-400">{article.category}</p>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-gray-400" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Suggestions */}
                          {message.suggestions && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs h-6 px-2 border-[var(--sublimes-border)] hover:bg-[var(--sublimes-gold)] hover:text-[var(--sublimes-dark-bg)]"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 bg-[var(--sublimes-gold)] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-[var(--sublimes-dark-bg)]" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t border-[var(--sublimes-border)]">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="✏️ Type your message..."
                      className="flex-1 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-400">
                      💡 Try: "How to post car listing?" or "Garage registration"
                    </p>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}