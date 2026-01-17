import { uploadToBucket } from "./useStorageUploader"

export function useUploadCommunityMedia() {
  return async (file: File, userId: string, postId?: string) => {
    return await uploadToBucket({
      file,
      bucket: "community-media",
      userId,
      tag: postId
    })
  }
}
