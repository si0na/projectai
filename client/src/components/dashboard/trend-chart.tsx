import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendData {
  date: string;
  green: number;
  amber: number;
  red: number;
}

export function TrendChart() {
  const { data: trendData, isLoading } = useQuery<TrendData[]>({
    queryKey: ['/api/dashboard/trends'],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Health Trend</h3>
          <div className="animate-pulse h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Health Trend</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-gray-500">No trend data available</div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: trendData.map(item => {
      const date = new Date(item.date);
      return `Week ${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Green',
        data: trendData.map(item => item.green),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      },
      {
        label: 'Amber',
        data: trendData.map(item => item.amber),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4
      },
      {
        label: 'Red',
        data: trendData.map(item => item.red),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Health Trend</h3>
        <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary focus:border-transparent">
          <option>Last 8 Weeks</option>
          <option>Last 12 Weeks</option>
          <option>Last 6 Months</option>
        </select>
      </div>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
