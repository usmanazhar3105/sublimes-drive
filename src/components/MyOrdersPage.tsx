import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, AlertCircle, MapPin, Calendar, Star, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MyOrdersPageProps {
  onNavigate?: (page: string) => void;
}

const orders = [
  {
    id: 'ORD-2024-001',
    type: 'marketplace',
    item: 'NIO ES8 Performance Brake Pads',
    seller: {
      name: 'AutoParts UAE',
      avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=40&h=40&fit=crop',
      rating: 4.8
    },
    price: 1250,
    quantity: 1,
    status: 'delivered',
    orderDate: '2024-01-10',
    deliveryDate: '2024-01-15',
    trackingNumber: 'SP123456789',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    deliveryAddress: 'Dubai Marina, Tower 3, Apt 1205'
  },
  {
    id: 'ORD-2024-002',
    type: 'service',
    item: 'BYD Han Full Service Package',
    seller: {
      name: 'Elite Auto Service',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
      rating: 4.9
    },
    price: 450,
    quantity: 1,
    status: 'in_progress',
    orderDate: '2024-01-12',
    estimatedCompletion: '2024-01-18',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
    serviceLocation: 'Al Quoz Industrial Area 3'
  },
  {
    id: 'ORD-2024-003',
    type: 'marketplace',
    item: 'Hongqi H9 Carbon Fiber Spoiler',
    seller: {
      name: 'Performance Parts Co',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b6aa2f2a?w=40&h=40&fit=crop',
      rating: 4.7
    },
    price: 890,
    quantity: 1,
    status: 'shipped',
    orderDate: '2024-01-14',
    estimatedDelivery: '2024-01-19',
    trackingNumber: 'FX987654321',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop',
    deliveryAddress: 'Business Bay, Executive Tower B, Office 2301'
  },
  {
    id: 'ORD-2024-004',
    type: 'marketplace',
    item: 'Geely Coolray LED Headlight Set',
    seller: {
      name: 'Bright Auto Lights',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
      rating: 4.6
    },
    price: 675,
    quantity: 2,
    status: 'processing',
    orderDate: '2024-01-16',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=200&fit=crop'
  }
];

export function MyOrdersPage({ onNavigate }: MyOrdersPageProps) {
  const [activeTab, setActiveTab] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgress = (status: string) => {
    switch (status) {
      case 'processing':
        return 25;
      case 'shipped':
      case 'in_progress':
        return 75;
      case 'delivered':
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => 
        activeTab === 'marketplace' ? order.type === 'marketplace' : 
        activeTab === 'services' ? order.type === 'service' :
        order.status === activeTab
      );

  const orderCounts = {
    all: orders.length,
    marketplace: orders.filter(o => o.type === 'marketplace').length,
    services: orders.filter(o => o.type === 'service').length,
    active: orders.filter(o => ['processing', 'shipped', 'in_progress'].includes(o.status)).length
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6 text-[var(--sublimes-gold)]" />
                My Orders
              </h1>
              <p className="text-sm text-muted-foreground">Track your purchases and services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[var(--sublimes-gold)]">{orderCounts.all}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{orderCounts.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                {orders.filter(o => ['delivered', 'completed'].includes(o.status)).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">
                AED {orders.reduce((sum, order) => sum + order.price, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({orderCounts.all})</TabsTrigger>
            <TabsTrigger value="marketplace">Parts ({orderCounts.marketplace})</TabsTrigger>
            <TabsTrigger value="services">Services ({orderCounts.services})</TabsTrigger>
            <TabsTrigger value="active">Active ({orderCounts.active})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't placed any orders yet. Browse our marketplace to get started!
                    </p>
                    <Button onClick={() => onNavigate?.('marketplace')}>
                      Browse Marketplace
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <ImageWithFallback 
                          src={order.image} 
                          alt={order.item}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold mb-1">{order.item}</h3>
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={order.seller.avatar} />
                                  <AvatarFallback>{order.seller.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">{order.seller.name}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{order.seller.rating}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-[var(--sublimes-gold)] mb-1">
                                AED {order.price.toLocaleString()}
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Order Progress</span>
                              <span>{getProgress(order.status)}%</span>
                            </div>
                            <Progress value={getProgress(order.status)} className="h-2" />
                          </div>

                          {/* Order Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Calendar className="h-3 w-3" />
                                Order Date: {new Date(order.orderDate).toLocaleDateString()}
                              </div>
                              {order.trackingNumber && (
                                <div className="text-muted-foreground">
                                  Tracking: {order.trackingNumber}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              {order.deliveryDate && (
                                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Delivered: {new Date(order.deliveryDate).toLocaleDateString()}
                                </div>
                              )}
                              {order.estimatedDelivery && !order.deliveryDate && (
                                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                  <Clock className="h-3 w-3" />
                                  Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                                </div>
                              )}
                              {order.estimatedCompletion && (
                                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                  <Clock className="h-3 w-3" />
                                  Est. Completion: {new Date(order.estimatedCompletion).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Address */}
                          {(order.deliveryAddress || order.serviceLocation) && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-start gap-1 text-sm">
                                <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {order.type === 'service' ? 'Service Location:' : 'Delivery Address:'}
                                </span>
                              </div>
                              <div className="text-sm pl-4">
                                {order.deliveryAddress || order.serviceLocation}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {order.status === 'delivered' || order.status === 'completed' ? (
                              <Button variant="outline" size="sm">
                                <Star className="h-3 w-3 mr-1" />
                                Rate & Review
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Contact Seller
                              </Button>
                            )}
                            {(order.status === 'shipped' || order.status === 'in_progress') && (
                              <Button variant="outline" size="sm">
                                Track Order
                              </Button>
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