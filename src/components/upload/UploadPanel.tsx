
import React from "react";
import { FileText, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoDropzone from "@/components/VideoDropzone";
import { UploadStatus } from "./UploadStatus";

interface UploadPanelProps {
  selectedVideo: File | null;
  onVideoSelect: (file: File) => void;
  uploadStatus: UploadStatus;
  handleUpload: () => void;
}

const UploadPanel = ({
  selectedVideo,
  onVideoSelect,
  uploadStatus,
  handleUpload,
}: UploadPanelProps) => {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Select Video</h2>
      <VideoDropzone onVideoSelect={onVideoSelect} />
      
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
  );
};

export default UploadPanel;
