import { uploadToBucket } from "./useStorageUploader"

export function useUploadMarketplaceMedia() {
  return async (file: File, userId: string, listingId?: string) => {
    return await uploadToBucket({
      file,
      bucket: "marketplace-media",
      userId,
      tag: listingId
    })
  }
}
