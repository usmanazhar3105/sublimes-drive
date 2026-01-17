import { uploadToBucket } from "./useStorageUploader"

export function useUploadBrandAsset() {
  return async (file: File, userId: string, type: 'logo' | 'banner' | 'preset') => {
    return await uploadToBucket({
      file,
      bucket: "system-settings",
      userId,
      tag: type
    })
  }
}
