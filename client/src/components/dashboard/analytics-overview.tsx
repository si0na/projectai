import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { Project, WeeklyStatusReport } from "@shared/schema";
import ExcelAutoSummary from "@/components/ExcelAutoSummary"; // adjust path if needed


export function AnalyticsOverview() {
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  const { data: weeklyReports } = useQuery<WeeklyStatusReport[]>({
    queryKey: ["/api/weekly-reports"],
  });

  // Calculate weekly trend
  const getWeeklyTrend = () => {
    if (!projects || !weeklyReports) return [];
    const last8Weeks = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const weekReports = weeklyReports.filter((report) => {
        const reportDate = new Date(report.createdAt!);
        return reportDate >= weekStart && reportDate <= weekEnd;
      });
      const ragCounts = { Green: 0, Amber: 0, Red: 0 };
      weekReports.forEach((report) => {
        const project = projects.find((p) => p.id === report.projectId);
        if (project && project.ragStatus) {
          ragCounts[project.ragStatus as keyof typeof ragCounts]++;
        }
      });
      last8Weeks.push({
        week: `W${8 - i}`,
        Green: ragCounts.Green,
        Amber: ragCounts.Amber,
        Red: ragCounts.Red,
      });
    }
    return last8Weeks;
  };

  const trendData = getWeeklyTrend();

  // ✅ Compute summary counts
  const summary = trendData.reduce(
    (acc, week) => {
      acc.Green += week.Green;
      acc.Amber += week.Amber;
      acc.Red += week.Red;
      return acc;
    },
    { Green: 0, Amber: 0, Red: 0 }
  );

 return (
  <div className="w-full">
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 shadow-lg p-10 my-4">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Weekly Trends</h3>
      </div>

      {/* ✅ Summary Section */}
      {trendData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-10 text-center">
          <div className="bg-white p-4 rounded-xl shadow border border-green-100">
            <p className="text-sm text-gray-500">Total Green</p>
            <p className="text-2xl font-semibold text-green-600">{summary.Green}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border border-yellow-100">
            <p className="text-sm text-gray-500">Total Amber</p>
            <p className="text-2xl font-semibold text-yellow-500">{summary.Amber}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border border-red-100">
            <p className="text-sm text-gray-500">Total Red</p>
            <p className="text-2xl font-semibold text-red-500">{summary.Red}</p>
          </div>
        </div>
      )}

      {/* ✅ Bar Chart */}
      {trendData.length > 0 ? (
        <div className="h-96 flex items-center justify-center mb-10">
          <ResponsiveContainer width="95%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" fontSize={14} />
              <YAxis stroke="#6b7280" fontSize={14} />
              <Tooltip />
              <Bar dataKey="Green" stackId="a" fill="#10b981" radius={[0, 0, 8, 8]} />
              <Bar dataKey="Amber" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Red" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center text-gray-500 mb-10">
          <p>No trend data available</p>
        </div>
      )}

      {/* ✅ Excel AI Summary Section */}
      <div className="mt-10 bg-white rounded-xl border border-gray-200 shadow p-6">
       <ExcelAutoSummary fileName="weekly_status_report.xlsx" />

      </div>
    </div>
  </div>
);

}
