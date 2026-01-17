import { useState } from 'react';
import { ArrowLeft, Search, Star, Eye, ThumbsUp, BookOpen, Filter, ChevronRight, Calendar, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { knowledgeBase, getKnowledgeBaseByCategory, searchKnowledgeBase, getPopularArticles, type KnowledgeBaseItem } from '../../utils/knowledgeBase';

interface FAQKnowledgeBasePageProps {
  onNavigate: (page: string) => void;
}

export function FAQKnowledgeBasePage({ onNavigate }: FAQKnowledgeBasePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseItem | null>(null);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📚', count: knowledgeBase.filter(item => item.isPublished).length },
    { id: 'Getting Started', name: 'Getting Started', icon: '🚀', count: getKnowledgeBaseByCategory('Getting Started').length },
    { id: 'Marketplace', name: 'Marketplace', icon: '🚗', count: getKnowledgeBaseByCategory('Marketplace').length },
    { id: 'Garage Hub', name: 'Garage Hub', icon: '🔧', count: getKnowledgeBaseByCategory('Garage Hub').length },
    { id: 'Repair Bid', name: 'Repair Bid', icon: '🛠️', count: getKnowledgeBaseByCategory('Repair Bid').length },
    { id: 'Boosts & Promotion', name: 'Boosts & Promotion', icon: '⚡', count: getKnowledgeBaseByCategory('Boosts & Promotion').length },
    { id: 'Payments & Billing', name: 'Payments & Billing', icon: '💳', count: getKnowledgeBaseByCategory('Payments & Billing').length },
    { id: 'Import Services', name: 'Import Services', icon: '🛳️', count: getKnowledgeBaseByCategory('Import Services').length }
  ];

  const popularArticles = getPopularArticles(6);

  const getFilteredArticles = () => {
    let articles = selectedCategory === 'all' 
      ? knowledgeBase.filter(item => item.isPublished)
      : getKnowledgeBaseByCategory(selectedCategory);

    if (searchQuery.trim()) {
      articles = searchKnowledgeBase(searchQuery);
    }

    return articles.sort((a, b) => b.priority - a.priority || b.views - a.views);
  };

  const handleArticleClick = (article: KnowledgeBaseItem) => {
    setSelectedArticle(article);
    // Update view count (in real app, this would be an API call)
    article.views += 1;
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-light-text)]">
        {/* Header */}
        <div className="bg-[var(--sublimes-card-bg)] border-b border-[var(--sublimes-border)] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 hover:bg-[var(--sublimes-dark-bg)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{selectedArticle.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {selectedArticle.lastUpdated}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedArticle.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{selectedArticle.helpful}% helpful</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <Badge className="bg-blue-500/10 text-blue-500">
                  {selectedArticle.category}
                </Badge>
                <div className="flex items-center space-x-2">
                  {selectedArticle.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {selectedArticle.content}
                </div>
              </div>
            </div>

            {/* Article Footer */}
            <div className="bg-[var(--sublimes-dark-bg)] border-t border-[var(--sublimes-border)] p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Was this article helpful?
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="text-green-500 border-green-500">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Yes
                  </Button>
                  <Button size="sm" variant="outline">
                    No
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-light-text)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <button
              onClick={() => onNavigate('legal-hub')}
              className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl opacity-90 mb-8">Find quick answers or chat with our AI assistant</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg bg-white text-black border-0"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold mb-2">{knowledgeBase.length}+</div>
              <div className="text-gray-400">Help Articles</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-gray-400">AI Support</div>
            </CardContent>
          </Card>

          <Card className="text-center bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-500" />
              </div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-gray-400">Resolution Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Star className="w-6 h-6 mr-2 text-[var(--sublimes-gold)]" />
            Popular Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]" onClick={() => handleArticleClick(article)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {article.views.toLocaleString()} views
                        </span>
                        <span className="text-sm text-green-500">
                          {article.helpful}% helpful
                        </span>
                      </div>
                      <h3 className="font-semibold hover:text-[var(--sublimes-gold)] transition-colors">
                        {article.title}
                      </h3>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Browse by Category */}
        <div>
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <span className="mr-3">📚</span>
            Browse by Category
          </h2>
          
          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.filter(cat => cat.id !== 'all').map((category) => (
              <Card 
                key={category.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{category.icon}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {category.count} articles
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-[var(--sublimes-gold)] transition-colors mb-2">
                        {category.name}
                      </h3>
                      <div className="space-y-1">
                        {getKnowledgeBaseByCategory(category.id).slice(0, 2).map((article) => (
                          <p key={article.id} className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                            {article.title}
                          </p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <button 
                        className="text-sm text-[var(--sublimes-gold)] hover:text-[var(--sublimes-gold)]/80 font-medium flex items-center group"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(category.id);
                        }}
                      >
                        View All
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Category Articles */}
          {selectedCategory !== 'all' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {categories.find(cat => cat.id === selectedCategory)?.name} Articles
                </h3>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory('all')}
                  className="border-[var(--sublimes-border)]"
                >
                  Show All Categories
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFilteredArticles().map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]" onClick={() => handleArticleClick(article)}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-blue-500/10 text-blue-500">
                            {article.category}
                          </Badge>
                          {article.priority === 1 && (
                            <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)]">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold group-hover:text-[var(--sublimes-gold)] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {article.content.substring(0, 100)}...
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{article.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{article.helpful}%</span>
                            </div>
                          </div>
                          <span>Updated {article.lastUpdated}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Can't find what you're looking for */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-[var(--sublimes-gold)]/10 to-blue-500/10 border-[var(--sublimes-gold)]/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Can't find what you're looking for?</h3>
              <p className="text-gray-400 mb-6">Chat with our AI assistant or contact our support team</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90">
                  Chat with Support
                </Button>
                <Button variant="outline" className="border-[var(--sublimes-border)]">
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}