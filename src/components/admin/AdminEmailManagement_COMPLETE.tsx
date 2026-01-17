import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Mail, Send, Plus, Edit, Trash2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

export function AdminEmailManagement_COMPLETE() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    template_id: '',
    audience_filter: 'all',
    schedule_at: ''
  });

  const [templateForm, setTemplateForm] = useState({
    code: '',
    subject: '',
    html: '',
    text: ''
  });

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*, email_templates(code, subject)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
    }
  };

  const createCampaign = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaignForm.name,
          template_id: campaignForm.template_id,
          audience_filter: { type: campaignForm.audience_filter },
          status: campaignForm.schedule_at ? 'scheduled' : 'draft',
          schedule_at: campaignForm.schedule_at || null,
          created_by: user.id
        });

      if (error) throw error;
      toast.success('Campaign created!');
      setShowCreateCampaign(false);
      setCampaignForm({ name: '', template_id: '', audience_filter: 'all', schedule_at: '' });
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('email_templates')
        .insert({
          code: templateForm.code,
          locale: 'en',
          version: 1,
          subject: templateForm.subject,
          html: templateForm.html,
          text: templateForm.text,
          is_active: true
        });

      if (error) throw error;
      toast.success('Template created!');
      setShowCreateTemplate(false);
      setTemplateForm({ code: '', subject: '', html: '', text: '' });
      fetchTemplates();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ status: 'sending', sent_at: new Date().toISOString() })
        .eq('id', campaignId);

      if (error) throw error;
      toast.success('Campaign queued for sending!');
      fetchCampaigns();
    } catch (error: any) {
      toast.error('Failed to send campaign');
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Delete this campaign?')) return;
    
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (error: any) {
      toast.error('Failed to delete campaign');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return;
    
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Template deactivated');
      fetchTemplates();
    } catch (error: any) {
      toast.error('Failed to delete template');
    }
  };

  const stats = {
    totalCampaigns: campaigns.length,
    sent: campaigns.filter(c => c.status === 'completed').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    draft: campaigns.filter(c => c.status === 'draft').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#E8EAED]">Email Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateTemplate(true)}
            variant="outline"
            className="border-[#2A3342] text-[#E8EAED]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
          <Button
            onClick={() => setShowCreateCampaign(true)}
            className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
          >
            <Mail className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <p className="text-sm text-[#8B92A7]">Total Campaigns</p>
            <p className="text-2xl font-bold text-[#E8EAED]">{stats.totalCampaigns}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <p className="text-sm text-[#8B92A7]">Sent</p>
            <p className="text-2xl font-bold text-green-500">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <p className="text-sm text-[#8B92A7]">Scheduled</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.scheduled}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <p className="text-sm text-[#8B92A7]">Drafts</p>
            <p className="text-2xl font-bold text-gray-500">{stats.draft}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign Form */}
      {showCreateCampaign && (
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardHeader>
            <CardTitle>Create Email Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Campaign Name</label>
              <Input
                placeholder="Campaign name"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Template</label>
              <Select
                value={campaignForm.template_id}
                onValueChange={(value) => setCampaignForm({ ...campaignForm, template_id: value })}
              >
                <SelectTrigger className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.code} - {template.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Audience</label>
              <Select
                value={campaignForm.audience_filter}
                onValueChange={(value) => setCampaignForm({ ...campaignForm, audience_filter: value })}
              >
                <SelectTrigger className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified Users</SelectItem>
                  <SelectItem value="car_owners">Car Owners</SelectItem>
                  <SelectItem value="garage_owners">Garage Owners</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Schedule (Optional)</label>
              <Input
                type="datetime-local"
                value={campaignForm.schedule_at}
                onChange={(e) => setCampaignForm({ ...campaignForm, schedule_at: e.target.value })}
                className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createCampaign}
                disabled={loading || !campaignForm.name || !campaignForm.template_id}
                className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateCampaign(false)}
                className="border-[#2A3342] text-[#E8EAED]"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Template Form */}
      {showCreateTemplate && (
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardHeader>
            <CardTitle>Create Email Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Template Code</label>
              <Input
                placeholder="e.g., welcome_email"
                value={templateForm.code}
                onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Subject</label>
              <Input
                placeholder="Email subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">HTML Content</label>
              <Textarea
                placeholder="HTML email content"
                value={templateForm.html}
                onChange={(e) => setTemplateForm({ ...templateForm, html: e.target.value })}
                className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                rows={6}
              />
            </div>
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Plain Text (Optional)</label>
              <Textarea
                placeholder="Plain text version"
                value={templateForm.text}
                onChange={(e) => setTemplateForm({ ...templateForm, text: e.target.value })}
                className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createTemplate}
                disabled={loading || !templateForm.code || !templateForm.subject || !templateForm.html}
                className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
              >
                Create Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateTemplate(false)}
                className="border-[#2A3342] text-[#E8EAED]"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1A2332]">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-12 text-[#8B92A7]">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-[#1A2332] rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-[#E8EAED]">{campaign.name}</h3>
                          <Badge
                            variant={
                              campaign.status === 'completed' ? 'default' :
                              campaign.status === 'scheduled' ? 'secondary' : 'outline'
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#8B92A7]">
                          Template: {campaign.email_templates?.code}
                        </p>
                        {campaign.schedule_at && (
                          <p className="text-xs text-[#8B92A7] mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(campaign.schedule_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                          <Button
                            size="sm"
                            onClick={() => sendCampaign(campaign.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12 text-[#8B92A7]">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No templates yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 bg-[#1A2332] rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-[#E8EAED] mb-1">{template.code}</h3>
                        <p className="text-sm text-[#8B92A7]">{template.subject}</p>
                        <p className="text-xs text-[#8B92A7] mt-1">Version {template.version}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#2A3342]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
