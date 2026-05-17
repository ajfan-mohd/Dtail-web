import { supabase } from './supabase';

export async function uploadImage(
  file: File,
  bucket: string
) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteImageByUrl(
  publicUrl: string,
  bucket: 'portfolio-images' | 'client-logos'
) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const path = publicUrl.split(marker)[1];

  if (!path) return { error: null };

  return supabase.storage
    .from(bucket)
    .remove([path]);
}