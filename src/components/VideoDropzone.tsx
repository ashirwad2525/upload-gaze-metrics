
import React, { useState, useRef } from "react";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoDropzoneProps {
  onVideoSelect: (file: File) => void;
  className?: string;
}

const VideoDropzone = ({ onVideoSelect, className }: VideoDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }

    // Check file size (limit to 200MB)
    const maxSize = 200 * 1024 * 1024; // 200MB in bytes
    if (file.size > maxSize) {
      toast.error("Video file is too large. Please select a file under 200MB");
      return;
    }

    setIsLoading(true);
    
    // Clean up previous video URL if it exists
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    
    // Generate video preview URL
    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);
    setSelectedFile(file);
    
    // Notify parent component
    onVideoSelect(file);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    toast.success("Video selected successfully");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClearVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      {!videoPreview ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center p-6 transition-all",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-secondary/50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Upload className="text-primary" size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Upload your video</h3>
          <p className="text-muted-foreground text-sm text-center mb-4">
            Drag and drop a video file here, or click to browse
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="video/*"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="relative overflow-hidden"
          >
            Select Video
          </Button>
        </div>
      ) : (
        <div className="relative border rounded-xl overflow-hidden animate-scale-in">
          {isLoading ? (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <button
              onClick={handleClearVideo}
              className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center transition-all hover:bg-destructive hover:text-destructive-foreground"
            >
              <X size={18} />
            </button>
          )}
          
          <video 
            ref={videoRef}
            src={videoPreview} 
            controls
            className="w-full rounded-xl max-h-96 object-contain bg-black"
            onError={() => {
              toast.error("Error loading video preview");
              handleClearVideo();
            }}
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 glass">
            <div className="flex items-center">
              <div className="flex-1 mr-4">
                <p className="font-medium text-sm truncate">{selectedFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedFile?.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isLoading && (
                  <span className="flex items-center text-xs text-green-500 font-medium">
                    <Check size={14} className="mr-1" /> Ready to analyze
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDropzone;
