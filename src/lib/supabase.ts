import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Entry = {
  id: string;
  company: string | null;
  project: string;
  work: string;
  note: string | null;
  media_urls: string[] | null;
  gps_lat: number | null;
  gps_lng: number | null;
  created_at: string;
};

export function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|m4v)$/i.test(url);
}
