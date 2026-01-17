/**
 * AdminLegalManagementPage - Manage Legal Documents and FAQ
 * For Brand Kit / Legal section in Admin
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  FileText, Shield, DollarSign, Info, HelpCircle, Save, 
  Eye, EyeOff, History, Plus, Trash2, Edit, Loader2 
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export function AdminLegalManagementPage() {
  const [activeTab, setActiveTab] = useState('documents');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    type: 'terms',
    title: '',
    content: '',
    is_published: false,
    meta_title: '',
    meta_description: ''
  });

  // FAQ States
  const [faqCategories, setFaqCategories] = useState<any[]>([]);
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchFAQData();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('type')
        .order('version', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const fetchFAQData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        supabase.from('faq_categories').select('*').order('display_order'),
        supabase.from('faq_items').select('*').order('display_order')
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setFaqCategories(categoriesRes.data || []);
      setFaqItems(itemsRes.data || []);
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
      toast.error('Failed to load FAQ data');
    }
  };

  const handleSaveDocument = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      if (selectedDoc?.id) {
        // Update existing
        const { error } = await supabase
          .from('legal_documents')
          .update({
            title: formData.title,
            content: formData.content,
            is_published: formData.is_published,
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            updated_by: user.id
          })
          .eq('id', selectedDoc.id);

        if (error) throw error;
        toast.success('Document updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('legal_documents')
          .insert({
            type: formData.type,
            title: formData.title,
            content: formData.content,
            is_published: formData.is_published,
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            created_by: user.id,
            updated_by: user.id
          });

        if (error) throw error;
        toast.success('Document created successfully!');
      }

      fetchDocuments();
      setEditMode(false);
      setSelectedDoc(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast.error(error.message || 'Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (docId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('legal_documents')
        .update({ is_published: !currentStatus })
        .eq('id', docId);

      if (error) throw error;
      
      toast.success(`Document ${!currentStatus ? 'published' : 'unpublished'}`);
      fetchDocuments();
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Failed to update document');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'terms',
      title: '',
      content: '',
      is_published: false,
      meta_title: '',
      meta_description: ''
    });
  };

  const loadDocument = (doc: any) => {
    setSelectedDoc(doc);
    setFormData({
      type: doc.type,
      title: doc.title,
      content: doc.content,
      is_published: doc.is_published,
      meta_title: doc.meta_title || '',
      meta_description: doc.meta_description || ''
    });
    setEditMode(true);
  };

  const documentTypes = [
    { value: 'terms', label: 'Terms of Service', icon: FileText, color: 'text-green-400' },
    { value: 'privacy', label: 'Privacy Policy', icon: Shield, color: 'text-purple-400' },
    { value: 'refund', label: 'Refund Policy', icon: DollarSign, color: 'text-orange-400' },
    { value: 'about', label: 'About Us', icon: Info, color: 'text-blue-400' }
  ];

  // Get published version for each type
  const getPublishedVersion = (type: string) => {
    return documents.find(doc => doc.type === type && doc.is_published);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#E8EAED] mb-2">Legal Content Management</h1>
          <p className="text-[#8B92A7]">
            Manage legal documents, FAQ, and support information
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1A2332]">
          <TabsTrigger value="documents">Legal Documents</TabsTrigger>
          <TabsTrigger value="faq">FAQ Management</TabsTrigger>
          <TabsTrigger value="support">Support Information</TabsTrigger>
        </TabsList>

        {/* Legal Documents Tab */}
        <TabsContent value="documents" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Documents List */}
            <div className="lg:col-span-1">
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {documentTypes.map((docType) => {
                    const Icon = docType.icon;
                    const publishedDoc = getPublishedVersion(docType.value);
                    
                    return (
                      <div
                        key={docType.value}
                        className="p-4 rounded-lg bg-[#1A2332] border border-[#2A3342]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${docType.color}`} />
                            <span className="text-sm text-[#E8EAED]">{docType.label}</span>
                          </div>
                          {publishedDoc ? (
                            <Badge className="bg-green-600 text-white text-xs">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-500 text-red-400 text-xs">
                              Draft
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => {
                              if (publishedDoc) {
                                loadDocument(publishedDoc);
                              } else {
                                setFormData({ ...formData, type: docType.value });
                                setEditMode(true);
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className="flex-1 border-[#2A3342] text-[#E8EAED]"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Editor */}
            <div className="lg:col-span-2">
              <Card className="bg-[#0F1829] border-[#1A2332]">
                <CardHeader>
                  <CardTitle className="text-[#E8EAED]">
                    {editMode ? 'Edit Document' : 'Select a document to edit'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-[#8B92A7] mb-2 block">Document Type</label>
                        <Input
                          value={documentTypes.find(dt => dt.value === formData.type)?.label}
                          disabled
                          className="bg-[#1A2332] border-[#2A3342] text-[#8B92A7]"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-[#8B92A7] mb-2 block">Title</label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Document title"
                          className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-[#8B92A7] mb-2 block">Content</label>
                        <Textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Document content in markdown or plain text"
                          rows={15}
                          className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED] font-mono text-sm"
                        />
                        <p className="text-xs text-[#8B92A7] mt-1">
                          Tip: Use double line breaks for paragraphs
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-[#8B92A7] mb-2 block">Meta Title (SEO)</label>
                          <Input
                            value={formData.meta_title}
                            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                            placeholder="SEO title"
                            className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-[#8B92A7] mb-2 block">Meta Description (SEO)</label>
                          <Input
                            value={formData.meta_description}
                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                            placeholder="SEO description"
                            className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="published"
                          checked={formData.is_published}
                          onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                          className="rounded"
                        />
                        <label htmlFor="published" className="text-sm text-[#E8EAED]">
                          Publish immediately
                        </label>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSaveDocument}
                          className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Document
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditMode(false);
                            setSelectedDoc(null);
                            resetForm();
                          }}
                          variant="outline"
                          className="border-[#2A3342] text-[#E8EAED]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-[#8B92A7] mx-auto mb-4" />
                      <p className="text-[#8B92A7]">
                        Select a document from the list to start editing
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* FAQ Management Tab */}
        <TabsContent value="faq" className="mt-6">
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-12 text-center">
              <HelpCircle className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="text-xl text-[#E8EAED] mb-2">FAQ Management</h3>
              <p className="text-[#8B92A7]">
                FAQ management interface coming soon. For now, manage FAQ items directly in the database.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Information Tab - Link to Brand Kit */}
        <TabsContent value="support" className="mt-6">
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-12 text-center">
              <Info className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="text-xl text-[#E8EAED] mb-2">Support Information</h3>
              <p className="text-[#8B92A7] mb-6">
                Support information (email, phone, response time) is managed in the Brand Kit page
              </p>
              <Button
                onClick={() => window.location.href = '/admin/brand-kit'}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
              >
                Go to Brand Kit
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
