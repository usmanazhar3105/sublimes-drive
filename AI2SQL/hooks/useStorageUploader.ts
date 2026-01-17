import { supabase } from "../../src/utils/supabase/client"

export async function uploadToBucket({
  file,
  bucket,
  userId,
  tag
}: {
  file: File
  bucket: string
  userId: string
  tag?: string
}): Promise<string> {
  // Storage policy requires path to start with userId/
  // Format: {userId}/posts/{timestamp}_{filename} or {userId}/{tag}/{timestamp}_{filename}
  const folder = tag === 'post' || tag === 'posts' ? 'posts' : (tag || 'upload');
  const path = `${userId}/${folder}/${Date.now()}_${file.name}`
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      metadata: { status: "pending" },
      upsert: false
    })

  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
