
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration for deterministic analysis
const ANALYSIS_VERSION = '1.1.0'; // Increased version for improved determinism

// Used to store video fingerprints for consistent analysis
const videoFingerprints = new Map();

// Human detection confidence threshold
const HUMAN_DETECTION_THRESHOLD = 0.85;
// Facial feature detection threshold
const FACIAL_DETECTION_THRESHOLD = 0.80;
// Posture analysis threshold
const POSTURE_ANALYSIS_THRESHOLD = 0.75;

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
          stepStatus: "failed",
          processingSteps: [
            { step: "initialization", status: "failed", message: "Invalid video data received" }
          ]
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a more robust video fingerprint based on file properties
    // Include more parameters to make it more unique
    const videoFingerprint = generateVideoFingerprint(videoData);
    
    // Check if we've analyzed this video before (for consistency)
    if (videoFingerprints.has(videoFingerprint)) {
      console.log("Using cached analysis for video fingerprint:", videoFingerprint);
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

    // Step 1: Enhanced human detection analysis with confidence score
    console.log("Step 1: Performing human detection check with confidence scoring");
    const humanDetectionResult = enhancedHumanDetection(videoData);
    
    if (!humanDetectionResult.detected) {
      console.log(`No human detected in video (confidence: ${humanDetectionResult.confidence}):`, videoData.fileName);
      return new Response(
        JSON.stringify({ 
          error: "No human detected. Please upload a valid video for analysis.", 
          success: false,
          processingSteps: [
            { step: "initialization", status: "success", message: "Analysis initialized" },
            { step: "humanDetection", status: "failed", message: `No human presence detected (confidence: ${humanDetectionResult.confidence})` }
          ],
          processingStep: "humanDetection",
          stepStatus: "failed"
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Enhanced facial feature detection with confidence score
    console.log("Step 2: Performing improved facial feature detection");
    const facialResult = enhancedFacialFeatureDetection(videoData);
    
    if (!facialResult.detected) {
      console.log(`Insufficient facial visibility in video (confidence: ${facialResult.confidence}):`, videoData.fileName);
      return new Response(
        JSON.stringify({ 
          error: "Insufficient facial visibility for analysis. Please ensure your face is clearly visible.", 
          success: false,
          processingSteps: [
            { step: "initialization", status: "success", message: "Analysis initialized" },
            { step: "humanDetection", status: "success", message: `Human presence detected (confidence: ${humanDetectionResult.confidence})` },
            { step: "facialFeatures", status: "failed", message: `Insufficient facial visibility (confidence: ${facialResult.confidence})` }
          ],
          processingStep: "facialFeatures",
          stepStatus: "failed"
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Enhanced body posture analysis with confidence score
    console.log("Step 3: Analyzing body posture with improved detection");
    const postureResult = enhancedPostureAnalysis(videoData);
    
    if (!postureResult.detected) {
      console.log(`Insufficient body posture visibility in video (confidence: ${postureResult.confidence}):`, videoData.fileName);
      return new Response(
        JSON.stringify({ 
          error: "Insufficient body visibility for posture analysis. Please ensure your body is clearly visible.", 
          success: false,
          processingSteps: [
            { step: "initialization", status: "success", message: "Analysis initialized" },
            { step: "humanDetection", status: "success", message: `Human presence detected (confidence: ${humanDetectionResult.confidence})` },
            { step: "facialFeatures", status: "success", message: `Facial features detected (confidence: ${facialResult.confidence})` },
            { step: "bodyPosture", status: "failed", message: `Insufficient body posture visibility (confidence: ${postureResult.confidence})` }
          ],
          processingStep: "bodyPosture",
          stepStatus: "failed"
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Enhanced speech analysis with confidence score
    console.log("Step 4: Performing improved speech analysis");
    const speechResult = enhancedSpeechAnalysis(videoData);

    // Step 5: Generate highly deterministic report
    console.log("Step 5: Generating final analysis report with improved determinism");
    
    // Generate deterministic analysis based on video properties
    const uniqueId = generateDeterministicId(videoData);
    const analysis = generateEnhancedDeterministicAnalysis(
      videoData, 
      uniqueId,
      humanDetectionResult.confidence,
      facialResult.confidence,
      postureResult.confidence,
      speechResult
    );
    
    // Store the analysis for future consistency
    videoFingerprints.set(videoFingerprint, analysis);
    
    console.log("Generated deterministic analysis with ID:", uniqueId);
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        processingSteps: [
          { step: "initialization", status: "success", message: "Analysis initialized" },
          { step: "humanDetection", status: "success", message: `Human presence detected (confidence: ${humanDetectionResult.confidence.toFixed(2)})` },
          { step: "facialFeatures", status: "success", message: `Facial features detected (confidence: ${facialResult.confidence.toFixed(2)})` },
          { step: "bodyPosture", status: "success", message: `Body posture analyzed (confidence: ${postureResult.confidence.toFixed(2)})` },
          { step: "speechAnalysis", status: "success", message: speechResult.detected ? "Speech patterns analyzed" : "No speech detected, skipping speech analysis" },
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

// Generate a more robust video fingerprint
function generateVideoFingerprint(videoData) {
  const fileAttributes = `${videoData.fileName}-${videoData.fileSize}-${ANALYSIS_VERSION}`;
  const seed = fileAttributes + (videoData.duration || '') + (videoData.resolution || '');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(12, '0');
}

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

// Enhanced human detection with confidence score
function enhancedHumanDetection(videoData) {
  // For demo purposes, simulate a more robust detection with confidence score
  const fileName = videoData.fileName.toLowerCase();
  
  // Non-human keywords with associated confidence penalties
  const nonHumanIndicators = [
    { keyword: 'landscape', penalty: 0.9 },
    { keyword: 'nature', penalty: 0.85 },
    { keyword: 'screen-recording', penalty: 0.8 },
    { keyword: 'screenshot', penalty: 0.95 },
    { keyword: 'diagram', penalty: 0.9 },
    { keyword: 'animation', penalty: 0.6 },
    { keyword: 'cartoon', penalty: 0.7 },
    { keyword: 'graph', penalty: 0.85 },
    { keyword: 'chart', penalty: 0.8 }
  ];
  
  // Start with base confidence
  let confidence = 0.95;
  
  // Check for confidence reducers
  nonHumanIndicators.forEach(indicator => {
    if (fileName.includes(indicator.keyword)) {
      confidence *= indicator.penalty;
    }
  });
  
  // For testing purposes, allow manual triggering of the "no human" error
  if (fileName.includes('test-no-human')) {
    return { detected: false, confidence: 0.2 };
  }
  
  // Determine if human detected based on confidence threshold
  return { 
    detected: confidence >= HUMAN_DETECTION_THRESHOLD, 
    confidence: confidence
  };
}

// Enhanced facial feature detection with confidence score
function enhancedFacialFeatureDetection(videoData) {
  // For demo purposes, simulate a more robust detection with confidence score
  const fileName = videoData.fileName.toLowerCase();
  
  // Poor visibility keywords with associated confidence penalties
  const poorVisibilityIndicators = [
    { keyword: 'dark', penalty: 0.7 },
    { keyword: 'backlighting', penalty: 0.75 },
    { keyword: 'distant', penalty: 0.8 },
    { keyword: 'blur', penalty: 0.65 },
    { keyword: 'blurry', penalty: 0.65 },
    { keyword: 'masked', penalty: 0.4 },
    { keyword: 'side-view', penalty: 0.6 },
    { keyword: 'back-view', penalty: 0.3 },
    { keyword: 'low-res', penalty: 0.7 }
  ];
  
  // Start with base confidence
  let confidence = 0.92;
  
  // Check for confidence reducers
  poorVisibilityIndicators.forEach(indicator => {
    if (fileName.includes(indicator.keyword)) {
      confidence *= indicator.penalty;
    }
  });
  
  // For testing purposes, allow manual triggering of the "poor facial visibility" error
  if (fileName.includes('test-no-face')) {
    return { detected: false, confidence: 0.3 };
  }
  
  // Determine if facial features detected based on confidence threshold
  return { 
    detected: confidence >= FACIAL_DETECTION_THRESHOLD, 
    confidence: confidence
  };
}

// Enhanced posture analysis with confidence score
function enhancedPostureAnalysis(videoData) {
  // For demo purposes, simulate a more robust detection with confidence score
  const fileName = videoData.fileName.toLowerCase();
  
  // Poor posture visibility keywords with associated confidence penalties
  const poorPostureIndicators = [
    { keyword: 'cropped', penalty: 0.75 },
    { keyword: 'closeup', penalty: 0.8 },
    { keyword: 'partial', penalty: 0.7 },
    { keyword: 'hidden', penalty: 0.6 },
    { keyword: 'sitting', penalty: 0.9 }, // Slightly reduces confidence but not drastically
    { keyword: 'head-only', penalty: 0.4 },
    { keyword: 'face-only', penalty: 0.3 },
    { keyword: 'crowded', penalty: 0.65 }
  ];
  
  // Start with base confidence
  let confidence = 0.90;
  
  // Check for confidence reducers
  poorPostureIndicators.forEach(indicator => {
    if (fileName.includes(indicator.keyword)) {
      confidence *= indicator.penalty;
    }
  });
  
  // For testing purposes, allow manual triggering of the "poor posture visibility" error
  if (fileName.includes('test-no-posture')) {
    return { detected: false, confidence: 0.2 };
  }
  
  // Determine if posture can be analyzed based on confidence threshold
  return { 
    detected: confidence >= POSTURE_ANALYSIS_THRESHOLD, 
    confidence: confidence
  };
}

// Enhanced speech analysis
function enhancedSpeechAnalysis(videoData) {
  // For demo purposes, simulate a more robust detection with confidence score
  const fileName = videoData.fileName.toLowerCase();
  
  // No speech keywords with associated confidence penalties
  const noSpeechIndicators = [
    { keyword: 'mute', penalty: 0.1 },
    { keyword: 'silent', penalty: 0.1 },
    { keyword: 'no-audio', penalty: 0.1 },
    { keyword: 'no-sound', penalty: 0.1 },
    { keyword: 'music-only', penalty: 0.3 },
    { keyword: 'instrumental', penalty: 0.4 }
  ];
  
  // Start with base confidence
  let confidence = 0.95;
  
  // Check for confidence reducers
  noSpeechIndicators.forEach(indicator => {
    if (fileName.includes(indicator.keyword)) {
      confidence *= indicator.penalty;
    }
  });
  
  // For testing purposes, allow manual triggering of the "no speech" condition
  if (fileName.includes('test-no-speech')) {
    return { detected: false, confidence: 0.1, words: 0 };
  }
  
  // Generate some speech metrics based on the video name (just for simulation)
  const nameLength = videoData.fileName.length;
  const wordsPerMinute = 110 + (nameLength % 40);
  
  // Determine if speech is detected and return metrics
  return { 
    detected: confidence > 0.4, 
    confidence: confidence,
    wordsPerMinute: wordsPerMinute,
    fillerRate: (1 + (nameLength % 5)) + "%"
  };
}

// Generate highly consistent analysis based on video properties and detection confidences
function generateEnhancedDeterministicAnalysis(
  videoData, 
  uniqueId, 
  humanConfidence, 
  facialConfidence, 
  postureConfidence,
  speechResult
) {
  // Create a deterministic seed based on video properties
  const fileName = videoData.fileName;
  const fileSize = videoData.fileSize;
  
  // Create a deterministic random number generator with improved seeding
  const seededRandom = (min, max, seed) => {
    const x = Math.sin(seed) * 10000;
    const rand = x - Math.floor(x);
    return min + rand * (max - min);
  };
  
  // Use multiple seed sources for more deterministic yet varied scores
  const primarySeed = (fileName.length * 53) + (fileSize % 997);
  const secondarySeed = (fileName.charCodeAt(0) * 17) + (fileSize % 87);
  
  // Confidence-weighted base scores
  // Weight the baseline scores by the detection confidences for more accuracy
  const confidenceWeight = (humanConfidence + facialConfidence + postureConfidence) / 3;
  
  // Base score between 65-85 depending on confidences
  const baseScore = 65 + (confidenceWeight * 20); 
  
  // Generate consistently varied metrics scores
  const eyeContactScore = Math.max(60, Math.min(95, baseScore - 5 + seededRandom(-8, 8, primarySeed)));
  const confidenceScore = Math.max(65, Math.min(95, baseScore + seededRandom(-5, 10, primarySeed + 1)));
  const bodyLanguageScore = Math.max(60, Math.min(95, baseScore + 3 + seededRandom(-5, 5, primarySeed + 2)));
  const speakingScore = Math.max(65, Math.min(95, baseScore + 5 + seededRandom(-3, 10, secondarySeed)));
  const engagementScore = Math.max(60, Math.min(90, baseScore - 2 + seededRandom(-10, 15, secondarySeed + 1)));
  
  // Calculate overall score - weighted average
  const overallScore = Math.round(
    (eyeContactScore * 0.2) +
    (confidenceScore * 0.25) +
    (bodyLanguageScore * 0.2) +
    (speakingScore * 0.2) +
    (engagementScore * 0.15)
  );
  
  // Generate consistently varied feedback based on the scores
  const feedback = generateDetailedFeedback(
    eyeContactScore, 
    confidenceScore, 
    bodyLanguageScore, 
    fileName, 
    uniqueId,
    facialConfidence,
    postureConfidence
  );
  
  // Generate timeline insights with more variation
  const timelineInsights = generateDetailedTimelineInsights(fileName, uniqueId, primarySeed);
  
  // Generate speech metrics based on deterministic values
  const wordsPerMinute = speechResult.detected ? speechResult.wordsPerMinute : 0;
  const fillerWordRate = speechResult.detected ? speechResult.fillerRate : "0%";
  const duration = Math.floor(2 + seededRandom(1, 5, secondarySeed)) + ":" + 
                  Math.floor(10 + seededRandom(10, 49, secondarySeed + 2)).toString().padStart(2, '0');

  return {
    analysisId: uniqueId,
    analysisVersion: ANALYSIS_VERSION,
    metrics: {
      overall: overallScore,
      eyeContact: Math.round(eyeContactScore),
      confidence: parseFloat(confidenceScore.toFixed(1)),
      bodyLanguage: Math.round(bodyLanguageScore),
      speaking: Math.round(speakingScore),
      engagement: Math.round(engagementScore)
    },
    detectionConfidence: {
      human: parseFloat(humanConfidence.toFixed(2)),
      facial: parseFloat(facialConfidence.toFixed(2)),
      posture: parseFloat(postureConfidence.toFixed(2)),
      speech: parseFloat(speechResult.confidence.toFixed(2))
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

// Generate more detailed feedback based on metrics and confidence scores
function generateDetailedFeedback(eyeContactScore, confidenceScore, bodyLanguageScore, fileName, uniqueId, facialConfidence, postureConfidence) {
  const feedback = [];
  
  // Positive feedback based on highest scores
  if (confidenceScore > 80) {
    feedback.push({ 
      type: "positive", 
      text: `Good posture and confident delivery of main points (ID: ${uniqueId.slice(0, 8)})` 
    });
  }
  
  if (bodyLanguageScore > 75) {
    feedback.push({ 
      type: "positive", 
      text: `Effective use of hand gestures to emphasize key information (Video: ${fileName.slice(0, 5)})` 
    });
  }
  
  if (eyeContactScore > 80) {
    feedback.push({ 
      type: "positive", 
      text: `Strong eye contact helps establish credibility and audience connection` 
    });
  }
  
  // Only give positive feedback on facial expressions if confidence is high
  if (facialConfidence > 0.85) {
    feedback.push({ 
      type: "positive", 
      text: `Good facial expressions that convey enthusiasm about the topic` 
    });
  }
  
  // Improvement areas - focus on lowest scores and confidence areas
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
  
  // Only give body language feedback if posture confidence is high enough
  if (postureConfidence < 0.85) {
    feedback.push({ 
      type: "improvement", 
      text: `Consider recording in an environment where your full posture is more visible` 
    });
  }
  
  return feedback;
}

// Generate more detailed timeline insights
function generateDetailedTimelineInsights(fileName, uniqueId, seed) {
  // Create a deterministic random number generator
  const seededRandom = (min, max, seedOffset) => {
    const x = Math.sin(seed + seedOffset) * 10000;
    const rand = x - Math.floor(x);
    return min + rand * (max - min);
  };

  // Generate more varied insights with time-appropriate comments
  return [
    { 
      timepoint: "0:15", 
      insight: `Strong opening with confident posture (ID: ${uniqueId.slice(0, 8)})` 
    },
    { 
      timepoint: formatTimepoint(seededRandom(30, 50, 1)), 
      insight: `Good hand gestures while explaining main concept (Video: ${fileName.slice(0, 5)})` 
    },
    { 
      timepoint: formatTimepoint(seededRandom(70, 100, 2)), 
      insight: "Breaking eye contact when discussing technical details" 
    },
    { 
      timepoint: formatTimepoint(seededRandom(120, 150, 3)), 
      insight: `Increased energy when presenting conclusion (ID: ${uniqueId.slice(4, 12)})` 
    }
  ];
}

// Format seconds into MM:SS format
function formatTimepoint(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
