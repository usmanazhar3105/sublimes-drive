/**
 * MyOrdersPage - Wired with Supabase Hooks
 * Uses: useWallet, useAnalytics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Package, Clock, CheckCircle, XCircle, Eye, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet, useAnalytics } from '../hooks';

interface MyOrdersPageProps {
  onNavigate?: (page: string) => void;
}

export function MyOrdersPage({ onNavigate }: MyOrdersPageProps) {
  const [activeTab, setActiveTab] = useState('all');

  const { transactions, loading } = useWallet();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/my-orders');
  }, []);

  const orders = transactions.filter(t => t.type === 'purchase');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-400 border-0">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-0">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-400 border-0">Cancelled</Badge>;
      default:
        return <Badge className="bg-[#1A2332] text-[#E8EAED] border-0">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl text-[#E8EAED] mb-2">My Orders</h1>
          <p className="text-sm text-[#8B92A7]">{orders.length} total orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#1A2332] border border-[#2A3342] mb-6">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              All Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <CheckCircle size={16} className="mr-2" />
              Completed ({completedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <Clock size={16} className="mr-2" />
              Pending ({pendingOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="mx-auto mb-4 text-[#8B92A7]" size={64} />
                <h3 className="text-xl text-[#E8EAED] mb-2">No orders yet</h3>
                <p className="text-[#8B92A7] mb-6">Start shopping to see your orders here</p>
                <Button onClick={() => onNavigate?.('marketplace')} className="bg-[#D4AF37] text-[#0B1426]">
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-[#0F1829] border-[#1A2332]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg text-[#E8EAED]">
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-[#8B92A7] mb-1">
                            {order.description || 'Marketplace purchase'}
                          </p>
                          <p className="text-xs text-[#8B92A7]">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl text-[#D4AF37] mb-2">
                            AED {order.amount.toLocaleString()}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-[#2A3342] text-[#E8EAED]">
                              <Eye size={16} />
                            </Button>
                            {order.status === 'completed' && (
                              <Button size="sm" variant="outline" className="border-[#2A3342] text-[#E8EAED]">
                                <Download size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
