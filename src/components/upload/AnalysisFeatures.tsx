
import React from "react";
import { Separator } from "@/components/ui/separator";

const AnalysisFeatures = () => {
  return (
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
  );
};

export default AnalysisFeatures;
