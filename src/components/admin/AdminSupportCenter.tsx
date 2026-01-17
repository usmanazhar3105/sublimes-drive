import { useState } from 'react';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  User,
  AlertCircle,
  Search,
  Filter,
  Star,
  BarChart3,
  Users,
  Headphones,
  Send,
  Plus,
  Settings,
  Download
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ViewToggle } from '../ui/ViewToggle';

export function AdminSupportCenter() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock support data
  const supportMetrics = {
    totalTickets: 1247,
    openTickets: 23,
    resolvedToday: 45,
    avgResponseTime: '2.3 hours',
    satisfactionScore: '4.8/5',
    activeAgents: 8,
    pendingTickets: 12,
    escalatedTickets: 3
  };

  // Mock support tickets
  const supportTickets = [
    {
      id: 'TKT-001',
      subject: 'Unable to upload car images',
      user: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      priority: 'High',
      status: 'Open',
      category: 'Technical',
      createdAt: '2024-01-20 14:30:00',
      lastReply: '2024-01-20 15:45:00',
      assignedTo: 'Sarah Admin',
      messages: 3
    },
    {
      id: 'TKT-002',
      subject: 'Payment failed for listing boost',
      user: 'Fatima Al-Zahra',
      email: 'fatima@example.com',
      priority: 'Medium',
      status: 'In Progress',
      category: 'Billing',
      createdAt: '2024-01-20 13:15:00',
      lastReply: '2024-01-20 14:20:00',
      assignedTo: 'Mike Support',
      messages: 5
    },
    {
      id: 'TKT-003',
      subject: 'How to verify my garage business?',
      user: 'Omar Garage',
      email: 'omar@garage.com',
      priority: 'Low',
      status: 'Resolved',
      category: 'General',
      createdAt: '2024-01-20 11:45:00',
      lastReply: '2024-01-20 12:30:00',
      assignedTo: 'Lisa Help',
      messages: 2
    },
    {
      id: 'TKT-004',
      subject: 'Account suspended without reason',
      user: 'Mohammed Ali',
      email: 'mohammed@example.com',
      priority: 'Urgent',
      status: 'Escalated',
      category: 'Account',
      createdAt: '2024-01-20 10:30:00',
      lastReply: '2024-01-20 11:15:00',
      assignedTo: 'Admin Team',
      messages: 8
    }
  ];

  // Mock agents
  const supportAgents = [
    { name: 'Sarah Admin', status: 'Online', tickets: 8, rating: 4.9, responseTime: '1.2 hours' },
    { name: 'Mike Support', status: 'Online', tickets: 12, rating: 4.7, responseTime: '1.8 hours' },
    { name: 'Lisa Help', status: 'Away', tickets: 6, rating: 4.8, responseTime: '2.1 hours' },
    { name: 'John Assist', status: 'Offline', tickets: 15, rating: 4.6, responseTime: '2.5 hours' }
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/30">
            Live
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">{value}</div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className="text-xs font-medium" style={{ color }}>{subtitle}</div>
        </div>
      </CardContent>
    </Card>
  );

  const TicketCard = ({ ticket }: any) => {
    if (viewMode === 'list') {
      return (
        <div className="grid grid-cols-9 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
          <div className="col-span-2">
            <div className="font-medium text-[var(--sublimes-light-text)] truncate">{ticket.subject}</div>
            <div className="text-sm text-gray-400">{ticket.id}</div>
          </div>
          <div className="text-sm text-[var(--sublimes-light-text)]">{ticket.user}</div>
          <div>
            <Badge 
              className={`text-xs ${
                ticket.priority === 'Urgent' ? 'bg-red-500/10 text-red-500' :
                ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-500' :
                ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-green-500/10 text-green-500'
              }`}
            >
              {ticket.priority}
            </Badge>
          </div>
          <div>
            <Badge 
              className={`text-xs ${
                ticket.status === 'Open' ? 'bg-blue-500/10 text-blue-500' :
                ticket.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' :
                ticket.status === 'Resolved' ? 'bg-green-500/10 text-green-500' :
                'bg-red-500/10 text-red-500'
              }`}
            >
              {ticket.status}
            </Badge>
          </div>
          <div className="text-sm text-gray-400">{ticket.category}</div>
          <div className="text-sm text-[var(--sublimes-light-text)]">{ticket.assignedTo}</div>
          <div className="text-sm text-gray-400">{ticket.createdAt}</div>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline" className="p-1 h-6 w-6">
              <MessageCircle className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="p-1 h-6 w-6">
              <User className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-[var(--sublimes-light-text)] truncate">{ticket.subject}</CardTitle>
            <div className="flex space-x-2">
              <Badge 
                className={`text-xs ${
                  ticket.priority === 'Urgent' ? 'bg-red-500/10 text-red-500' :
                  ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-500' :
                  ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-green-500/10 text-green-500'
                }`}
              >
                {ticket.priority}
              </Badge>
              <Badge 
                className={`text-xs ${
                  ticket.status === 'Open' ? 'bg-blue-500/10 text-blue-500' :
                  ticket.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' :
                  ticket.status === 'Resolved' ? 'bg-green-500/10 text-green-500' :
                  'bg-red-500/10 text-red-500'
                }`}
              >
                {ticket.status}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-gray-400">{ticket.id} • {ticket.category}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div>
                <span className="text-gray-400">User:</span> 
                <span className="text-[var(--sublimes-light-text)] ml-1">{ticket.user}</span>
              </div>
              <div>
                <span className="text-gray-400">Assigned to:</span> 
                <span className="text-[var(--sublimes-light-text)] ml-1">{ticket.assignedTo}</span>
              </div>
              <div>
                <span className="text-gray-400">Messages:</span> 
                <span className="text-[var(--sublimes-light-text)] ml-1">{ticket.messages}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">Created: {ticket.createdAt}</div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-1" />
                Reply
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <User className="h-4 w-4 mr-1" />
                Assign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Support Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Tickets"
          value={supportMetrics.totalTickets}
          subtitle="All time"
          icon={MessageCircle}
          color="#3B82F6"
        />
        <StatCard
          title="Open Tickets"
          value={supportMetrics.openTickets}
          subtitle="Need attention"
          icon={AlertCircle}
          color="#EF4444"
        />
        <StatCard
          title="Resolved Today"
          value={supportMetrics.resolvedToday}
          subtitle="+12 vs yesterday"
          icon={CheckCircle}
          color="#10B981"
        />
        <StatCard
          title="Avg Response"
          value={supportMetrics.avgResponseTime}
          subtitle="Target: <4 hours"
          icon={Clock}
          color="#D4AF37"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Support Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportAgents.map((agent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[var(--sublimes-light-text)]">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.tickets} tickets • {agent.responseTime}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-[var(--sublimes-gold)]" />
                      <span className="text-xs text-[var(--sublimes-light-text)]">{agent.rating}</span>
                    </div>
                    <Badge 
                      className={`text-xs ${
                        agent.status === 'Online' ? 'bg-green-500/10 text-green-500' :
                        agent.status === 'Away' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Satisfaction Score</span>
                <span className="text-sm font-medium text-[var(--sublimes-gold)]">{supportMetrics.satisfactionScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Active Agents</span>
                <span className="text-sm text-[var(--sublimes-light-text)]">{supportMetrics.activeAgents}/12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Pending Tickets</span>
                <span className="text-sm text-yellow-500">{supportMetrics.pendingTickets}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Escalated</span>
                <span className="text-sm text-red-500">{supportMetrics.escalatedTickets}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTicketsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Support Tickets</h3>
          <p className="text-gray-400">Manage customer support requests and communications</p>
        </div>
        <div className="flex items-center space-x-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search tickets..."
              className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
            <select className="px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
              <option>All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Escalated</option>
            </select>
            <select className="px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
              <option>All Priorities</option>
              <option>Urgent</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
              <option>All Categories</option>
              <option>Technical</option>
              <option>Billing</option>
              <option>Account</option>
              <option>General</option>
            </select>
            <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      {viewMode === 'list' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-0">
            <div className="grid grid-cols-9 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
              <div className="col-span-2 text-sm font-medium text-gray-400">Subject</div>
              <div className="text-sm font-medium text-gray-400">User</div>
              <div className="text-sm font-medium text-gray-400">Priority</div>
              <div className="text-sm font-medium text-gray-400">Status</div>
              <div className="text-sm font-medium text-gray-400">Category</div>
              <div className="text-sm font-medium text-gray-400">Assigned</div>
              <div className="text-sm font-medium text-gray-400">Created</div>
              <div className="text-sm font-medium text-gray-400">Actions</div>
            </div>
            {supportTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {supportTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Support Analytics</h3>
          <p className="text-gray-400">Track support performance and customer satisfaction</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--sublimes-border)] rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Response time chart would be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Ticket Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--sublimes-border)] rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Category distribution chart would be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Support Settings</h3>
        <p className="text-gray-400">Configure support system preferences and automation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Auto-Response Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Auto-Response Delay (minutes)</label>
              <Input 
                defaultValue="5"
                type="number"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Default Response Template</label>
              <Textarea
                defaultValue="Thank you for contacting Sublimes Drive support. We have received your message and will respond within 4 hours."
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--sublimes-light-text)]">Enable Auto-Response</span>
              <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-green-500">
                <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-6" />
              </div>
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Auto-Response Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Escalation Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Auto-escalate after (hours)</label>
              <Input 
                defaultValue="24"
                type="number"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Urgent Priority Escalation (hours)</label>
              <Input 
                defaultValue="4"
                type="number"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--sublimes-light-text)]">Email on Escalation</span>
              <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-green-500">
                <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-6" />
              </div>
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Escalation Rules
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Support Center</h1>
        <p className="text-gray-400">Manage customer support, chat analytics, and help desk</p>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <MessageCircle className="h-4 w-4 mr-2" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
        <TabsContent value="tickets">{renderTicketsTab()}</TabsContent>
        <TabsContent value="analytics">{renderAnalyticsTab()}</TabsContent>
        <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
      </Tabs>
    </div>
  );
}