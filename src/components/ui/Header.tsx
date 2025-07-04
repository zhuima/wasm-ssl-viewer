export default function Header() {
    return (
      <header className="bg-white shadow h-16 flex items-center px-6">
        <h1 className="text-xl font-semibold text-gray-800">SSL Certificate Viewer</h1>
        <div className="ml-auto">
          <button className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded">
            Upload Certificate
          </button>
        </div>
      </header>
    );
  }