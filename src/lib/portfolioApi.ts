import { supabase } from './supabase';

export async function getCategories() {
  return supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
}


export async function getClients() {
  return supabase
    .from('clients')
    .select('*')
    .order('sort_order', { ascending: true });
}

export async function getProjects() {
  return supabase
    .from('projects')
    .select(`
      id,
      category_id,
      title,
      image_url,
      thumbnail_url,
      sort_order,
      is_active,
      categories (
        name,
        slug
      )
    `)
    .order('sort_order', { ascending: true });
}

export async function createCategory(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return supabase
    .from('categories')
    .insert({
      name,
      slug,
      sort_order: 999,
      is_active: true,
    })
    .select()
    .single();
}

export async function createProject({
  categoryId,
  title,
  imageUrl,
}: {
  categoryId: string;
  title: string;
  imageUrl: string;
}) {
  return supabase
    .from('projects')
    .insert({
      category_id: categoryId,
      title,
      image_url: imageUrl,
      sort_order: 999,
      is_active: true,
    })
    .select(`
      id,
      category_id,
      title,
      image_url,
      thumbnail_url,
      sort_order,
      is_active,
      categories (
        name,
        slug
      )
    `)
    .single();
}

export async function deleteProject(id: string | number) {
  return supabase
    .from('projects')
    .delete()
    .eq('id', id);
}

export async function createClient({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string;
}) {
  return supabase
    .from('clients')
    .insert({
      name,
      logo_url: logoUrl,
      sort_order: 999,
      is_active: true,
    })
    .select()
    .single();
}

export async function deleteClient(id: string | number) {
  return supabase
    .from('clients')
    .delete()
    .eq('id', id);
}

export async function updateCategoryCover(id: string, coverUrl: string) {
  return supabase
    .from('categories')
    .update({ cover_url: coverUrl })
    .eq('id', id)
    .select()
    .single();
}

export async function updateCategoryOrder(
  categories: { id: string; sort_order: number }[]
) {
  const updates = categories.map((cat) =>
    supabase
      .from('categories')
      .update({ sort_order: cat.sort_order })
      .eq('id', cat.id)
  );

  return Promise.all(updates);
}

export async function updateCategoryBrochure(
  id: string,
  brochureUrl: string
) {
  return supabase
    .from('categories')
    .update({ brochure_url: brochureUrl })
    .eq('id', id)
    .select()
    .single();
}

export async function deleteCategory(id: string) {
  return supabase
    .from('categories')
    .delete()
    .eq('id', id);
}