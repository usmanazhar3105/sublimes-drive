import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

interface NotificationPreferences {
  email: {
    newMessages: boolean;
    newFollowers: boolean;
    postLikes: boolean;
    postComments: boolean;
    listingInterest: boolean;
    offerUpdates: boolean;
    eventReminders: boolean;
    weeklyDigest: boolean;
    promotions: boolean;
  };
  push: {
    newMessages: boolean;
    newFollowers: boolean;
    postLikes: boolean;
    postComments: boolean;
    listingInterest: boolean;
    offerUpdates: boolean;
    eventReminders: boolean;
  };
  sms: {
    verificationCodes: boolean;
    securityAlerts: boolean;
    paymentUpdates: boolean;
  };
}

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      newMessages: true,
      newFollowers: true,
      postLikes: false,
      postComments: true,
      listingInterest: true,
      offerUpdates: true,
      eventReminders: true,
      weeklyDigest: true,
      promotions: false,
    },
    push: {
      newMessages: true,
      newFollowers: true,
      postLikes: false,
      postComments: true,
      listingInterest: true,
      offerUpdates: true,
      eventReminders: true,
    },
    sms: {
      verificationCodes: true,
      securityAlerts: true,
      paymentUpdates: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const updatePreference = (
    channel: 'email' | 'push' | 'sms',
    key: string,
    value: boolean
  ) => {
    setPreferences({
      ...preferences,
      [channel]: {
        ...preferences[channel],
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Notification preferences saved successfully');
  };

  const disableAll = (channel: 'email' | 'push' | 'sms') => {
    const updated = { ...preferences };
    Object.keys(updated[channel]).forEach(key => {
      (updated[channel] as any)[key] = false;
    });
    setPreferences(updated);
  };

  const enableAll = (channel: 'email' | 'push' | 'sms') => {
    const updated = { ...preferences };
    Object.keys(updated[channel]).forEach(key => {
      (updated[channel] as any)[key] = true;
    });
    setPreferences(updated);
  };

  return (
    <div className="min-h-screen bg-[#0B1426] p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-[#9CA3AF] hover:text-[#E8EAED] mb-4"
            onClick={() => window.history.back()}
          >
            ← Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#1A2332] rounded-lg">
                  <Bell className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h1 className="text-2xl font-bold text-[#E8EAED]">
                  Notification Preferences
                </h1>
              </div>
              <p className="text-[#9CA3AF]">
                Choose how you want to be notified about updates
              </p>
            </div>
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-[#1A2332] border border-[#2A3441] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-xl font-semibold text-[#E8EAED]">Email</h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => enableAll('email')}
                className="text-[#9CA3AF] hover:text-[#E8EAED]"
              >
                Enable All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => disableAll('email')}
                className="text-[#9CA3AF] hover:text-[#E8EAED]"
              >
                Disable All
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(preferences.email).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-[#2A3441] last:border-0">
                <div>
                  <p className="text-[#E8EAED] font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-[#9CA3AF] text-sm">
                    Get notified by email
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updatePreference('email', key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-[#1A2332] border border-[#2A3441] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-xl font-semibold text-[#E8EAED]">Push Notifications</h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => enableAll('push')}
                className="text-[#9CA3AF] hover:text-[#E8EAED]"
              >
                Enable All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => disableAll('push')}
                className="text-[#9CA3AF] hover:text-[#E8EAED]"
              >
                Disable All
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(preferences.push).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-[#2A3441] last:border-0">
                <div>
                  <p className="text-[#E8EAED] font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-[#9CA3AF] text-sm">
                    Get push notifications on your device
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updatePreference('push', key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-[#1A2332] border border-[#2A3441] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-xl font-semibold text-[#E8EAED]">SMS</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(preferences.sms).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-[#2A3441] last:border-0">
                <div>
                  <p className="text-[#E8EAED] font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-[#9CA3AF] text-sm">
                    Receive text messages for critical updates
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updatePreference('sms', key, checked)}
                  disabled={key === 'verificationCodes' || key === 'securityAlerts'}
                />
              </div>
            ))}
          </div>
          
          <p className="text-[#9CA3AF] text-xs mt-4">
            * Some SMS notifications cannot be disabled for security reasons
          </p>
        </div>

        {/* Unsubscribe */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h3 className="text-red-500 font-semibold mb-2">Unsubscribe from All</h3>
          <p className="text-[#9CA3AF] text-sm mb-4">
            You'll only receive essential security and legal notifications.
          </p>
          <Button
            variant="outline"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            onClick={() => {
              disableAll('email');
              disableAll('push');
              toast.success('Unsubscribed from all marketing communications');
            }}
          >
            Unsubscribe from All Marketing
          </Button>
        </div>
      </div>
    </div>
  );
}
