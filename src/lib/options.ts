import { supabase } from './supabase';

export type Option = { id: string; name: string };

export async function fetchCompanies(): Promise<Option[]> {
  const { data, error } = await supabase.from('companies').select('*').order('name');
  if (error || !data) return [];
  return data as Option[];
}

export async function fetchProjects(): Promise<Option[]> {
  const { data, error } = await supabase.from('projects').select('*').order('name');
  if (error || !data) return [];
  return data as Option[];
}

export async function addCompany(name: string) {
  return supabase.from('companies').insert({ name: name.trim() });
}

export async function addProject(name: string) {
  return supabase.from('projects').insert({ name: name.trim() });
}

export async function deleteCompany(id: string) {
  return supabase.from('companies').delete().eq('id', id);
}

export async function deleteProject(id: string) {
  return supabase.from('projects').delete().eq('id', id);
}
