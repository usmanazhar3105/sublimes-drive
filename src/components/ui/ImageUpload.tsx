import { useState, useRef } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '../../src/hooks';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
  folder?: string;
  existingImages?: string[];
}

export function ImageUpload({ 
  onImagesUploaded, 
  maxImages = 5,
  folder = 'general',
  existingImages = []
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploading, uploadImages, deleteImage, progress } = useImageUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + previewUrls.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const { urls, errors } = await uploadImages(selectedFiles, folder);
    
    if (urls.length > 0) {
      onImagesUploaded([...existingImages, ...urls]);
      setPreviewUrls(prev => {
        // Replace blob URLs with actual URLs
        const newUrls = [...prev];
        urls.forEach((url, index) => {
          const blobIndex = existingImages.length + index;
          if (blobIndex < newUrls.length) {
            newUrls[blobIndex] = url;
          }
        });
        return newUrls;
      });
      setSelectedFiles([]);
    }
    
    if (errors.length > 0) {
      toast.error(`${errors.length} image(s) failed to upload`);
    }
  };

  const handleRemove = async (index: number) => {
    const urlToRemove = previewUrls[index];
    
    // If it's an existing uploaded image, delete from storage
    if (!urlToRemove.startsWith('blob:')) {
      await deleteImage(urlToRemove);
    }
    
    // Remove from preview
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    
    // Remove from selected files if it's a blob URL
    if (urlToRemove.startsWith('blob:')) {
      const fileIndex = index - existingImages.length;
      if (fileIndex >= 0) {
        setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
    
    // Update parent component
    const newUrls = previewUrls.filter((_, i) => i !== index && !previewUrls[i].startsWith('blob:'));
    onImagesUploaded(newUrls);
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={previewUrls.length >= maxImages || uploading}
          className="border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332]"
        >
          <ImageIcon size={20} className="mr-2" />
          Select Images ({previewUrls.length}/{maxImages})
        </Button>
        
        {selectedFiles.length > 0 && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]"
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} className="mr-2" />
                Upload {selectedFiles.length} Image(s)
              </>
            )}
          </Button>
        )}
      </div>

      {/* Progress Display */}
      {progress.length > 0 && (
        <div className="space-y-2">
          {progress.map((p, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-[#8B92A7]">{p.fileName}</span>
              {p.status === 'uploading' && (
                <Loader2 size={16} className="text-[#D4AF37] animate-spin" />
              )}
              {p.status === 'complete' && (
                <span className="text-green-400">✓</span>
              )}
              {p.status === 'error' && (
                <span className="text-red-400">✗</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <Card key={index} className="relative bg-[#0F1829] border-[#1A2332] overflow-hidden group">
              <img 
                src={url} 
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                onClick={() => handleRemove(index)}
              >
                <X size={16} />
              </Button>
              {url.startsWith('blob:') && (
                <div className="absolute bottom-2 left-2 bg-[#D4AF37] text-[#0B1426] text-xs px-2 py-1 rounded">
                  Not uploaded
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-sm text-[#8B92A7]">
        Upload up to {maxImages} images. Supported formats: JPEG, PNG, WebP, GIF (max 10MB each)
      </p>
    </div>
  );
}
