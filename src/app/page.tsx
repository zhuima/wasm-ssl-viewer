'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CertificateData {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  serialNumber: string;
  pemCertificate: string;
  daysRemaining?: number;
}

interface ApiErrorResponse {
  error: string;
}

export default function Home() {
  const [domain, setDomain] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      setError('请输入有效的域名');
      return;
    }
    
    setLoading(true);
    setError(null);
    setCertData(null);
    
    try {
      console.log(`正在获取域名 ${domain} 的SSL证书...`);
      
      // 发送请求获取域名的SSL证书
      const response = await fetch(`/api/fetch-cert?domain=${encodeURIComponent(domain)}`);
      const data = await response.json() as CertificateData | ApiErrorResponse;
      
      console.log('API响应:', data);
      
      if ('error' in data) {
        throw new Error(data.error);
      }
      
      if (!response.ok) {
        throw new Error(`获取证书失败: ${response.statusText}`);
      }
      
      // 解析证书数据并在当前页面显示
      setCertData(data as CertificateData);
      console.log('证书数据已设置');
    } catch (err) {
      console.error('获取证书错误:', err);
      setError(`获取证书失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push(`/dashboard?domain=${encodeURIComponent(domain)}`);
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-6 mb-4">
        <h1 className="text-2xl font-medium text-center mb-4 text-gray-900">SSL证书查看器</h1>
        <p className="text-gray-500 mb-6 text-center text-sm leading-relaxed">
          使用WebAssembly技术提供的高性能SSL证书分析工具
        </p>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              输入网站域名
            </label>
            <div className="relative">
              <input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
              {domain && (
                <button
                  type="button"
                  onClick={() => setDomain('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="清除输入"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              格式: example.com (不需要添加 https:// 或 www.)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>检查中...</span>
              </div>
            ) : '检查SSL证书'}
          </button>
        </form>
        
        {!certData && !loading && (
          <div className="text-center">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 text-sm font-medium">
              直接前往证书查看面板 →
            </Link>
          </div>
        )}
      </div>
      
      {certData && (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-medium mb-3">证书信息</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-medium text-gray-700">域名信息</h3>
              <p className="text-gray-600">
                {certData.subject?.CN || domain}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">颁发机构</h3>
              <p className="text-gray-600">
                {certData.issuer?.O || certData.issuer?.CN || '未知'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="font-medium text-gray-700">有效期开始</h3>
                <p className="text-gray-600">{formatDate(certData.validFrom)}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">有效期结束</h3>
                <p className="text-gray-600">{formatDate(certData.validTo)}</p>
              </div>
            </div>
            
            {certData.daysRemaining !== undefined && (
              <div>
                <h3 className="font-medium text-gray-700">剩余天数</h3>
                <p className={`${certData.daysRemaining < 30 ? 'text-orange-600' : 'text-green-600'}`}>
                  {certData.daysRemaining} 天
                </p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium text-gray-700">指纹</h3>
              <p className="text-gray-600 break-all text-xs">{certData.fingerprint}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">序列号</h3>
              <p className="text-gray-600 break-all text-xs">{certData.serialNumber}</p>
            </div>
          </div>
          
          <button
            onClick={goToDashboard}
            className="w-full bg-gray-900 hover:bg-black text-white py-2 px-4 rounded-lg font-medium transition-colors mt-4"
          >
            查看详细面板
          </button>
        </div>
      )}
      
      <footer className="text-center text-gray-400 text-xs">
        <p>使用WebAssembly和Next.js构建</p>
      </footer>
    </div>
  );
}