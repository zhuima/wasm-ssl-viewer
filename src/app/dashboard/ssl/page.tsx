'use client';

import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { SortingState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCertificates } from './hooks/useCertificates';

// 使用动态导入替代静态导入，减少初始加载时间
import dynamic from 'next/dynamic';

// 懒加载组件
const CertificateStats = dynamic(() => import('./components/CertificateStats'), {
  loading: () => <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>,
  ssr: false
});

const CertificateTable = dynamic(() => import('./components/CertificateTable'), {
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>,
  ssr: false
});

// 模态框组件懒加载
const CertificateDetails = lazy(() => import('./components/CertificateDetails'));
const AddCertificateModal = lazy(() => import('./components/AddCertificateModal'));
const FilterModal = lazy(() => import('./components/FilterModal'));
const ImportModal = lazy(() => import('./components/ImportModal'));
const ToolbarActions = lazy(() => import('./components/ToolbarActions'));

// 加载指示器
const LoadingFallback = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// 初始加载指示器
const InitialLoadingIndicator = () => (
  <div className="flex flex-col space-y-6">
    <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-12 bg-gray-100 rounded-lg animate-pulse mb-4"></div>
      <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  </div>
);

export default function SSLCertificatePage() {
  // 使用自定义钩子管理证书数据
  const {
    certificates,
    isLoading,
    isInitialized,
    certificateStats,
    addCertificate,
    deleteCertificate,
    importCertificates
  } = useCertificates();

  // UI状态
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<{
    enabled: boolean;
    days: number;
  }>({
    enabled: false,
    days: 30,
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  // 使用useEffect确保组件挂载后再显示内容
  useEffect(() => {
    // 延迟一点时间让浏览器有时间渲染初始UI
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // 使用防抖处理全局过滤器
  const handleGlobalFilterChange = useCallback((value: string) => {
    // 使用setTimeout模拟防抖
    const timer = setTimeout(() => {
      setGlobalFilter(value);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // 显示证书详情
  const showCertificateDetails = useCallback((certificate: any) => {
    setSelectedCertificate(certificate);
    setIsDetailsModalOpen(true);
  }, []);

  // 处理添加证书
  const handleAddCertificate = useCallback(async (domain: string) => {
    await addCertificate(domain);
    setIsModalOpen(false);
  }, [addCertificate]);

  // 处理导入证书
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedCount = await importCertificates(content);
        setIsImportModalOpen(false);
        alert(`成功导入 ${importedCount} 个证书`);
      } catch (error) {
        alert('导入失败：' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  }, [importCertificates]);

  // 导出CSV
  const exportToCSV = useCallback(() => {
    if (certificates.length === 0) return;
    
    // 使用Web Worker处理CSV导出以避免阻塞主线程
    // 这里简化实现，实际项目中可以创建一个专门的Web Worker
    setTimeout(() => {
      try {
        // Create CSV header
        const headers = [
          '域名信息',
          '颁发机构',
          '有效期开始',
          '有效期结束',
          '剩余天数',
          '指纹',
          '序列号'
        ];
        
        // Create CSV rows - 批处理以避免阻塞
        const batchSize = 100;
        const batches = Math.ceil(certificates.length / batchSize);
        let csvRows: string[] = [];
        
        for (let i = 0; i < batches; i++) {
          const start = i * batchSize;
          const end = Math.min(start + batchSize, certificates.length);
          const batchCerts = certificates.slice(start, end);
          
          const batchRows = batchCerts.map(cert => [
            cert.domain,
            cert.issuer,
            format(cert.validFrom, 'yyyy/MM/dd HH:mm:ss'),
            format(cert.validTo, 'yyyy/MM/dd HH:mm:ss'),
            `${cert.daysRemaining} 天`,
            cert.fingerprint,
            cert.serialNumber
          ].map(cell => `"${cell}"`).join(','));
          
          csvRows = [...csvRows, ...batchRows];
        }
        
        // Combine header and rows
        const csvContent = [
          headers.join(','),
          ...csvRows
        ].join('\n');
        
        // Create a Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', `ssl-certificates-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('导出失败，请稍后再试');
      }
    }, 0);
  }, [certificates]);

  // 如果页面还没准备好，显示加载指示器
  if (!isPageReady) {
    return <InitialLoadingIndicator />;
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            <span>处理中...</span>
          </div>
        </div>
      )}
      
      {/* Certificate Status Summary */}
      <CertificateStats
        total={certificateStats.total}
        valid={certificateStats.valid}
        expiringSoon={certificateStats.expiringSoon}
        expired={certificateStats.expired}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <Suspense fallback={<LoadingFallback />}>
          <ToolbarActions
            globalFilter={globalFilter}
            onGlobalFilterChange={handleGlobalFilterChange}
            expiryFilter={expiryFilter}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            onExportCSV={exportToCSV}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenAddModal={() => setIsModalOpen(true)}
            certificatesCount={certificates.length}
          />
        </Suspense>
        
        {isInitialized ? (
          <CertificateTable
            certificates={certificates}
            sorting={sorting}
            setSorting={setSorting}
            globalFilter={globalFilter}
            expiryFilter={expiryFilter}
            onShowDetails={showCertificateDetails}
            onDelete={deleteCertificate}
          />
        ) : (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">加载证书数据中...</p>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <AddCertificateModal
            onAdd={handleAddCertificate}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        
        {isDetailsModalOpen && selectedCertificate && (
          <CertificateDetails
            certificate={selectedCertificate}
            onClose={() => setIsDetailsModalOpen(false)}
            onDelete={deleteCertificate}
          />
        )}
        
        {isFilterModalOpen && (
          <FilterModal
            initialFilter={expiryFilter}
            onApply={setExpiryFilter}
            onClose={() => setIsFilterModalOpen(false)}
          />
        )}
        
        {isImportModalOpen && (
          <ImportModal
            onImport={handleImport}
            onClose={() => setIsImportModalOpen(false)}
          />
        )}
      </Suspense>
    </>
  );
}