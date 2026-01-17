// =====================================================
// ADMIN TRANSLATION MANAGEMENT INTERFACE
// =====================================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  RefreshCw, 
  Download, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Globe,
  Languages
} from 'lucide-react';

interface TranslationItem {
  id: string;
  entity_type: 'posts' | 'listings' | 'comments' | 'messages';
  entity_id: string;
  original_text: string;
  original_lang: string;
  translations: {
    [key: string]: {
      text: string;
      status: 'pending' | 'ready' | 'failed' | 'locked';
      updated_at: string;
    };
  };
  content_rev: number;
  created_at: string;
  updated_at: string;
}

interface TranslationStats {
  total_items: number;
  pending_translations: number;
  ready_translations: number;
  failed_translations: number;
  locked_translations: number;
  by_language: {
    [key: string]: {
      pending: number;
      ready: number;
      failed: number;
    };
  };
}

export function TranslationManagement() {
  const { t } = useLanguage();
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Load translation data
  const loadTranslations = async () => {
    setLoading(true);
    try {
      // This would be replaced with actual API calls
      // const data = await fetchTranslations({ entity: selectedEntity, status: selectedStatus });
      // setTranslations(data);
      
      // Mock data for now
      setTranslations([]);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load translation statistics
  const loadStats = async () => {
    try {
      // This would be replaced with actual API calls
      // const data = await fetchTranslationStats();
      // setStats(data);
      
      // Mock data for now
      setStats({
        total_items: 1250,
        pending_translations: 45,
        ready_translations: 1180,
        failed_translations: 20,
        locked_translations: 5,
        by_language: {
          ar: { pending: 25, ready: 590, failed: 10 },
          zh: { pending: 20, ready: 590, failed: 10 }
        }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadTranslations();
    loadStats();
  }, [selectedEntity, selectedStatus, selectedLanguage]);

  const getStatusBadge = (status: string) => {
    const variants = {
      ready: 'default',
      pending: 'secondary',
      failed: 'destructive',
      locked: 'outline'
    } as const;

    const icons = {
      ready: CheckCircle,
      pending: Clock,
      failed: XCircle,
      locked: AlertTriangle
    } as const;

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleRetryTranslation = async (item: TranslationItem, targetLang: string) => {
    try {
      // This would trigger a retry of the translation
      console.log('Retrying translation for:', item.id, targetLang);
      await loadTranslations();
    } catch (error) {
      console.error('Error retrying translation:', error);
    }
  };

  const handleLockTranslation = async (item: TranslationItem, targetLang: string) => {
    try {
      // This would lock the translation to prevent overwriting
      console.log('Locking translation for:', item.id, targetLang);
      await loadTranslations();
    } catch (error) {
      console.error('Error locking translation:', error);
    }
  };

  const handleBulkRetry = async () => {
    try {
      // This would retry all failed translations
      console.log('Bulk retry failed translations');
      await loadTranslations();
    } catch (error) {
      console.error('Error in bulk retry:', error);
    }
  };

  const handleExportTranslations = async () => {
    try {
      // This would export translations for external review
      console.log('Exporting translations');
    } catch (error) {
      console.error('Error exporting translations:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.translationManagement')}</h1>
          <p className="text-muted-foreground">
            Manage and monitor content translations across all languages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTranslations}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleBulkRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Failed
          </Button>
          <Button onClick={loadTranslations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{stats.total_items.toLocaleString()}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ready</p>
                  <p className="text-2xl font-bold text-green-600">{stats.ready_translations}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending_translations}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed_translations}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Locked</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.locked_translations}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search translations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
                <SelectItem value="listings">Listings</SelectItem>
                <SelectItem value="comments">Comments</SelectItem>
                <SelectItem value="messages">Messages</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Translation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading translations...
            </div>
          ) : translations.length === 0 ? (
            <div className="text-center py-8">
              <Languages className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No translations found</h3>
              <p className="text-muted-foreground">
                No translations match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {translations.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{item.entity_type}</Badge>
                          <Badge variant="secondary">Rev {item.content_rev}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.original_lang.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium mb-2">
                          {item.original_text.length > 100 
                            ? `${item.original_text.substring(0, 100)}...`
                            : item.original_text
                          }
                        </p>
                        
                        <div className="flex gap-2">
                          {Object.entries(item.translations).map(([lang, translation]) => (
                            <div key={lang} className="flex items-center gap-2">
                              <span className="text-xs font-medium">{lang.toUpperCase()}</span>
                              {getStatusBadge(translation.status)}
                              {translation.status === 'failed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRetryTranslation(item, lang)}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              )}
                              {translation.status === 'ready' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleLockTranslation(item, lang)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
