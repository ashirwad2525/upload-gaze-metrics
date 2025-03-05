
import React from "react";
import { FileText } from "lucide-react";
import UploadStatusComponent, { UploadStatus } from "./UploadStatus";

interface StatusDisplayProps {
  uploadStatus: UploadStatus;
  selectedVideo: File | null;
  uploadProgress: number;
  processingProgress: number;
  analysisId: string | null;
  onReset: () => void;
}

const StatusDisplay = ({
  uploadStatus,
  selectedVideo,
  uploadProgress,
  processingProgress,
  analysisId,
  onReset,
}: StatusDisplayProps) => {
  return (
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
            <UploadStatusComponent 
              status={uploadStatus}
              uploadProgress={uploadProgress}
              processingProgress={processingProgress}
              analysisId={analysisId}
              onReset={onReset}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusDisplay;
