import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Bell, Send, Users, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

export function AdminNotificationsCenter_COMPLETE() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target_audience: 'all',
    scheduled_for: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('push_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const createCampaign = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('push_campaigns')
        .insert({
          title: formData.title,
          body: formData.body,
          target_audience: formData.target_audience,
          status: formData.scheduled_for ? 'scheduled' : 'sent',
          scheduled_for: formData.scheduled_for || null,
          created_by: user.id
        });

      if (error) throw error;

      toast.success('Notification campaign created!');
      setShowCreateForm(false);
      setFormData({ title: '', body: '', target_audience: 'all', scheduled_for: '' });
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const sendNow = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('push_campaigns')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', campaignId);

      if (error) throw error;
      toast.success('Campaign sent!');
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    draft: campaigns.filter(c => c.status === 'draft').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#E8EAED]">Notifications Center</h1>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
        >
          <Bell className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Total Campaigns</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Sent</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.sent}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Scheduled</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.scheduled}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Drafts</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.draft}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardHeader>
            <CardTitle>Create Notification Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Title</label>
              <Input
                placeholder="Notification title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Message</label>
              <Textarea
                placeholder="Notification message"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Target Audience</label>
              <Select
                value={formData.target_audience}
                onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
              >
                <SelectTrigger className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified Users</SelectItem>
                  <SelectItem value="car_owners">Car Owners</SelectItem>
                  <SelectItem value="garage_owners">Garage Owners</SelectItem>
                  <SelectItem value="vendors">Vendors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#8B92A7] mb-2 block">Schedule For (Optional)</label>
              <Input
                type="datetime-local"
                value={formData.scheduled_for}
                onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createCampaign}
                disabled={loading || !formData.title || !formData.body}
                className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
              >
                <Send className="w-4 h-4 mr-2" />
                {formData.scheduled_for ? 'Schedule' : 'Send Now'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="border-[#2A3342] text-[#E8EAED]"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-[#8B92A7]">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No campaigns yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 bg-[#1A2332] rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-[#E8EAED]">{campaign.title}</h3>
                      <Badge
                        variant={
                          campaign.status === 'sent' ? 'default' :
                          campaign.status === 'scheduled' ? 'secondary' : 'outline'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#8B92A7] mb-2">{campaign.body}</p>
                    <div className="flex items-center gap-4 text-xs text-[#8B92A7]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.target_audience}
                      </span>
                      {campaign.scheduled_for && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(campaign.scheduled_for).toLocaleString()}
                        </span>
                      )}
                      {campaign.sent_at && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Sent {new Date(campaign.sent_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {campaign.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => sendNow(campaign.id)}
                      className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
                    >
                      Send Now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
