import DashboardLayout from '@/components/ui/Dashboard';
import WasmSSLViewer from '@/components/wasm/WasmComponent';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
          <p className="text-gray-600">
            Welcome to the SSL Certificate Viewer powered by WebAssembly. Use the SSL Viewer section to analyze your certificates.
          </p>
        </div>
        
        <WasmSSLViewer />
      </div>
    </DashboardLayout>
  );
}