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
import { 
  Mail, 
  Send, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'failed';
  template_id: string;
  sender_id: string;
  audience_filter: any;
  schedule_at?: string;
  created_at: string;
  created_by: string;
}

interface EmailTemplate {
  id: string;
  code: string;
  locale: string;
  version: number;
  subject: string;
  html: string;
  text?: string;
  is_active: boolean;
}

interface EmailSender {
  id: string;
  name: string;
  from_name: string;
  from_email: string;
  transport: 'api' | 'smtp';
  provider?: string;
  is_default: boolean;
}

export const AdminEmailManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [senders, setSenders] = useState<EmailSender[]>([]);
  const [loading, setLoading] = useState(false);

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    template_id: '',
    sender_id: '',
    audience_filter: {},
    schedule_at: '',
    ab_test: null
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    code: '',
    locale: 'en',
    subject: '',
    html: '',
    text: ''
  });

  // Sender form state
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
    use_tls: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load campaigns, templates, and senders
      // This would be actual Supabase calls in production
      setCampaigns([
        {
          id: '1',
          name: 'Welcome Campaign',
          status: 'completed',
          template_id: '1',
          sender_id: '1',
          audience_filter: { roles: ['car_owner'] },
          created_at: '2024-01-01T00:00:00Z',
          created_by: 'admin'
        }
      ]);
      
      setTemplates([
        {
          id: '1',
          code: 'welcome',
          locale: 'en',
          version: 1,
          subject: 'Welcome to Sublimes Drive!',
          html: '<div>Welcome email content</div>',
          is_active: true
        }
      ]);
      
      setSenders([
        {
          id: '1',
          name: 'Sublimes Drive',
          from_name: 'Sublimes Drive',
          from_email: 'info@sublimesdrive.com',
          transport: 'api',
          provider: 'resend',
          is_default: true
        }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      sending: { color: 'bg-yellow-100 text-yellow-800', icon: Play },
      paused: { color: 'bg-orange-100 text-orange-800', icon: Pause },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleCreateCampaign = async () => {
    setLoading(true);
    try {
      // Create campaign logic
      console.log('Creating campaign:', campaignForm);
      // Reset form
      setCampaignForm({
        name: '',
        template_id: '',
        sender_id: '',
        audience_filter: {},
        schedule_at: '',
        ab_test: null
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    setLoading(true);
    try {
      // Create template logic
      console.log('Creating template:', templateForm);
      // Reset form
      setTemplateForm({
        code: '',
        locale: 'en',
        subject: '',
        html: '',
        text: ''
      });
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSender = async () => {
    setLoading(true);
    try {
      // Create sender logic
      console.log('Creating sender:', senderForm);
      // Reset form
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
        use_tls: true
      });
    } catch (error) {
      console.error('Error creating sender:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-gray-600">Manage email campaigns, templates, and senders</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span className="text-sm text-gray-600">Email System Active</span>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">12,456</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold">11,892</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">24.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold">3.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="senders">Senders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Campaigns</h2>
            <Button onClick={() => setActiveTab('campaigns')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="campaign-template">Template</Label>
                  <Select value={campaignForm.template_id} onValueChange={(value) => setCampaignForm({ ...campaignForm, template_id: value })}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-sender">Sender</Label>
                  <Select value={campaignForm.sender_id} onValueChange={(value) => setCampaignForm({ ...campaignForm, sender_id: value })}>
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
                <Label htmlFor="audience-filter">Audience Filter (JSON)</Label>
                <Textarea
                  id="audience-filter"
                  value={JSON.stringify(campaignForm.audience_filter, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setCampaignForm({ ...campaignForm, audience_filter: parsed });
                    } catch (error) {
                      // Invalid JSON, keep current value
                    }
                  }}
                  placeholder='{"roles": ["car_owner"], "brands": ["BMW"]}'
                  rows={4}
                />
              </div>

              <Button onClick={handleCreateCampaign} disabled={loading}>
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        {templates.find(t => t.id === campaign.template_id)?.code || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {campaign.schedule_at ? new Date(campaign.schedule_at).toLocaleString() : 'Immediate'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <Button onClick={() => setActiveTab('templates')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="template-code">Code</Label>
                  <Input
                    id="template-code"
                    value={templateForm.code}
                    onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                    placeholder="welcome, verification_approved, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="template-locale">Locale</Label>
                  <Select value={templateForm.locale} onValueChange={(value) => setTemplateForm({ ...templateForm, locale: value })}>
                    <SelectTrigger>
                      <SelectValue />
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
                  placeholder="Email subject line"
                />
              </div>

              <div>
                <Label htmlFor="template-html">HTML Content</Label>
                <Textarea
                  id="template-html"
                  value={templateForm.html}
                  onChange={(e) => setTemplateForm({ ...templateForm, html: e.target.value })}
                  placeholder="HTML email content with Handlebars variables"
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="template-text">Text Content (Optional)</Label>
                <Textarea
                  id="template-text"
                  value={templateForm.text}
                  onChange={(e) => setTemplateForm({ ...templateForm, text: e.target.value })}
                  placeholder="Plain text version"
                  rows={4}
                />
              </div>

              <Button onClick={handleCreateTemplate} disabled={loading}>
                {loading ? 'Creating...' : 'Create Template'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Locale</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.code}</TableCell>
                      <TableCell>{template.locale}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>v{template.version}</TableCell>
                      <TableCell>
                        <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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

        {/* Senders Tab */}
        <TabsContent value="senders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sender Identities</h2>
            <Button onClick={() => setActiveTab('senders')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Sender
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Sender</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sender-name">Name</Label>
                  <Input
                    id="sender-name"
                    value={senderForm.name}
                    onChange={(e) => setSenderForm({ ...senderForm, name: e.target.value })}
                    placeholder="Sublimes Drive"
                  />
                </div>
                <div>
                  <Label htmlFor="sender-from-name">From Name</Label>
                  <Input
                    id="sender-from-name"
                    value={senderForm.from_name}
                    onChange={(e) => setSenderForm({ ...senderForm, from_name: e.target.value })}
                    placeholder="Sublimes Drive"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sender-from-email">From Email</Label>
                <Input
                  id="sender-from-email"
                  type="email"
                  value={senderForm.from_email}
                  onChange={(e) => setSenderForm({ ...senderForm, from_email: e.target.value })}
                  placeholder="info@sublimesdrive.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sender-transport">Transport</Label>
                  <Select value={senderForm.transport} onValueChange={(value: 'api' | 'smtp') => setSenderForm({ ...senderForm, transport: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API (Resend/Mailgun/SendGrid)</SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sender-provider">Provider</Label>
                  <Select value={senderForm.provider} onValueChange={(value) => setSenderForm({ ...senderForm, provider: value })}>
                    <SelectTrigger>
                      <SelectValue />
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
                    placeholder="RESEND_API_KEY"
                  />
                </div>
              )}

              {senderForm.transport === 'smtp' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sender-smtp-host">SMTP Host</Label>
                      <Input
                        id="sender-smtp-host"
                        value={senderForm.smtp_host}
                        onChange={(e) => setSenderForm({ ...senderForm, smtp_host: e.target.value })}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sender-smtp-port">SMTP Port</Label>
                      <Input
                        id="sender-smtp-port"
                        type="number"
                        value={senderForm.smtp_port}
                        onChange={(e) => setSenderForm({ ...senderForm, smtp_port: parseInt(e.target.value) })}
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sender-smtp-user">SMTP User Alias</Label>
                    <Input
                      id="sender-smtp-user"
                      value={senderForm.smtp_user_alias}
                      onChange={(e) => setSenderForm({ ...senderForm, smtp_user_alias: e.target.value })}
                      placeholder="SMTP_USER"
                    />
                  </div>
                </>
              )}

              <Button onClick={handleCreateSender} disabled={loading}>
                {loading ? 'Creating...' : 'Add Sender'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Senders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>From</TableHead>
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
                      <TableCell>{sender.from_name} &lt;{sender.from_email}&gt;</TableCell>
                      <TableCell>{sender.transport.toUpperCase()}</TableCell>
                      <TableCell>{sender.provider || 'N/A'}</TableCell>
                      <TableCell>
                        {sender.is_default && (
                          <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold">Email Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Welcome Campaign</span>
                    <span className="font-semibold">2,456 sent</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verification Campaign</span>
                    <span className="font-semibold">1,234 sent</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Boost Analytics</span>
                    <span className="font-semibold">890 sent</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Delivered</span>
                    <span className="font-semibold text-green-600">95.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bounced</span>
                    <span className="font-semibold text-red-600">2.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complained</span>
                    <span className="font-semibold text-orange-600">0.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Welcome email sent to 50 new users</p>
                    <p className="text-sm text-gray-600">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Send className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Boost analytics digest sent</p>
                    <p className="text-sm text-gray-600">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">High bounce rate detected for campaign</p>
                    <p className="text-sm text-gray-600">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
