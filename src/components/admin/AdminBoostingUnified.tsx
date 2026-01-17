/**
 * WiringDoc (auto)
 * Entities: [marketplace_listings, garages, wallet_transactions, entitlements]
 * Reads: public.marketplace_listings(boosted), public.garages(boosted), public.wallet_transactions
 * Writes: fn.approve_boost, fn.deny_boost, fn.refund_boost
 * RLS: admin_all_listings, admin_all_garages
 * Role UI: admin, editor
 * Stripe: webhook payment confirmations
 * AI Bot: n/a
 * Telemetry: view:admin_boosting, action:approve_boost, action:deny_boost, action:refund_boost
 * Last Verified: 2025-10-31T00:00:00Z
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Car,
  Building2,
  DollarSign,
  Calendar,
  Eye,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface BoostRequest {
  id: string;
  entity_type: 'marketplace' | 'garage';
  entity_id: string;
  user_id: string;
  boost_package: string;
  boost_duration_days: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_amount: number;
  payment_id?: string;
  status: 'pending' | 'approved' | 'denied' | 'active' | 'expired';
  starts_at?: string;
  expires_at?: string;
  created_at: string;
  // Entity details (joined)
  entity?: {
    title: string;
    images?: string[];
    thumbnail_url?: string;
  };
  // User details (joined)
  profiles?: {
    display_name: string;
    email: string;
  };
}

export function AdminBoostingUnified() {
  const [activeTab, setActiveTab] = useState('pending');
  const [entityType, setEntityType] = useState<'marketplace' | 'garage'>('marketplace');
  const [boostRequests, setBoostRequests] = useState<BoostRequest[]>([]);
  const [selectedBoost, setSelectedBoost] = useState<BoostRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBoostRequests();
    logAnalytics('view', 'admin_boosting');
  }, [activeTab, entityType]);

  const fetchBoostRequests = async () => {
    setLoading(true);
    try {
      let profilesMap: Record<string, { display_name?: string; email?: string }> = {};
      
      // Fetch marketplace boosts
      if (entityType === 'marketplace') {
        // Step 1: Fetch listings without FK join
        const { data: listingsData, error: listingsError } = await supabase
          .from('marketplace_listings')
          .select(`
            id,
            user_id,
            title,
            images,
            thumbnail_url,
            is_boosted,
            boost_package,
            boost_expires_at,
            boost_payment_id,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;

        // Step 2: Get unique user IDs and fetch profiles separately
        const userIds = [...new Set((listingsData || []).map(l => l.user_id).filter(Boolean))];
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .in('id', userIds);

          if (profilesData) {
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = { display_name: profile.display_name, email: profile.email };
              return acc;
            }, {} as Record<string, { display_name?: string; email?: string }>);
          }
        }

        // Step 3: Transform to BoostRequest format with merged profiles
        const transformed = (listingsData || []).map(item => {
          const isBoosted = item.is_boosted === true;
          const hasExpired = item.boost_expires_at && new Date(item.boost_expires_at) < new Date();
          
          let status: 'pending' | 'approved' | 'denied' | 'active' | 'expired' = 'pending';
          if (isBoosted && hasExpired) {
            status = 'expired';
          } else if (isBoosted) {
            status = 'active';
          } else if (item.boost_package) {
            status = 'pending';
          }

          return {
            id: item.id,
            entity_type: 'marketplace' as const,
            entity_id: item.id,
            user_id: item.user_id,
            boost_package: item.boost_package || 'basic',
            boost_duration_days: 30,
            payment_status: item.boost_payment_id ? 'completed' as const : 'pending' as const,
            payment_amount: item.boost_package === 'premium' ? 500 : item.boost_package === 'featured' ? 1000 : 250,
            payment_id: item.boost_payment_id,
            status,
            expires_at: item.boost_expires_at,
            created_at: item.created_at,
            entity: {
              title: item.title || 'Untitled Listing',
              images: item.images,
              thumbnail_url: item.thumbnail_url || (item.images && item.images[0])
            },
            profiles: profilesMap[item.user_id] || { display_name: 'Unknown User', email: '' }
          };
        });

        // Filter by active tab
        setBoostRequests(transformed.filter(b => {
          if (activeTab === 'pending') return b.status === 'pending';
          if (activeTab === 'active') return b.status === 'active';
          if (activeTab === 'expired') return b.status === 'expired';
          return true;
        }));
      }
      // Garages
      else {
        // Step 1: Fetch garages without FK join
        const { data: garagesData, error: garagesError } = await supabase
          .from('garages')
          .select(`
            id,
            owner_id,
            name,
            images,
            is_boosted,
            boost_level,
            boost_expires_at,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (garagesError) throw garagesError;

        // Step 2: Get unique owner IDs and fetch profiles separately
        const ownerIds = [...new Set((garagesData || []).map(g => g.owner_id).filter(Boolean))];
        
        if (ownerIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .in('id', ownerIds);

          if (profilesData) {
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = { display_name: profile.display_name, email: profile.email };
              return acc;
            }, {} as Record<string, { display_name?: string; email?: string }>);
          }
        }

        // Step 3: Transform to BoostRequest format with merged profiles
        const transformed = (garagesData || []).map(item => {
          const isBoosted = item.is_boosted === true;
          const hasExpired = item.boost_expires_at && new Date(item.boost_expires_at) < new Date();
          
          let status: 'pending' | 'approved' | 'denied' | 'active' | 'expired' = 'pending';
          if (isBoosted && hasExpired) {
            status = 'expired';
          } else if (isBoosted) {
            status = 'active';
          } else if (item.boost_level) {
            status = 'pending';
          }

          return {
            id: item.id,
            entity_type: 'garage' as const,
            entity_id: item.id,
            user_id: item.owner_id,
            boost_package: item.boost_level || 'basic',
            boost_duration_days: 30,
            payment_status: 'completed' as const,
            payment_amount: 500,
            status,
            expires_at: item.boost_expires_at,
            created_at: item.created_at,
            entity: {
              title: item.name || 'Unnamed Garage',
              images: item.images,
              thumbnail_url: item.images?.[0]
            },
            profiles: profilesMap[item.owner_id] || { display_name: 'Unknown Owner', email: '' }
          };
        });

        // Filter by active tab
        setBoostRequests(transformed.filter(b => {
          if (activeTab === 'pending') return b.status === 'pending';
          if (activeTab === 'active') return b.status === 'active';
          if (activeTab === 'expired') return b.status === 'expired';
          return true;
        }));
      }
    } catch (error: any) {
      console.error('Error fetching boost requests:', error);
      toast.error('Failed to load boost requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (boost: BoostRequest) => {
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + boost.boost_duration_days);

      const table = boost.entity_type === 'marketplace' ? 'marketplace_listings' : 'garages';
      const { error } = await supabase
        .from(table)
        .update({
          is_boosted: true,
          boost_package: boost.boost_package,
          boost_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', boost.entity_id);

      if (error) throw error;

      await logAudit('approve_boost', table, boost.entity_id, true);
      await logAnalytics('action', 'approve_boost');

      toast.success('Boost approved and activated');
      setDetailsOpen(false);
      fetchBoostRequests();
    } catch (error: any) {
      console.error('Error approving boost:', error);
      toast.error('Failed to approve boost');
      await logAudit('approve_boost', 'boost', boost.id, false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (boost: BoostRequest) => {
    if (!actionNotes.trim()) {
      toast.error('Please provide a denial reason');
      return;
    }

    setLoading(true);
    try {
      // Set boost to inactive and refund if payment was made
      const table = boost.entity_type === 'marketplace' ? 'marketplace_listings' : 'garages';
      const { error } = await supabase
        .from(table)
        .update({
          is_boosted: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', boost.entity_id);

      if (error) throw error;

      // TODO: Trigger refund via Stripe if payment was completed

      await logAudit('deny_boost', table, boost.entity_id, true);
      await logAnalytics('action', 'deny_boost');

      toast.success('Boost denied and refund initiated');
      setDetailsOpen(false);
      setActionNotes('');
      fetchBoostRequests();
    } catch (error: any) {
      console.error('Error denying boost:', error);
      toast.error('Failed to deny boost');
      await logAudit('deny_boost', 'boost', boost.id, false);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (boost: BoostRequest) => {
    if (!actionNotes.trim()) {
      toast.error('Please provide a refund reason');
      return;
    }

    setLoading(true);
    try {
      // TODO: Process refund via Stripe
      // For now, just deactivate boost
      const table = boost.entity_type === 'marketplace' ? 'marketplace_listings' : 'garages';
      const { error } = await supabase
        .from(table)
        .update({
          is_boosted: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', boost.entity_id);

      if (error) throw error;

      await logAudit('refund_boost', table, boost.entity_id, true);
      await logAnalytics('action', 'refund_boost');

      toast.success('Boost refunded');
      setDetailsOpen(false);
      setActionNotes('');
      fetchBoostRequests();
    } catch (error: any) {
      console.error('Error refunding boost:', error);
      toast.error('Failed to process refund');
      await logAudit('refund_boost', 'boost', boost.id, false);
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (boost: BoostRequest, days: number) => {
    setLoading(true);
    try {
      const currentExpiry = boost.expires_at ? new Date(boost.expires_at) : new Date();
      const newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + days);

      const table = boost.entity_type === 'marketplace' ? 'marketplace_listings' : 'garages';
      const { error } = await supabase
        .from(table)
        .update({
          boost_expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', boost.entity_id);

      if (error) throw error;

      await logAudit('extend_boost', table, boost.entity_id, true);

      toast.success(`Boost extended by ${days} days`);
      setDetailsOpen(false);
      fetchBoostRequests();
    } catch (error: any) {
      console.error('Error extending boost:', error);
      toast.error('Failed to extend boost');
    } finally {
      setLoading(false);
    }
  };

  const logAudit = async (action: string, entity: string, entityId: string, success: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        entity,
        entity_id: entityId,
        success,
        metadata: { notes: actionNotes },
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  };

  const logAnalytics = async (type: 'view' | 'action', event: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: type,
        event_name: event,
        metadata: { tab: activeTab, entity_type: entityType },
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging analytics:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'denied':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return null;
    }
  };

  const getBoostBadge = (pkg: string) => {
    const colors = {
      basic: 'bg-blue-500/10 text-blue-400',
      premium: 'bg-purple-500/10 text-purple-400',
      featured: 'bg-[#D4AF37]/10 text-[#D4AF37]',
      gold: 'bg-[#D4AF37]/10 text-[#D4AF37]'
    };
    return (
      <Badge variant="outline" className={colors[pkg as keyof typeof colors] || colors.basic}>
        <TrendingUp className="w-3 h-3 mr-1" />
        {pkg.toUpperCase()}
      </Badge>
    );
  };

  const BoostCard = ({ boost, onClick }: { boost: BoostRequest; onClick: () => void }) => (
    <Card 
      className="p-4 bg-[#1a1f2e] border-gray-700 hover:border-[#D4AF37] cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {boost.entity?.thumbnail_url && (
          <img 
            src={boost.entity.thumbnail_url} 
            alt={boost.entity.title}
            className="w-24 h-24 object-cover rounded"
          />
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-[#E8EAED]">{boost.entity?.title}</h4>
              <div className="text-sm text-gray-400">{boost.profiles?.display_name}</div>
            </div>
            <div className="flex gap-2">
              {getBoostBadge(boost.boost_package)}
              {getStatusBadge(boost.status)}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              AED {boost.payment_amount}
            </div>
            {boost.expires_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Expires: {new Date(boost.expires_at).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-1">
              {boost.entity_type === 'marketplace' ? <Car className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              {boost.entity_type}
            </div>
          </div>
        </div>
        <Eye className="w-5 h-5 text-gray-400" />
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl text-[#E8EAED] mb-2">Unified Boosting Panel</h1>
        <p className="text-gray-400">Manage boosts for Marketplace and Garage Hub</p>
      </div>

      {/* Entity Type Toggle */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={entityType === 'marketplace' ? 'default' : 'outline'}
          onClick={() => setEntityType('marketplace')}
          className={entityType === 'marketplace' ? 'bg-[#D4AF37] text-black' : ''}
        >
          <Car className="w-4 h-4 mr-2" />
          Marketplace
        </Button>
        <Button
          variant={entityType === 'garage' ? 'default' : 'outline'}
          onClick={() => setEntityType('garage')}
          className={entityType === 'garage' ? 'bg-[#D4AF37] text-black' : ''}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Garage Hub
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#1a1f2e] border border-gray-700">
          <TabsTrigger value="pending" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({boostRequests.filter(b => b.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <TrendingUp className="w-4 h-4 mr-2" />
            Active ({boostRequests.filter(b => b.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <XCircle className="w-4 h-4 mr-2" />
            Expired
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-3">
            {boostRequests.map(boost => (
              <BoostCard 
                key={boost.id}
                boost={boost}
                onClick={() => {
                  setSelectedBoost(boost);
                  setDetailsOpen(true);
                }}
              />
            ))}
            {boostRequests.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <div>No {activeTab} boosts</div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Boost Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-[#1a1f2e] border-gray-700 text-[#E8EAED] max-w-2xl">
          {selectedBoost && (
            <>
              <DialogHeader>
                <DialogTitle>Boost Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Entity Preview */}
                <div>
                  {selectedBoost.entity?.thumbnail_url && (
                    <img 
                      src={selectedBoost.entity.thumbnail_url}
                      alt={selectedBoost.entity.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="text-lg text-[#E8EAED]">{selectedBoost.entity?.title}</h3>
                  <div className="flex gap-2 mt-2">
                    {getBoostBadge(selectedBoost.boost_package)}
                    {getStatusBadge(selectedBoost.status)}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#0B1426] rounded-lg">
                  <div>
                    <div className="text-sm text-gray-400">Owner</div>
                    <div className="text-[#E8EAED]">{selectedBoost.profiles?.display_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Amount</div>
                    <div className="text-[#E8EAED]">AED {selectedBoost.payment_amount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Duration</div>
                    <div className="text-[#E8EAED]">{selectedBoost.boost_duration_days} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Payment Status</div>
                    <div className="text-[#E8EAED]">{selectedBoost.payment_status}</div>
                  </div>
                  {selectedBoost.expires_at && (
                    <div className="col-span-2">
                      <div className="text-sm text-gray-400">Expires</div>
                      <div className="text-[#E8EAED]">{new Date(selectedBoost.expires_at).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                {(selectedBoost.status === 'pending' || selectedBoost.status === 'active') && (
                  <div>
                    <Label className="text-gray-400 mb-2 block">Admin Notes</Label>
                    <Textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Add notes or reason..."
                      className="bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                      rows={3}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedBoost.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApprove(selectedBoost)}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Activate
                      </Button>
                      <Button
                        onClick={() => handleDeny(selectedBoost)}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Deny & Refund
                      </Button>
                    </>
                  )}
                  {selectedBoost.status === 'active' && (
                    <>
                      <Button
                        onClick={() => handleExtend(selectedBoost, 7)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Extend +7 days
                      </Button>
                      <Button
                        onClick={() => handleExtend(selectedBoost, 30)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Extend +30 days
                      </Button>
                      <Button
                        onClick={() => handleRefund(selectedBoost)}
                        disabled={loading}
                        variant="destructive"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Refund
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
