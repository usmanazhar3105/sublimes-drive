import { useEffect } from 'react';
// import { supabase } from '@/lib/supabase';

export function useViewTracking(entityType: string, entityId: string | undefined) {
  // View tracking RPC disabled - function not deployed in Supabase
  // Re-enable when fn_track_view is deployed to the database

  useEffect(() => {
    if (!entityId) return;

    // Tracking disabled - just log locally for debugging
    if (import.meta.env.DEV) {
      console.debug(`[ViewTracking] ${entityType}:${entityId}`);
    }
  }, [entityId, entityType]);
}
