import { useState } from 'react';
import { Mail, Plus, Edit, Trash2, Eye, Save, X, Copy, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  type: 'offer_purchase' | 'general_purchase' | 'redemption_confirmation';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Offer Purchase Confirmation',
    subject: 'Your Sublimes Drive Offer Purchase - {{offerTitle}}',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { background: #0B1426; color: #E8EAED; padding: 30px 20px; text-align: center; }
    .logo { color: #D4AF37; font-size: 28px; font-weight: bold; margin: 0; }
    .tagline { margin: 5px 0 0 0; font-size: 14px; }
    .content { padding: 30px 20px; background: #ffffff; color: #333; }
    .offer-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .purchase-code { background: #D4AF37; color: #0B1426; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-family: monospace; }
    .steps { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">Sublimes Drive</h1>
      <p class="tagline">Seamless Access</p>
    </div>
    
    <div class="content">
      <h2 style="color: #0B1426; margin-top: 0;">Thank you for your purchase!</h2>
      <p>Dear {{userName}},</p>
      <p>Your offer purchase has been confirmed successfully. Here are your purchase details:</p>
      
      <div class="offer-details">
        <h3 style="color: #D4AF37; margin-top: 0;">Offer Details</h3>
        <p><strong>Offer:</strong> {{offerTitle}}</p>
        <p><strong>Amount Paid:</strong> AED {{amount}}</p>
        <p><strong>Purchase Date:</strong> {{purchaseDate}}</p>
        <p><strong>Purchase Code:</strong> <span class="purchase-code">{{purchaseCode}}</span></p>
      </div>
      
      <div class="steps">
        <h3 style="color: #0B1426; margin-top: 0;">How to Redeem Your Offer</h3>
        <ol style="margin: 0; padding-left: 20px;">
          <li>Visit the service provider at their location</li>
          <li>Present your unique purchase code: <strong>{{purchaseCode}}</strong></li>
          <li>The provider will validate your code in their system</li>
          <li>Enjoy your discounted service!</li>
        </ol>
      </div>
      
      <p style="margin-top: 30px;">Thank you for choosing Sublimes Drive!</p>
      
      <p>Best regards,<br>The Sublimes Drive Team</p>
    </div>
    
    <div class="footer">
      <p>This email was sent to {{userEmail}}. If you have any questions, please contact our support team.</p>
      <p>© 2024 Sublimes Drive. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    variables: ['userName', 'offerTitle', 'amount', 'purchaseDate', 'purchaseCode', 'userEmail'],
    type: 'offer_purchase',
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    name: 'Offer Redemption Confirmation',
    subject: 'Offer Redeemed Successfully - {{offerTitle}}',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { background: #0B1426; color: #E8EAED; padding: 30px 20px; text-align: center; }
    .logo { color: #D4AF37; font-size: 28px; font-weight: bold; margin: 0; }
    .content { padding: 30px 20px; background: #ffffff; color: #333; }
    .success-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">Sublimes Drive</h1>
      <p class="tagline">Seamless Access</p>
    </div>
    
    <div class="content">
      <div class="success-badge">✓ Offer Redeemed Successfully</div>
      
      <h2 style="color: #0B1426;">Great news, {{userName}}!</h2>
      <p>Your offer has been successfully redeemed at the service provider.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #D4AF37; margin-top: 0;">Redemption Details</h3>
        <p><strong>Offer:</strong> {{offerTitle}}</p>
        <p><strong>Redeemed on:</strong> {{redemptionDate}}</p>
        <p><strong>Service Provider:</strong> {{providerName}}</p>
        <p><strong>Location:</strong> {{providerLocation}}</p>
      </div>
      
      <p>We hope you enjoyed the service! Please consider leaving a review.</p>
      
      <p>Thank you for using Sublimes Drive!</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Sublimes Drive. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    variables: ['userName', 'offerTitle', 'redemptionDate', 'providerName', 'providerLocation'],
    type: 'redemption_confirmation',
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  }
];

export function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state for creating/editing templates
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    type: 'offer_purchase' as EmailTemplate['type'],
    variables: [] as string[],
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.htmlContent) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      ...templateForm,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTemplates(prev => [...prev, newTemplate]);
    toast.success('Email template created successfully');
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return;

    const updatedTemplate = {
      ...selectedTemplate,
      ...templateForm,
      updatedAt: new Date(),
    };

    setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
    toast.success('Email template updated successfully');
    setIsEditModalOpen(false);
    setSelectedTemplate(null);
    resetForm();
  };

  const handleDeleteTemplate = (template: EmailTemplate) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      toast.success('Email template deleted successfully');
    }
  };

  const handleToggleStatus = (template: EmailTemplate) => {
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, isActive: !t.isActive, updatedAt: new Date() } : t
    ));
    toast.success(`Template ${template.isActive ? 'deactivated' : 'activated'}`);
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      htmlContent: '',
      type: 'offer_purchase',
      variables: [],
    });
  };

  const openEditModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      type: template.type,
      variables: template.variables,
    });
    setIsEditModalOpen(true);
  };

  const openPreviewModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const sendTestEmail = async (template: EmailTemplate) => {
    toast.loading('Sending test email...');
    
    // Simulate sending test email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.dismiss();
    toast.success('Test email sent successfully!');
  };

  const extractVariables = (content: string): string[] => {
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;
    
    while ((match = variablePattern.exec(content)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  };

  const handleContentChange = (content: string) => {
    setTemplateForm(prev => ({
      ...prev,
      htmlContent: content,
      variables: extractVariables(content + prev.subject),
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setTemplateForm(prev => ({
      ...prev,
      subject,
      variables: extractVariables(prev.htmlContent + subject),
    }));
  };

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Email Template Manager</h1>
            <p className="text-gray-400 mt-1">Design and manage email templates for offers and purchases</p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search templates by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              <SelectItem value="offer_purchase">Offer Purchase</SelectItem>
              <SelectItem value="general_purchase">General Purchase</SelectItem>
              <SelectItem value="redemption_confirmation">Redemption</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-[var(--sublimes-light-text)] text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">{template.subject}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={template.isActive ? "default" : "secondary"}
                    className={template.isActive ? "bg-green-500" : "bg-gray-500"}
                  >
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {template.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Variables:</span>
                    <span className="text-[var(--sublimes-light-text)]">{template.variables.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.variables.slice(0, 3).map((variable, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {template.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.variables.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  <div>Created: {template.createdAt.toLocaleDateString()}</div>
                  <div>Updated: {template.updatedAt.toLocaleDateString()}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPreviewModal(template)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendTestEmail(template)}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Test
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:bg-blue-500/10"
                    onClick={() => openEditModal(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${template.isActive ? 'text-orange-500 hover:bg-orange-500/10' : 'text-green-500 hover:bg-green-500/10'}`}
                    onClick={() => handleToggleStatus(template)}
                  >
                    {template.isActive ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDeleteTemplate(template)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">No templates found</h3>
          <p className="text-gray-400">Create your first email template to get started.</p>
        </div>
      )}

      {/* Create/Edit Template Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedTemplate(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">
              {isCreateModalOpen ? 'Create New Template' : 'Edit Template'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Template Name *
                </label>
                <Input
                  placeholder="e.g., Offer Purchase Confirmation"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Template Type *
                </label>
                <Select 
                  value={templateForm.type} 
                  onValueChange={(value) => setTemplateForm(prev => ({ ...prev, type: value as EmailTemplate['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offer_purchase">Offer Purchase</SelectItem>
                    <SelectItem value="general_purchase">General Purchase</SelectItem>
                    <SelectItem value="redemption_confirmation">Redemption Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                Email Subject *
              </label>
              <Input
                placeholder="e.g., Your Sublimes Drive Offer Purchase - {{offerTitle}}"
                value={templateForm.subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                HTML Content *
              </label>
              <Textarea
                rows={20}
                placeholder="Enter your HTML email template here..."
                value={templateForm.htmlContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {templateForm.variables.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Detected Variables
                </label>
                <div className="flex flex-wrap gap-2">
                  {templateForm.variables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 pt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
                onClick={isCreateModalOpen ? handleCreateTemplate : handleUpdateTemplate}
              >
                <Save className="w-4 h-4 mr-2" />
                {isCreateModalOpen ? 'Create Template' : 'Update Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">
              Preview: {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-[var(--sublimes-light-text)] mb-2">Subject:</h4>
                <div className="bg-[var(--sublimes-card-bg)] p-3 rounded border border-[var(--sublimes-border)]">
                  {selectedTemplate.subject}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-[var(--sublimes-light-text)] mb-2">HTML Preview:</h4>
                <div 
                  className="bg-white p-4 rounded border max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}