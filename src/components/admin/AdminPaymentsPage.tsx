import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react';

export function AdminPaymentsPage() {
  const paymentStats = [
    { title: 'Total Revenue', value: 'AED 45.2K', change: '+18%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Active Subscriptions', value: '234', change: '+12%', icon: Users, color: 'text-blue-500' },
    { title: 'Monthly Growth', value: '23%', change: '+5%', icon: TrendingUp, color: 'text-[var(--sublimes-gold)]' },
    { title: 'Payment Success', value: '97.8%', change: '+0.2%', icon: CreditCard, color: 'text-green-500' },
  ];

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Payments & Billing</h1>
        <p className="text-gray-400">Manage payments, subscriptions, and billing settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {paymentStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className={`px-2 py-1 text-xs font-bold rounded ${stat.color.replace('text-', 'bg-')}/10 ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">Payments & Billing Management</h3>
        <p className="text-gray-400">Complete payment management system coming soon</p>
      </div>
    </div>
  );
}