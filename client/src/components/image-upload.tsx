import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onCancel?: () => void;
  buttonText?: string;
  className?: string;
}

export function ImageUpload({ onImageUpload, onCancel, buttonText = "Resim Gönder", className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Hata",
        description: "Lütfen bir resim dosyası seçin",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "Hata", 
        description: "Resim boyutu 5MB'dan küçük olmalı",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `chat-images/${timestamp}-${selectedFile.name}`;
      
      // Create reference and upload file
      const imageRef = ref(storage, filename);
      await uploadBytes(imageRef, selectedFile);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(imageRef);
      
      onImageUpload(downloadUrl);
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      
      toast({
        title: "Başarılı",
        description: "Resim gönderildi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Resim yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onCancel?.();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {!previewUrl ? (
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Camera className="h-4 w-4" />
            Resim Seç
          </label>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-48 rounded-lg border"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              size="sm"
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Gönderiliyor..." : buttonText}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}