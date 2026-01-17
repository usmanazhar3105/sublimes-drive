import { useState } from 'react';
import { Smartphone, Monitor, Tablet, MapPin, Clock, Shield, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  location: string;
  lastActive: string;
  current: boolean;
  ipAddress: string;
}

export default function DeviceManagementPage() {
  // Mock devices - replace with actual Supabase session data
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 14 Pro',
      type: 'mobile',
      browser: 'Safari',
      os: 'iOS 17.0',
      location: 'Dubai, UAE',
      lastActive: 'Active now',
      current: true,
      ipAddress: '192.168.1.1',
    },
    {
      id: '2',
      name: 'MacBook Pro',
      type: 'desktop',
      browser: 'Chrome',
      os: 'macOS 14.0',
      location: 'Dubai, UAE',
      lastActive: '2 hours ago',
      current: false,
      ipAddress: '192.168.1.2',
    },
    {
      id: '3',
      name: 'iPad Air',
      type: 'tablet',
      browser: 'Safari',
      os: 'iPadOS 17.0',
      location: 'Abu Dhabi, UAE',
      lastActive: '1 day ago',
      current: false,
      ipAddress: '192.168.1.3',
    },
  ]);

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'mobile':
        return Smartphone;
      case 'desktop':
        return Monitor;
      case 'tablet':
        return Tablet;
      default:
        return Smartphone;
    }
  };

  const revokeDevice = (id: string) => {
    // Mock revocation - replace with actual Supabase session revocation
    setDevices(devices.filter(d => d.id !== id));
    toast.success('Device access revoked successfully');
  };

  const revokeAllOtherDevices = () => {
    setDevices(devices.filter(d => d.current));
    toast.success('All other devices have been signed out');
  };

  return (
    <div className="min-h-screen bg-[#0B1426] p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-[#9CA3AF] hover:text-[#E8EAED] mb-4"
            onClick={() => window.history.back()}
          >
            ← Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#1A2332] rounded-lg">
                  <Shield className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h1 className="text-2xl font-bold text-[#E8EAED]">
                  Devices & Sessions
                </h1>
              </div>
              <p className="text-[#9CA3AF]">
                Manage devices that are signed in to your account
              </p>
            </div>
            
            {devices.filter(d => !d.current).length > 0 && (
              <Button
                onClick={revokeAllOtherDevices}
                variant="outline"
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                Sign Out All Other Devices
              </Button>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-blue-400 text-sm">
            <strong>Security Tip:</strong> If you see a device you don't recognize, 
            revoke its access immediately and change your password.
          </p>
        </div>

        {/* Devices List */}
        <div className="space-y-4">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type);
            
            return (
              <div
                key={device.id}
                className="bg-[#1A2332] border border-[#2A3441] rounded-lg p-6 hover:border-[#3A4451] transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="p-3 bg-[#0B1426] rounded-lg">
                    <DeviceIcon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-[#E8EAED] font-semibold mb-1 flex items-center gap-2">
                          {device.name}
                          {device.current && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded">
                              Current Device
                            </span>
                          )}
                        </h3>
                        <p className="text-[#9CA3AF] text-sm">
                          {device.browser} • {device.os}
                        </p>
                      </div>
                      
                      {!device.current && (
                        <Button
                          onClick={() => revokeDevice(device.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Revoke
                        </Button>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="text-[#9CA3AF]">{device.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#9CA3AF]" />
                        <span className="text-[#9CA3AF]">{device.lastActive}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[#9CA3AF]">IP: {device.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-8 bg-[#1A2332] border border-[#2A3441] rounded-lg p-6">
          <h3 className="text-[#E8EAED] font-semibold mb-3">
            About Device Management
          </h3>
          <ul className="text-[#9CA3AF] text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-0.5">•</span>
              <span>You'll be signed out from revoked devices immediately</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-0.5">•</span>
              <span>Location is estimated based on IP address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-0.5">•</span>
              <span>For added security, enable two-factor authentication</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
