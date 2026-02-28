import { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}

export default function DataTable<T>({ data, columns, emptyMessage = 'Nenhum dado encontrado.' }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-[#0B1220] overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left min-w-[600px] md:min-w-full border-collapse">
          <thead className="bg-[#0B1220] text-[10px] font-black text-white uppercase tracking-[0.3em]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-5 border-r-2 border-[#FFFFFF]/10 last:border-r-0 ${col.className} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#0B1220]/10">
            {data.map((item, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#1D4ED8]/5 transition-all group">
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-6 py-5 text-[11px] font-black uppercase tracking-tight text-[#0B1220] ${col.className} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : (item[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
