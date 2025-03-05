import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import MetricsCard from "@/components/MetricsCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Activity, ThumbsUp, Clock, Download, Share2, AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AnalysisData {
  id: string;
  title: string;
  date: string;
  duration: string;
  url: string;
  thumbnail: string;
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
}

const mockAnalysisData: AnalysisData = {
  id: "new",
  title: "Job Interview Practice",
  date: "Today",
  duration: "2:45",
  url: "https://example.com/video.mp4",
  thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop",
  metrics: {
    overall: 76,
    eyeContact: 72,
    confidence: 80,
    bodyLanguage: 75,
    speaking: 82,
    engagement: 70,
  },
  feedback: [
    {
      type: "positive",
      text: "Strong opening that effectively captures attention"
    },
    {
      type: "positive",
      text: "Good voice modulation and clear articulation"
    },
    {
      type: "improvement",
      text: "Consider maintaining more consistent eye contact with the camera"
    },
    {
      type: "improvement",
      text: "Try to reduce filler words like 'um' and 'uh'"
    },
    {
      type: "improvement",
      text: "Hand gestures could be more natural and purposeful"
    },
  ],
  timelineInsights: [
    { timepoint: "0:12", insight: "Good opening stance and posture" },
    { timepoint: "0:45", insight: "Breaking eye contact while describing experience" },
    { timepoint: "1:20", insight: "Increased filler words when discussing challenges" },
    { timepoint: "2:05", insight: "Strong engagement when describing achievements" },
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const Analytics = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData>(mockAnalysisData);
  
  useEffect(() => {
    const fetchAnalysisData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (id === 'new') {
          setAnalysisData({...mockAnalysisData, id: 'new'});
          setLoading(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAnalysisData({...mockAnalysisData, id: id || 'unknown'});
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analysis:", err);
        setError("Failed to load analysis data");
        setLoading(false);
        toast.error("Failed to load analysis data");
      }
    };
    
    fetchAnalysisData();
  }, [id, user]);
  
  const metricsData = [
    { name: 'Eye Contact', value: analysisData.metrics.eyeContact },
    { name: 'Confidence', value: analysisData.metrics.confidence },
    { name: 'Body Language', value: analysisData.metrics.bodyLanguage },
    { name: 'Speaking', value: analysisData.metrics.speaking },
    { name: 'Engagement', value: analysisData.metrics.engagement },
  ];

  const timelineData = [
    { name: '0:00', score: 65 },
    { name: '0:30', score: 70 },
    { name: '1:00', score: 60 },
    { name: '1:30', score: 75 },
    { name: '2:00', score: 85 },
    { name: '2:30', score: 80 },
  ];

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

  if (error) {
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{analysisData.title}</h1>
            <p className="text-muted-foreground mt-1">
              Analyzed {analysisData.date} • {analysisData.duration} minutes
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
                <video
                  src={analysisData.url}
                  poster={analysisData.thumbnail}
                  controls
                  className="w-full h-full object-contain"
                ></video>
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
                  <p className="text-muted-foreground text-sm mt-2">Very Good</p>
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
                      <Tooltip formatter={(value) => `${value}%`} />
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
