'use client';

type ToolbarActionsProps = {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  expiryFilter: {
    enabled: boolean;
    days: number;
  };
  onOpenFilterModal: () => void;
  onExportCSV: () => void;
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
  certificatesCount: number;
};

export default function ToolbarActions({
  globalFilter,
  onGlobalFilterChange,
  expiryFilter,
  onOpenFilterModal,
  onExportCSV,
  onOpenImportModal,
  onOpenAddModal,
  certificatesCount
}: ToolbarActionsProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
      <h2 className="text-xl font-semibold">SSL 证书查看器</h2>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={globalFilter}
          onChange={e => onGlobalFilterChange(e.target.value)}
          placeholder="搜索..."
          className="px-4 py-2 border rounded-lg w-full sm:w-auto"
        />
        <button
          onClick={onOpenFilterModal}
          className={`px-3 py-2 ${expiryFilter.enabled ? 'bg-green-600' : 'bg-gray-600'} text-white rounded-lg hover:bg-opacity-90 text-sm`}
        >
          {expiryFilter.enabled ? `过期筛选: ${expiryFilter.days}天` : '过期筛选'}
        </button>
        <button
          onClick={onExportCSV}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          disabled={certificatesCount === 0}
        >
          导出 CSV
        </button>
        <button
          onClick={onOpenImportModal}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          批量导入
        </button>
        <button
          onClick={onOpenAddModal}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          添加域名
        </button>
      </div>
    </div>
  );
} 