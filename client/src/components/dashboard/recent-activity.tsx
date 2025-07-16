import { useQuery } from "@tanstack/react-query";
import { Clock, FileText, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import type { WeeklyStatusReport, TechnicalReview } from "@shared/schema";

interface ActivityItem {
  id: string;
  type: 'report' | 'review' | 'escalation' | 'status_change';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

export function RecentActivity() {
  const { data: reports } = useQuery<WeeklyStatusReport[]>({
    queryKey: ['/api/weekly-reports'],
  });

  const { data: reviews } = useQuery<TechnicalReview[]>({
    queryKey: ['/api/technical-reviews'],
  });

  // Generate activity items from reports and reviews
  const generateActivityItems = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Add recent reports
    if (reports) {
      reports.slice(0, 3).forEach((report) => {
        activities.push({
          id: `report-${report.id}`,
          type: 'report',
          title: 'Weekly Report Submitted',
          description: `Project status updated to ${report.ragStatus}`,
          timestamp: new Date(report.createdAt!),
          icon: FileText,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100'
        });

        if (report.clientEscalation) {
          activities.push({
            id: `escalation-${report.id}`,
            type: 'escalation',
            title: 'Client Escalation Reported',
            description: 'Requires immediate attention',
            timestamp: new Date(report.createdAt!),
            icon: AlertTriangle,
            iconColor: 'text-red-600',
            bgColor: 'bg-red-100'
          });
        }
      });
    }

    // Add recent reviews
    if (reviews) {
      reviews.slice(0, 2).forEach((review) => {
        activities.push({
          id: `review-${review.id}`,
          type: 'review',
          title: 'Technical Review Completed',
          description: `${review.reviewType} review by ${review.conductorId}`,
          timestamp: new Date(review.createdAt!),
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100'
        });
      });
    }

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 6);
  };

  const activityItems = generateActivityItems();

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (activityItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
            <Clock className="h-4 w-4 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No recent activity to display</p>
          <p className="text-sm text-gray-500 mt-1">Activity will appear here as projects are updated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
          <Clock className="h-4 w-4 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {activityItems.map((item) => (
          <div key={item.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className={`w-8 h-8 ${item.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <item.icon className={`h-4 w-4 ${item.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View all activity
        </button>
      </div>
    </div>
  );
}