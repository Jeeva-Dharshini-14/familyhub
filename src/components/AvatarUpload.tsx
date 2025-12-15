import { useState, useRef } from "react";
import { Camera, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  currentImage?: string;
  onImageChange: (imageData: string) => void;
  name: string;
  size?: "sm" | "md" | "lg";
  showSaveButton?: boolean;
}

export const AvatarUpload = ({ 
  currentImage, 
  onImageChange, 
  name, 
  size = "md",
  showSaveButton = false 
}: AvatarUploadProps) => {
  const [preview, setPreview] = useState<string>(currentImage || "");
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setHasChanges(true);
      
      // If no save button, auto-save
      if (!showSaveButton) {
        onImageChange(result);
        saveToLocalStorage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (hasChanges) {
      onImageChange(preview);
      saveToLocalStorage(preview);
      setHasChanges(false);
      toast({
        title: "Photo saved",
        description: "Your profile photo has been updated",
      });
    }
  };

  const saveToLocalStorage = (imageData: string) => {
    try {
      localStorage.setItem(`profile_photo_${name}`, imageData);
    } catch (error) {
      console.error("Failed to save photo to localStorage:", error);
    }
  };

  const handleRemove = () => {
    setPreview("");
    setHasChanges(true);
    
    if (!showSaveButton) {
      onImageChange("");
      localStorage.removeItem(`profile_photo_${name}`);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={preview} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        
        {preview && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4" />
          {preview ? "Change Photo" : "Upload Photo"}
        </Button>

        {showSaveButton && hasChanges && (
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Photo
          </Button>
        )}
      </div>
    </div>
  );
};