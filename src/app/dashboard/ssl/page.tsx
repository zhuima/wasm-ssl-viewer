import DashboardLayout from '@/components/ui/Dashboard';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">SSL Certificate Viewer</h2>
          <p className="text-gray-600">
            SSL Certificate Viewer
          </p>
        </div>
        
      </div>
    </DashboardLayout>
  );
}