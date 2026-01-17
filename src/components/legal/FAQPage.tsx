/**
 * FAQPage - FAQ & Help Center with database wiring
 * Fetches FAQ categories and items from database
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  ArrowLeft, Search, HelpCircle, ChevronDown, ChevronUp, 
  ThumbsUp, ThumbsDown, Loader2, Mail 
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface FAQPageProps {
  onNavigate?: (page: string) => void;
}

interface FAQCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
}

interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  is_featured: boolean;
  view_count: number;
  helpful_count: number;
}

export function FAQPage({ onNavigate }: FAQPageProps) {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FAQItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [faqItems, selectedCategory, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('faq_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch FAQ items
      const { data: itemsData, error: itemsError } = await supabase
        .from('faq_items')
        .select('*')
        .eq('is_published', true)
        .order('display_order');

      if (itemsError) throw itemsError;
      setFaqItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
      toast.error('Failed to load FAQ data');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = faqItems;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
      // Track view
      trackView(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const trackView = async (itemId: string) => {
    try {
      // Increment view count
      const { error } = await supabase
        .from('faq_items')
        .update({ view_count: supabase.sql`view_count + 1` })
        .eq('id', itemId);

      if (error) console.error('Error tracking view:', error);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleFeedback = async (itemId: string, wasHelpful: boolean) => {
    // Check if already given feedback
    if (feedbackGiven.has(itemId)) {
      toast.info('You have already submitted feedback for this question');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to provide feedback');
        return;
      }

      // Insert feedback
      const { error } = await supabase
        .from('faq_feedback')
        .insert({
          faq_item_id: itemId,
          user_id: user.id,
          was_helpful: wasHelpful
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info('You have already submitted feedback for this question');
        } else {
          throw error;
        }
        return;
      }

      // Update local state
      setFeedbackGiven(new Set([...feedbackGiven, itemId]));

      // Update helpful count if positive
      if (wasHelpful) {
        const { error: updateError } = await supabase
          .from('faq_items')
          .update({ helpful_count: supabase.sql`helpful_count + 1` })
          .eq('id', itemId);

        if (updateError) console.error('Error updating helpful count:', updateError);
      }

      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const featuredItems = faqItems.filter(item => item.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-[#8B92A7]">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => onNavigate?.('profile')}
            variant="ghost"
            className="text-[#8B92A7] hover:text-[#E8EAED] mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <div className="text-center mb-8">
            <div className="bg-[#D4AF37]/20 p-4 rounded-full inline-block mb-4">
              <HelpCircle className="h-12 w-12 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl text-[#E8EAED] mb-4">FAQ & Help Center</h1>
            <p className="text-[#8B92A7] max-w-2xl mx-auto">
              Find answers to common questions about Sublimes Drive
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B92A7]" />
            <Input
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-[#1A2332] border-[#2A3342] text-[#E8EAED] h-12"
            />
          </div>
        </div>

        {/* Featured Questions */}
        {featuredItems.length > 0 && !searchQuery && !selectedCategory && (
          <Card className="bg-gradient-to-br from-[#D4AF37]/10 to-[#1A2332] border-[#D4AF37]/30 mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl text-[#E8EAED] mb-4">Popular Questions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredItems.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="text-left p-4 rounded-lg bg-[#1A2332]/50 hover:bg-[#2A3342] border border-[#2A3342] transition-all"
                  >
                    <p className="text-sm text-[#E8EAED]">{item.question}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-[#0F1829] border-[#1A2332] sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-[#E8EAED] mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? 'bg-[#D4AF37] text-[#0B1426]'
                        : 'bg-[#1A2332] text-[#E8EAED] hover:bg-[#2A3342]'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'bg-[#D4AF37] text-[#0B1426]'
                          : 'bg-[#1A2332] text-[#E8EAED] hover:bg-[#2A3342]'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Items */}
          <div className="lg:col-span-3 space-y-4">
            {filteredItems.length === 0 ? (
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="h-16 w-16 text-[#8B92A7] mx-auto mb-4" />
                  <h3 className="text-xl text-[#E8EAED] mb-2">No questions found</h3>
                  <p className="text-[#8B92A7] mb-6">
                    Try adjusting your search or category filter
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                    variant="outline"
                    className="border-[#2A3342] text-[#E8EAED]"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="bg-[#0F1829] border-[#1A2332]">
                  <CardContent className="p-6">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-start justify-between text-left"
                    >
                      <div className="flex-1">
                        <h4 className="text-lg text-[#E8EAED] mb-2">{item.question}</h4>
                        {item.is_featured && (
                          <Badge className="bg-[#D4AF37] text-[#0B1426]">Popular</Badge>
                        )}
                      </div>
                      {expandedItems.has(item.id) ? (
                        <ChevronUp className="h-5 w-5 text-[#8B92A7] flex-shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#8B92A7] flex-shrink-0 ml-4" />
                      )}
                    </button>

                    {expandedItems.has(item.id) && (
                      <div className="mt-4 pt-4 border-t border-[#2A3342]">
                        <p className="text-[#E8EAED] leading-relaxed mb-4 whitespace-pre-wrap">
                          {item.answer}
                        </p>

                        {/* Feedback */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#8B92A7]">Was this helpful?</span>
                            <Button
                              onClick={() => handleFeedback(item.id, true)}
                              variant="ghost"
                              size="sm"
                              className={`text-[#8B92A7] hover:text-green-400 ${
                                feedbackGiven.has(item.id) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={feedbackGiven.has(item.id)}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleFeedback(item.id, false)}
                              variant="ghost"
                              size="sm"
                              className={`text-[#8B92A7] hover:text-red-400 ${
                                feedbackGiven.has(item.id) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={feedbackGiven.has(item.id)}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-[#8B92A7]">
                            {item.helpful_count} people found this helpful
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-[#0F1829] border-[#1A2332] mt-8">
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-xl text-[#E8EAED] mb-2">Still need help?</h3>
            <p className="text-[#8B92A7] mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <Button
              onClick={() => window.open('mailto:support@sublimesdrive.com', '_blank')}
              className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
