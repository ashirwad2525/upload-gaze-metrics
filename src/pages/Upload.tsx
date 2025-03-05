
import React from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import UploadPanel from "@/components/upload/UploadPanel";
import StatusDisplay from "@/components/upload/StatusDisplay";
import AnalysisFeatures from "@/components/upload/AnalysisFeatures";
import { useVideoUpload } from "@/hooks/useVideoUpload";

const Upload = () => {
  const { user } = useAuth();
  const {
    selectedVideo,
    uploadStatus,
    uploadProgress,
    processingProgress,
    analysisId,
    handleVideoSelect,
    handleUpload,
    resetUpload,
  } = useVideoUpload(user?.id);

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
          <UploadPanel
            selectedVideo={selectedVideo}
            onVideoSelect={handleVideoSelect}
            uploadStatus={uploadStatus}
            handleUpload={handleUpload}
          />
          
          <StatusDisplay
            uploadStatus={uploadStatus}
            selectedVideo={selectedVideo}
            uploadProgress={uploadProgress}
            processingProgress={processingProgress}
            analysisId={analysisId}
            onReset={resetUpload}
          />
        </div>

        <AnalysisFeatures />
      </div>
    </Layout>
  );
};

export default Upload;
