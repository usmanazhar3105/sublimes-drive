/**
 * Supabase project metadata.
 *
 * IMPORTANT:
 * - Do NOT hardcode keys in the repo.
 * - Use Vite env vars instead: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 *
 * This file exists for legacy/diagnostic tooling that expects `projectId` and
 * `publicAnonKey` exports, but values are derived from env at runtime.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const projectId =
  url ? new URL(url).hostname.split('.')[0] : '';

export const publicAnonKey = anon ?? '';