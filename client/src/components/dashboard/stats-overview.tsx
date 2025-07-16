import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertTriangle, XCircle, AlertCircle } from "lucide-react";

interface DashboardStats {
  greenProjects: number;
  amberProjects: number;
  redProjects: number;
  escalations: number;
  totalProjects: number;
}

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Green Projects',
      value: stats.greenProjects,
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Amber Projects',
      value: stats.amberProjects,
      icon: AlertTriangle,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Red Projects',
      value: stats.redProjects,
      icon: XCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      title: 'Client Escalations',
      value: stats.escalations,
      icon: AlertCircle,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
