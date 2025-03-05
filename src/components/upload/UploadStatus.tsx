
import React from "react";
import { Loader2, CheckCircle, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export enum UploadStatus {
  IDLE,
  UPLOADING,
  PROCESSING,
  COMPLETE,
  ERROR,
}

interface UploadStatusProps {
  status: UploadStatus;
  uploadProgress: number;
  processingProgress: number;
  analysisId: string | null;
  onReset: () => void;
}

const UploadStatusComponent = ({
  status,
  uploadProgress,
  processingProgress,
  analysisId,
  onReset,
}: UploadStatusProps) => {
  const navigate = useNavigate();

  switch (status) {
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
          <p className="text-sm text-muted-foreground mb-4">
            There was a problem analyzing your video. Please try again.
          </p>
          <Button variant="outline" onClick={onReset}>
            Try Again
          </Button>
        </div>
      );
    default:
      return null;
  }
};

export default UploadStatusComponent;
