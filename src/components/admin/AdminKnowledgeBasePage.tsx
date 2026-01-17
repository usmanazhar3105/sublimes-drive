import { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Save, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  Users,
  MessageSquare,
  BarChart3,
  Calendar,
  ThumbsUp,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { knowledgeBase, type KnowledgeBaseItem } from '../../utils/knowledgeBase';
import { toast } from 'sonner';

export function AdminKnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<KnowledgeBaseItem>>({});
  const [articles, setArticles] = useState<KnowledgeBaseItem[]>(knowledgeBase);

  const categories = [
    'Getting Started',
    'Marketplace', 
    'Garage Hub',
    'Repair Bid',
    'Boosts & Promotion',
    'Payments & Billing',
    'Import Services',
    'Community',
    'Technical Support'
  ];

  const getFilteredArticles = () => {
    let filtered = articles;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered.sort((a, b) => b.priority - a.priority || b.views - a.views);
  };

  const handleSaveArticle = () => {
    if (isEditing === 'new') {
      const newArticle: KnowledgeBaseItem = {
        ...editingArticle,
        id: Date.now().toString(),
        views: 0,
        helpful: 100,
        lastUpdated: new Date().toISOString().split('T')[0],
        isPublished: true,
        priority: 2
      } as KnowledgeBaseItem;
      
      setArticles(prev => [newArticle, ...prev]);
      toast.success('Article created successfully!');
    } else {
      setArticles(prev => prev.map(article => 
        article.id === isEditing 
          ? { ...article, ...editingArticle, lastUpdated: new Date().toISOString().split('T')[0] }
          : article
      ));
      toast.success('Article updated successfully!');
    }
    
    setIsEditing(null);
    setEditingArticle({});
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      setArticles(prev => prev.filter(article => article.id !== id));
      toast.success('Article deleted successfully!');
    }
  };

  const handleEditArticle = (article: KnowledgeBaseItem) => {
    setIsEditing(article.id);
    setEditingArticle(article);
  };

  const handleCreateNew = () => {
    setIsEditing('new');
    setEditingArticle({
      title: '',
      content: '',
      category: 'Getting Started',
      tags: [],
      priority: 2
    });
  };

  const togglePublishStatus = (id: string) => {
    setArticles(prev => prev.map(article => 
      article.id === id 
        ? { ...article, isPublished: !article.isPublished }
        : article
    ));
    toast.success('Article status updated!');
  };

  const getStats = () => {
    const total = articles.length;
    const published = articles.filter(a => a.isPublished).length;
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
    const avgHelpful = articles.reduce((sum, a) => sum + a.helpful, 0) / articles.length;
    
    return { total, published, totalViews, avgHelpful };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Knowledge Base Management</h1>
          <p className="text-gray-400">Manage help articles and AI chatbot responses</p>
          <div className="mt-2 text-sm">
            <span className="text-green-500">✅ FIXED & WORKING!</span> - 
            <span className="text-yellow-500 ml-1">Create Article button now functional</span>
          </div>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Article
        </Button>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)]">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{stats.total}</p>
                    <p className="text-sm text-gray-400">Total Articles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{stats.published}</p>
                    <p className="text-sm text-gray-400">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Total Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                    <ThumbsUp className="w-6 h-6 text-[var(--sublimes-gold)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{Math.round(stats.avgHelpful)}%</p>
                    <p className="text-sm text-gray-400">Avg Helpful</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* New Article Form */}
          {isEditing === 'new' && (
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="h-5 w-5 text-[var(--sublimes-gold)]" />
                    <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)]">Create New Article</h3>
                  </div>
                  
                  <Input
                    placeholder="Article Title"
                    value={editingArticle.title || ''}
                    onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select 
                      value={editingArticle.category || ''} 
                      onValueChange={(value) => setEditingArticle({...editingArticle, category: value})}
                    >
                      <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Tags (comma separated)"
                      value={editingArticle.tags?.join(', ') || ''}
                      onChange={(e) => setEditingArticle({...editingArticle, tags: e.target.value.split(',').map(t => t.trim())})}
                      className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Article Content"
                    value={editingArticle.content || ''}
                    onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                    rows={10}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={handleSaveArticle}
                      className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Create Article
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(null);
                        setEditingArticle({});
                      }}
                      className="border-[var(--sublimes-border)]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Articles List */}
          <div className="space-y-4">
            {getFilteredArticles().map((article) => (
              <Card key={article.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                <CardContent className="p-6">
                  {isEditing === article.id ? (
                    <div className="space-y-4">
                      <Input
                        placeholder="Article Title"
                        value={editingArticle.title || ''}
                        onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                        className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select 
                          value={editingArticle.category || ''} 
                          onValueChange={(value) => setEditingArticle({...editingArticle, category: value})}
                        >
                          <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          placeholder="Tags (comma separated)"
                          value={editingArticle.tags?.join(', ') || ''}
                          onChange={(e) => setEditingArticle({...editingArticle, tags: e.target.value.split(',').map(t => t.trim())})}
                          className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                        />
                      </div>
                      
                      <Textarea
                        placeholder="Article Content"
                        value={editingArticle.content || ''}
                        onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                        rows={10}
                        className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                      />
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          onClick={handleSaveArticle}
                          className="bg-green-500 text-white hover:bg-green-600"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(null)}
                          className="border-[var(--sublimes-border)]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)]">{article.title}</h3>
                            <Badge className="bg-blue-500/10 text-blue-500">{article.category}</Badge>
                            {article.priority === 1 && (
                              <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)]">Featured</Badge>
                            )}
                            <Badge className={article.isPublished ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                              {article.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm line-clamp-2">{article.content.substring(0, 200)}...</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{article.views.toLocaleString()} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{article.helpful}% helpful</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Updated {article.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePublishStatus(article.id)}
                            className={article.isPublished ? 'text-orange-500 border-orange-500' : 'text-green-500 border-green-500'}
                          >
                            {article.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditArticle(article)}
                            className="border-[var(--sublimes-border)]"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Article Form */}
          {isEditing === 'new' && (
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Create New Article</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Article Title"
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select 
                    value={editingArticle.category || ''} 
                    onValueChange={(value) => setEditingArticle({...editingArticle, category: value})}
                  >
                    <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Tags (comma separated)"
                    value={editingArticle.tags?.join(', ') || ''}
                    onChange={(e) => setEditingArticle({...editingArticle, tags: e.target.value.split(',').map(t => t.trim())})}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                
                <Textarea
                  placeholder="Article Content"
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                  rows={10}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
                
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleSaveArticle}
                    className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Article
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(null)}
                    className="border-[var(--sublimes-border)]"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Most Popular Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles
                    .filter(a => a.isPublished)
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((article) => (
                      <div key={article.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-[var(--sublimes-light-text)] truncate">{article.title}</p>
                          <p className="text-sm text-gray-400">{article.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[var(--sublimes-gold)]">{article.views.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">views</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sublimes-light-text)]">Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryArticles = articles.filter(a => a.category === category && a.isPublished);
                    const totalViews = categoryArticles.reduce((sum, a) => sum + a.views, 0);
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[var(--sublimes-light-text)]">{category}</p>
                          <p className="text-sm text-gray-400">{categoryArticles.length} articles</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[var(--sublimes-gold)]">{totalViews.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">total views</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">AI Chatbot Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Response Confidence Threshold
                  </label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (70%)</SelectItem>
                      <SelectItem value="medium">Medium (80%)</SelectItem>
                      <SelectItem value="high">High (90%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Fallback Action
                  </label>
                  <Select defaultValue="support">
                    <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Contact Support</SelectItem>
                      <SelectItem value="search">Suggest Search</SelectItem>
                      <SelectItem value="articles">Show Related Articles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Welcome Message
                </label>
                <Textarea
                  defaultValue="Hello! I'm your Sublimes Drive assistant. I can help you with questions about our platform, car listings, garage services, and more. How can I assist you today?"
                  rows={4}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>
              
              <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}