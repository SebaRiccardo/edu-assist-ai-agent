import { CheckCircle } from 'lucide-react';

interface AnalysisStatsBarProps {
  stats: {
    totalAnalyzed: number;
    courseRelated: number;
  };
}

export function AnalysisStatsBar({ stats }: AnalysisStatsBarProps) {

  return (
    <div className="flex items-center gap-6 text-sm p-4 bg-background/80 backdrop-blur rounded-xl border-none shadow-none">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-muted-foreground">Analyzed:</span>
        <span className="font-semibold text-foreground">
          {stats.totalAnalyzed}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-chart-2" />
        <span className="text-muted-foreground">Course Related:</span>
        <span className="font-semibold text-foreground">
          {stats.courseRelated}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-muted-foreground">Analysis Complete</span>
      </div>
    </div>
  );
}
