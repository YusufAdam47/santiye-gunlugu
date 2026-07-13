import { supabase } from './supabase';

export type Manager = { id: string; code: string; project: string; name: string | null };

export async function fetchManagers(): Promise<Manager[]> {
  const { data, error } = await supabase.from('managers').select('*').order('project');
  if (error || !data) return [];
  return data as Manager[];
}

export async function findManagerByCode(code: string): Promise<Manager | null> {
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .eq('code', code)
    .maybeSingle();
  if (error || !data) return null;
  return data as Manager;
}

export async function addManager(code: string, project: string, name: string) {
  return supabase.from('managers').insert({ code: code.trim(), project, name: name.trim() || null });
}

export async function deleteManager(id: string) {
  return supabase.from('managers').delete().eq('id', id);
}
