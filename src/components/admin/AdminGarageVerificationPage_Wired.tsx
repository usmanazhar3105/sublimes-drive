/**
 * AdminGarageVerificationPage_Wired - Garage Verification
 * Uses: useGarages, useAnalytics
 */

import { useEffect } from 'react';
import { Wrench, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useGarages, useAnalytics } from '../../src/hooks';

export function AdminGarageVerificationPage_Wired() {
  const { garages, updateGarage } = useGarages();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/admin/garage-verification');
  }, []);

  const pendingGarages = garages.filter(g => g.verification_status === 'pending');

  const handleApprove = async (id: string) => {
    await updateGarage(id, { verification_status: 'verified' });
    toast.success('Garage verified');
    analytics.trackEvent('admin_garage_verified', { garage_id: id });
  };

  const handleReject = async (id: string) => {
    await updateGarage(id, { verification_status: 'rejected' });
    toast.success('Garage rejected');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>Garage Verification</h1>
      <div className="grid gap-4">
        {pendingGarages.map((garage) => (
          <Card key={garage.id} className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="text-[#D4AF37]" size={20} />
                    <h3 className="text-lg text-[#E8EAED]" style={{ fontWeight: 600 }}>
                      {garage.name}
                    </h3>
                  </div>
                  <p className="text-[#8B92A7] mb-2">{garage.location}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{garage.services?.join(', ')}</Badge>
                    <Badge className="bg-orange-500/20 text-orange-400">
                      <Clock className="mr-1" size={12} />
                      Pending
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(garage.id)} className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="mr-2" size={16} />
                    Approve
                  </Button>
                  <Button onClick={() => handleReject(garage.id)} variant="outline" className="border-red-500 text-red-500">
                    <XCircle className="mr-2" size={16} />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {pendingGarages.length === 0 && (
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl text-[#E8EAED] mb-2">All Caught Up!</h3>
              <p className="text-[#8B92A7]">No pending garage verifications</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
