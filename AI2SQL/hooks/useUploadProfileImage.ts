import { uploadToBucket } from "./useStorageUploader"

export function useUploadProfileImage() {
  return async (file: File, userId: string) => {
    return await uploadToBucket({
      file,
      bucket: "profile-images",
      userId,
      tag: "avatar"
    })
  }
}
