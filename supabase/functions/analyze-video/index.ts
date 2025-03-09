
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration for deterministic analysis
const ANALYSIS_VERSION = '1.0.0';

// Used to store video fingerprints for consistent analysis
const videoFingerprints = new Map();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoData, userId } = await req.json();

    console.log("Received request to analyze video for user:", userId);
    console.log("Video data sample:", videoData?.fileName, videoData?.fileSize, "Path:", videoData?.videoPath);
    
    if (!videoData || !videoData.fileName || !videoData.videoPath) {
      console.error("Invalid video data received");
      return new Response(
        JSON.stringify({ 
          error: "Invalid video data", 
          success: false,
          processingStep: "initialization",
          stepStatus: "failed"
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a consistent video fingerprint based on file properties
    const videoFingerprint = `${videoData.fileName}-${videoData.fileSize}`;
    
    // Check if we've analyzed this video before (for consistency)
    if (videoFingerprints.has(videoFingerprint)) {
      console.log("Using cached analysis for video:", videoFingerprint);
      return new Response(
        JSON.stringify({
          success: true,
          analysis: videoFingerprints.get(videoFingerprint),
          processingSteps: [
            { step: "fingerprinting", status: "success", message: "Video fingerprint matched to existing analysis" },
            { step: "humanDetection", status: "success", message: "Human presence verified (cached)" },
            { step: "facialFeatures", status: "success", message: "Facial features detected (cached)" },
            { step: "bodyPosture", status: "success", message: "Body posture analyzed (cached)" },
            { step: "speechAnalysis", status: "success", message: "Speech patterns analyzed (cached)" },
            { step: "reportGeneration", status: "success", message: "Report generated from cache" }
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Human detection analysis
    console.log("Step 1: Performing human detection check");
    const hasHuman = simulateHumanDetection(videoData);
    
    if (!hasHuman) {
      console.log("No human detected in video:", videoData.fileName);
      return new Response(
        JSON.stringify({ 
          error: "No human detected. Please upload a valid video for analysis.", 
          success: false,
          processingSteps: [
            { step: "initialization", status: "success", message: "Analysis initialized" },
            { step: "humanDetection", status: "failed", message: "No human presence detected in video" }
          ],
          processingStep: "humanDetection",
          stepStatus: "failed"
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Facial feature detection
    console.log("Step 2: Performing facial feature detection");
    const hasFacialFeatures = simulateFacialFeatureDetection(videoData);
    
    if (!hasFacialFeatures) {
      console.log("Insufficient facial visibility in video:", videoData.fileName);
      return new Response(
        JSON.stringify({ 
          error: "Insufficient facial visibility for analysis. Please ensure your face is clearly visible.", 
          success: false,
          processingSteps: [
            { step: "initialization", status: "success", message: "Analysis initialized" },
            { step: "humanDetection", status: "success", message: "Human presence detected" },
            { step: "facialFeatures", status: "failed", message: "Insufficient facial visibility" }
          ],
          processingStep: "facialFeatures",
          stepStatus: "failed"
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Body posture analysis 
    console.log("Step 3: Analyzing body posture");
    const hasGoodPosture = simulatePostureAnalysis(videoData);
    
    if (!hasGoodPosture) {
      console.log("Insufficient body posture visibility in video:", videoData.fileName);
      return new Response(
        JSON.stringify({ 
          error: "Insufficient body visibility for posture analysis. Please ensure your body is clearly visible.", 
          success: false,
          processingSteps: [
            { step: "initialization", status: "success", message: "Analysis initialized" },
            { step: "humanDetection", status: "success", message: "Human presence detected" },
            { step: "facialFeatures", status: "success", message: "Facial features detected" },
            { step: "bodyPosture", status: "failed", message: "Insufficient body posture visibility" }
          ],
          processingStep: "bodyPosture",
          stepStatus: "failed"
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Speech analysis simulation
    console.log("Step 4: Performing speech analysis");
    const hasSpeech = simulateSpeechAnalysis(videoData);

    // Step 5: Generate report
    console.log("Step 5: Generating final analysis report");
    
    // Generate deterministic analysis based on video properties
    const uniqueId = generateDeterministicId(videoData);
    const analysis = generateDeterministicAnalysis(videoData, uniqueId);
    
    // Store the analysis for future consistency
    videoFingerprints.set(videoFingerprint, analysis);
    
    console.log("Generated deterministic analysis with ID:", uniqueId);
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        processingSteps: [
          { step: "initialization", status: "success", message: "Analysis initialized" },
          { step: "humanDetection", status: "success", message: "Human presence detected" },
          { step: "facialFeatures", status: "success", message: "Facial features detected" },
          { step: "bodyPosture", status: "success", message: "Body posture analyzed" },
          { step: "speechAnalysis", status: "success", message: hasSpeech ? "Speech patterns analyzed" : "No speech detected, skipping speech analysis" },
          { step: "reportGeneration", status: "success", message: "Analysis report generated" }
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("General error in analyze-video function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unknown error occurred",
        success: false,
        processingStep: "unknown",
        stepStatus: "failed",
        processingSteps: [
          { step: "error", status: "failed", message: error.message || "An unknown error occurred" }
        ]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate a deterministic ID based on video properties
function generateDeterministicId(videoData) {
  const seed = `${videoData.fileName}-${videoData.fileSize}-${ANALYSIS_VERSION}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Simulate human detection in video
function simulateHumanDetection(videoData) {
  // For demo purposes, assume all videos have humans except those with specific keywords
  const nonHumanKeywords = ['landscape', 'nature', 'screen-recording', 'screenshot', 'diagram'];
  const fileName = videoData.fileName.toLowerCase();
  
  // Check if filename contains any non-human keywords
  const containsNonHumanKeyword = nonHumanKeywords.some(keyword => fileName.includes(keyword));
  
  // For testing purposes, allow manual triggering of the "no human" error
  if (fileName.includes('test-no-human')) {
    return false;
  }
  
  return !containsNonHumanKeyword;
}

// Simulate facial feature detection
function simulateFacialFeatureDetection(videoData) {
  // For demo purposes, assume all videos have sufficient facial visibility 
  // except those with specific keywords
  const poorVisibilityKeywords = ['dark', 'backlighting', 'distant', 'blur', 'masked'];
  const fileName = videoData.fileName.toLowerCase();
  
  // For testing purposes, allow manual triggering of the "poor facial visibility" error
  if (fileName.includes('test-no-face')) {
    return false;
  }
  
  return !poorVisibilityKeywords.some(keyword => fileName.includes(keyword));
}

// Simulate posture analysis
function simulatePostureAnalysis(videoData) {
  // For demo purposes, assume all videos have good posture visibility
  // except those with specific keywords
  const poorPostureKeywords = ['cropped', 'closeup', 'partial', 'hidden'];
  const fileName = videoData.fileName.toLowerCase();
  
  // For testing purposes, allow manual triggering of the "poor posture visibility" error
  if (fileName.includes('test-no-posture')) {
    return false;
  }
  
  return !poorPostureKeywords.some(keyword => fileName.includes(keyword));
}

// Simulate speech analysis
function simulateSpeechAnalysis(videoData) {
  // For demo purposes, assume all videos have speech 
  // except those with specific keywords
  const noSpeechKeywords = ['mute', 'silent', 'no-audio', 'no-sound'];
  const fileName = videoData.fileName.toLowerCase();
  
  // For testing purposes, allow manual triggering of the "no speech" condition
  if (fileName.includes('test-no-speech')) {
    return false;
  }
  
  return !noSpeechKeywords.some(keyword => fileName.includes(keyword));
}

// Generate deterministic analysis based on video properties
function generateDeterministicAnalysis(videoData, uniqueId) {
  // Create a deterministic seed based on video properties
  const fileName = videoData.fileName;
  const fileSize = videoData.fileSize;
  
  // Create a deterministic random number generator
  const seededRandom = (min, max) => {
    const seed = (fileName.length * 53) + (fileSize % 997);
    const x = Math.sin(seed) * 10000;
    const rand = x - Math.floor(x);
    return Math.floor(rand * (max - min + 1)) + min;
  };
  
  // Generate consistent scores based on filename and size
  // Different files will get different scores, but the same file will always get the same scores
  const baseScore = (fileName.length % 15) + 70; // Base score between 70-84
  const confidenceScore = baseScore + (fileSize % 10000) / 1000; // Add some variation based on file size
  const eyeContactScore = Math.max(60, Math.min(95, baseScore - 5 + seededRandom(-8, 8)));
  const bodyLanguageScore = Math.max(60, Math.min(95, baseScore + 3 + seededRandom(-5, 5)));
  const speakingScore = Math.max(65, Math.min(95, baseScore + 5 + seededRandom(-3, 10)));
  const engagementScore = Math.max(60, Math.min(90, baseScore - 2 + seededRandom(-10, 15)));
  
  // Generate consistently varied feedback based on the scores
  const feedback = generateFeedback(eyeContactScore, confidenceScore, bodyLanguageScore, fileName, uniqueId);
  
  // Generate timeline insights
  const timelineInsights = generateTimelineInsights(fileName, uniqueId);
  
  // Generate speech metrics based on deterministic values
  const wordsPerMinute = 115 + seededRandom(5, 45);
  const fillerWordRate = (2 + seededRandom(0, 6)) + "%";
  const duration = Math.floor(2 + seededRandom(1, 5)) + ":" + Math.floor(10 + seededRandom(10, 49)).toString().padStart(2, '0');

  return {
    analysisId: uniqueId,
    analysisVersion: ANALYSIS_VERSION,
    metrics: {
      overall: Math.round(baseScore),
      eyeContact: Math.round(eyeContactScore),
      confidence: parseFloat(confidenceScore.toFixed(1)),
      bodyLanguage: Math.round(bodyLanguageScore),
      speaking: Math.round(speakingScore),
      engagement: Math.round(engagementScore)
    },
    feedback: feedback,
    timelineInsights: timelineInsights,
    speechMetrics: {
      wordsPerMinute: wordsPerMinute,
      fillerWordRate: fillerWordRate,
      duration: duration
    },
    transcriptId: uniqueId.slice(0, 8)
  };
}

// Generate consistent feedback based on metrics
function generateFeedback(eyeContactScore, confidenceScore, bodyLanguageScore, fileName, uniqueId) {
  const feedback = [];
  
  // Positive feedback
  if (confidenceScore > 80) {
    feedback.push({ 
      type: "positive", 
      text: `Good posture and confident delivery of main points (ID: ${uniqueId.slice(0, 8)})` 
    });
  }
  
  feedback.push({ 
    type: "positive", 
    text: `Effective use of hand gestures to emphasize key information (Video: ${fileName.slice(0, 5)})` 
  });
  
  // Improvement areas
  if (eyeContactScore < 85) {
    feedback.push({ 
      type: "improvement", 
      text: "Maintain more consistent eye contact with the camera" 
    });
  }
  
  feedback.push({ 
    type: "improvement", 
    text: `Reduce use of filler words during transitions (ID: ${uniqueId.slice(0, 4)})` 
  });
  
  if (bodyLanguageScore < 90) {
    feedback.push({ 
      type: "improvement", 
      text: `Work on maintaining energy levels throughout the presentation (ID: ${uniqueId.slice(0, 8)})` 
    });
  }
  
  return feedback;
}

// Generate consistent timeline insights
function generateTimelineInsights(fileName, uniqueId) {
  return [
    { 
      timepoint: "0:15", 
      insight: `Strong opening with confident posture (ID: ${uniqueId.slice(0, 8)})` 
    },
    { 
      timepoint: "0:45", 
      insight: `Good hand gestures while explaining main concept (Video: ${fileName.slice(0, 5)})` 
    },
    { 
      timepoint: "1:30", 
      insight: "Breaking eye contact when discussing technical details" 
    },
    { 
      timepoint: "2:15", 
      insight: `Increased energy when presenting conclusion (ID: ${uniqueId.slice(4, 12)})` 
    }
  ];
}
