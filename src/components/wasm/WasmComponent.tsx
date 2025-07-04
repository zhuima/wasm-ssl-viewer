'use client';

import { useState, useEffect, useCallback } from 'react';

interface SSLCertificate {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  serialNumber?: string;
  version?: number;
}

interface WasmSSLViewerProps {
  initialDomain?: string;
}

export default function WasmSSLViewer({ initialDomain = '' }: WasmSSLViewerProps) {
  const [certificate, setCertificate] = useState<SSLCertificate | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [domain, setDomain] = useState<string>(initialDomain);

  // 初始化WASM模块
  useEffect(() => {
    const initWasm = async () => {
      try {
        // 动态导入WASM模块
        const wasmModule = await import('../../../public/wasm/wasm_ssl_viewer.js');
        await wasmModule.default();
        setWasmModule(wasmModule);
      } catch (err) {
        console.error('Failed to initialize WASM module:', err);
        setError('Failed to initialize WebAssembly module');
      }
    };

    initWasm();
  }, []);

  // 处理域名提交
  const handleDomainSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!domain.trim()) {
      setError('请输入有效的域名');
      return;
    }
    
    setLoading(true);
    setError(null);
    setCertificate(null);
    setFileContent(null);
    
    try {
      // 发送请求获取域名的SSL证书
      const response = await fetch(`/api/fetch-cert?domain=${encodeURIComponent(domain)}`);
      
      if (!response.ok) {
        throw new Error(`获取证书失败: ${response.statusText}`);
      }
      
      const certData = await response.text();
      setFileContent(certData);
      
      // 处理证书数据
      if (wasmModule) {
        try {
          // 将PEM格式转换为DER格式
          const pemContents = certData.replace(/(-----(BEGIN|END) CERTIFICATE-----|[\n\r])/g, '');
          // 使用浏览器API替代Node.js的Buffer
          const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
          
          // 调用WASM模块的parse_certificate函数
          const certInfo = wasmModule.parse_certificate(binaryDer);
          
          // 处理返回的证书数据
          setCertificate({
            subject: certInfo.subject,
            issuer: certInfo.issuer,
            validFrom: certInfo.valid_from,
            validTo: certInfo.valid_to,
            fingerprint: certInfo.serial_number,
            serialNumber: certInfo.serial_number,
            version: certInfo.version
          });
        } catch (wasmError) {
          console.error('WASM processing error:', wasmError);
          setError('证书处理失败');
        }
      }
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError(`获取证书失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [domain, wasmModule]);

  // 当initialDomain变化或组件加载且有initialDomain时，自动查询证书
  useEffect(() => {
    if (initialDomain && wasmModule) {
      setDomain(initialDomain);
      handleDomainSubmit();
    }
  }, [initialDomain, wasmModule, handleDomainSubmit]);

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setDomain('');

    try {
      // 读取文件内容
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
        
        try {
          if (!wasmModule) {
            throw new Error('WASM module not initialized');
          }
          
          // 检查文件内容是PEM还是DER格式
          let certData: Uint8Array;
          
          if (content.includes('-----BEGIN CERTIFICATE-----')) {
            // PEM格式，需要转换为DER
            const pemContents = content.replace(/(-----(BEGIN|END) CERTIFICATE-----|[\n\r])/g, '');
            // 使用浏览器API替代Node.js的Buffer
            certData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
          } else {
            // 假设是DER格式或其他格式
            certData = new TextEncoder().encode(content);
          }
          
          // 调用WASM模块的parse_certificate函数
          const certInfo = wasmModule.parse_certificate(certData);
          
          // 处理返回的证书数据
          setCertificate({
            subject: certInfo.subject,
            issuer: certInfo.issuer,
            validFrom: certInfo.valid_from,
            validTo: certInfo.valid_to,
            fingerprint: certInfo.serial_number,
            serialNumber: certInfo.serial_number,
            version: certInfo.version
          });
        } catch (wasmError) {
          console.error('WASM processing error:', wasmError);
          setError('证书处理失败');
        }
      };
      
      reader.readAsText(file);
    } catch (err) {
      setError('读取文件失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6 text-gray-900">SSL证书查看器</h2>
      
      {/* 域名输入表单 */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-2 text-gray-700">输入域名</h3>
        <form onSubmit={handleDomainSubmit} className="flex gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
          >
            {loading ? '检查中...' : '检查SSL'}
          </button>
        </form>
      </div>
      
      <div className="mb-6">
        <h3 className="text-base font-medium mb-2 text-gray-700">或上传证书文件</h3>
        <input
          type="file"
          accept=".pem,.crt,.cer,.der"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-gray-100 file:text-gray-700
            hover:file:bg-gray-200"
        />
      </div>

      {loading && (
        <div className="flex justify-center my-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      {certificate && (
        <div className="bg-gray-50 p-6 rounded-md border border-gray-100">
          <h3 className="font-medium mb-4 text-gray-900">证书详情</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">主题</p>
              <p className="mt-1 text-gray-900">{certificate.subject}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">颁发者</p>
              <p className="mt-1 text-gray-900">{certificate.issuer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">有效期自</p>
              <p className="mt-1 text-gray-900">{certificate.validFrom}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">有效期至</p>
              <p className="mt-1 text-gray-900">{certificate.validTo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">序列号</p>
              <p className="mt-1 font-mono text-sm break-all text-gray-900">{certificate.serialNumber}</p>
            </div>
            {certificate.version !== undefined && (
              <div>
                <p className="text-sm font-medium text-gray-500">版本</p>
                <p className="mt-1 text-gray-900">{certificate.version}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {fileContent && !certificate && !loading && !error && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
          <h3 className="font-medium mb-2 text-gray-900">证书原始内容</h3>
          <pre className="whitespace-pre-wrap font-mono text-xs mt-2 bg-gray-100 p-4 rounded overflow-auto max-h-96 text-gray-800">
            {fileContent}
          </pre>
        </div>
      )}
    </div>
  );
}