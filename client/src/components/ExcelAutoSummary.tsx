import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3
} from 'lucide-react';

interface ProjectSummary {
  projectName: string;
  weekNumber: number;
  overallHealth: string;
  summary: string;
  reportingDate: string;
  healthTrend: string;
}

interface ExcelData {
  summaries: ProjectSummary[];
}

export default function ExcelAutoSummary() {
  const { data: excelData, isLoading, error } = useQuery<ExcelData>({
    queryKey: ['/api/excel/summaries'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getHealthBadgeColor = (health: string) => {
    switch (health) {
      case 'Red': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            Excel Portfolio Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-red-600" />
            Excel Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load Excel analysis. Please check if Excel files are available in public/excels/
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!excelData || !excelData.summaries || !Array.isArray(excelData.summaries) || excelData.summaries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-gray-600" />
            Excel Portfolio Analysis
          </CardTitle>
          <CardDescription>
            No Excel data found. Add .xlsx files to public/excels/ for automatic analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Waiting for Excel files to be processed...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Portfolio Analysis
        </CardTitle>
        <CardDescription>
          {excelData?.summaries?.length || 0} projects analyzed from Excel reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium">Total Projects</div>
            <div className="text-2xl font-bold">{excelData?.summaries?.length || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium">Health Distribution</div>
            <div className="flex gap-1">
              {(() => {
                if (!excelData?.summaries || !Array.isArray(excelData.summaries)) return null;
                
                const healthCounts = excelData.summaries.reduce((acc, p) => {
                  if (p?.overallHealth) {
                    acc[p.overallHealth] = (acc[p.overallHealth] || 0) + 1;
                  }
                  return acc;
                }, {} as { [key: string]: number });
                
                return Object.entries(healthCounts).map(([health, count]) => (
                  <Badge key={health} className={getHealthBadgeColor(health)} variant="outline">
                    {health}: {count}
                  </Badge>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Project Summaries */}
        {excelData?.summaries && Array.isArray(excelData.summaries) && excelData.summaries.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Project Reports
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {excelData.summaries.slice(0, 4).map((project, index) => (
                <div key={index} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium truncate">{project?.projectName || 'Unknown Project'}</div>
                    <div className="flex gap-1">
                      <Badge className={getHealthBadgeColor(project?.overallHealth || 'Green')}>
                        {project?.overallHealth || 'Green'}
                      </Badge>
                      {project?.weekNumber && (
                        <Badge variant="outline">
                          Week {project.weekNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {project?.summary || 'No summary available'}
                  </div>
                  {project?.healthTrend && (
                    <div className="text-xs text-blue-600">
                      Trend: {project.healthTrend}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <div>• Auto-refreshes every 30 seconds</div>
          <div>• Data sourced from Excel files in public/excels/</div>
          <div>• AI-powered analysis using OpenAI</div>
        </div>
      </CardContent>
    </Card>
  );
}