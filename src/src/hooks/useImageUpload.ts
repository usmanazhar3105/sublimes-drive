import { useState } from 'react';
import { supabase, apiCall } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { STORAGE_BUCKETS, PUBLIC_BUCKETS, type BucketKey } from '../../lib/storageBuckets';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ];

  /**
   * Compress image before upload
   */
  async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            file.type,
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  /**
   * Validate file before upload
   */
  function validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit.',
      };
    }

    return { valid: true };
  }

  /**
   * Upload single image
   */
  async function uploadImage(
    file: File,
    folder: string = 'general',
    bucketKey: BucketKey = 'community'
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare blob to upload
      setUploading(true);
      const isImage = file.type.startsWith('image/');
      const isGif = file.type === 'image/gif';
      const blobToUpload: Blob | File = (isImage && !isGif) ? await compressImage(file) : file;

      // Generate unique filename using bucket-aware folder prefixes to satisfy RLS
      const fileExt = file.name.split('.').pop();
      const normalizedFolder =
        bucketKey === 'marketplace'
          ? 'listings'
          : bucketKey === 'offers'
          ? 'offers'
          : bucketKey === 'events'
          ? 'events'
          : bucketKey === 'garage'
          ? 'garages'
          : bucketKey === 'bidrepair'
          ? 'bidrepair'
          : bucketKey === 'import'
          ? 'imports'
          : bucketKey === 'profile'
          ? 'avatars'
          : folder;
      const fileName = `${normalizedFolder}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Update progress
      setProgress((prev) => [
        ...prev,
        { fileName: file.name, progress: 0, status: 'uploading' },
      ]);

      const bucketName = STORAGE_BUCKETS[bucketKey] ?? STORAGE_BUCKETS.community;

      const attemptSignedUpload = async () => {
        const signed = await apiCall('/storage/signed-upload', {
          method: 'POST',
          body: JSON.stringify({ bucket: bucketName, file_name: fileName })
        }, true);
        const token = signed?.token as string | undefined;
        if (!token) throw new Error('No signed token returned from signed upload endpoint');
        const { error: signedErr } = await supabase.storage
          .from(bucketName)
          .uploadToSignedUrl(fileName, token, blobToUpload);
        if (signedErr) throw signedErr;
      };

      const attemptDirectUpload = async () => {
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, blobToUpload, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
      };

      try {
        await attemptSignedUpload();
      } catch (signedErr) {
        await attemptDirectUpload().catch((directErr) => {
          throw directErr;
        });
      }

      // Resolve URL: prefer signed URL (works for both public/private buckets), fallback to public URL
      let publicUrl: string;
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 604800);
      if (signedError) {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      } else {
        publicUrl = signedData.signedUrl;
      }

      // Update progress
      setProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name
            ? { ...p, progress: 100, status: 'complete' as const }
            : p
        )
      );

      setUploadedUrls((prev) => [...prev, publicUrl]);
      toast.success('Image uploaded successfully');

      return { url: publicUrl, error: null };
    } catch (err) {
      console.error('Error uploading image:', err);
      
      // Update progress with error
      setProgress((prev) =>
        prev.map((p) =>
          p.fileName === file.name
            ? { ...p, status: 'error' as const }
            : p
        )
      );

      toast.error('Failed to upload image');
      return { url: null, error: err as Error };
    } finally {
      setUploading(false);
    }
  }

  /**
   * Upload multiple images
   */
  async function uploadImages(files: File[], folder: string = 'general', bucketKey: BucketKey = 'community'): Promise<{ urls: string[]; errors: Error[] }> {
    setUploading(true);
    const urls: string[] = [];
    const errors: Error[] = [];

    for (const file of files) {
      const { url, error } = await uploadImage(file, folder, bucketKey);
      if (url) {
        urls.push(url);
      }
      if (error) {
        errors.push(error);
      }
    }

    setUploading(false);
    return { urls, errors };
  }

  /**
   * Delete image from storage
   */
  async function deleteImage(fileUrl: string): Promise<{ error: Error | null }> {
    try {
      // Extract bucket and file path from URL (supports multiple buckets)
      const urlParts = fileUrl.split('/');
      const knownBuckets = Object.values(STORAGE_BUCKETS) as string[];
      const bucketName = knownBuckets.find((b) => urlParts.includes(b));
      if (!bucketName) throw new Error('Invalid file URL');
      const bucketIndex = urlParts.indexOf(bucketName);
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      setUploadedUrls((prev) => prev.filter((url) => url !== fileUrl));
      toast.success('Image deleted successfully');

      return { error: null };
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error('Failed to delete image');
      return { error: err as Error };
    }
  }

  /**
   * Reset upload state
   */
  function reset() {
    setProgress([]);
    setUploadedUrls([]);
    setUploading(false);
  }

  return {
    uploading,
    progress,
    uploadedUrls,
    uploadImage,
    uploadImages,
    deleteImage,
    reset,
  };
}
