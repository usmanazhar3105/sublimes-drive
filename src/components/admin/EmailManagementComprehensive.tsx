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
  Settings, 
  Plus,
  Edit,
  Eye,
  CheckCircle,
  FileText,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { emailTemplatesAuto, emailTriggersAuto } from '@/lib/emailTemplatesAuto';

// Types
interface EmailSender {
  id: string;
  name: string;
  from_name: string;
  from_email: string;
  transport: 'api' | 'smtp';
  provider: string | null;
  api_key_alias: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user_alias: string | null;
  use_tls: boolean;
  is_default: boolean;
}

interface EmailTemplate {
  id: string;
  code: string;
  locale: string;
  version: number;
  subject: string;
  html: string;
  text: string | null;
  is_active: boolean;
}

interface EmailCampaign {
  id: string;
  name: string;
  template_id: string;
  sender_id: string;
  audience_filter: Record<string, any>;
  status: 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'failed';
  schedule_at: string | null;
  ab_test: Record<string, any> | null;
  attachments: Record<string, any> | null;
  created_at: string;
  created_by: string;
}

interface EmailTrigger {
  id: string;
  code: string;
  template_id: string;
  sender_id: string;
  is_enabled: boolean;
  throttle_seconds: number;
}

interface AudienceFilter {
  roles?: string[];
  brands?: string[];
  modules?: string[];
  lister_types?: string[];
  verification_status?: string[];
  activity?: { posted_within_days?: number };
  wallet?: { repair_bid_wallet_lt?: number };
  xp?: { gte?: number };
}

export function EmailManagementComprehensive() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [senders, setSenders] = useState<EmailSender[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [triggers, setTriggers] = useState<EmailTrigger[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isSenderOpen, setIsSenderOpen] = useState(false);
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [isImportingTemplates, setIsImportingTemplates] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingSender, setEditingSender] = useState<EmailSender | null>(null);
  const [editingTrigger, setEditingTrigger] = useState<EmailTrigger | null>(null);

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    template_id: '',
    sender_id: '',
    audience_filter: {} as AudienceFilter,
    schedule_at: '',
    ab_test: null as Record<string, any> | null,
    attachments: null as Record<string, any> | null,
    status: 'draft' as const
  });

  const [templateForm, setTemplateForm] = useState({
    code: '',
    locale: 'en',
    subject: '',
    html: '',
    text: '',
    is_active: true
  });

  const [senderForm, setSenderForm] = useState({
    name: '',
    from_name: '',
    from_email: '',
    transport: 'api' as 'api' | 'smtp',
    provider: 'resend',
    api_key_alias: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_user_alias: '',
    use_tls: true,
    is_default: false
  });

  const [triggerForm, setTriggerForm] = useState({
    code: '',
    template_id: '',
    sender_id: '',
    is_enabled: true,
    throttle_seconds: 0
  });

  // Load data
  const importAutoTemplates = async () => {
    try {
      setIsImportingTemplates(true);
      
      // Import templates
      for (const [templateCode, templateData] of Object.entries(emailTemplatesAuto)) {
        for (const [locale, localeData] of Object.entries(templateData.locales)) {
          const templatePayload = {
            code: templateCode,
            locale: locale,
            subject: localeData.subject,
            html: localeData.html,
            is_active: true
          };

          const response = await fetch('/api/admin/email-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templatePayload)
          });

          if (!response.ok) {
            console.warn(`Failed to import template ${templateCode} (${locale})`);
          }
        }
      }

      // Import triggers
      for (const [triggerCode, triggerData] of Object.entries(emailTriggersAuto)) {
        // Get the first template for this trigger
        const template = Object.values(emailTemplatesAuto).find(t => t.code === triggerCode);
        if (template) {
          const templateId = templates.find(t => t.code === triggerCode)?.id;
          if (templateId) {
            const triggerPayload = {
              code: triggerCode,
              template_id: templateId,
              is_enabled: true,
              throttle_seconds: triggerData.delay
            };

            const response = await fetch('/api/admin/email-triggers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(triggerPayload)
            });

            if (!response.ok) {
              console.warn(`Failed to import trigger ${triggerCode}`);
            }
          }
        }
      }

      toast.success('Auto templates imported successfully!');
      loadData();
    } catch (error) {
      console.error('Error importing auto templates:', error);
      toast.error('Failed to import auto templates');
    } finally {
      setIsImportingTemplates(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sendersRes, templatesRes, campaignsRes, triggersRes] = await Promise.all([
        fetch('/api/admin/email-senders'),
        fetch('/api/admin/email-templates'),
        fetch('/api/admin/email-campaigns'),
        fetch('/api/admin/email-triggers')
      ]);

      if (sendersRes.ok) setSenders(await sendersRes.json());
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
      if (triggersRes.ok) setTriggers(await triggersRes.json());
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

  // Trigger handlers
  const handleCreateTrigger = async () => {
    try {
      const response = await fetch('/api/admin/email-triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triggerForm)
      });

      if (response.ok) {
        toast.success('Trigger created successfully');
        setIsTriggerOpen(false);
        resetTriggerForm();
        loadData();
      } else {
        throw new Error('Failed to create trigger');
      }
    } catch (error) {
      console.error('Error creating trigger:', error);
      toast.error('Failed to create trigger');
    }
  };

  // Form resets
  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      template_id: '',
      sender_id: '',
      audience_filter: {},
      schedule_at: '',
      ab_test: null,
      attachments: null,
      status: 'draft'
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      code: '',
      locale: 'en',
      subject: '',
      html: '',
      text: '',
      is_active: true
    });
  };

  const resetSenderForm = () => {
    setSenderForm({
      name: '',
      from_name: '',
      from_email: '',
      transport: 'api',
      provider: 'resend',
      api_key_alias: '',
      smtp_host: '',
      smtp_port: 587,
      smtp_user_alias: '',
      use_tls: true,
      is_default: false
    });
  };

  const resetTriggerForm = () => {
    setTriggerForm({
      code: '',
      template_id: '',
      sender_id: '',
      is_enabled: true,
      throttle_seconds: 0
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
              <SelectItem value="car_owner">Car Owner</SelectItem>
              <SelectItem value="garage_owner">Garage Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Modules</Label>
          <Select onValueChange={(value) => onChange({ ...filter, modules: value ? [value] : [] })}>
            <SelectTrigger>
              <SelectValue placeholder="Select modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="garage">Garage</SelectItem>
              <SelectItem value="events">Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Verification Status</Label>
          <Select onValueChange={(value) => onChange({ ...filter, verification_status: value ? [value] : [] })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>XP Points (Min)</Label>
          <Input 
            type="number" 
            placeholder="Minimum XP" 
            value={filter.xp?.gte || ''} 
            onChange={(e) => onChange({ ...filter, xp: { gte: parseInt(e.target.value) || undefined } })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Activity (Days)</Label>
          <Input 
            type="number" 
            placeholder="Posted within days" 
            value={filter.activity?.posted_within_days || ''} 
            onChange={(e) => onChange({ ...filter, activity: { posted_within_days: parseInt(e.target.value) || undefined } })}
          />
        </div>
        <div>
          <Label>Wallet Balance (Max)</Label>
          <Input 
            type="number" 
            placeholder="Max wallet balance" 
            value={filter.wallet?.repair_bid_wallet_lt || ''} 
            onChange={(e) => onChange({ ...filter, wallet: { repair_bid_wallet_lt: parseInt(e.target.value) || undefined } })}
          />
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
          <p className="text-gray-400">Complete email campaign and automation system</p>
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
              <Button 
                onClick={importAutoTemplates} 
                disabled={isImportingTemplates}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {isImportingTemplates ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Import Auto Templates
                  </>
                )}
              </Button>
          <Button onClick={() => setIsSenderOpen(true)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            New Sender
          </Button>
          <Button onClick={() => setIsTriggerOpen(true)} variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            New Trigger
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="senders">Senders</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
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
                      <TableCell>{templates.find(t => t.id === campaign.template_id)?.code || 'N/A'}</TableCell>
                      <TableCell>
                        {campaign.schedule_at ? new Date(campaign.schedule_at).toLocaleDateString() : 'Immediate'}
                      </TableCell>
                      <TableCell>0</TableCell>
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
                    <TableHead>Code</TableHead>
                    <TableHead>Locale</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.code}</TableCell>
                      <TableCell>{template.locale}</TableCell>
                      <TableCell>{template.version}</TableCell>
                      <TableCell>{template.subject}</TableCell>
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
                    <TableHead>Transport</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senders.map((sender) => (
                    <TableRow key={sender.id}>
                      <TableCell className="font-medium">{sender.name}</TableCell>
                      <TableCell>{sender.from_email}</TableCell>
                      <TableCell>{sender.transport}</TableCell>
                      <TableCell>{sender.provider || 'N/A'}</TableCell>
                      <TableCell>
                        {sender.is_default && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingSender(sender)}>
                            <Edit className="w-4 h-4" />
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

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Email Triggers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Throttle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {triggers.map((trigger) => (
                    <TableRow key={trigger.id}>
                      <TableCell className="font-medium">{trigger.code}</TableCell>
                      <TableCell>{templates.find(t => t.id === trigger.template_id)?.code || 'N/A'}</TableCell>
                      <TableCell>{trigger.throttle_seconds}s</TableCell>
                      <TableCell>
                        <Badge variant={trigger.is_enabled ? 'default' : 'outline'}>
                          {trigger.is_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingTrigger(trigger)}>
                            <Edit className="w-4 h-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">
                  {templates.filter(t => t.is_active).length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Triggers</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{triggers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {triggers.filter(t => t.is_enabled).length} enabled
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Senders</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{senders.length}</div>
                <p className="text-xs text-muted-foreground">
                  {senders.filter(s => s.is_default).length} default
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
                        {sender.name} ({sender.from_email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="campaign-template">Template</Label>
              <Select onValueChange={(value) => setCampaignForm({ ...campaignForm, template_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.code} ({template.locale})
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

            <div>
              <Label>Audience Filter</Label>
              <AudienceFilterComponent 
                filter={campaignForm.audience_filter} 
                onChange={(filter) => setCampaignForm({ ...campaignForm, audience_filter: filter })}
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
                  placeholder="e.g., welcome, verification_approved"
                />
              </div>
              <div>
                <Label htmlFor="template-locale">Locale</Label>
                <Select onValueChange={(value) => setTemplateForm({ ...templateForm, locale: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select locale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-subject">Subject</Label>
              <Input
                id="template-subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                placeholder="e.g., Welcome {{user.first_name}}!"
              />
            </div>

            <div>
              <Label htmlFor="template-html">HTML Template</Label>
              <Textarea
                id="template-html"
                value={templateForm.html}
                onChange={(e) => setTemplateForm({ ...templateForm, html: e.target.value })}
                placeholder="Enter HTML template with Handlebars variables"
                rows={8}
              />
            </div>

            <div>
              <Label htmlFor="template-text">Text Template</Label>
              <Textarea
                id="template-text"
                value={templateForm.text}
                onChange={(e) => setTemplateForm({ ...templateForm, text: e.target.value })}
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
                <Label htmlFor="sender-from-name">From Name</Label>
                <Input
                  id="sender-from-name"
                  value={senderForm.from_name}
                  onChange={(e) => setSenderForm({ ...senderForm, from_name: e.target.value })}
                  placeholder="e.g., Sublimes Drive"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sender-email">From Email</Label>
              <Input
                id="sender-email"
                type="email"
                value={senderForm.from_email}
                onChange={(e) => setSenderForm({ ...senderForm, from_email: e.target.value })}
                placeholder="e.g., info@sublimesdrive.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sender-transport">Transport</Label>
                <Select onValueChange={(value) => setSenderForm({ ...senderForm, transport: value as 'api' | 'smtp' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="smtp">SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sender-provider">Provider</Label>
                <Select onValueChange={(value) => setSenderForm({ ...senderForm, provider: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {senderForm.transport === 'api' && (
              <div>
                <Label htmlFor="sender-api-key">API Key Alias</Label>
                <Input
                  id="sender-api-key"
                  value={senderForm.api_key_alias}
                  onChange={(e) => setSenderForm({ ...senderForm, api_key_alias: e.target.value })}
                  placeholder="e.g., RESEND_API_KEY"
                />
              </div>
            )}

            {senderForm.transport === 'smtp' && (
              <>
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
                  <Label htmlFor="smtp-user">SMTP User Alias</Label>
                  <Input
                    id="smtp-user"
                    value={senderForm.smtp_user_alias}
                    onChange={(e) => setSenderForm({ ...senderForm, smtp_user_alias: e.target.value })}
                    placeholder="e.g., SMTP_USER"
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="sender-tls" 
                  checked={senderForm.use_tls}
                  onCheckedChange={(checked) => setSenderForm({ ...senderForm, use_tls: checked })}
                />
                <Label htmlFor="sender-tls">Use TLS</Label>
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

      {/* Create Trigger Dialog */}
      <Dialog open={isTriggerOpen} onOpenChange={setIsTriggerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Trigger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="trigger-code">Trigger Code</Label>
              <Input
                id="trigger-code"
                value={triggerForm.code}
                onChange={(e) => setTriggerForm({ ...triggerForm, code: e.target.value })}
                placeholder="e.g., welcome, verification_approved, listing_created"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trigger-template">Template</Label>
                <Select onValueChange={(value) => setTriggerForm({ ...triggerForm, template_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.code} ({template.locale})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trigger-sender">Sender</Label>
                <Select onValueChange={(value) => setTriggerForm({ ...triggerForm, sender_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sender" />
                  </SelectTrigger>
                  <SelectContent>
                    {senders.map((sender) => (
                      <SelectItem key={sender.id} value={sender.id}>
                        {sender.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="trigger-throttle">Throttle (seconds)</Label>
              <Input
                id="trigger-throttle"
                type="number"
                value={triggerForm.throttle_seconds}
                onChange={(e) => setTriggerForm({ ...triggerForm, throttle_seconds: parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="trigger-enabled" 
                checked={triggerForm.is_enabled}
                onCheckedChange={(checked) => setTriggerForm({ ...triggerForm, is_enabled: checked })}
              />
              <Label htmlFor="trigger-enabled">Enabled</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTriggerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTrigger} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                Create Trigger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
