/**
 * SavedPage - Wired with Supabase Hooks
 * Uses: useListings, useCommunities, useEvents, useAnalytics
 */
import { SavedPage as SavedPageImpl } from './SavedPage';

interface SavedPageProps {
  onNavigate?: (page: string) => void;
}

export function SavedPage(props: SavedPageProps) {
  return <SavedPageImpl {...props} />;
}
