import { useState } from 'react';
import { Package2, Truck, CheckCircle, Clock, MapPin, QrCode, Phone, AlertTriangle, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MyPackagesPageProps {
  onNavigate?: (page: string) => void;
}

const packages = [
  {
    id: 'PKG-2024-001',
    trackingNumber: 'SP123456789',
    carrier: 'Sublime Express',
    status: 'out_for_delivery',
    item: 'NIO ES8 Performance Brake Pads',
    sender: 'AutoParts UAE',
    estimatedDelivery: '2024-01-19',
    currentLocation: 'Dubai Marina Sorting Facility',
    deliveryAddress: 'Dubai Marina, Tower 3, Apt 1205',
    weight: '2.5 kg',
    value: 1250,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    timeline: [
      { status: 'Package picked up', location: 'Al Quoz Warehouse', time: '2024-01-17 09:00', completed: true },
      { status: 'Arrived at sorting facility', location: 'Dubai Sorting Center', time: '2024-01-17 15:30', completed: true },
      { status: 'Out for delivery', location: 'Dubai Marina Hub', time: '2024-01-19 08:00', completed: true },
      { status: 'Delivered', location: 'Dubai Marina, Tower 3', time: 'Expected by 18:00', completed: false }
    ]
  },
  {
    id: 'PKG-2024-002',
    trackingNumber: 'FX987654321',
    carrier: 'FastTrack Delivery',
    status: 'in_transit',
    item: 'Hongqi H9 Carbon Fiber Spoiler',
    sender: 'Performance Parts Co',
    estimatedDelivery: '2024-01-20',
    currentLocation: 'Abu Dhabi Distribution Center',
    deliveryAddress: 'Business Bay, Executive Tower B, Office 2301',
    weight: '1.8 kg',
    value: 890,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop',
    timeline: [
      { status: 'Package dispatched', location: 'Sharjah Warehouse', time: '2024-01-18 14:00', completed: true },
      { status: 'In transit', location: 'Abu Dhabi Distribution', time: '2024-01-19 10:00', completed: true },
      { status: 'Out for delivery', location: 'Dubai Business Bay Hub', time: 'Expected 2024-01-20 09:00', completed: false },
      { status: 'Delivered', location: 'Business Bay, Executive Tower B', time: 'Expected by 17:00', completed: false }
    ]
  },
  {
    id: 'PKG-2024-003',
    trackingNumber: 'DL456789123',
    carrier: 'UAE Express',
    status: 'delivered',
    item: 'BYD Tang Interior LED Kit',
    sender: 'Bright Auto Lights',
    deliveredDate: '2024-01-15',
    deliveryAddress: 'Dubai Marina, Tower 3, Apt 1205',
    weight: '0.8 kg',
    value: 320,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=200&fit=crop',
    timeline: [
      { status: 'Package picked up', location: 'Ajman Warehouse', time: '2024-01-13 11:00', completed: true },
      { status: 'Processed at facility', location: 'Dubai Sorting Center', time: '2024-01-14 08:30', completed: true },
      { status: 'Out for delivery', location: 'Dubai Marina Hub', time: '2024-01-15 09:00', completed: true },
      { status: 'Delivered', location: 'Dubai Marina, Tower 3', time: '2024-01-15 14:30', completed: true }
    ]
  },
  {
    id: 'PKG-2024-004',
    trackingNumber: 'EX789456123',
    carrier: 'Express Courier',
    status: 'delayed',
    item: 'Geely Coolray Dashboard Cover',
    sender: 'Car Interior Co',
    originalDelivery: '2024-01-18',
    newEstimatedDelivery: '2024-01-21',
    currentLocation: 'Customs Clearance - Dubai',
    deliveryAddress: 'Jumeirah Lakes Towers, Cluster A, Tower 2',
    weight: '1.2 kg',
    value: 180,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
    delayReason: 'Customs clearance required - additional documentation needed',
    timeline: [
      { status: 'Package dispatched', location: 'China Warehouse', time: '2024-01-10 10:00', completed: true },
      { status: 'Arrived in UAE', location: 'Dubai International Airport', time: '2024-01-16 22:00', completed: true },
      { status: 'Customs clearance', location: 'Dubai Customs', time: '2024-01-17 09:00', completed: false },
      { status: 'Released for delivery', location: 'Dubai Sorting Center', time: 'Pending clearance', completed: false }
    ]
  }
];

export function MyPackagesPage({ onNavigate }: MyPackagesPageProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [trackingInput, setTrackingInput] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_transit':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgress = (timeline: any[]) => {
    const completed = timeline.filter(item => item.completed).length;
    return (completed / timeline.length) * 100;
  };

  const filteredPackages = activeTab === 'all' 
    ? packages 
    : packages.filter(pkg => 
        activeTab === 'active' ? ['in_transit', 'out_for_delivery'].includes(pkg.status) :
        activeTab === 'delivered' ? pkg.status === 'delivered' :
        pkg.status === activeTab
      );

  const packageCounts = {
    all: packages.length,
    active: packages.filter(p => ['in_transit', 'out_for_delivery'].includes(p.status)).length,
    delivered: packages.filter(p => p.status === 'delivered').length,
    delayed: packages.filter(p => p.status === 'delayed').length
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Package2 className="h-6 w-6 text-[var(--sublimes-gold)]" />
                My Packages
              </h1>
              <p className="text-sm text-muted-foreground">Track all your package deliveries</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Quick Track */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Quick Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter tracking number..."
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="flex-1"
              />
              <Button>Track Package</Button>
            </div>
          </CardContent>
        </Card>

        {/* Package Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[var(--sublimes-gold)]">{packageCounts.all}</div>
              <div className="text-sm text-muted-foreground">Total Packages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{packageCounts.active}</div>
              <div className="text-sm text-muted-foreground">In Transit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{packageCounts.delivered}</div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{packageCounts.delayed}</div>
              <div className="text-sm text-muted-foreground">Delayed</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({packageCounts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({packageCounts.active})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({packageCounts.delivered})</TabsTrigger>
            <TabsTrigger value="delayed">Delayed ({packageCounts.delayed})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredPackages.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No packages found</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any packages in this category yet.
                    </p>
                    <Button onClick={() => onNavigate?.('marketplace')}>
                      Shop Now
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredPackages.map((pkg) => (
                  <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <ImageWithFallback 
                          src={pkg.image} 
                          alt={pkg.item}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold mb-1">{pkg.item}</h3>
                              <div className="text-sm text-muted-foreground mb-2">
                                From: {pkg.sender} • Tracking: {pkg.trackingNumber}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Carrier: {pkg.carrier} • Weight: {pkg.weight}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <Badge className={getStatusColor(pkg.status)} >
                                {getStatusIcon(pkg.status)}
                                <span className="ml-1 capitalize">{pkg.status.replace('_', ' ')}</span>
                              </Badge>
                              <div className="text-sm text-muted-foreground mt-1">
                                AED {pkg.value.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Current Status */}
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">Current Location</span>
                            </div>
                            <div className="text-sm">{pkg.currentLocation}</div>
                            
                            {pkg.status === 'delayed' && pkg.delayReason && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                                  <AlertTriangle className="h-3 w-3" />
                                  Delay Reason
                                </div>
                                <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                                  {pkg.delayReason}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Delivery Progress</span>
                              <span>{Math.round(getProgress(pkg.timeline))}%</span>
                            </div>
                            <Progress value={getProgress(pkg.timeline)} className="h-2" />
                          </div>

                          {/* Timeline Preview */}
                          <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Tracking Timeline</div>
                            <div className="space-y-2">
                              {pkg.timeline.slice(-2).map((event, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <div className={`w-2 h-2 rounded-full ${event.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  <div className="flex-1">
                                    <span className={event.completed ? 'text-foreground' : 'text-muted-foreground'}>
                                      {event.status}
                                    </span>
                                    <div className="text-xs text-muted-foreground">
                                      {event.location} • {event.time}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <div className="text-muted-foreground mb-1">Delivery Address:</div>
                              <div>{pkg.deliveryAddress}</div>
                            </div>
                            <div>
                              {pkg.status === 'delivered' && pkg.deliveredDate ? (
                                <div>
                                  <div className="text-muted-foreground mb-1">Delivered:</div>
                                  <div className="text-green-600">{new Date(pkg.deliveredDate).toLocaleDateString()}</div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-muted-foreground mb-1">
                                    {pkg.status === 'delayed' ? 'New Est. Delivery:' : 'Est. Delivery:'}
                                  </div>
                                  <div className={pkg.status === 'delayed' ? 'text-red-600' : 'text-blue-600'}>
                                    {new Date(pkg.newEstimatedDelivery || pkg.estimatedDelivery).toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Full Timeline
                            </Button>
                            {pkg.status === 'delivered' ? (
                              <Button variant="outline" size="sm">
                                <Star className="h-3 w-3 mr-1" />
                                Rate Delivery
                              </Button>
                            ) : (
                              <>
                                <Button variant="outline" size="sm">
                                  <Phone className="h-3 w-3 mr-1" />
                                  Contact Carrier
                                </Button>
                                {pkg.status === 'out_for_delivery' && (
                                  <Button variant="outline" size="sm">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Live Track
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}