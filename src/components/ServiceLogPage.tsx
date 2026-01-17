import React, { useState } from 'react';
import { useServiceLog } from '../hooks/useServiceLog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Wrench, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ServiceLogPage() {
  const { logs, reminders, loading, createLog, deleteLog } = useServiceLog();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    service_date: '',
    mileage: '',
    cost_amount: '',
    service_provider: '',
    notes: '',
    next_service_date: '',
    next_service_mileage: '',
  });

  const serviceTypes = [
    { value: 'oil_change', label: 'Oil Change' },
    { value: 'tire_rotation', label: 'Tire Rotation' },
    { value: 'brake_service', label: 'Brake Service' },
    { value: 'battery_replacement', label: 'Battery Replacement' },
    { value: 'ac_service', label: 'A/C Service' },
    { value: 'alignment', label: 'Wheel Alignment' },
    { value: 'inspection', label: 'Annual Inspection' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service_type || !formData.service_date) {
      toast.error('Service type and date are required');
      return;
    }

    const result = await createLog({
      service_type: formData.service_type,
      service_date: formData.service_date,
      mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      cost_amount: formData.cost_amount ? parseInt(formData.cost_amount) * 100 : undefined, // Convert to fils
      service_provider: formData.service_provider || undefined,
      notes: formData.notes || undefined,
      next_service_date: formData.next_service_date || undefined,
      next_service_mileage: formData.next_service_mileage ? parseInt(formData.next_service_mileage) : undefined,
    });

    if (result) {
      setShowAddDialog(false);
      setFormData({
        service_type: '',
        service_date: '',
        mileage: '',
        cost_amount: '',
        service_provider: '',
        notes: '',
        next_service_date: '',
        next_service_mileage: '',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vehicle Service Log</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Reminders */}
      {reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Upcoming Service Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reminders.map((reminder: any) => (
              <div
                key={reminder.id}
                className={`p-3 rounded-lg border ${getPriorityColor(reminder.priority)}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {serviceTypes.find(t => t.value === reminder.service_type)?.label || reminder.service_type}
                    </div>
                    {reminder.service_provider && (
                      <div className="text-sm">{reminder.service_provider}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(reminder.next_service_date).toLocaleDateString()}
                    </div>
                    {reminder.next_service_mileage && (
                      <div className="text-xs">@ {reminder.next_service_mileage.toLocaleString()} km</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Service History */}
      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No service records yet</p>
              <p className="text-sm">Start tracking your vehicle maintenance</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">
                        {serviceTypes.find(t => t.value === log.service_type)?.label || log.service_type}
                      </h3>
                      {log.service_provider && (
                        <p className="text-sm text-muted-foreground">{log.service_provider}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this service record?')) {
                          deleteLog(log.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(log.service_date).toLocaleDateString()}
                    </div>
                    {log.mileage && (
                      <div className="text-muted-foreground">
                        {log.mileage.toLocaleString()} km
                      </div>
                    )}
                    {log.cost_amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        AED {(log.cost_amount / 100).toFixed(2)}
                      </div>
                    )}
                  </div>

                  {log.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {log.notes}
                    </p>
                  )}

                  {log.next_service_date && (
                    <div className="mt-3 pt-3 border-t text-sm">
                      <span className="text-muted-foreground">Next service: </span>
                      {new Date(log.next_service_date).toLocaleDateString()}
                      {log.next_service_mileage && ` @ ${log.next_service_mileage.toLocaleString()} km`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Service Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Service Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Service Type *</Label>
              <Select
                value={formData.service_type}
                onValueChange={value => setFormData({ ...formData, service_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Service Date *</Label>
                <Input
                  type="date"
                  value={formData.service_date}
                  onChange={e => setFormData({ ...formData, service_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Mileage (km)</Label>
                <Input
                  type="number"
                  value={formData.mileage}
                  onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                  placeholder="e.g. 50000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Service Provider</Label>
                <Input
                  value={formData.service_provider}
                  onChange={e => setFormData({ ...formData, service_provider: e.target.value })}
                  placeholder="e.g. Premium Auto Spa"
                />
              </div>
              <div>
                <Label>Cost (AED)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost_amount}
                  onChange={e => setFormData({ ...formData, cost_amount: e.target.value })}
                  placeholder="e.g. 150.00"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Next Service Reminder (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Next Service Date</Label>
                  <Input
                    type="date"
                    value={formData.next_service_date}
                    onChange={e => setFormData({ ...formData, next_service_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Next Service Mileage (km)</Label>
                  <Input
                    type="number"
                    value={formData.next_service_mileage}
                    onChange={e => setFormData({ ...formData, next_service_mileage: e.target.value })}
                    placeholder="e.g. 55000"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Add Service Record</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
