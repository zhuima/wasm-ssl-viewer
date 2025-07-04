'use client';

import { format } from 'date-fns';
import { SSLCertificate } from '../types';

type CertificateDetailsProps = {
  certificate: SSLCertificate;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export default function CertificateDetails({ 
  certificate, 
  onClose, 
  onDelete 
}: CertificateDetailsProps) {
  if (!certificate) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">SSL 证书详情</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          {certificate.daysRemaining <= 0 ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
              此证书已过期
            </div>
          ) : certificate.daysRemaining <= 7 ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
              此证书即将过期（剩余 {certificate.daysRemaining} 天）
            </div>
          ) : certificate.daysRemaining <= 30 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg">
              此证书将在 {certificate.daysRemaining} 天后过期
            </div>
          ) : (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg">
              此证书有效（剩余 {certificate.daysRemaining} 天）
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <span className="font-semibold">域名: </span>
              <span>{certificate.domain}</span>
            </div>
            <div>
              <span className="font-semibold">颁发机构: </span>
              <span>{certificate.issuer}</span>
            </div>
            <div>
              <span className="font-semibold">有效期开始: </span>
              <span>{format(certificate.validFrom, 'yyyy/MM/dd HH:mm:ss')}</span>
            </div>
            <div>
              <span className="font-semibold">有效期结束: </span>
              <span>{format(certificate.validTo, 'yyyy/MM/dd HH:mm:ss')}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="font-semibold">剩余天数: </span>
              <span>{certificate.daysRemaining} 天</span>
            </div>
            <div>
              <span className="font-semibold">序列号: </span>
              <span className="break-all">{certificate.serialNumber}</span>
            </div>
            <div>
              <span className="font-semibold">指纹: </span>
              <span className="break-all">{certificate.fingerprint}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              onDelete(certificate.id);
              onClose();
            }}
            className="mr-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            删除证书
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
} 