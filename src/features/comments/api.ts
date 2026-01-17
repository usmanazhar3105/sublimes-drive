import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS, type BucketKey } from '@/lib/storageBuckets'

export async function addComment(postId: string, body: string) {
  const { data: sessionData, error: sessionErr } = await supabase.auth.getUser()
  if (sessionErr) throw new Error(sessionErr.message)
  const user = sessionData?.user
  if (!user?.id) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('community_comments')
    .insert({ post_id: postId, author_id: user.id, body })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id as string
}

export async function uploadCommentImage(
  commentId: string, 
  file: File, 
  userId: string, 
  bucketKey: BucketKey = 'community'
) {
  const bucket = STORAGE_BUCKETS[bucketKey]
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `comments/${userId}/${crypto.randomUUID()}.${ext}`
  
  const { error: upErr } = await supabase
    .storage
    .from(bucket)
    .upload(path, file, { upsert: false, cacheControl: '3600' })
  
  if (upErr) throw new Error(upErr.message)
  
  const { error: linkErr } = await supabase
    .from('community_comment_images')
    .insert({ comment_id: commentId, storage_path: path })
  
  if (linkErr) throw new Error(linkErr.message)
  
  return path
}

export async function toggleLike(commentId: string) {
  const { data, error } = await supabase
    .rpc('toggle_comment_like', { p_comment_id: commentId })

  if (error) throw new Error(error.message)
  return data as { liked: boolean; like_count: number }[]
}

export async function listComments(postId: string) {
  const { data, error } = await supabase
    .from('community_comments')
    .select(`
      id, 
      body, 
      author_id, 
      created_at,
      community_comment_likes(count),
      community_comment_images(storage_path)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export function publicImageUrl(
  path: string, 
  bucketKey: BucketKey = 'community'
) {
  const bucket = STORAGE_BUCKETS[bucketKey]
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

