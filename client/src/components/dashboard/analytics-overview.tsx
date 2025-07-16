import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Target, Activity } from "lucide-react";
import type { Project, WeeklyStatusReport } from "@shared/schema";

export function AnalyticsOverview() {
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: weeklyReports } = useQuery<WeeklyStatusReport[]>({
    queryKey: ['/api/weekly-reports'],
  });

  // Calculate RAG distribution
  const getRagDistribution = () => {
    if (!projects || !weeklyReports) return [];

    const ragCounts = { Green: 0, Amber: 0, Red: 0 };
    
    projects.forEach(project => {
      const latestReport = weeklyReports
        .filter(r => r.projectId === project.id)
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
      
      if (latestReport) {
        ragCounts[project.ragStatus as keyof typeof ragCounts]++;
      }
    });

    return [
      { name: 'Green', value: ragCounts.Green, color: '#10b981' },
      { name: 'Amber', value: ragCounts.Amber, color: '#f59e0b' },
      { name: 'Red', value: ragCounts.Red, color: '#ef4444' }
    ];
  };

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

    const weekReports = weeklyReports.filter(report => {
      const reportDate = new Date(report.createdAt!);
      return reportDate >= weekStart && reportDate <= weekEnd;
    });

    const ragCounts = { Green: 0, Amber: 0, Red: 0 };
    weekReports.forEach(report => {
      const project = projects.find(p => p.id === report.projectId);
      if (project && project.ragStatus) {
        ragCounts[project.ragStatus as keyof typeof ragCounts]++;
      }
    });

    last8Weeks.push({
      week: `W${i + 1}`,
      Green: ragCounts.Green,
      Amber: ragCounts.Amber,
      Red: ragCounts.Red
    });
  }

  return last8Weeks;
};

  const ragData = getRagDistribution();
  const trendData = getWeeklyTrend();
  const totalProjects = ragData.reduce((sum, item) => sum + item.value, 0);
  const healthScore = totalProjects > 0 ? Math.round((ragData.find(item => item.name === 'Green')?.value || 0) / totalProjects * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Health Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Health</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{healthScore}%</p>
            <p className="text-sm text-gray-600">Health Score</p>
          </div>
        </div>
        
        {ragData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ragData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ragData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex justify-center space-x-6 mt-4">
              {ragData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>No data available</p>
          </div>
        )}
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Trends</h3>
        </div>
        
        {trendData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="Green" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Amber" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Red" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>No trend data available</p>
          </div>
        )}
      </div>
    </div>
  );
}