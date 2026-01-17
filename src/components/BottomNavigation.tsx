import { Home, Users, ShoppingBag, Wrench, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { ActionModal } from './ActionModal';
import { MoreModal } from './MoreModal';

interface BottomNavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onCreatePost: () => void;
}

export function BottomNavigation({ currentPage, setCurrentPage, onCreatePost }: BottomNavigationProps) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);

  const navigation = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'create', label: 'Create', icon: Plus, special: true },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'more', label: 'Menu', icon: MoreHorizontal, special: 'more' }
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case 'create-post':
        onCreatePost();
        break;
      case 'create-listing':
        setCurrentPage('place-ad');
        break;
      case 'create-repair-request':
        setCurrentPage('repair-bid');
        break;
      case 'instant-meetup':
        setCurrentPage('meetup');
        break;
    }
  };

  const handleMoreNavigation = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 md:hidden z-40">
        <div className="flex justify-around items-center">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || 
              (item.id === 'more' && ['garage-hub', 'meetup', 'repair-bid', 'events', 'import-car', 'admin', 'offers', 'profile'].includes(currentPage));
            
            if (item.special === true) {
              return (
                <Button
                  key={item.id}
                  size="icon"
                  className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80 rounded-full h-12 w-12 shadow-lg"
                  onClick={() => setShowActionModal(true)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              );
            }

            if (item.special === 'more') {
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center space-y-1 ${
                    isActive ? 'text-[var(--sublimes-gold)]' : 'text-muted-foreground'
                  }`}
                  onClick={() => setShowMoreModal(true)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            }
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center space-y-1 ${
                  isActive ? 'text-[var(--sublimes-gold)]' : 'text-muted-foreground'
                }`}
                onClick={() => setCurrentPage(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      <ActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onAction={handleAction}
      />

      <MoreModal
        isOpen={showMoreModal}
        onClose={() => setShowMoreModal(false)}
        onNavigate={handleMoreNavigation}
      />
    </>
  );
}