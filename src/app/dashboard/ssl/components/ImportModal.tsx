'use client';

import { useRef } from 'react';

type ImportModalProps = {
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
};

export default function ImportModal({ onImport, onClose }: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">批量导入证书</h3>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            请选择一个JSON文件，包含证书数据数组。每个证书对象应包含以下字段：domain, issuer, validFrom, validTo, fingerprint, serialNumber。
          </p>
          
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={onImport}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
} 