/**
 * Service Log Section for Profile Page
 * Tracks vehicle maintenance history privately
 */

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Car, Calendar, DollarSign, 
  AlertTriangle, MapPin, FileText, Loader2, Check 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface ServiceRecord {
  id: string;
  user_id: string;
  vehicle_name: string;
  service_date: string;
  mileage: number;
  service_type: string;
  provider: string;
  cost: number;
  next_service_date?: string;
  next_service_mileage?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface VehicleSummary {
  vehicle_name: string;
  current_mileage: number;
  last_updated: string;
  total_records: number;
  total_spent: number;
}

interface ServiceLogSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ServiceLogSection({ userId, isOwnProfile }: ServiceLogSectionProps) {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [vehicleSummaries, setVehicleSummaries] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceRecord>>({
    vehicle_name: '',
    service_date: new Date().toISOString().split('T')[0],
    mileage: 0,
    service_type: 'Oil Change',
    provider: '',
    cost: 0,
    next_service_date: '',
    next_service_mileage: 0,
    notes: ''
  });

  useEffect(() => {
    loadServiceRecords();
  }, [userId]);

  const loadServiceRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_logs')
        .select('*')
        .eq('user_id', userId)
        .order('service_date', { ascending: false });

      if (error) throw error;

      setServiceRecords(data || []);
      calculateVehicleSummaries(data || []);
    } catch (error: any) {
      console.error('Error loading service records:', error);
      // Don't show error toast if table doesn't exist yet
      if (!error.message?.includes('does not exist')) {
        toast.error('Failed to load service records');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateVehicleSummaries = (records: ServiceRecord[]) => {
    const vehicleMap = new Map<string, VehicleSummary>();

    records.forEach(record => {
      const existing = vehicleMap.get(record.vehicle_name);
      if (!existing) {
        vehicleMap.set(record.vehicle_name, {
          vehicle_name: record.vehicle_name,
          current_mileage: record.mileage,
          last_updated: record.service_date,
          total_records: 1,
          total_spent: record.cost || 0
        });
      } else {
        existing.total_records++;
        existing.total_spent += record.cost || 0;
        if (new Date(record.service_date) > new Date(existing.last_updated)) {
          existing.current_mileage = record.mileage;
          existing.last_updated = record.service_date;
        }
      }
    });

    setVehicleSummaries(Array.from(vehicleMap.values()));
  };

  const handleAddRecord = () => {
    setEditingRecord(null);
    setFormData({
      vehicle_name: vehicleSummaries[0]?.vehicle_name || '',
      service_date: new Date().toISOString().split('T')[0],
      mileage: 0,
      service_type: 'Oil Change',
      provider: '',
      cost: 0,
      next_service_date: '',
      next_service_mileage: 0,
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleEditRecord = (record: ServiceRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setIsAddModalOpen(true);
  };

  const handleSaveRecord = async () => {
    if (!formData.vehicle_name || !formData.service_date || !formData.mileage) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      const recordData = {
        user_id: userId,
        vehicle_name: formData.vehicle_name,
        service_date: formData.service_date,
        mileage: Number(formData.mileage),
        service_type: formData.service_type || 'Oil Change',
        provider: formData.provider || '',
        cost: Number(formData.cost) || 0,
        next_service_date: formData.next_service_date || null,
        next_service_mileage: formData.next_service_mileage ? Number(formData.next_service_mileage) : null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString()
      };

      if (editingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('service_logs')
          .update(recordData)
          .eq('id', editingRecord.id);

        if (error) throw error;
        toast.success('Service record updated successfully');
      } else {
        // Create new record
        const { error } = await supabase
          .from('service_logs')
          .insert([recordData]);

        if (error) throw error;
        toast.success('Service record added successfully');
      }

      setIsAddModalOpen(false);
      loadServiceRecords();
    } catch (error: any) {
      console.error('Error saving service record:', error);
      toast.error(error.message || 'Failed to save service record');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service record?')) return;

    try {
      const { error } = await supabase
        .from('service_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Service record deleted');
      loadServiceRecords();
    } catch (error: any) {
      console.error('Error deleting service record:', error);
      toast.error('Failed to delete service record');
    }
  };

  const getOverdueServices = () => {
    const today = new Date();
    return serviceRecords.filter(record => {
      if (record.next_service_date) {
        return new Date(record.next_service_date) < today;
      }
      return false;
    });
  };

  const overdueServices = getOverdueServices();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  if (!isOwnProfile) {
    return (
      <div className="text-center py-8 text-gray-400">
        Service logs are private
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl text-[#E8EAED]">Service Log</h3>
          <p className="text-sm text-gray-400">Track your vehicle maintenance privately</p>
        </div>
        <Button
          onClick={handleAddRecord}
          className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#0B1426]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service Record
        </Button>
      </div>

      {/* Vehicle Summaries */}
      {vehicleSummaries.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {vehicleSummaries.map((vehicle, index) => (
            <Card key={index} className="bg-[#0B1426] border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Car className="w-8 h-8 text-[#D4AF37]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[#E8EAED] truncate">{vehicle.vehicle_name}</div>
                    <div className="text-xs text-gray-400">
                      Last Updated: {new Date(vehicle.last_updated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs">Current Mileage</div>
                    <div className="text-[#E8EAED]">{vehicle.current_mileage.toLocaleString()} km</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Total Records</div>
                    <div className="text-[#E8EAED]">{vehicle.total_records}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-400 text-xs">Total Spent</div>
                    <div className="text-[#E8EAED]">AED {vehicle.total_spent.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Service Reminders */}
      {overdueServices.length > 0 && (
        <Card className="bg-red-900/10 border-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Overdue Services ({overdueServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueServices.map(service => (
              <div key={service.id} className="mb-2 last:mb-0">
                <div className="text-sm text-red-300">
                  • {service.service_type} - Due: {service.next_service_date && new Date(service.next_service_date).toLocaleDateString()} 
                  {service.next_service_mileage && ` or ${service.next_service_mileage.toLocaleString()} km`}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Service History */}
      <Card className="bg-[#151B2E] border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#E8EAED]">Service History</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No service records yet. Add your first service record to start tracking!
            </div>
          ) : (
            <div className="space-y-4">
              {serviceRecords.map((record) => (
                <div key={record.id} className="p-4 rounded-lg bg-[#0B1426] border border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-[#D4AF37]" />
                      <div>
                        <div className="text-[#E8EAED]">{record.service_type}</div>
                        <div className="text-sm text-gray-400">{record.provider || 'No provider'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRecord(record)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-400 text-xs">Service Date</div>
                      <div className="text-[#E8EAED]">{new Date(record.service_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Mileage</div>
                      <div className="text-[#E8EAED]">{record.mileage.toLocaleString()} km</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Cost</div>
                      <div className="text-[#E8EAED]">AED {record.cost.toLocaleString()}</div>
                    </div>
                    {record.next_service_date && (
                      <div>
                        <div className="text-gray-400 text-xs">Next Due</div>
                        <div className="text-[#E8EAED]">{new Date(record.next_service_date).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>

                  {record.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="text-xs text-gray-400 mb-1">Notes</div>
                      <div className="text-sm text-[#E8EAED]">{record.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Service Record' : 'Add Service Record'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vehicle Name *</Label>
                <Input
                  value={formData.vehicle_name}
                  onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                  placeholder="2023 BYD Seal"
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
              <div>
                <Label>Service Date *</Label>
                <Input
                  type="date"
                  value={formData.service_date}
                  onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Mileage (km) *</Label>
                <Input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                  placeholder="28500"
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
              <div>
                <Label>Cost (AED)</Label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  placeholder="280"
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Service Type</Label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-[#0B1426] border border-[#1A2332] text-[#E8EAED]"
                >
                  <option>Oil Change</option>
                  <option>Major Service</option>
                  <option>Minor Service</option>
                  <option>Tire Rotation</option>
                  <option>Brake Service</option>
                  <option>Battery Replacement</option>
                  <option>Coolant Flush</option>
                  <option>Transmission Service</option>
                  <option>Air Filter</option>
                  <option>Inspection</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <Label>Service Provider</Label>
                <Input
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="BYD Service Center Dubai"
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
            </div>

            <Separator className="bg-gray-800" />

            <div>
              <Label className="text-gray-400">Next Service Reminder (Optional)</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Next Service Date</Label>
                <Input
                  type="date"
                  value={formData.next_service_date}
                  onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
              <div>
                <Label>Next Service Mileage (km)</Label>
                <Input
                  type="number"
                  value={formData.next_service_mileage}
                  onChange={(e) => setFormData({ ...formData, next_service_mileage: Number(e.target.value) })}
                  placeholder="30000"
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Used synthetic oil, replaced air filter"
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="border-[#1A2332] text-[#E8EAED]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRecord}
              disabled={saving}
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#0B1426]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
