import { useState } from 'react';
import { X, Users, ShoppingBag, Wrench, MessageCircle, MapPin, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

export function ActionModal({ isOpen, onClose, onAction }: ActionModalProps) {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'create-post',
      title: 'Create Post',
      description: 'Share something with the community',
      icon: MessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'create-listing',
      title: 'Create Listing',
      description: 'Sell your car or parts',
      icon: ShoppingBag,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'create-repair-request',
      title: 'Create Repair Request',
      description: 'Get quotes from garages',
      icon: Wrench,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      id: 'instant-meetup',
      title: 'Instant Meetup',
      description: 'Connect with nearby enthusiasts',
      icon: MapPin,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:hidden fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 max-w-none w-full rounded-t-3xl border-t border-border animate-in slide-in-from-bottom duration-300">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">What would you like to do?</DialogTitle>
          <DialogDescription>
            Choose an action to create new content or connect with the community.
          </DialogDescription>
        </DialogHeader>
        
        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          {actions.map((action) => (
            <Card
              key={action.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-border"
              onClick={() => {
                onAction(action.id);
                onClose();
              }}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${action.bgColor} flex items-center justify-center`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <h3 className="font-medium mb-1 text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Handle indicator */}
        <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto" />
      </DialogContent>
    </Dialog>
  );
}