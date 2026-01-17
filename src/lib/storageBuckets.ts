/**
 * Centralized map of all Supabase Storage bucket names.
 * User + Admin share the same buckets for consistent access.
 */

// Default bucket names (used when env vars not set)
const DEFAULT_BUCKETS = {
  community: 'community-media',
  offers: 'offers-media',
  marketplace: 'marketplace-media',
  events: 'events-media',
  garage: 'garagehub-media',
  bidrepair: 'bidrepair-media',
  import: 'import-media',
  profile: 'profile-images',
  system: 'system-settings',
} as const;

export type BucketKey = keyof typeof DEFAULT_BUCKETS;

function getBucketName(key: BucketKey): string {
  const envKey = `VITE_BUCKET_${key.toUpperCase()}`;
  const envValue = import.meta.env[envKey] as string | undefined;
  
  if (!envValue) {
    // Use default value, just log a warning in development
    if (import.meta.env.DEV) {
      console.warn(`⚠️ Environment variable ${envKey} is not set. Using default: ${DEFAULT_BUCKETS[key]}`);
    }
    return DEFAULT_BUCKETS[key];
  }
  
  return envValue;
}

export const STORAGE_BUCKETS: Record<BucketKey, string> = Object.freeze(
  Object.keys(DEFAULT_BUCKETS).reduce((acc, key) => {
    acc[key as BucketKey] = getBucketName(key as BucketKey);
    return acc;
  }, {} as Record<BucketKey, string>)
);

export const PUBLIC_BUCKET_KEYS = ['community', 'offers', 'marketplace', 'events'] as const satisfies readonly BucketKey[];
export const PUBLIC_BUCKETS = new Set<string>(PUBLIC_BUCKET_KEYS.map((key) => STORAGE_BUCKETS[key]));
