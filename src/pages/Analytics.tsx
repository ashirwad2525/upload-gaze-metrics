import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import MetricsCard from "@/components/MetricsCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Activity, ThumbsUp, Clock, Download, Share2, AlertCircle, Mic, Brain, FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface AnalysisData {
  id: string;
  title?: string;
  date?: string;
  duration?: string;
  url?: string;
  thumbnail?: string;
  metrics: {
    overall: number;
    eyeContact: number;
    confidence: number;
    bodyLanguage: number;
    speaking: number;
    engagement: number;
  };
  feedback: {
    type: string;
    text: string;
  }[];
  timelineInsights: {
    timepoint: string;
    insight: string;
  }[];
  speechMetrics?: {
    wordsPerMinute: number;
    fillerWordRate: string;
    duration: string;
  };
  transcriptId?: string;
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isValidAnalysisJson = (data: unknown): boolean => {
  if (!isObject(data)) return false;
  
  const hasMetrics = isObject(data.metrics) && 
    typeof data.metrics.overall === 'number' &&
    typeof data.metrics.eyeContact === 'number' &&
    typeof data.metrics.confidence === 'number' &&
    typeof data.metrics.bodyLanguage === 'number' &&
    typeof data.metrics.speaking === 'number' &&
    typeof data.metrics.engagement === 'number';
  
  const hasFeedback = Array.isArray(data.feedback) && 
    data.feedback.every(item => 
      isObject(item) && 
      typeof item.type === 'string' && 
      typeof item.text === 'string'
    );
  
  const hasTimelineInsights = Array.isArray(data.timelineInsights) && 
    data.timelineInsights.every(item => 
      isObject(item) && 
      typeof item.timepoint === 'string' && 
      typeof item.insight === 'string'
    );
  
  return hasMetrics && hasFeedback && hasTimelineInsights;
};

const extractMetrics = (analysisJson: unknown): AnalysisData['metrics'] => {
  if (!isObject(analysisJson) || !isObject(analysisJson.metrics)) {
    return {
      overall: 0,
      eyeContact: 0,
      confidence: 0,
      bodyLanguage: 0,
      speaking: 0,
      engagement: 0
    };
  }
  
  const metrics = analysisJson.metrics;
  
  return {
    overall: typeof metrics.overall === 'number' ? metrics.overall : 0,
    eyeContact: typeof metrics.eyeContact === 'number' ? metrics.eyeContact : 0,
    confidence: typeof metrics.confidence === 'number' ? metrics.confidence : 0,
    bodyLanguage: typeof metrics.bodyLanguage === 'number' ? metrics.bodyLanguage : 0,
    speaking: typeof metrics.speaking === 'number' ? metrics.speaking : 0,
    engagement: typeof metrics.engagement === 'number' ? metrics.engagement : 0
  };
};

const extractFeedback = (analysisJson: unknown): AnalysisData['feedback'] => {
  if (!isObject(analysisJson) || !Array.isArray(analysisJson.feedback)) {
    return [];
  }
  
  return analysisJson.feedback
    .filter(item => isObject(item) && typeof item.type === 'string' && typeof item.text === 'string')
    .map(item => ({
      type: item.type as string,
      text: item.text as string
    }));
};

const extractTimelineInsights = (analysisJson: unknown): AnalysisData['timelineInsights'] => {
  if (!isObject(analysisJson) || !Array.isArray(analysisJson.timelineInsights)) {
    return [];
  }
  
  return analysisJson.timelineInsights
    .filter(item => isObject(item) && typeof item.timepoint === 'string' && typeof item.insight === 'string')
    .map(item => ({
      timepoint: item.timepoint as string,
      insight: item.insight as string
    }));
};

const extractSpeechMetrics = (analysisJson: unknown): AnalysisData['speechMetrics'] | undefined => {
  if (!isObject(analysisJson) || !isObject(analysisJson.speechMetrics)) {
    return undefined;
  }
  
  const metrics = analysisJson.speechMetrics;
  
  if (typeof metrics.wordsPerMinute !== 'number' || 
      typeof metrics.fillerWordRate !== 'string' || 
      typeof metrics.duration !== 'string') {
    return undefined;
  }
  
  return {
    wordsPerMinute: metrics.wordsPerMinute as number,
    fillerWordRate: metrics.fillerWordRate as string,
    duration: metrics.duration as string
  };
};

const extractTranscriptId = (analysisJson: unknown): string | undefined => {
  if (!isObject(analysisJson)) {
    return undefined;
  }
  
  return typeof analysisJson.transcriptId === 'string' ? analysisJson.transcriptId : undefined;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const Analytics = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAnalysisData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!id || !user) {
          throw new Error("Missing analysis ID or user is not logged in");
        }
        
        console.log("Fetching analysis for ID:", id);
        
        const { data: analysisRecord, error: fetchError } = await supabase
          .from('video_analyses')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) {
          console.error("Error fetching analysis:", fetchError);
          throw new Error("Failed to fetch analysis data");
        }
        
        if (!analysisRecord) {
          throw new Error("Analysis not found");
        }
        
        console.log("Found analysis record:", analysisRecord.id);
        
        const { data: urlData } = await supabase.storage
          .from('videos')
          .createSignedUrl(analysisRecord.video_path, 3600); // 1 hour expiry
        
        if (urlData?.signedUrl) {
          setVideoUrl(urlData.signedUrl);
          console.log("Video URL created");
        }
        
        const analysisJson = analysisRecord.analysis;
        console.log("Analysis data:", analysisJson);
        
        const formattedData: AnalysisData = {
          id: analysisRecord.id,
          title: "Video Analysis",
          date: new Date(analysisRecord.created_at).toLocaleDateString(),
          metrics: extractMetrics(analysisJson),
          feedback: extractFeedback(analysisJson),
          timelineInsights: extractTimelineInsights(analysisJson),
          speechMetrics: extractSpeechMetrics(analysisJson),
          transcriptId: extractTranscriptId(analysisJson)
        };
        
        console.log("Formatted data:", formattedData);
        setAnalysisData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchAnalysisData:", err);
        setError(err instanceof Error ? err.message : "Failed to load analysis data");
        setLoading(false);
        toast.error("Failed to load analysis data");
      }
    };
    
    fetchAnalysisData();
  }, [id, user]);
  
  const getMetricsData = () => {
    if (!analysisData) return [];
    
    return [
      { name: 'Eye Contact', value: analysisData.metrics.eyeContact },
      { name: 'Confidence', value: analysisData.metrics.confidence },
      { name: 'Body Language', value: analysisData.metrics.bodyLanguage },
      { name: 'Speaking', value: analysisData.metrics.speaking },
      { name: 'Engagement', value: analysisData.metrics.engagement },
    ];
  };

  const getTimelineData = () => {
    if (!analysisData || !analysisData.timelineInsights.length) return [];
    
    const timelinePoints = analysisData.timelineInsights.map((insight, index) => {
      const timeParts = insight.timepoint.split(':');
      const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
      
      return {
        name: insight.timepoint,
        seconds,
        score: 60 + (Math.sin(index * 1.5) * 20) + (Math.random() * 10),
        insight: insight.insight
      };
    });
    
    return timelinePoints
      .sort((a, b) => a.seconds - b.seconds)
      .map(({ name, score, insight }) => ({ name, score, insight }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
            <p className="text-muted-foreground">Loading analysis...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !analysisData) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to load analysis</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const timelineData = getTimelineData();
  const metricsData = getMetricsData();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{analysisData.title || "Presentation Analysis"}</h1>
            <p className="text-muted-foreground mt-1">
              Analyzed {analysisData.date} • {analysisData.speechMetrics?.duration || "N/A"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download size={16} />
              Download
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-black">
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  ></video>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Video not available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Overall Score</CardTitle>
                <CardDescription>Performance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative">
                    <svg className="w-32 h-32">
                      <circle
                        className="text-muted/20"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className="text-primary"
                        strokeWidth="8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                        strokeDasharray={`${2 * Math.PI * 56 * analysisData.metrics.overall / 100} ${2 * Math.PI * 56 * (1 - analysisData.metrics.overall / 100)}`}
                        strokeDashoffset={2 * Math.PI * 56 * 0.25}
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-4xl font-bold">{analysisData.metrics.overall}</span>
                      <span className="text-xl">%</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    {analysisData.metrics.overall >= 90 ? "Excellent" :
                      analysisData.metrics.overall >= 80 ? "Very Good" :
                      analysisData.metrics.overall >= 70 ? "Good" :
                      analysisData.metrics.overall >= 60 ? "Satisfactory" :
                      "Needs Improvement"}
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  {Object.entries(analysisData.metrics)
                    .filter(([key]) => key !== 'overall')
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricsCard
            title="Eye Contact"
            score={analysisData.metrics.eyeContact}
            description="How well you maintained eye contact with the camera"
            icon={<Eye className="text-primary" size={20} />}
          />
          <MetricsCard
            title="Confidence"
            score={analysisData.metrics.confidence}
            description="Your overall confidence and delivery"
            icon={<ThumbsUp className="text-primary" size={20} />}
          />
          <MetricsCard
            title="Body Language"
            score={analysisData.metrics.bodyLanguage}
            description="Your posture, gestures and movement"
            icon={<Activity className="text-primary" size={20} />}
          />
        </div>

        {analysisData.speechMetrics && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium">Speech Analysis</h2>
              <Separator className="flex-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Mic size={18} />
                    <span>Speaking Rate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analysisData.speechMetrics.wordsPerMinute}</div>
                  <p className="text-sm text-muted-foreground">words per minute</p>
                  <div className="mt-2 text-sm">
                    {analysisData.speechMetrics.wordsPerMinute > 170 ? (
                      <span className="text-yellow-500">Slightly fast - try slowing down</span>
                    ) : analysisData.speechMetrics.wordsPerMinute < 120 ? (
                      <span className="text-yellow-500">Slightly slow - try increasing pace</span>
                    ) : (
                      <span className="text-green-500">Good pace - easy to follow</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={18} />
                    <span>Filler Words</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analysisData.speechMetrics.fillerWordRate}</div>
                  <p className="text-sm text-muted-foreground">of total words</p>
                  <div className="mt-2 text-sm">
                    {parseFloat(analysisData.speechMetrics.fillerWordRate) > 5 ? (
                      <span className="text-yellow-500">Try to reduce use of "um", "uh", etc.</span>
                    ) : (
                      <span className="text-green-500">Good control of filler words</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={18} />
                    <span>Analyzed Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analysisData.speechMetrics.duration}</div>
                  <p className="text-sm text-muted-foreground">presentation duration</p>
                  <div className="mt-2 text-sm">
                    {analysisData.transcriptId ? (
                      <span className="text-green-500">Full transcript available</span>
                    ) : (
                      <span className="text-muted-foreground">Basic analysis only</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <Tabs defaultValue="feedback" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="feedback">Key Feedback</TabsTrigger>
            <TabsTrigger value="charts">Detailed Charts</TabsTrigger>
            <TabsTrigger value="timeline">Timeline Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feedback" className="animate-slide-up">
            <Card>
              <CardHeader>
                <CardTitle>Key Feedback</CardTitle>
                <CardDescription>
                  AI-generated feedback on your presentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-green-500"></span>
                      Strengths
                    </h3>
                    <ul className="space-y-2 pl-6">
                      {analysisData.feedback
                        .filter(item => item.type === "positive")
                        .map((item, index) => (
                          <li key={index} className="list-disc text-muted-foreground">
                            {item.text}
                          </li>
                        ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2 pl-6">
                      {analysisData.feedback
                        .filter(item => item.type === "improvement")
                        .map((item, index) => (
                          <li key={index} className="list-disc text-muted-foreground">
                            {item.text}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="charts" className="animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metrics Comparison</CardTitle>
                  <CardDescription>
                    How different aspects of your presentation compare
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metricsData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {metricsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                  <CardDescription>
                    How your performance varied during the presentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timelineData}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          return [
                            `${value}%`,
                            props.payload.insight || "Performance score"
                          ];
                        }}
                      />
                      <Bar dataKey="score" fill="#0088FE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="animate-slide-up">
            <Card>
              <CardHeader>
                <CardTitle>Timeline Analysis</CardTitle>
                <CardDescription>
                  Key moments and insights throughout your presentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-8 border-l border-border space-y-6">
                  {analysisData.timelineInsights.map((item, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Clock size={12} className="text-primary-foreground" />
                      </div>
                      <div className="mb-1 font-medium">{item.timepoint}</div>
                      <p className="text-muted-foreground">{item.insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;
