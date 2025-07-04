'use client';

import { useState } from 'react';

type FilterModalProps = {
  initialFilter: {
    enabled: boolean;
    days: number;
  };
  onApply: (filter: { enabled: boolean; days: number }) => void;
  onClose: () => void;
};

export default function FilterModal({ initialFilter, onApply, onClose }: FilterModalProps) {
  const [filter, setFilter] = useState(initialFilter);
  
  const handleApply = () => {
    onApply(filter);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">设置过期筛选</h3>
        
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={filter.enabled}
              onChange={e => setFilter(prev => ({
                ...prev,
                enabled: e.target.checked
              }))}
              className="mr-2"
            />
            <span>启用过期筛选</span>
          </label>
          
          <div className="flex items-center">
            <span className="mr-2">显示</span>
            <input
              type="number"
              value={filter.days}
              onChange={e => setFilter(prev => ({
                ...prev,
                days: parseInt(e.target.value) || 0
              }))}
              className="w-20 px-2 py-1 border rounded-lg text-center"
              min="1"
              max="365"
            />
            <span className="ml-2">天内过期的证书</span>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            应用
          </button>
        </div>
      </div>
    </div>
  );
} 