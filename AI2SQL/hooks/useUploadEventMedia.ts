import { uploadToBucket } from "./useStorageUploader"

export function useUploadEventMedia() {
  return async (file: File, userId: string, eventId: string) => {
    return await uploadToBucket({
      file,
      bucket: "events-media",
      userId,
      tag: eventId
    })
  }
}
