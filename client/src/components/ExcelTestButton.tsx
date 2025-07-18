import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function ExcelTestButton() {
  const [result, setResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const parseExcelMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/excel/parse'),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-reports'] });
    },
    onError: (error) => {
      console.error('Excel parsing error:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  });

  const handleParseExcel = () => {
    setResult(null);
    parseExcelMutation.mutate();
  };

  const getHealthBadgeColor = (health: string) => {
    switch (health) {
      case 'Red': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          Excel Parser Test
        </CardTitle>
        <CardDescription>
          Test Excel parsing with AI analysis from /public/excels/
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleParseExcel}
          disabled={parseExcelMutation.isPending}
          className="w-full"
        >
          {parseExcelMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Excel Files...
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Parse Excel & Generate AI Summaries
            </>
          )}
        </Button>

        {/* Success Result */}
        {result && !result.error && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">
                  ✅ Successfully processed {result.projectsProcessed} projects
                </div>
                <div className="text-sm">
                  Portfolio Health: <Badge className={getHealthBadgeColor(result.portfolioSummary?.overallHealth)}>
                    {result.portfolioSummary?.overallHealth}
                  </Badge>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Result */}
        {result?.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Error processing Excel files:</div>
                <div className="text-sm font-mono bg-red-50 p-2 rounded">
                  {result.error}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Project Summaries */}
        {result?.projectSummaries && result.projectSummaries.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Project Analysis Results:</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {result.projectSummaries.map((project: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{project.projectName}</div>
                    <Badge className={getHealthBadgeColor(project.overallHealth)}>
                      {project.overallHealth}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {project.summary}
                  </div>
                  {project.criticalIssues?.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      Critical: {project.criticalIssues.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <div>• Reads Excel files from public/excels/ directory</div>
          <div>• Converts color values (red/green/yellow) to health status</div>
          <div>• Generates AI-powered project insights using OpenAI</div>
          <div>• Updates dashboard with real project data</div>
        </div>
      </CardContent>
    </Card>
  );
}