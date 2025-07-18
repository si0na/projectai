import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, CheckCircle, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';

interface AIAnalysisData {
  lastUpdated: string;
  activeProjects: number;
  immediateFocus: Array<{
    project: string;
    description: string;
    type: 'red' | 'amber' | 'green';
  }>;
  amberRisk: Array<{
    project: string;
    description: string;
  }>;
  stableProjects: {
    percentage: number;
    description: string;
  };
  topRiskDriver: {
    description: string;
    impactedProjects: number;
  };
  keyAction: {
    description: string;
  };
  statusCounts: {
    green: number;
    amber: number;
    red: number;
  };
  continuousLearning: string;
}

export function AIAnalysisRecommendations() {
  const { data: analysis, isLoading } = useQuery<AIAnalysisData>({
    queryKey: ['/api/ai-portfolio-analysis'],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            AI Analysis & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            AI Analysis & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">No analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (type: 'red' | 'amber' | 'green') => {
    switch (type) {
      case 'red':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'amber':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'green':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (type: 'red' | 'amber' | 'green') => {
    switch (type) {
      case 'red':
        return 'text-red-600 dark:text-red-400';
      case 'amber':
        return 'text-amber-600 dark:text-amber-400';
      case 'green':
        return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            AI Analysis & Recommendations
          </CardTitle>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>Last Updated: {analysis.lastUpdated}</span>
          <span>•</span>
          <span>Active Projects: {analysis.activeProjects}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Immediate Focus */}
        {analysis.immediateFocus.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="font-medium text-red-600 dark:text-red-400">Immediate focus:</span>
              <span className="text-gray-600 dark:text-gray-300">
                {analysis.immediateFocus.map(item => item.project).join(', ')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 pl-6">
              {analysis.immediateFocus[0]?.description}
            </p>
          </div>
        )}

        {/* Amber Risk */}
        {analysis.amberRisk.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-amber-600 dark:text-amber-400">Amber risk:</span>
              <span className="text-gray-600 dark:text-gray-300">
                {analysis.amberRisk.map(item => item.project).join(', ')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 pl-6">
              {analysis.amberRisk[0]?.description}
            </p>
          </div>
        )}

        {/* Stable Projects */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-medium text-green-600 dark:text-green-400">Stable projects:</span>
            <span className="text-gray-600 dark:text-gray-300">
              {analysis.stableProjects.description}
            </span>
          </div>
        </div>

        {/* Top Risk Driver */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-blue-600 dark:text-blue-400">Top risk driver:</span>
            <span className="text-gray-600 dark:text-gray-300">
              {analysis.topRiskDriver.description} (impacting {analysis.topRiskDriver.impactedProjects} projects)
            </span>
          </div>
        </div>

        {/* Key Action */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-purple-600 dark:text-purple-400">Key action:</span>
            <span className="text-gray-600 dark:text-gray-300">
              {analysis.keyAction.description}
            </span>
          </div>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-4 pt-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium">{analysis.statusCounts.green} Green</span>
            </div>
          </Badge>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-medium">{analysis.statusCounts.amber} Amber</span>
            </div>
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="font-medium">{analysis.statusCounts.red} Red</span>
            </div>
          </Badge>
        </div>

        {/* Continuous Learning */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-purple-500" />
            {analysis.continuousLearning}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}