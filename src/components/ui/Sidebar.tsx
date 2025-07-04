import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-gray-800 text-white p-4 overflow-y-auto">
      <div className="text-2xl font-bold mb-8">WASM Dashboard</div>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/dashboard/ssl" className="block py-2 px-4 rounded hover:bg-gray-700">
              SSL Table
            </Link>
          </li>
          <li>
            <Link href="/dashboard/settings" className="block py-2 px-4 rounded hover:bg-gray-700">
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}