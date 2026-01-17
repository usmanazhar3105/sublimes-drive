/**
 * RepairBidPage - Wired with Supabase Hooks
 * Uses: useGarages, useWallet, useAnalytics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Wrench, Upload, Send, Clock, X as XIcon, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useBidRepair, useAnalytics, useProfile } from '../hooks';
import { supabase } from '../utils/supabase/client';
import { useUploadBidRepairMedia } from '../../AI2SQL/hooks/useUploadBidRepairMedia';

interface RepairBidPageProps {
  onNavigate?: (page: string) => void;
}

export function RepairBidPage({ onNavigate: _onNavigate }: RepairBidPageProps) {
  const { profile } = useProfile();
  const [formData, setFormData] = useState({
    vehicle_info: '',
    issue_description: '',
    preferred_date: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { createBidRequest, getUserBidRequests } = useBidRepair();
  const upload = useUploadBidRepairMedia();
  const [myBids, setMyBids] = useState<any[]>([]);
  const analytics = useAnalytics();

  const isGarageOwner = profile?.role === 'garage_owner';

  const safeMyBids = myBids || [];

  useEffect(() => {
    analytics.trackPageView('/repair-bid');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await getUserBidRequests();
        const mapped = (list || []).map((r: any) => ({
          id: r.id,
          vehicle_info: r.title || 'Repair request',
          issue_description: r.description || '',
          bids_count: (r as any)?.bids_count || 0,
        }));
        setMyBids(mapped);
      } catch {
        setMyBids([]);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (isGarageOwner) {
      toast.error('Garage owners can view bids but cannot create repair requests.');
      return;
    }

    if (!formData.vehicle_info || !formData.issue_description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Upload any selected images first
      let urls: string[] = [];
      if (imageFiles.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) throw new Error('Sign in required to upload');
        const results = await Promise.allSettled(
          imageFiles.map((f) => upload(f, userId, 'request'))
        );
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) throw new Error('Failed to upload one or more images');
        urls = (results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<string>[])?.map(r => r.value) || [];
      }

      await createBidRequest({
        title: formData.vehicle_info,
        description: formData.issue_description,
        media: urls,
      });

      toast.success('Repair bid request submitted!');
      analytics.trackEvent('repair_bid_created');
      setFormData({ vehicle_info: '', issue_description: '', preferred_date: '' });
      setImageFiles([]);
      setImagePreviews([]);
      // refresh my requests list
      const list = await getUserBidRequests();
      const mapped = (list || []).map((r: any) => ({
        id: r.id,
        vehicle_info: r.title || 'Repair request',
        issue_description: r.description || '',
        bids_count: (r as any)?.bids_count || 0,
      }));
      setMyBids(mapped);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit bid request');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl text-[#E8EAED] mb-2">Repair Bid System</h1>
          <p className="text-sm text-[#8B92A7]">Get competitive quotes from verified garages</p>
        </div>
      </div>

      {isGarageOwner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-800 rounded-lg p-4 text-amber-100">
            <ShieldAlert className="h-5 w-5 text-amber-300 mt-0.5" />
            <div>
              <h3 className="font-semibold">View-only for Garage Owners</h3>
              <p className="text-sm text-amber-200/80">
                Garage owners can review incoming repair bids and reply, but cannot create new bid requests. 
                This keeps the flow car-owner → garage consistent with the RLS policies.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue={isGarageOwner ? 'active' : 'create'}>
          <TabsList className="bg-[#1A2332] border border-[#2A3342] mb-6">
            {!isGarageOwner && (
              <TabsTrigger value="create" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
                <Send size={16} className="mr-2" />
                Create Bid
              </TabsTrigger>
            )}
            <TabsTrigger value="active" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <Clock size={16} className="mr-2" />
              Active Bids ({safeMyBids.length})
            </TabsTrigger>
          </TabsList>

          {!isGarageOwner && (
            <TabsContent value="create">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#0F1829] border-[#1A2332]">
                  <CardHeader>
                    <CardTitle className="text-[#E8EAED]">Repair Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-[#8B92A7] mb-2 block">Vehicle Information</label>
                      <Input
                        value={formData.vehicle_info}
                        onChange={(e) => setFormData({ ...formData, vehicle_info: e.target.value })}
                        placeholder="e.g., 2020 Toyota Camry"
                        className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#8B92A7] mb-2 block">Issue Description</label>
                      <Textarea
                        value={formData.issue_description}
                        onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                        placeholder="Describe the repair needed..."
                        rows={5}
                        className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#8B92A7] mb-2 block">Preferred Date</label>
                      <Input
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                      />
                    </div>
                    {/* Photos Upload */}
                    <div>
                      <label className="text-sm text-[#8B92A7] mb-2 block">Photos (Optional)</label>
                      <div className="border-2 border-dashed border-[#2A3342] rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#1A2332] border border-[#2A3342] rounded cursor-pointer hover:border-[#D4AF37] text-[#E8EAED]">
                            <Upload size={16} />
                            <span>Add Photos</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                          </label>
                          <span className="text-xs text-[#8B92A7]">Up to 6 images</span>
                        </div>
                        {imagePreviews.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
                            {imagePreviews.map((src, idx) => (
                              <div key={idx} className="relative group">
                                <img src={src} className="w-full h-20 object-cover rounded" />
                                <button type="button" aria-label="Remove" className="absolute -top-2 -right-2 bg-[#0B1426] text-white rounded-full p-1 border border-[#2A3342] opacity-90 hover:opacity-100" onClick={() => removeImage(idx)}>
                                  <XIcon size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleSubmit} className="w-full bg-[#D4AF37] text-[#0B1426]">
                      <Send size={20} className="mr-2" />
                      Submit Bid Request
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#0F1829] border-[#1A2332]">
                  <CardHeader>
                    <CardTitle className="text-[#E8EAED]">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { step: 1, title: 'Submit Request', desc: 'Describe your repair needs' },
                        { step: 2, title: 'Get Quotes', desc: 'Receive bids from garages' },
                        { step: 3, title: 'Compare', desc: 'Review and compare offers' },
                        { step: 4, title: 'Book', desc: 'Choose and book your repair' },
                      ].map((item) => (
                        <div key={item.step} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0B1426] flex items-center justify-center flex-shrink-0">
                            {item.step}
                          </div>
                          <div>
                            <h4 className="text-[#E8EAED] mb-1">{item.title}</h4>
                            <p className="text-sm text-[#8B92A7]">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          <TabsContent value="active">
            {safeMyBids.length === 0 ? (
              <div className="text-center py-16">
                <Wrench className="mx-auto mb-4 text-[#8B92A7]" size={64} />
                <h3 className="text-xl text-[#E8EAED] mb-2">No active bids</h3>
                <p className="text-[#8B92A7]">
                  {isGarageOwner
                    ? 'You can review bids you are invited to respond to.'
                    : 'Create a bid request to get started.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {safeMyBids.map((bid) => (
                  <Card key={bid.id} className="bg-[#0F1829] border-[#1A2332]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg text-[#E8EAED] mb-2">{bid.vehicle_info}</h3>
                          <p className="text-sm text-[#8B92A7] mb-3">{bid.issue_description}</p>
                          <Badge className="bg-green-500/10 text-green-400 border-0">
                            {bid.bids_count || 0} bids received
                          </Badge>
                        </div>
                        <Button className="bg-[#D4AF37] text-[#0B1426]">View Bids</Button>
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
