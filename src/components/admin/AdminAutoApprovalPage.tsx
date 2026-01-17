import { useState } from 'react';
import { Settings, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Save } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAdminSettings, getAutoApprovalCategories } from './AdminSettingsContext';
import { toast } from 'sonner';

export function AdminAutoApprovalPage() {
  const { autoApprovalSettings, updateAutoApproval, getAutoApprovalStatus } = useAdminSettings();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const categories = getAutoApprovalCategories();
  const enabledCount = Object.values(autoApprovalSettings).filter(Boolean).length;
  const totalCategories = categories.length;

  const handleToggleAll = (enabled: boolean) => {
    categories.forEach(category => {
      updateAutoApproval(category.key, enabled);
    });
    
    if (enabled) {
      toast.success(`🤖 Auto-approval ENABLED for all ${totalCategories} categories`);
    } else {
      toast.info(`👤 Auto-approval DISABLED for all categories`);
    }
  };

  const exportSettings = () => {
    const settings = getAutoApprovalStatus();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auto-approval-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('📥 Auto-approval settings exported');
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            Object.entries(settings).forEach(([key, value]) => {
              if (typeof value === 'boolean') {
                updateAutoApproval(key as any, value);
              }
            });
            toast.success('📤 Auto-approval settings imported');
          } catch (error) {
            toast.error('❌ Failed to import settings - Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">🤖 Auto-Approval Settings</h1>
            <p className="text-gray-400 mt-1">Configure automatic approval for different content types</p>
            <div className="mt-2 text-sm">
              <span className="text-[var(--sublimes-gold)]">{enabledCount}/{totalCategories}</span>
              <span className="text-gray-400 ml-1">categories have auto-approval enabled</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
            <Button
              onClick={exportSettings}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            <Button
              onClick={importSettings}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => handleToggleAll(true)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Enable All
          </Button>
          <Button
            onClick={() => handleToggleAll(false)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Disable All
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">Active</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{enabledCount}</p>
          <p className="text-sm text-gray-400">Auto-Approval Enabled</p>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-500" />
            </div>
            <div className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded">Manual</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{totalCategories - enabledCount}</p>
          <p className="text-sm text-gray-400">Manual Review Required</p>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-500" />
            </div>
            <div className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded">Total</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{totalCategories}</p>
          <p className="text-sm text-gray-400">Total Categories</p>
        </Card>
      </div>

      {/* Auto-Approval Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-4">Configure Auto-Approval by Category</h2>
        
        {categories.map((category) => (
          <Card key={category.key} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    autoApprovalSettings[category.key] 
                      ? 'bg-green-500/10' 
                      : 'bg-gray-500/10'
                  }`}>
                    {autoApprovalSettings[category.key] ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--sublimes-light-text)]">{category.label}</h3>
                    <p className="text-sm text-gray-400">{category.description}</p>
                  </div>
                </div>
                
                {showAdvanced && (
                  <div className="mt-3 pl-11">
                    <div className={`text-xs px-2 py-1 rounded inline-block ${
                      autoApprovalSettings[category.key]
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      Status: {autoApprovalSettings[category.key] ? 'Auto-approved' : 'Manual review required'}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`text-sm font-medium ${
                  autoApprovalSettings[category.key] 
                    ? 'text-green-500' 
                    : 'text-gray-400'
                }`}>
                  {autoApprovalSettings[category.key] ? '🤖 Auto' : '👤 Manual'}
                </div>
                <Switch
                  checked={autoApprovalSettings[category.key]}
                  onCheckedChange={(checked) => updateAutoApproval(category.key, checked)}
                  className="data-[state=checked]:bg-[var(--sublimes-gold)]"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Warning Section */}
      <Card className="bg-yellow-500/10 border border-yellow-500/20 p-6 mt-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-bold text-yellow-500 mb-2">⚠️ Auto-Approval Warning</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Auto-approval bypasses manual review processes</li>
              <li>• Content may still be flagged by automated systems</li>
              <li>• You can always revert to manual approval at any time</li>
              <li>• Monitor the admin logs for auto-approved content</li>
              <li>• Consider legal and compliance requirements for your region</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}