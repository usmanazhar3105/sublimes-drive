import React, { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';
import { getOverseasSettings, updateOverseasSettings } from '../../lib/api/overseas';
import type { OverseasSettings } from '../../lib/types/overseas';

export const OverseasSettings: React.FC = () => {
  const [settings, setSettings] = useState<OverseasSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getOverseasSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await updateOverseasSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof OverseasSettings>(
    key: K,
    value: OverseasSettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Overseas Settings</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-4">
          <h3 className="text-lg font-medium">Car Mediation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mediation Fee (AED)
              </label>
              <input
                type="number"
                value={settings.car_mediation_fee_aed}
                onChange={(e) => updateSetting('car_mediation_fee_aed', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.car_refund_percent}
                onChange={(e) => updateSetting('car_refund_percent', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-medium">Parts Mediation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Threshold (AED)
              </label>
              <input
                type="number"
                value={settings.parts_mediation_threshold_aed}
                onChange={(e) => updateSetting('parts_mediation_threshold_aed', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.parts_mediation_fee_percent}
                onChange={(e) => updateSetting('parts_mediation_fee_percent', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Fee (AED)
              </label>
              <input
                type="number"
                value={settings.parts_mediation_min_fee_aed}
                onChange={(e) => updateSetting('parts_mediation_min_fee_aed', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-medium">Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-nags"
                checked={settings.show_verification_nags}
                onChange={(e) => updateSetting('show_verification_nags', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="show-nags" className="text-sm text-gray-700">
                Show verification nags
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Nags
              </label>
              <input
                type="number"
                min="0"
                value={settings.verification_nag_max}
                onChange={(e) => updateSetting('verification_nag_max', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-medium">Contact Warning</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warning Text
            </label>
            <textarea
              value={settings.contact_warning_text}
              onChange={(e) => updateSetting('contact_warning_text', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-medium">Allowed Countries</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Countries (comma-separated)
            </label>
            <input
              type="text"
              value={settings.allowed_origin_countries.join(', ')}
              onChange={(e) => updateSetting('allowed_origin_countries', e.target.value.split(',').map(c => c.trim()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="China, Japan, Korea"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};
