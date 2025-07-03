import DashboardLayout from '@/components/ui/Dashboard';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p className="text-gray-600">
            Settings
          </p>
        </div>
        
      </div>
    </DashboardLayout>
  );
}