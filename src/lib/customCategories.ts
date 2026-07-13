import { supabase } from './supabase';

export type CategoryItem = { id: string; name: string };
export type Category = { id: string; label: string; items: CategoryItem[] };

export async function fetchCategoriesWithItems(): Promise<Category[]> {
  const { data: cats, error: catError } = await supabase
    .from('list_categories')
    .select('*')
    .order('label');
  if (catError || !cats) return [];

  const { data: items, error: itemError } = await supabase
    .from('list_items')
    .select('*')
    .order('name');
  if (itemError || !items) {
    return cats.map((c) => ({ id: c.id, label: c.label, items: [] }));
  }

  return cats.map((c) => ({
    id: c.id,
    label: c.label,
    items: items.filter((i) => i.category_id === c.id).map((i) => ({ id: i.id, name: i.name })),
  }));
}

export async function addCategory(label: string) {
  return supabase.from('list_categories').insert({ label: label.trim() });
}

export async function deleteCategory(id: string) {
  return supabase.from('list_categories').delete().eq('id', id);
}

export async function addCategoryItem(categoryId: string, name: string) {
  return supabase.from('list_items').insert({ category_id: categoryId, name: name.trim() });
}

export async function deleteCategoryItem(id: string) {
  return supabase.from('list_items').delete().eq('id', id);
}
