import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Mail, Edit, Save, X, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  variables: string[];
  created_at: string;
}

export function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          body_html: editingTemplate.body_html,
          body_text: editingTemplate.body_text,
        })
        .eq('id', editingTemplate.id);

      if (error) throw error;
      toast.success('Template saved successfully');
      setEditingTemplate(null);
      await fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template: ' + (error.message || 'Unknown error'));
    }
  };

  const handleTestEmail = async () => {
    if (!editingTemplate || !testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      const { error } = await supabase.rpc('fn_send_email_template', {
        p_template_key: editingTemplate.template_key,
        p_recipient_email: testEmail,
        p_variables: {
          name: 'Test User',
          app_url: window.location.origin,
        },
      });

      if (error) throw error;
      toast.success('Test email sent!');
      setShowTestModal(false);
      setTestEmail('');
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-400">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">
          Email Templates
        </h1>
        <p className="text-gray-400">Manage email templates for automated communications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template List */}
        <div className="space-y-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] cursor-pointer hover:border-[var(--sublimes-gold)] transition-colors"
              onClick={() => setEditingTemplate(template)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-[var(--sublimes-light-text)]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[var(--sublimes-gold)]" />
                    <span>{template.name}</span>
                  </div>
                  <Badge variant="secondary">{template.template_key}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-2">Subject: {template.subject}</p>
                <p className="text-xs text-gray-500">
                  Variables: {Array.isArray(template.variables) ? template.variables.join(', ') : 'None'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Template Editor */}
        {editingTemplate && (
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-[var(--sublimes-light-text)]">
                <span>Edit Template</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTestModal(true)}
                    className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTemplate(null)}
                    className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[var(--sublimes-light-text)]">Template Name</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] mt-2"
                />
              </div>
              <div>
                <Label className="text-[var(--sublimes-light-text)]">Subject</Label>
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                  }
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] mt-2"
                />
              </div>
              <div>
                <Label className="text-[var(--sublimes-light-text)]">HTML Body</Label>
                <Textarea
                  value={editingTemplate.body_html}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, body_html: e.target.value })
                  }
                  rows={10}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] mt-2 font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-[var(--sublimes-light-text)]">Text Body (Optional)</Label>
                <Textarea
                  value={editingTemplate.body_text || ''}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, body_text: e.target.value })
                  }
                  rows={5}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] mt-2"
                />
              </div>
              <Button
                onClick={handleSaveTemplate}
                className="w-full bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Test Email Modal */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Send Test Email</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter an email address to test the template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[var(--sublimes-light-text)]">Email Address</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTestModal(false)}
              className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTestEmail}
              className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
            >
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) {
  return (
    <span className={`px-2 py-1 rounded text-xs ${className || 'bg-gray-700 text-gray-300'}`}>
      {children}
    </span>
  );
}


