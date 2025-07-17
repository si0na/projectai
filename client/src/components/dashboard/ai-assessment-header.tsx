import { useQuery } from "@tanstack/react-query";
import { Bot, BarChart3, Activity, Star } from "lucide-react";
import type { PortfolioAnalysis, Project } from "@shared/schema";

export function AIAssessmentHeader() {
  const { data: analysis, isLoading } = useQuery<PortfolioAnalysis>({
    queryKey: ["/api/portfolio-analysis"],
  });

  const getPrimaryRecommendation = (reason: string): string => {
  if (!reason) return "Review portfolio and address critical issues immediately";

  // Try to extract direct recommendation
  const recommendationMatch = reason.match(/Recommend (.+?)(\.|$)/i);
  if (recommendationMatch) return recommendationMatch[1];

  // Fallback to general patterns
  const actionMatch =
    reason.match(/focus(.+?)(\.|$)/i) ||
    reason.match(/attention(.+?)(\.|$)/i) ||
    reason.match(/address(.+?)(\.|$)/i);

  return actionMatch
    ? `Focus on ${actionMatch[1].trim()}`
    : "Review portfolio and address critical issues immediately";
};


const primaryRecommendation = analysis?.reason ? getPrimaryRecommendation(analysis.reason) : "";

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "green":
        return "bg-green-500";
      case "amber":
        return "bg-amber-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "green":
        return "bg-green-50 border-green-200";
      case "amber":
        return "bg-amber-50 border-amber-200";
      case "red":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const extractMetrics = (reason: string) => {
    const greenMatch = reason.match(/(\d+)\s*projects.*?Green/i);
    const amberMatch = reason.match(/(\d+)\s*projects.*?Amber/i);
    const redMatch = reason.match(/(\d+)\s*projects.*?Red/i);

    return {
      green: greenMatch ? parseInt(greenMatch[1]) : 0,
      amber: amberMatch ? parseInt(amberMatch[1]) : 0,
      red: redMatch ? parseInt(redMatch[1]) : 0,
    };
  };

  const metrics = analysis ? extractMetrics(analysis.reason) : { green: 0, amber: 0, red: 0 };
  const total = metrics.green + metrics.amber + metrics.red;

  const getSummaryText = () => {
    if (metrics.red > 10) return "High risk projects need immediate attention";
    if (metrics.amber > 15) return "Several projects require monitoring";
    return "Portfolio showing stable performance";
  };

  const strategicCount = projects?.filter((p) => p.projectImportance === "Strategic").length || 0;

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!analysis) {
    return (
      <div className="p-8 text-center text-gray-600">
        No AI portfolio analysis available yet.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Portfolio Intelligence</h2>
              <p className="text-blue-600 font-medium">Automated insights and risk analysis</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full">
            Updated: {formatDate(analysis.analysisDate!)}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Overall Status */}
            <div className={`rounded-2xl p-4 border-2 ${getStatusBgColor(analysis.overallPortfolioRagStatus)}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(analysis.overallPortfolioRagStatus)}`}></div>
                <div>
                  <p className="font-bold text-lg text-gray-900">{analysis.overallPortfolioRagStatus}</p>
                  <p className="text-sm text-gray-600">Tower Health</p>
                </div>
              </div>
            </div>

            {/* Strategic Projects */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-4 border-2 border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">{strategicCount}</p>
                  <p className="text-sm text-gray-600">Strategic Projects</p>
                </div>
              </div>
            </div>

            {/* Active Projects */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">{total}</p>
                  <p className="text-sm text-gray-600">Active Projects</p>
                </div>
              </div>
            </div>
          </div>

{/* AI Summary */}
<div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
  <div className="flex items-center space-x-3 mb-4">
    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
      <Bot className="h-4 w-4 text-white" />
    </div>
    <h3 className="font-semibold text-gray-900">AI Analysis & Recommendations</h3>
  </div>

  {/* Replaced Paragraph with AI Recommendation */}
  <p className="text-sm text-gray-700 leading-relaxed mb-4">
    {primaryRecommendation || "Review portfolio and address critical issues immediately."}
  </p>

  <div className="flex items-center space-x-4 mb-4">
    <span className="inline-flex items-center space-x-1 text-sm text-green-700">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span>{metrics.green} Green</span>
    </span>
    <span className="inline-flex items-center space-x-1 text-sm text-amber-700">
      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
      <span>{metrics.amber} Amber</span>
    </span>
    <span className="inline-flex items-center space-x-1 text-sm text-red-700">
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <span>{metrics.red} Red</span>
    </span>
  </div>

  <div className="flex items-center space-x-2">
    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
    <p className="text-xs text-indigo-600 font-medium">
      Continuously learning from your project patterns
    </p>
  </div>
</div>

        </div>
      </div>
    </div>
  );
}
