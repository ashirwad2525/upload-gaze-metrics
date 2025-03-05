
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ArrowRight, Film, Clock, BarChart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const recentVideos = [
    {
      id: 1,
      title: "Job Interview Practice",
      date: "2 days ago",
      thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop",
      metrics: {
        confidence: 78,
        eyeContact: 65,
        bodyLanguage: 82
      }
    },
    {
      id: 2,
      title: "Sales Pitch Rehearsal",
      date: "1 week ago",
      thumbnail: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?q=80&w=1974&auto=format&fit=crop",
      metrics: {
        confidence: 85,
        eyeContact: 72,
        bodyLanguage: 79
      }
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Upload and analyze your videos to improve your presentation skills
            </p>
          </div>
          <Button size="lg" onClick={() => navigate("/upload")} className="gap-2">
            <Upload size={18} />
            New Upload
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Total Videos</CardTitle>
              <CardDescription>Your uploaded videos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Film className="mr-2 text-primary" />
                <span className="text-2xl font-bold">7</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Last Upload</CardTitle>
              <CardDescription>Your most recent analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 text-primary" />
                <span className="text-2xl font-bold">2 days ago</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Average Score</CardTitle>
              <CardDescription>Across all metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart className="mr-2 text-primary" />
                <span className="text-2xl font-bold">76%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Uploads</h2>
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight size={16} />
            </Button>
          </div>

          {recentVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/analytics/${video.id}`)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="aspect-video overflow-hidden bg-secondary">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{video.title}</h3>
                      <span className="text-xs text-muted-foreground">{video.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                        <div className="text-sm font-medium">{video.metrics.confidence}%</div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Eye Contact</p>
                        <div className="text-sm font-medium">{video.metrics.eyeContact}%</div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Body Language</p>
                        <div className="text-sm font-medium">{video.metrics.bodyLanguage}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <Button size="sm" className="ml-auto glass backdrop-blur-md">
                      View Analysis
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Film className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-medium mb-2">No videos yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Upload your first video to see analysis and metrics
              </p>
              <Button onClick={() => navigate("/upload")}>Upload Video</Button>
            </Card>
          )}
        </div>

        <Card className="overflow-hidden mb-8">
          <div className="relative bg-gradient-to-r from-primary/20 to-secondary p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full translate-x-1/2 -translate-y-1/2 filter blur-3xl"></div>
            <div className="relative z-10 max-w-xl">
              <h2 className="text-2xl font-bold mb-2">Supercharge your presentations</h2>
              <p className="text-muted-foreground mb-4">
                Upgrade to Pro and unlock advanced analysis, unlimited uploads and detailed feedback
              </p>
              <Button>Upgrade to Pro</Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
