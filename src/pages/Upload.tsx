import React, { useState } from "react";
import Layout from "@/components/Layout";
import VideoDropzone from "@/components/VideoDropzone";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

enum UploadStatus {
  IDLE,
  UPLOADING,
  PROCESSING,
  COMPLETE,
  ERROR,
}

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const handleVideoSelect = (file: File) => {
    setSelectedVideo(file);
    setErrorDetails(null);
    if (uploadStatus === UploadStatus.ERROR) {
      setUploadStatus(UploadStatus.IDLE);
    }
  };

  const handleUpload = async () => {
    if (!selectedVideo) {
      toast.error("Please select a video first");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to analyze videos");
      return;
    }

    setUploadStatus(UploadStatus.UPLOADING);
    setUploadProgress(0);
    setErrorDetails(null);

    try {
      const videoId = crypto.randomUUID();
      
      const sanitizedFileName = selectedVideo.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\s+/g, '_');
      
      const filePath = `${user.id}/${videoId}/${sanitizedFileName}`;

      console.log("Attempting to upload video to path:", filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('videos')
        .upload(filePath, selectedVideo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        throw new Error(`Error uploading video: ${uploadError.message}`);
      }

      console.log("Video uploaded successfully:", data);

      const { error: insertError, data: analysisRecord } = await supabase
        .from('video_analyses')
        .insert({
          user_id: user.id,
          video_path: filePath,
          status: 'processing'
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating analysis record:', insertError);
        throw new Error(`Error creating analysis record: ${insertError.message}`);
      }

      setUploadProgress(100);
      setUploadStatus(UploadStatus.PROCESSING);
      processVideo(filePath, analysisRecord.id);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(UploadStatus.ERROR);
      setErrorDetails(error instanceof Error ? error.message : "Failed to upload video");
      toast.error(error instanceof Error ? error.message : "Failed to upload video");
    }
  };

  const processVideo = async (videoPath: string, videoAnalysisId: string) => {
    setProcessingProgress(0);
    
    const processingInterval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 95) {
          clearInterval(processingInterval);
          return 95;
        }
        return newProgress;
      });
    }, 300);
    
    try {
      console.log("Processing video analysis with ID:", videoAnalysisId);
      
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: {
          videoData: {
            fileName: selectedVideo!.name,
            fileSize: selectedVideo!.size,
            videoPath: videoPath,
            analysisId: videoAnalysisId
          },
          userId: user?.id
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to analyze video");
      }

      if (!data?.success) {
        console.error("Analysis failed with data:", data);
        throw new Error(data?.error || "Analysis failed");
      }

      clearInterval(processingInterval);
      setProcessingProgress(100);
      
      const { error: updateError } = await supabase
        .from('video_analyses')
        .update({
          analysis: data.analysis,
          status: 'completed'
        })
        .eq('id', videoAnalysisId);
        
      if (updateError) {
        console.error("Error updating analysis record:", updateError);
        throw new Error(`Error updating analysis record: ${updateError.message}`);
      }
      
      console.log("Analysis completed successfully:", data.analysis);
      setAnalysisId(videoAnalysisId);
      setUploadStatus(UploadStatus.COMPLETE);
      toast.success("Video analysis complete!");
    } catch (error) {
      console.error("Processing error:", error);
      clearInterval(processingInterval);
      setUploadStatus(UploadStatus.ERROR);
      setErrorDetails(error instanceof Error ? error.message : "Failed to analyze video");
      toast.error(error instanceof Error ? error.message : "Failed to analyze video");
      
      if (videoAnalysisId) {
        await supabase
          .from('video_analyses')
          .update({
            status: 'error'
          })
          .eq('id', videoAnalysisId);
      }
    }
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
            <Progress 
              value={uploadProgress} 
              className="h-2 mb-1" 
            />
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
            <Progress 
              value={processingProgress} 
              className="h-2 mb-1"
            />
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
            <Button 
              onClick={() => navigate(`/analytics/${analysisId}`)} 
              className="gap-2"
            >
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
            {errorDetails && (
              <p className="text-sm text-destructive mb-2 p-2 bg-destructive/10 rounded-md">
                {errorDetails}
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-4">
              {errorDetails?.includes("No human detected") || errorDetails?.includes("facial visibility") 
                ? "Please upload a different video with clear human presence and facial visibility."
                : "There was a problem analyzing your video. Please try again."}
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
