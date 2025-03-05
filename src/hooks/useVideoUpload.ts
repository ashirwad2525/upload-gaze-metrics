
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UploadStatus } from "@/components/upload/UploadStatus";

export const useVideoUpload = (userId: string | undefined) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const handleVideoSelect = (file: File) => {
    setSelectedVideo(file);
  };

  const resetUpload = () => {
    setUploadStatus(UploadStatus.IDLE);
  };

  const handleUpload = async () => {
    if (!selectedVideo) {
      toast.error("Please select a video first");
      return;
    }

    if (!userId) {
      toast.error("You must be logged in to analyze videos");
      return;
    }

    setUploadStatus(UploadStatus.UPLOADING);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return newProgress;
        });
      }, 200);

      // After upload completes
      setTimeout(() => {
        clearInterval(uploadInterval);
        setUploadProgress(100);
        setUploadStatus(UploadStatus.PROCESSING);
        processVideo(userId, selectedVideo);
      }, 4000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(UploadStatus.ERROR);
      toast.error("Failed to upload video");
    }
  };

  const processVideo = async (userId: string, selectedVideo: File) => {
    setProcessingProgress(0);
    
    // Simulate processing progress
    const processingInterval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(processingInterval);
          return 100;
        }
        return newProgress;
      });
    }, 300);
    
    try {
      // Generate a base64 preview of the video (simulated for demo)
      const videoPreview = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCAAIABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAABvuSaBP/EABkQAAIDAQAAAAAAAAAAAAAAAAACEgMTIf/aAAgBAQABBQLHS1dHnEf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//xAAaEAACAgMAAAAAAAAAAAAAAAABAgAREiOB/9oACAEBAAY/AtDZJVLC6kR1P//EABkQAAIDAQAAAAAAAAAAAAAAAAERABAhMf/aAAgBAQABPyFUHJdBGXEff//aAAwDAQACAAMAAAAQw+//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EH//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/EH//xAAcEAEAAgEFAAAAAAAAAAAAAAABABEhQWFxkbH/2gAIAQEAAT8QXFQ7mYQhYbXJsNHSpNYPRyn/2Q==";
      
      // Call our edge function to analyze the video
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: {
          videoData: {
            fileName: selectedVideo.name,
            fileSize: selectedVideo.size,
            preview: videoPreview
          },
          userId: userId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // After processing completes
      setTimeout(() => {
        clearInterval(processingInterval);
        setProcessingProgress(100);
        
        if (data.success) {
          setAnalysisId(data.videoId);
          setUploadStatus(UploadStatus.COMPLETE);
          toast.success("Video analysis complete!");
        } else {
          throw new Error("Analysis failed");
        }
      }, 3000);
    } catch (error) {
      console.error("Processing error:", error);
      clearInterval(processingInterval);
      setUploadStatus(UploadStatus.ERROR);
      toast.error("Failed to analyze video");
    }
  };

  return {
    selectedVideo,
    uploadStatus,
    uploadProgress,
    processingProgress,
    analysisId,
    handleVideoSelect,
    handleUpload,
    resetUpload,
  };
};
