import { uploadToBucket } from "./useStorageUploader"

export function useUploadGarageMedia() {
  return async (file: File, userId: string, garageId: string) => {
    return await uploadToBucket({
      file,
      bucket: "garagehub-media",
      userId,
      tag: garageId
    })
  }
}
