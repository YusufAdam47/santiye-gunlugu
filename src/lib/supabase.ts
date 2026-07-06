import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Entry = {
  id: string;
  project: string;
  work: string;
  note: string | null;
  photo_url: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  created_at: string;
};
