
import React, { useState } from "react";
import Layout from "@/components/Layout";
import VideoDropzone from "@/components/VideoDropzone";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

enum UploadStatus {
  IDLE,
  UPLOADING,
  PROCESSING,
  COMPLETE,
  ERROR,
}

const Upload = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleVideoSelect = (file: File) => {
    setSelectedVideo(file);
  };

  const handleUpload = () => {
    if (!selectedVideo) {
      toast.error("Please select a video first");
      return;
    }

    setUploadStatus(UploadStatus.UPLOADING);
    setUploadProgress(0);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(uploadInterval);
          setUploadStatus(UploadStatus.PROCESSING);
          simulateProcessing();
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  const simulateProcessing = () => {
    setProcessingProgress(0);
    
    // Simulate processing progress
    const processingInterval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(processingInterval);
          setUploadStatus(UploadStatus.COMPLETE);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const renderUploadStatus = () => {
    switch (uploadStatus) {
      case UploadStatus.UPLOADING:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="animate-spin text-primary" size={18} />
              <h3 className="font-medium">Uploading video...</h3>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
          </div>
        );
      case UploadStatus.PROCESSING:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="animate-spin text-primary" size={18} />
              <h3 className="font-medium">Processing video...</h3>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Analyzing body language, eye contact, and confidence metrics
            </p>
          </div>
        );
      case UploadStatus.COMPLETE:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-500" size={18} />
              <h3 className="font-medium">Processing complete!</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your video has been analyzed successfully
            </p>
            <Button onClick={() => navigate("/analytics/new")} className="gap-2">
              <FileText size={16} />
              View Analysis Report
            </Button>
          </div>
        );
      case UploadStatus.ERROR:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2 text-destructive">
              <AlertCircle size={18} />
              <h3 className="font-medium">Error processing video</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              There was a problem analyzing your video. Please try again.
            </p>
            <Button variant="outline" onClick={() => setUploadStatus(UploadStatus.IDLE)}>
              Try Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload Video</h1>
          <p className="text-muted-foreground mt-1">
            Upload a video to analyze your presentation skills
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-medium mb-4">Select Video</h2>
            <VideoDropzone onVideoSelect={handleVideoSelect} />
            
            {selectedVideo && (
              <div className="mt-4">
                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={handleUpload}
                  disabled={uploadStatus !== UploadStatus.IDLE}
                >
                  {uploadStatus === UploadStatus.IDLE ? (
                    <>
                      <CheckCircle size={18} />
                      Start Analysis
                    </>
                  ) : (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Processing...
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-4">Upload Status</h2>
            <div className="rounded-xl border border-border p-6 h-[400px] flex flex-col">
              {uploadStatus === UploadStatus.IDLE ? (
                selectedVideo ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <FileText className="text-primary mb-4" size={40} />
                    <h3 className="text-lg font-medium mb-2">Ready to analyze</h3>
                    <p className="text-muted-foreground text-sm mb-4 max-w-xs">
                      Click "Start Analysis" to begin processing your video
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <FileText className="text-muted-foreground" size={24} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No video selected</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      Select a video using the upload panel to begin analysis
                    </p>
                  </div>
                )
              ) : (
                <div className="p-4 flex-1 flex flex-col justify-center">
                  {renderUploadStatus()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-medium">What we analyze</h2>
            <Separator className="flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H4M20 12H22M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Eye Contact</h3>
              <p className="text-sm text-muted-foreground">
                We analyze how well you maintain eye contact with the camera and audience
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Body Language</h3>
              <p className="text-sm text-muted-foreground">
                We measure your posture, gestures, and overall body language effectiveness
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M16 16V8H8M16 16H8M16 16L21 21M8 16V8M8 16L3 21M8 8L3 3M16 8L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Confidence</h3>
              <p className="text-sm text-muted-foreground">
                We evaluate vocal clarity, pace, tone, and overall confidence in presentation
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
