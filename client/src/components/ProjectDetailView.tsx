import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Target,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';
import type { Project } from '@shared/schema';

interface ProjectDetailViewProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DetailedAnalysis {
  currentUpdateSummary: {
    pendingItems: string[];
    impactingFactors: string[];
    customerConnect: string;
    expectedUpdate: string;
    riskLevel: string;
  };
  tasksIdentified: Array<{
    task: string;
    priority: string;
    owner: string;
    status: string;
  }>;
  keyIssuesChallenges: string[];
  mitigationPlan: Array<{
    step: number;
    action: string;
  }>;
  nextSteps: string[];
  summary: string;
  overallHealth: string;
}

export default function ProjectDetailView({ project, open, onOpenChange }: ProjectDetailViewProps) {
  const { data: analysis, isLoading, error } = useQuery<DetailedAnalysis>({
    queryKey: [`/api/projects/${project.id}/detailed-analysis`],
    enabled: open,
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
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority.includes('🔴') || priority.includes('High')) return '🔴';
    if (priority.includes('🟡') || priority.includes('Medium')) return '🟡';
    return '🟢';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            {project.name}
            {analysis?.overallHealth && (
              <Badge className={getHealthBadgeColor(analysis.overallHealth)}>
                {analysis.overallHealth}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {project.customer}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {project.importance}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Code: {project.codeId}
            </span>
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load detailed analysis. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {analysis && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="plan">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Current Update Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Current Update Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm text-muted-foreground mb-3">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Pending Items
                      </h4>
                      <ul className="text-sm space-y-1">
                        {analysis.currentUpdateSummary.pendingItems.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Risk Level
                      </h4>
                      <Badge className={getRiskBadgeColor(analysis.currentUpdateSummary.riskLevel)}>
                        {analysis.currentUpdateSummary.riskLevel}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        {analysis.currentUpdateSummary.expectedUpdate}
                      </p>
                    </div>
                  </div>

                  {analysis.currentUpdateSummary.impactingFactors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Impacting Factors</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.currentUpdateSummary.impactingFactors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Tasks Identified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Task</th>
                          <th className="text-left py-2 font-medium">Priority</th>
                          <th className="text-left py-2 font-medium">Owner</th>
                          <th className="text-left py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.tasksIdentified.map((task, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 pr-4">{task.task}</td>
                            <td className="py-3 pr-4">
                              <Badge variant="outline" className="text-xs">
                                {task.priority}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">{task.owner}</td>
                            <td className="py-3">
                              <Badge 
                                variant={task.status === 'Completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {task.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Key Issues & Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.keyIssuesChallenges.map((issue, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{issue}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Mitigation Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.mitigationPlan.map((item, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                            {item.step}
                          </div>
                          <p className="text-sm">{item.action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}