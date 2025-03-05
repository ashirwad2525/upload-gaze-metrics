
import React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface MetricsCardProps {
  title: string;
  score: number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const MetricsCard = ({ title, score, description, icon, className }: MetricsCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className={cn("p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        <Badge variant="outline" className={cn("font-medium", getScoreColor(score))}>
          {getScoreLabel(score)}
        </Badge>
      </div>
      
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Score</span>
          <span className={cn("font-medium", getScoreColor(score))}>{score}%</span>
        </div>
        <Progress value={score} className="h-2" />
      </div>
    </div>
  );
};

export default MetricsCard;
