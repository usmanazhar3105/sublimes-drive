import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Shield, CheckCircle, Building, ChevronRight } from 'lucide-react';

interface RoleSelectionPageProps {
  onNavigate: (page: string) => void;
}

type Role = 'browser' | 'car-owner' | 'garage-owner';

export function RoleSelectionPage({ onNavigate }: RoleSelectionPageProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const roles = [
    {
      id: 'browser' as Role,
      title: 'Car Browser',
      description: 'Explore everything. No verification needed. Yellow shield badge.',
      icon: Shield,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
      borderColor: 'border-yellow-500/20 hover:border-yellow-500/40'
    },
    {
      id: 'car-owner' as Role,
      title: 'Car Owner',
      description: 'Full access. Verify vehicle to get a green shield badge.',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
      borderColor: 'border-green-500/20 hover:border-green-500/40'
    },
    {
      id: 'garage-owner' as Role,
      title: 'Garage Owner',
      description: 'Manage bids and wallet credits. No Instant Meetup. Verify to get blue badge.',
      icon: Building,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      borderColor: 'border-blue-500/20 hover:border-blue-500/40'
    }
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'browser') {
      // Browser role doesn't need verification
      onNavigate('onboarding');
    } else {
      // Car owner and garage owner need verification
      onNavigate(`verify-${role}`);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        background: 'linear-gradient(135deg, #0B1426 0%, #1a2332 100%)'
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('verify-email')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Role</h1>
          <p className="text-muted-foreground">
            Select how you'd like to use Sublimes Drive
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4 w-full">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.id}
                className={`cursor-pointer transition-all duration-200 ${role.bgColor} ${role.borderColor} border-2`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-card flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${role.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why Verification Section */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg w-full">
          <h3 className="font-semibold mb-3">Why verification?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Earn trust and badges</li>
            <li>• Unlock features</li>
            <li>• Reduce spam and fraud</li>
          </ul>
        </div>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            className="text-sm"
            onClick={() => onNavigate('onboarding')}
          >
            Skip for now (can set role later)
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}