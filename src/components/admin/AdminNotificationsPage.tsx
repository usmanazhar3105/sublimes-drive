import { useState } from 'react';
import { Bell, Send, Users, MessageSquare, Settings, CheckCircle, TrendingUp } from 'lucide-react';

export function AdminNotificationsPage() {
  const [selectedTab, setSelectedTab] = useState('broadcast');

  const tabs = [
    { id: 'broadcast', label: 'Broadcast Notifications', icon: Send },
    { id: 'settings', label: 'Notification Settings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: MessageSquare }
  ];

  const renderBroadcastContent = () => (
    <div className="space-y-6">
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
        <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">Send Broadcast Notification</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Notification Title</label>
            <input
              type="text"
              placeholder="Enter notification title..."
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Message Content</label>
            <textarea
              rows={4}
              placeholder="Enter your message..."
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Target Role</label>
              <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]">
                <option value="all">All Users</option>
                <option value="car-owner">Car Owners</option>
                <option value="garage-owner">Garage Owners</option>
                <option value="browser">Browsers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Target Emirate</label>
              <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]">
                <option value="all">All Emirates</option>
                <option value="dubai">Dubai</option>
                <option value="abu-dhabi">Abu Dhabi</option>
                <option value="sharjah">Sharjah</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Delivery Method</label>
              <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]">
                <option value="push">Push Notification</option>
                <option value="email">Email</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex-1 py-3 px-6 border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-lg hover:bg-[var(--sublimes-dark-bg)] transition-colors">
              Save as Draft
            </button>
            <button className="flex-1 py-3 px-6 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg font-medium hover:bg-[var(--sublimes-gold)]/90 transition-colors">
              Send Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Notifications & Messaging</h1>
        <p className="text-gray-400">Manage push notifications and user communications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Bell className="w-8 h-8 text-blue-500" />
            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500/10 text-blue-500">Live</span>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">2,847</p>
          <p className="text-sm text-gray-400">Total Notifications Sent</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-green-500" />
            <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/10 text-green-500">+12%</span>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">89.2%</p>
          <p className="text-sm text-gray-400">Delivery Rate</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-[var(--sublimes-gold)]" />
            <span className="px-2 py-1 text-xs font-bold rounded bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)]">+8%</span>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">67.5%</p>
          <p className="text-sm text-gray-400">Open Rate</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Send className="w-8 h-8 text-purple-500" />
            <span className="px-2 py-1 text-xs font-bold rounded bg-purple-500/10 text-purple-500">Live</span>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">156</p>
          <p className="text-sm text-gray-400">This Month</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex space-x-1 bg-[var(--sublimes-card-bg)] rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]'
                    : 'text-gray-400 hover:text-[var(--sublimes-light-text)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedTab === 'broadcast' && renderBroadcastContent()}
      {selectedTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">Notification Settings</h3>
            
            <div className="space-y-6">
              {/* Push Notification Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--sublimes-light-text)]">Push Notifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                    <div>
                      <label className="font-medium text-[var(--sublimes-light-text)]">New User Registration</label>
                      <p className="text-sm text-gray-400">Notify when new users sign up</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle toggle-success" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                    <div>
                      <label className="font-medium text-[var(--sublimes-light-text)]">New Listings</label>
                      <p className="text-sm text-gray-400">Notify users about new marketplace items</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle toggle-success" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                    <div>
                      <label className="font-medium text-[var(--sublimes-light-text)]">Community Updates</label>
                      <p className="text-sm text-gray-400">Notify about community activities</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle toggle-success" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                    <div>
                      <label className="font-medium text-[var(--sublimes-light-text)]">System Maintenance</label>
                      <p className="text-sm text-gray-400">Notify about system updates</p>
                    </div>
                    <input type="checkbox" className="toggle toggle-success" />
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--sublimes-light-text)]">Email Notifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                    <div>
                      <label className="font-medium text-[var(--sublimes-light-text)]">Weekly Reports</label>
                      <p className="text-sm text-gray-400">Send weekly analytics reports</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle toggle-success" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                    <div>
                      <label className="font-medium text-[var(--sublimes-light-text)]">Critical Alerts</label>
                      <p className="text-sm text-gray-400">Send critical system alerts</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle toggle-success" />
                  </div>
                </div>
              </div>

              {/* Notification Frequency */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--sublimes-light-text)]">Frequency Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Daily Digest</label>
                    <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]">
                      <option value="disabled">Disabled</option>
                      <option value="morning">Morning (9 AM)</option>
                      <option value="evening" selected>Evening (6 PM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Weekly Summary</label>
                    <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]">
                      <option value="sunday">Sunday</option>
                      <option value="monday" selected>Monday</option>
                      <option value="friday">Friday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Monthly Report</label>
                    <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]">
                      <option value="first" selected>1st of Month</option>
                      <option value="last">Last Day of Month</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="py-3 px-6 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg font-medium hover:bg-[var(--sublimes-gold)]/90 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Bell className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--sublimes-light-text)]">Total Sent</h3>
                    <p className="text-sm text-gray-400">This Month</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-[var(--sublimes-light-text)]">2,847</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-500">↗ +12%</span>
                <span className="text-gray-400">vs last month</span>
              </div>
            </div>

            <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--sublimes-light-text)]">Delivered</h3>
                    <p className="text-sm text-gray-400">Success Rate</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-[var(--sublimes-light-text)]">89.2%</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-500">↗ +5%</span>
                <span className="text-gray-400">vs last month</span>
              </div>
            </div>

            <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[var(--sublimes-gold)]/10 rounded-lg">
                    <Users className="w-6 h-6 text-[var(--sublimes-gold)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--sublimes-light-text)]">Opened</h3>
                    <p className="text-sm text-gray-400">Open Rate</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-[var(--sublimes-light-text)]">67.5%</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-500">↗ +8%</span>
                <span className="text-gray-400">vs last month</span>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">Recent Notifications</h3>
            <div className="space-y-4">
              {[
                { title: 'New Feature Launch', type: 'Feature Update', sent: '2 hours ago', delivered: '98%', opened: '72%' },
                { title: 'Weekly Community Digest', type: 'Community', sent: '1 day ago', delivered: '95%', opened: '68%' },
                { title: 'Marketplace Alert', type: 'Marketplace', sent: '2 days ago', delivered: '91%', opened: '74%' },
                { title: 'System Maintenance Notice', type: 'System', sent: '3 days ago', delivered: '87%', opened: '45%' },
                { title: 'Welcome New Users', type: 'Welcome', sent: '1 week ago', delivered: '94%', opened: '82%' }
              ].map((notification, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--sublimes-light-text)]">{notification.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-400">{notification.type}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-400">{notification.sent}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-[var(--sublimes-light-text)]">{notification.delivered}</p>
                      <p className="text-xs text-gray-400">Delivered</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-[var(--sublimes-light-text)]">{notification.opened}</p>
                      <p className="text-xs text-gray-400">Opened</p>
                    </div>
                    <button className="text-[var(--sublimes-gold)] hover:text-[var(--sublimes-gold)]/80 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)] mb-6">Performance Trends</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--sublimes-border)] rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Chart visualization would be implemented here</p>
                <p className="text-sm text-gray-500 mt-2">Integration with charting library required</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}