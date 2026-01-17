import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Mail, 
  Send, 
  BarChart3, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Pause,
  CheckCircle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface EmailSender {
  id: string;
  name: string;
  email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_secure: boolean;
  is_active: boolean;
  is_default: boolean;
}

interface EmailTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  subject_template: string;
  html_template: string;
  text_template: string;
  variables: Record<string, string>;
  is_active: boolean;
  is_system: boolean;
}

interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  sender_id: string;
  template_id: string;
  subject: string;
  html_content: string;
  text_content: string;
  audience_filter: Record<string, any>;
  status: 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'failed' | 'cancelled';
  schedule_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface AudienceFilter {
  roles?: string[];
  user_types?: string[];
  car_brands?: string[];
  garage_types?: string[];
  listing_types?: string[];
  locations?: string[];
  registration_date_from?: string;
  registration_date_to?: string;
  last_active_from?: string;
  last_active_to?: string;
  xp_points_min?: number;
  xp_points_max?: number;
  is_verified?: boolean;
  is_premium?: boolean;
  has_listings?: boolean;
  has_garage?: boolean;
  custom_filters?: Record<string, any>;
}

export function AdminEmailManagementEnhanced() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [senders, setSenders] = useState<EmailSender[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isSenderOpen, setIsSenderOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingSender, setEditingSender] = useState<EmailSender | null>(null);

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    sender_id: '',
    template_id: '',
    subject: '',
    html_content: '',
    text_content: '',
    audience_filter: {} as AudienceFilter,
    schedule_at: '',
    status: 'draft' as const
  });

  const [templateForm, setTemplateForm] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    subject_template: '',
    html_template: '',
    text_template: '',
    variables: {} as Record<string, string>,
    is_active: true
  });

  const [senderForm, setSenderForm] = useState({
    name: '',
    email: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_secure: false,
    is_active: true,
    is_default: false
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load senders, templates, and campaigns
      const [sendersRes, templatesRes, campaignsRes] = await Promise.all([
        fetch('/api/admin/email-senders'),
        fetch('/api/admin/email-templates'),
        fetch('/api/admin/email-campaigns')
      ]);

      if (sendersRes.ok) setSenders(await sendersRes.json());
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  // Campaign handlers
  const handleCreateCampaign = async () => {
    try {
      const response = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm)
      });

      if (response.ok) {
        toast.success('Campaign created successfully');
        setIsCreateOpen(false);
        resetCampaignForm();
        loadData();
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return;

    try {
      const response = await fetch(`/api/admin/email-campaigns/${editingCampaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm)
      });

      if (response.ok) {
        toast.success('Campaign updated successfully');
        setEditingCampaign(null);
        resetCampaignForm();
        loadData();
      } else {
        throw new Error('Failed to update campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await fetch(`/api/admin/email-campaigns/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Campaign deleted successfully');
        loadData();
      } else {
        throw new Error('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/email-campaigns/${id}/send`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Campaign sent successfully');
        loadData();
      } else {
        throw new Error('Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/email-campaigns/${id}/pause`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Campaign paused successfully');
        loadData();
      } else {
        throw new Error('Failed to pause campaign');
      }
    } catch (error) {
      console.error('Error pausing campaign:', error);
      toast.error('Failed to pause campaign');
    }
  };

  // Template handlers
  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      });

      if (response.ok) {
        toast.success('Template created successfully');
        setIsTemplateOpen(false);
        resetTemplateForm();
        loadData();
      } else {
        throw new Error('Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const response = await fetch(`/api/admin/email-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      });

      if (response.ok) {
        toast.success('Template updated successfully');
        setEditingTemplate(null);
        resetTemplateForm();
        loadData();
      } else {
        throw new Error('Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Template deleted successfully');
        loadData();
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  // Sender handlers
  const handleCreateSender = async () => {
    try {
      const response = await fetch('/api/admin/email-senders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(senderForm)
      });

      if (response.ok) {
        toast.success('Sender created successfully');
        setIsSenderOpen(false);
        resetSenderForm();
        loadData();
      } else {
        throw new Error('Failed to create sender');
      }
    } catch (error) {
      console.error('Error creating sender:', error);
      toast.error('Failed to create sender');
    }
  };

  const handleUpdateSender = async () => {
    if (!editingSender) return;

    try {
      const response = await fetch(`/api/admin/email-senders/${editingSender.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(senderForm)
      });

      if (response.ok) {
        toast.success('Sender updated successfully');
        setEditingSender(null);
        resetSenderForm();
        loadData();
      } else {
        throw new Error('Failed to update sender');
      }
    } catch (error) {
      console.error('Error updating sender:', error);
      toast.error('Failed to update sender');
    }
  };

  const handleDeleteSender = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sender?')) return;

    try {
      const response = await fetch(`/api/admin/email-senders/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Sender deleted successfully');
        loadData();
      } else {
        throw new Error('Failed to delete sender');
      }
    } catch (error) {
      console.error('Error deleting sender:', error);
      toast.error('Failed to delete sender');
    }
  };

  // Form resets
  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      sender_id: '',
      template_id: '',
      subject: '',
      html_content: '',
      text_content: '',
      audience_filter: {},
      schedule_at: '',
      status: 'draft'
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      code: '',
      name: '',
      description: '',
      category: '',
      subject_template: '',
      html_template: '',
      text_template: '',
      variables: {},
      is_active: true
    });
  };

  const resetSenderForm = () => {
    setSenderForm({
      name: '',
      email: '',
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      smtp_secure: false,
      is_active: true,
      is_default: false
    });
  };

  // Audience filter component
  const AudienceFilterComponent = ({ filter, onChange }: { filter: AudienceFilter; onChange: (filter: AudienceFilter) => void }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>User Roles</Label>
          <Select onValueChange={(value) => onChange({ ...filter, roles: value ? [value] : [] })}>
            <SelectTrigger>
              <SelectValue placeholder="Select roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="car_browser">Car Browser</SelectItem>
              <SelectItem value="car_owner">Car Owner</SelectItem>
              <SelectItem value="garage_owner">Garage Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>User Types</Label>
          <Select onValueChange={(value) => onChange({ ...filter, user_types: value ? [value] : [] })}>
            <SelectTrigger>
              <SelectValue placeholder="Select types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="garage">Garage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Car Brands</Label>
          <Select onValueChange={(value) => onChange({ ...filter, car_brands: value ? [value] : [] })}>
            <SelectTrigger>
              <SelectValue placeholder="Select brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              <SelectItem value="BMW">BMW</SelectItem>
              <SelectItem value="Mercedes">Mercedes</SelectItem>
              <SelectItem value="Audi">Audi</SelectItem>
              <SelectItem value="Toyota">Toyota</SelectItem>
              <SelectItem value="BYD">BYD</SelectItem>
              <SelectItem value="Geely">Geely</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Locations</Label>
          <Select onValueChange={(value) => onChange({ ...filter, locations: value ? [value] : [] })}>
            <SelectTrigger>
              <SelectValue placeholder="Select locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Dubai">Dubai</SelectItem>
              <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
              <SelectItem value="Sharjah">Sharjah</SelectItem>
              <SelectItem value="Ajman">Ajman</SelectItem>
              <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
              <SelectItem value="Fujairah">Fujairah</SelectItem>
              <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>XP Points Range</Label>
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Min XP" 
              value={filter.xp_points_min || ''} 
              onChange={(e) => onChange({ ...filter, xp_points_min: parseInt(e.target.value) || undefined })}
            />
            <Input 
              type="number" 
              placeholder="Max XP" 
              value={filter.xp_points_max || ''} 
              onChange={(e) => onChange({ ...filter, xp_points_max: parseInt(e.target.value) || undefined })}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="verified" 
              checked={filter.is_verified || false}
              onCheckedChange={(checked) => onChange({ ...filter, is_verified: checked })}
            />
            <Label htmlFor="verified">Verified Users Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="premium" 
              checked={filter.is_premium || false}
              onCheckedChange={(checked) => onChange({ ...filter, is_premium: checked })}
            />
            <Label htmlFor="premium">Premium Users Only</Label>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sublimes-gold)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Email Management</h1>
          <p className="text-gray-400">Manage email campaigns, templates, and senders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
          <Button onClick={() => setIsTemplateOpen(true)} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            New Template
          </Button>
          <Button onClick={() => setIsSenderOpen(true)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            New Sender
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="senders">Senders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          campaign.status === 'completed' ? 'default' :
                          campaign.status === 'sending' ? 'secondary' :
                          campaign.status === 'failed' ? 'destructive' :
                          'outline'
                        }>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{templates.find(t => t.id === campaign.template_id)?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {campaign.schedule_at ? new Date(campaign.schedule_at).toLocaleDateString() : 'Immediate'}
                      </TableCell>
                      <TableCell>{campaign.total_recipients}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingCampaign(campaign)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCampaign(campaign)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {campaign.status === 'draft' && (
                            <Button size="sm" onClick={() => handleSendCampaign(campaign.id)}>
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          {campaign.status === 'sending' && (
                            <Button size="sm" variant="outline" onClick={() => handlePauseCampaign(campaign.id)}>
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteCampaign(campaign.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>{template.code}</TableCell>
                      <TableCell>
                        <Badge variant={template.is_active ? 'default' : 'outline'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingTemplate(template)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingTemplate(template)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!template.is_system && (
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteTemplate(template.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="senders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Email Senders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>SMTP Host</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senders.map((sender) => (
                    <TableRow key={sender.id}>
                      <TableCell className="font-medium">{sender.name}</TableCell>
                      <TableCell>{sender.email}</TableCell>
                      <TableCell>{sender.smtp_host}</TableCell>
                      <TableCell>
                        <Badge variant={sender.is_active ? 'default' : 'outline'}>
                          {sender.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sender.is_default && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingSender(sender)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteSender(sender.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <p className="text-xs text-muted-foreground">
                  {campaigns.filter(c => c.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.sent_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Emails delivered
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.length > 0 ? 
                    Math.round((campaigns.reduce((sum, c) => sum + c.opened_count, 0) / 
                    campaigns.reduce((sum, c) => sum + c.sent_count, 0)) * 100) || 0 : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average open rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <Label htmlFor="campaign-sender">Sender</Label>
                <Select onValueChange={(value) => setCampaignForm({ ...campaignForm, sender_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sender" />
                  </SelectTrigger>
                  <SelectContent>
                    {senders.map((sender) => (
                      <SelectItem key={sender.id} value={sender.id}>
                        {sender.name} ({sender.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="campaign-description">Description</Label>
              <Textarea
                id="campaign-description"
                value={campaignForm.description}
                onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                placeholder="Enter campaign description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaign-template">Template</Label>
                <Select onValueChange={(value) => setCampaignForm({ ...campaignForm, template_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="campaign-schedule">Schedule At</Label>
                <Input
                  id="campaign-schedule"
                  type="datetime-local"
                  value={campaignForm.schedule_at}
                  onChange={(e) => setCampaignForm({ ...campaignForm, schedule_at: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="campaign-subject">Subject</Label>
              <Input
                id="campaign-subject"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <Label>Audience Filter</Label>
              <AudienceFilterComponent 
                filter={campaignForm.audience_filter} 
                onChange={(filter) => setCampaignForm({ ...campaignForm, audience_filter: filter })}
              />
            </div>

            <div>
              <Label htmlFor="campaign-html">HTML Content</Label>
              <Textarea
                id="campaign-html"
                value={campaignForm.html_content}
                onChange={(e) => setCampaignForm({ ...campaignForm, html_content: e.target.value })}
                placeholder="Enter HTML content"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="campaign-text">Text Content</Label>
              <Textarea
                id="campaign-text"
                value={campaignForm.text_content}
                onChange={(e) => setCampaignForm({ ...campaignForm, text_content: e.target.value })}
                placeholder="Enter text content"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-code">Template Code</Label>
                <Input
                  id="template-code"
                  value={templateForm.code}
                  onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                  placeholder="e.g., welcome, transaction_success"
                />
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="transaction">Transaction</SelectItem>
                    <SelectItem value="listing">Listing</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>

            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                placeholder="Enter template description"
              />
            </div>

            <div>
              <Label htmlFor="template-subject">Subject Template</Label>
              <Input
                id="template-subject"
                value={templateForm.subject_template}
                onChange={(e) => setTemplateForm({ ...templateForm, subject_template: e.target.value })}
                placeholder="e.g., Welcome {{user_name}}!"
              />
            </div>

            <div>
              <Label htmlFor="template-html">HTML Template</Label>
              <Textarea
                id="template-html"
                value={templateForm.html_template}
                onChange={(e) => setTemplateForm({ ...templateForm, html_template: e.target.value })}
                placeholder="Enter HTML template"
                rows={8}
              />
            </div>

            <div>
              <Label htmlFor="template-text">Text Template</Label>
              <Textarea
                id="template-text"
                value={templateForm.text_template}
                onChange={(e) => setTemplateForm({ ...templateForm, text_template: e.target.value })}
                placeholder="Enter text template"
                rows={6}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTemplateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Sender Dialog */}
      <Dialog open={isSenderOpen} onOpenChange={setIsSenderOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Sender</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sender-name">Sender Name</Label>
                <Input
                  id="sender-name"
                  value={senderForm.name}
                  onChange={(e) => setSenderForm({ ...senderForm, name: e.target.value })}
                  placeholder="e.g., Sublimes Drive"
                />
              </div>
              <div>
                <Label htmlFor="sender-email">Email Address</Label>
                <Input
                  id="sender-email"
                  type="email"
                  value={senderForm.email}
                  onChange={(e) => setSenderForm({ ...senderForm, email: e.target.value })}
                  placeholder="e.g., info@sublimesdrive.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  value={senderForm.smtp_host}
                  onChange={(e) => setSenderForm({ ...senderForm, smtp_host: e.target.value })}
                  placeholder="e.g., smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  value={senderForm.smtp_port}
                  onChange={(e) => setSenderForm({ ...senderForm, smtp_port: parseInt(e.target.value) })}
                  placeholder="587"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="smtp-username">SMTP Username</Label>
              <Input
                id="smtp-username"
                value={senderForm.smtp_username}
                onChange={(e) => setSenderForm({ ...senderForm, smtp_username: e.target.value })}
                placeholder="SMTP username"
              />
            </div>

            <div>
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <Input
                id="smtp-password"
                type="password"
                value={senderForm.smtp_password}
                onChange={(e) => setSenderForm({ ...senderForm, smtp_password: e.target.value })}
                placeholder="SMTP password"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="smtp-secure" 
                  checked={senderForm.smtp_secure}
                  onCheckedChange={(checked) => setSenderForm({ ...senderForm, smtp_secure: checked })}
                />
                <Label htmlFor="smtp-secure">Use SSL/TLS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="sender-active" 
                  checked={senderForm.is_active}
                  onCheckedChange={(checked) => setSenderForm({ ...senderForm, is_active: checked })}
                />
                <Label htmlFor="sender-active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="sender-default" 
                  checked={senderForm.is_default}
                  onCheckedChange={(checked) => setSenderForm({ ...senderForm, is_default: checked })}
                />
                <Label htmlFor="sender-default">Default</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSenderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSender} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                Create Sender
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
