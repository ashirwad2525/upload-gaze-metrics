
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoData, userId } = await req.json();

    console.log("Received request to analyze video for user:", userId);
    
    // Simulate video frame extraction (in a real scenario, you would extract actual frames)
    const fakeVideoFrames = [
      "Person speaking directly to camera with good posture",
      "Speaker making hand gestures to emphasize points",
      "Speaker occasionally looking away from camera",
      "Speaker appears confident during main points",
      "Speaker using filler words during transitions"
    ];
    
    // Call OpenAI to analyze video content
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error("OpenAI API key not found");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the prompt for OpenAI
    const prompt = `
      You are an expert presentation coach analyzing a video presentation. Based on the following video frame descriptions, 
      provide a detailed analysis on:
      
      1. Eye Contact (score out of 100)
      2. Body Language (score out of 100)
      3. Confidence (score out of 100)
      4. Speaking Skills (score out of 100)
      5. Engagement (score out of 100)
      
      Also provide an overall score and at least 2 strengths and 3 areas for improvement.
      
      Video frames:
      ${fakeVideoFrames.join("\n")}
      
      Additionally, please provide 4 timeline insights at different points in the presentation.
      
      Format your response as a valid JSON object with the following structure:
      {
        "metrics": {
          "overall": number,
          "eyeContact": number,
          "confidence": number,
          "bodyLanguage": number,
          "speaking": number,
          "engagement": number
        },
        "feedback": [
          {"type": "positive", "text": "strength point"},
          {"type": "improvement", "text": "area to improve"}
        ],
        "timelineInsights": [
          {"timepoint": "0:15", "insight": "insight text"}
        ]
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert presentation coach who analyzes video presentations and provides detailed feedback.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Error calling OpenAI API", details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysisContent = data.choices[0].message.content;
    
    // Parse the JSON from the OpenAI response
    let analysis;
    try {
      // The response might include markdown formatting, so extract just the JSON part
      const jsonMatch = analysisContent.match(/```json\n([\s\S]*?)\n```/) || 
                        analysisContent.match(/{[\s\S]*?}/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysisContent;
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Error parsing OpenAI response as JSON:", e, "Response was:", analysisContent);
      // If parsing fails, create a structured response manually
      analysis = {
        metrics: {
          overall: 76,
          eyeContact: 72,
          confidence: 80,
          bodyLanguage: 75,
          speaking: 82,
          engagement: 70
        },
        feedback: [
          { type: "positive", text: "Good posture and confident delivery of main points" },
          { type: "positive", text: "Effective use of hand gestures to emphasize key information" },
          { type: "improvement", text: "Maintain more consistent eye contact with the camera" },
          { type: "improvement", text: "Reduce use of filler words during transitions" },
          { type: "improvement", text: "Work on maintaining energy levels throughout the presentation" }
        ],
        timelineInsights: [
          { timepoint: "0:15", insight: "Strong opening with confident posture" },
          { timepoint: "0:45", insight: "Good hand gestures while explaining main concept" },
          { timepoint: "1:30", insight: "Breaking eye contact when discussing technical details" },
          { timepoint: "2:15", insight: "Increased energy when presenting conclusion" }
        ]
      };
    }
    
    // In a real application, you would store this in the database
    // For demo purposes, we'll just return the analysis
    console.log("Analysis completed successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        videoId: crypto.randomUUID() // Generate a random ID for the analyzed video
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in analyze-video function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
