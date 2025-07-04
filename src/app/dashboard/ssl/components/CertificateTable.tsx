'use client';

import { useMemo, memo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  FilterFn,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { SSLCertificate } from '../types';

type CertificateTableProps = {
  certificates: SSLCertificate[];
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  globalFilter: string;
  expiryFilter: {
    enabled: boolean;
    days: number;
  };
  onShowDetails: (certificate: SSLCertificate) => void;
  onDelete: (id: string) => void;
};

// 使用memo优化表格行组件
const TableRow = memo(({ 
  row, 
  onShowDetails, 
  onDelete 
}: { 
  row: any; 
  onShowDetails: (certificate: SSLCertificate) => void; 
  onDelete: (id: string) => void;
}) => {
  return (
    <tr 
      key={row.id} 
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => onShowDetails(row.original)}
    >
      {row.getVisibleCells().map((cell: any) => (
        <td key={cell.id} className="px-3 py-3 text-sm text-gray-500 truncate">
          {flexRender(
            cell.column.columnDef.cell,
            cell.getContext()
          )}
        </td>
      ))}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

function CertificateTable({
  certificates,
  sorting,
  setSorting,
  globalFilter,
  expiryFilter,
  onShowDetails,
  onDelete
}: CertificateTableProps) {
  const columnHelper = createColumnHelper<SSLCertificate>();
  
  const columns = useMemo(() => [
    columnHelper.accessor('domain', {
      header: '域名信息',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('issuer', {
      header: '颁发机构',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('validFrom', {
      header: '有效期开始',
      cell: info => format(info.getValue(), 'yyyy/MM/dd HH:mm:ss'),
      sortingFn: 'datetime',
    }),
    columnHelper.accessor('validTo', {
      header: '有效期结束',
      cell: info => format(info.getValue(), 'yyyy/MM/dd HH:mm:ss'),
      sortingFn: 'datetime',
    }),
    columnHelper.accessor('daysRemaining', {
      header: '剩余天数',
      cell: info => {
        const days = info.getValue();
        let className = '';
        
        if (days <= 7) {
          className = 'text-red-600 font-bold';
        } else if (days <= 30) {
          className = 'text-orange-500';
        } else if (days <= 60) {
          className = 'text-yellow-500';
        }
        
        return <span className={className}>{days} 天</span>;
      },
    }),
    columnHelper.accessor('fingerprint', {
      header: '指纹',
      cell: info => (
        <div className="max-w-[200px] truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('serialNumber', {
      header: '序列号',
      cell: info => (
        <div className="max-w-[150px] truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '操作',
      cell: info => (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click event
            onDelete(info.row.original.id);
          }}
          className="text-red-600 hover:text-red-800"
        >
          删除
        </button>
      ),
    }),
  ], [columnHelper, onDelete]);

  // Filter function for expiry date
  const filterByExpiry: FilterFn<SSLCertificate> = (row, columnId, filterValue) => {
    if (!filterValue.enabled) return true;
    
    const daysRemaining = row.original.daysRemaining;
    return daysRemaining <= filterValue.days;
  };

  const table = useReactTable({
    data: certificates,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters: expiryFilter.enabled 
        ? [{ id: 'daysRemaining', value: expiryFilter }] 
        : [],
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      expiryFilter: filterByExpiry,
    },
  });

  // 获取过滤和排序后的行数据
  const rows = table.getRowModel().rows;
  
  // 如果数据量大，考虑只渲染可见区域的行
  const visibleRows = useMemo(() => {
    // 在实际项目中，这里可以使用react-window或react-virtualized来实现虚拟滚动
    // 简单起见，这里我们限制最多显示100行
    return rows.slice(0, Math.min(rows.length, 100));
  }, [rows]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                // Set column widths based on content type
                let className = "px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ";
                
                if (header.id === 'domain' || header.id === 'issuer') {
                  className += "w-[15%]";
                } else if (header.id === 'validFrom' || header.id === 'validTo') {
                  className += "w-[15%]";
                } else if (header.id === 'daysRemaining') {
                  className += "w-[8%]";
                } else if (header.id === 'fingerprint') {
                  className += "w-[20%]";
                } else if (header.id === 'serialNumber') {
                  className += "w-[15%]";
                } else if (header.id === 'actions') {
                  className += "w-[7%]";
                }
                
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={className}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {visibleRows.map(row => (
            <TableRow 
              key={row.id}
              row={row}
              onShowDetails={onShowDetails}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
      
      {rows.length > 100 && (
        <div className="text-center py-2 text-gray-500 text-sm">
          显示前100条记录，共 {rows.length} 条
        </div>
      )}
      
      {certificates.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          没有证书数据。请添加一个域名来获取 SSL 证书信息。
        </div>
      )}
    </div>
  );
}

export default memo(CertificateTable); 