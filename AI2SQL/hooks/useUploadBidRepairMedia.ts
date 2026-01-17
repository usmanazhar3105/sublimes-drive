import { uploadToBucket } from "./useStorageUploader"
import { supabase } from "../../src/utils/supabase/client"

export function useUploadBidRepairMedia() {
  return async (file: File, userId: string, bidId?: string) => {
    return await uploadToBucket({
      file,
      bucket: "bidrepair-media",
      userId,
      tag: bidId
    })
  }
}

// Backward-compatible direct uploader
export async function uploadBidRepairMedia(file: File, bidId?: string): Promise<string> {
  const path = `anon/${bidId || 'draft'}_${Date.now()}_${file.name}`
  const { error } = await supabase.storage
    .from("bidrepair-media")
    .upload(path, file, {
      metadata: { status: "pending" },
      upsert: false
    })

  if (error) throw error
  const { data } = supabase.storage.from("bidrepair-media").getPublicUrl(path)
  return data.publicUrl
}
