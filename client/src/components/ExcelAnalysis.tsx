import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileSpreadsheet, Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ProjectSummary {
  projectName: string;
  overallHealth: 'Red' | 'Amber' | 'Green';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  keyInsights: string[];
  recommendations: string[];
  summary: string;
  criticalIssues: string[];
  successFactors: string[];
}

interface PortfolioSummary {
  overallHealth: string;
  totalProjects: number;
  riskDistribution: Record<string, number>;
  keyRecommendations: string[];
  criticalAlerts: string[];
}

interface ExcelAnalysisResult {
  message: string;
  projectsProcessed: number;
  portfolioSummary: PortfolioSummary;
  projectSummaries: ProjectSummary[];
  rawData: any[];
}

export default function ExcelAnalysis() {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Query for existing AI summaries
  const { data: existingSummaries, isLoading: loadingSummaries } = useQuery({
    queryKey: ['/api/excel/summaries'],
    enabled: false // Only load when expanded
  });

  // Mutation for processing Excel files
  const parseExcelMutation = useMutation({
    mutationFn: () => apiRequest('/api/excel/parse', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/excel/summaries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-reports'] });
    }
  });

  const handleParseExcel = async () => {
    try {
      await parseExcelMutation.mutateAsync();
    } catch (error) {
      console.error('Excel parsing failed:', error);
    }
  };

  const getHealthBadgeColor = (health: string) => {
    switch (health) {
      case 'Red': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>AI-Powered Excel Analysis</CardTitle>
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        <CardDescription>
          Parse Excel weekly status reports and generate AI insights for project management
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Parse Excel Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleParseExcel}
              disabled={parseExcelMutation.isPending}
              className="flex items-center gap-2"
            >
              {parseExcelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              {parseExcelMutation.isPending ? 'Processing...' : 'Parse Excel & Analyze'}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Processes Excel files from /public/excels/ directory
            </div>
          </div>

          {/* Processing Results */}
          {parseExcelMutation.data && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully processed {parseExcelMutation.data.projectsProcessed} projects. 
                AI analysis complete and dashboard updated.
              </AlertDescription>
            </Alert>
          )}

          {parseExcelMutation.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {parseExcelMutation.error instanceof Error 
                  ? parseExcelMutation.error.message 
                  : 'Failed to process Excel files'}
              </AlertDescription>
            </Alert>
          )}

          {/* Portfolio Summary */}
          {parseExcelMutation.data?.portfolioSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Portfolio Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{parseExcelMutation.data.portfolioSummary.totalProjects}</div>
                    <div className="text-sm text-muted-foreground">Total Projects</div>
                  </div>
                  <div className="text-center">
                    <Badge className={getHealthBadgeColor(parseExcelMutation.data.portfolioSummary.overallHealth)}>
                      {parseExcelMutation.data.portfolioSummary.overallHealth}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">Overall Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {parseExcelMutation.data.portfolioSummary.criticalAlerts.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Critical Alerts</div>
                  </div>
                </div>

                {/* Risk Distribution */}
                <div className="space-y-2">
                  <h4 className="font-medium">Risk Distribution</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(parseExcelMutation.data.portfolioSummary.riskDistribution).map(([risk, count]) => (
                      <div key={risk} className="text-center p-2 rounded-lg border">
                        <div className="font-medium">{count}</div>
                        <Badge className={getRiskBadgeColor(risk)} variant="outline">
                          {risk}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Recommendations */}
                {parseExcelMutation.data.portfolioSummary.keyRecommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {parseExcelMutation.data.portfolioSummary.keyRecommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Project Summaries */}
          {parseExcelMutation.data?.projectSummaries && (
            <Card>
              <CardHeader>
                <CardTitle>Project Analysis Results</CardTitle>
                <CardDescription>
                  AI-generated insights for each project from Excel data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {parseExcelMutation.data.projectSummaries.map((project, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{project.projectName}</h4>
                          <div className="flex gap-2">
                            <Badge className={getHealthBadgeColor(project.overallHealth)}>
                              {project.overallHealth}
                            </Badge>
                            <Badge className={getRiskBadgeColor(project.riskLevel)} variant="outline">
                              {project.riskLevel} Risk
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{project.summary}</p>

                        {project.keyInsights.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-1">Key Insights</h5>
                            <ul className="list-disc list-inside text-xs space-y-1">
                              {project.keyInsights.map((insight, idx) => (
                                <li key={idx}>{insight}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {project.recommendations.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-1">Recommendations</h5>
                            <ul className="list-disc list-inside text-xs space-y-1">
                              {project.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {project.criticalIssues.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-1 text-red-600">Critical Issues</h5>
                            <ul className="list-disc list-inside text-xs space-y-1 text-red-600">
                              {project.criticalIssues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      )}
    </Card>
  );
}