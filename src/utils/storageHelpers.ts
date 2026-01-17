import { supabase } from './supabase/client'
import { STORAGE_BUCKETS, type BucketKey } from '../lib/storageBuckets'

/** Upload a file into the correct bucket under user-scoped path */
export async function uploadToBucket(
  bucketKey: BucketKey,
  file: File,
  userId: string,
  subPath = ''
) {
  const bucket = STORAGE_BUCKETS[bucketKey]
  const key = `${userId}/${subPath}${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage.from(bucket).upload(key, file)
  if (error) throw error
  return { bucket, path: key, data }
}

/** Get a public or signed URL depending on bucket visibility */
export async function getFileURL(
  bucketKey: BucketKey,
  path: string,
  isPublic = false,
  expiresIn = 3600
) {
  const bucket = STORAGE_BUCKETS[bucketKey]
  if (isPublic) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
