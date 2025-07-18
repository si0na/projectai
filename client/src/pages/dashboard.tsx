import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  RefreshCw,
  Download,
  ClipboardCheck,
  Bot,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIAssessmentHeader } from "@/components/dashboard/ai-assessment-header";
import { SearchBar } from "@/components/dashboard/search-bar";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { ProjectCard } from "@/components/dashboard/project-card";
import { WeeklyReportForm } from "@/components/forms/weekly-report-form";
import ExcelAutoSummary from "@/components/ExcelAutoSummary";
import { AIAnalysisRecommendations } from "@/components/AIAnalysisRecommendations";
import { useAuth } from "@/hooks/use-auth";
import { USER_ROLES } from "@/lib/constants";
import type { Project, WeeklyStatusReport } from "@shared/schema";

export default function Dashboard() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [importanceFilter, setImportanceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { user } = useAuth();

  // Static real project data from Excel image
  const projects = [
    {
      id: 1,
      name: "KAV",
      pm: "Vijo Jacob",
      customer: "KAV",
      ragStatus: "Red",
      projectImportance: "High",
      clientEscalation: true,
    },
    {
      id: 2,
      name: "BOSCH",
      pm: "Rajeev Kallumpurath",
      customer: "BOSCH",
      ragStatus: "Amber",
      projectImportance: "Medium",
      clientEscalation: false,
    },
    {
      id: 3,
      name: "Ashwathy Project",
      pm: "Ashwathy Nair",
      customer: "Ashwathy Customer",
      ragStatus: "Amber",
      projectImportance: "Medium",
      clientEscalation: false,
    },
    {
      id: 4,
      name: "Srinivasan Project",
      pm: "Srinivasan K R",
      customer: "Srinivasan Customer",
      ragStatus: "Amber",
      projectImportance: "Medium",
      clientEscalation: false,
    },
    {
      id: 5,
      name: "Project X",
      pm: "Rajakrishnan S",
      customer: "X Customer",
      ragStatus: "Green",
      projectImportance: "Low",
      clientEscalation: false,
    },
    {
      id: 6,
      name: "Project Y",
      pm: "Yamunaa Rani",
      customer: "Y Customer",
      ragStatus: "Green",
      projectImportance: "Low",
      clientEscalation: false,
    },
    {
      id: 7,
      name: "Project Z",
      pm: "Amitha M N",
      customer: "Z Customer",
      ragStatus: "Green",
      projectImportance: "Low",
      clientEscalation: false,
    },
    {
      id: 8,
      name: "Prakash Project",
      pm: "Prakash S",
      customer: "Prakash Customer",
      ragStatus: "Green",
      projectImportance: "Low",
      clientEscalation: false,
    },
    {
      id: 9,
      name: "Umesh Project",
      pm: "Umesh Choudhary",
      customer: "Umesh Customer",
      ragStatus: "Green",
      projectImportance: "Low",
      clientEscalation: false,
    },
    {
      id: 10,
      name: "Shanavaz Project",
      pm: "Shanavaz",
      customer: "Shanavaz Customer",
      ragStatus: "Green",
      projectImportance: "Low",
      clientEscalation: false,
    },
  ];

  // Simulate weeklyReports for dashboard logic
  const weeklyReports = projects.map((p, idx) => ({
    id: idx + 1,
    projectId: p.id,
    ragStatus: p.ragStatus,
    projectImportance: p.projectImportance,
    clientEscalation: p.clientEscalation,
    createdAt: new Date().toISOString(),
  }));

  const projectsLoading = false;
  const reportsLoading = false;

  // No-op for handleRefresh since we use static data
  const handleRefresh = () => {};

  const getLatestReportForProject = (projectId: number) => {
    return weeklyReports.find((r) => r.projectId === projectId);
  };

  const filteredProjects =
    projects?.filter((project) => {
      const latestReport = getLatestReportForProject(project.id);

      // Search filter
      if (
        searchQuery &&
        !project.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !project.customer?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (
        statusFilter !== "all" &&
        (!latestReport ||
          latestReport.ragStatus?.toLowerCase() !== statusFilter)
      ) {
        return false;
      }

      // Importance filter
      if (
        importanceFilter !== "all" &&
        (!latestReport ||
          latestReport.projectImportance?.toLowerCase() !== importanceFilter)
      ) {
        return false;
      }

      return true;
    }) || [];

  // Get high priority projects for dashboard
  const getDashboardProjects = () => {
    if (!projects || !weeklyReports) return [];

    return projects
      .map((project) => ({
        ...project,
        latestReport: getLatestReportForProject(project.id),
      }))
      .filter(
        (project) =>
          project.latestReport &&
          (project.latestReport.ragStatus === "Red" ||
            project.latestReport.clientEscalation ||
            project.latestReport.projectImportance === "High")
      )
      .sort((a, b) => {
        // Sort by priority: Red > Escalation > High Importance
        const getPriority = (proj: any) => {
          if (proj.latestReport?.ragStatus === "Red") return 3;
          if (proj.latestReport?.clientEscalation) return 2;
          if (proj.latestReport?.projectImportance === "High") return 1;
          return 0;
        };
        return getPriority(b) - getPriority(a);
      })
      .slice(0, 6);
  };

  const dashboardProjects = getDashboardProjects();

  const isLoading = projectsLoading || reportsLoading;

  return (
    <div className="bg-gray-50 min-h-full">
      <AIAssessmentHeader />

      <div className="max-w-7xl mx-auto p-8">
        {/* Header with filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Portfolio Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time insights and priority project tracking
            </p>
          </div>

          {/* Removed status/priority dropdowns and refresh icon for a cleaner, more relevant dashboard header */}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Analytics and Priority Projects */}
          <div className="xl:col-span-2 space-y-8">
            {/* Analytics Overview */}
            <AnalyticsOverview />

            {/* Priority Projects */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Priority Projects
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : dashboardProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">
                    No priority projects requiring attention
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    All projects are performing well
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">
                              {project.name}
                            </h4>
                            {project.latestReport && (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  project.latestReport.ragStatus === "Red"
                                    ? "bg-red-100 text-red-800"
                                    : project.latestReport.ragStatus === "Amber"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                    project.latestReport.ragStatus === "Red"
                                      ? "bg-red-500"
                                      : project.latestReport.ragStatus ===
                                        "Amber"
                                      ? "bg-amber-500"
                                      : "bg-green-500"
                                  }`}
                                ></div>
                                {project.latestReport.ragStatus}
                              </span>
                            )}
                            {project.latestReport?.clientEscalation && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Escalated
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {project.customer}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="space-y-8">
            {/* AI Analysis & Recommendations */}
            <AIAnalysisRecommendations />
            
            {/* Excel Analysis */}
            <ExcelAutoSummary />
            
            <RecentActivity />

            {/* Quick Actions */}
            {(user?.role === USER_ROLES.DELIVERY_MANAGER ||
              user?.role === USER_ROLES.ADMIN) && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl h-12"
                  >
                    <Download className="h-4 w-4 mr-3" />
                    Export Portfolio Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl h-12"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-3" />
                    Technical Reviews
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl h-12"
                  >
                    <Bot className="h-4 w-4 mr-3" />
                    AI Configuration
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}