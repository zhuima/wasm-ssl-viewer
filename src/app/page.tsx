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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-medium text-center mb-6 text-gray-900">SSL证书查看器</h1>
        <p className="text-gray-500 mb-8 text-center leading-relaxed">
          使用WebAssembly技术提供的高性能SSL证书分析工具，快速查看任何网站的SSL证书详情
        </p>
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              输入网站域名
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">
              格式: example.com (不需要添加 https:// 或 www.)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '检查中...' : '检查SSL证书'}
          </button>
        </form>
        
        {certData && (
          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-medium mb-4">证书信息</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">域名信息</h3>
                <p className="text-sm text-gray-600">
                  {certData.subject?.CN || domain}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">颁发机构</h3>
                <p className="text-sm text-gray-600">
                  {certData.issuer?.O || certData.issuer?.CN || '未知'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">有效期开始</h3>
                  <p className="text-sm text-gray-600">{formatDate(certData.validFrom)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">有效期结束</h3>
                  <p className="text-sm text-gray-600">{formatDate(certData.validTo)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">指纹</h3>
                <p className="text-sm text-gray-600 break-all">{certData.fingerprint}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">序列号</h3>
                <p className="text-sm text-gray-600 break-all">{certData.serialNumber}</p>
              </div>
            </div>
            
            <button
              onClick={goToDashboard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors mt-6"
            >
              查看详细面板
            </button>
          </div>
        )}
        
        {!certData && !loading && (
          <div className="text-center">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 text-sm font-medium">
              直接前往证书查看面板 →
            </Link>
          </div>
        )}
      </div>
      
      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>使用WebAssembly和Next.js构建</p>
      </footer>
    </div>
  );
}