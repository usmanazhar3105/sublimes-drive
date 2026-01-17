import React, { useState } from 'react';
import { Settings, CheckCircle, DollarSign, Globe } from 'lucide-react';
import { OverseasSettings } from './OverseasSettings';
import { VerificationQueue } from './VerificationQueue';
import { MediationsQueue } from './MediationsQueue';

export const OverseasAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'verification' | 'mediations'>('settings');

  const tabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'verification', label: 'Verification Queue', icon: CheckCircle },
    { id: 'mediations', label: 'Mediations Queue', icon: DollarSign },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Overseas Management</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'settings' && <OverseasSettings />}
        {activeTab === 'verification' && <VerificationQueue />}
        {activeTab === 'mediations' && <MediationsQueue />}
      </div>
    </div>
  );
};
