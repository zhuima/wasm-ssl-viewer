'use client';

import { useState } from 'react';

type AddCertificateModalProps = {
  onAdd: (domain: string) => void;
  onClose: () => void;
};

export default function AddCertificateModal({ onAdd, onClose }: AddCertificateModalProps) {
  const [domainInput, setDomainInput] = useState('');
  
  const handleAdd = () => {
    if (domainInput.trim()) {
      onAdd(domainInput.trim());
      setDomainInput('');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">添加新域名</h3>
        <input
          type="text"
          value={domainInput}
          onChange={e => setDomainInput(e.target.value)}
          placeholder="输入域名 (例如: example.com)"
          className="w-full px-4 py-2 border rounded-lg mb-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
} 