type CertificateStatsProps = {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
};

export default function CertificateStats({ total, valid, expiringSoon, expired }: CertificateStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-3 md:p-4">
        <div className="text-xs sm:text-sm text-gray-500 mb-1">总证书数</div>
        <div className="text-xl md:text-2xl font-bold">{total}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-3 md:p-4">
        <div className="text-xs sm:text-sm text-gray-500 mb-1">有效证书</div>
        <div className="text-xl md:text-2xl font-bold text-green-600">{valid}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-3 md:p-4">
        <div className="text-xs sm:text-sm text-gray-500 mb-1">即将过期（30天内）</div>
        <div className="text-xl md:text-2xl font-bold text-orange-500">{expiringSoon}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-3 md:p-4">
        <div className="text-xs sm:text-sm text-gray-500 mb-1">已过期</div>
        <div className="text-xl md:text-2xl font-bold text-red-600">{expired}</div>
      </div>
    </div>
  );
} 