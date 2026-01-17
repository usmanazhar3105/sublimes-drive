/**
 * MobileProfilePage - Mobile-optimized profile view
 * Uses ProfilePage_Wired for consistency
 */

import { ProfilePage } from './ProfilePage_Wired';

interface MobileProfilePageProps {
  onNavigate?: (page: string) => void;
  userId?: string;
}

export function MobileProfilePage({ onNavigate, userId }: MobileProfilePageProps) {
  // Simply use the wired ProfilePage which is already responsive
  return <ProfilePage onNavigate={onNavigate} userId={userId} />;
}
