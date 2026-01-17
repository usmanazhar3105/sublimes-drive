/**
 * VerificationStatusCard - Mobile-Friendly Verification Status Component
 * Shows all verification roles with better mobile layout
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Shield, Car, Wrench, Store, Eye, CheckCircle, XCircle, Info, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';

interface VerificationStatusCardProps {
  userRole?: string;
  isVerified?: boolean;
  onNavigate?: (page: string) => void;
  onVerify?: (type: string) => void;
}

export function VerificationStatusCard({ 
  userRole = 'car_browser', 
  isVerified = false,
  onNavigate,
  onVerify 
}: VerificationStatusCardProps) {
  
  const verificationOptions = [
    {
      id: 'car_owner',
      title: 'Car Owner',
      description: 'Verify your car ownership to access exclusive features',
      icon: Car,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      route: 'verify-car-owner',
      isActive: userRole === 'car_owner'
    },
    {
      id: 'garage_owner',
      title: 'Garage Owner',
      description: 'Verify your garage business to list services',
      icon: Wrench,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      route: 'verify-garage-owner',
      isActive: userRole === 'garage_owner'
    },
    {
      id: 'vendor',
      title: 'Vendor',
      description: 'Verify your business to sell parts and accessories',
      icon: Store,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      route: 'verify-vendor',
      isActive: userRole === 'vendor'
    },
    {
      id: 'car_browser',
      title: 'Car Browser',
      description: 'Browse cars, parts, and services without verification',
      icon: Eye,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      isActive: userRole === 'car_browser',
      isBrowser: true
    }
  ];

  const handleVerification = (type: string, route?: string) => {
    if (type === 'car_browser') {
      toast.info('You are currently browsing as a Car Browser');
      return;
    }
    
    if (route) {
      onNavigate?.(route);
    } else {
      onVerify?.(type);
    }
  };

  return (
    <Card className="bg-[#0F1829] border-[#1A2332] overflow-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-[#D4AF37] flex items-center gap-2 text-base sm:text-lg">
          <Shield className="h-5 w-5 flex-shrink-0" />
          <span>Verification Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Verification Options */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {verificationOptions.map((option) => {
            const Icon = option.icon;
            const isVerified = option.isActive && !option.isBrowser;
            
            return (
              <div
                key={option.id}
                className={`
                  relative rounded-xl p-3 sm:p-4 border transition-all
                  ${option.isActive ? `${option.bgColor} ${option.borderColor}` : 'bg-[#1A2332] border-[#2A3342]'}
                  ${!option.isBrowser && !option.isActive ? 'hover:border-[#D4AF37]/30' : ''}
                `}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`${option.bgColor} p-2.5 sm:p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${option.iconColor}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                      <h4 className="text-sm sm:text-base text-[#E8EAED] font-medium">
                        {option.title}
                      </h4>
                      {option.isBrowser ? (
                        option.isActive && (
                          <Badge className="bg-blue-600 text-white text-xs whitespace-nowrap">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )
                      ) : isVerified ? (
                        <Badge className="bg-green-600 text-white text-xs whitespace-nowrap">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-400 text-xs whitespace-nowrap">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#8B92A7] mb-3 leading-relaxed">
                      {option.description}
                    </p>
                    
                    {/* Button */}
                    {option.isBrowser ? (
                      option.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#2A3342] text-[#8B92A7] cursor-default text-xs sm:text-sm"
                          disabled
                        >
                          Stay as Car Browser
                        </Button>
                      )
                    ) : !option.isActive ? (
                      <Button
                        onClick={() => handleVerification(option.id, option.route)}
                        className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] text-xs sm:text-sm h-9 sm:h-10"
                        size="sm"
                      >
                        Get Verified as {option.title}
                        <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why Get Verified Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm text-blue-400 font-medium mb-2">Why Get Verified?</h4>
              <ul className="text-xs sm:text-sm text-blue-300 space-y-1">
                <li>• Access exclusive features and perks</li>
                <li>• Priority support and customer service</li>
                <li>• Verified badge on your profile</li>
                <li>• Enhanced trust from other users</li>
                <li>• Increased visibility and promotions</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
