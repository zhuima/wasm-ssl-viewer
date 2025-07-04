import DashboardLayout from '@/components/ui/Dashboard';
import { LineChart, BarChart, PieChartComponent, AreaChartComponent } from '@/components/charts/ChartComponents';

export default function DashboardPage() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Certificates Analyzed</h3>
            <p className="text-3xl font-bold text-gray-800">128</p>
            <p className="text-sm text-gray-500 mt-2">+12% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Expiring Soon</h3>
            <p className="text-3xl font-bold text-red-600">5</p>
            <p className="text-sm text-gray-500 mt-2">Certificates expiring in 30 days</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Security Score</h3>
            <p className="text-3xl font-bold text-green-600">A+</p>
            <p className="text-sm text-gray-500 mt-2">Based on 24 security checks</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Certificates Active</h3>
            <p className="text-3xl font-bold text-blue-600">87</p>
            <p className="text-sm text-gray-500 mt-2">Currently valid certificates</p>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Certificate Expiry Timeline</h3>
            <div className="h-64">
              <LineChart />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SSL Certificate Types</h3>
            <div className="h-64">
              <BarChart />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Certificate Issuers</h3>
            <div className="h-64">
              <PieChartComponent />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Score Trend</h3>
            <div className="h-64">
              <AreaChartComponent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}