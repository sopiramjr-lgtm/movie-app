import React from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No results found.",
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="w-full">
      <div className="rounded-xl overflow-hidden bg-white dark:bg-[#141414]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className={`py-4 px-4 font-semibold ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 px-4 text-center text-gray-500 dark:text-slate-400">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 px-4 text-center text-gray-500 dark:text-slate-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={keyExtractor(row)} className="border-b border-gray-100 dark:border-slate-800/80 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    {columns.map((col, index) => (
                      <td key={index} className={`py-4 px-4 whitespace-nowrap ${col.className || ""}`}>
                        {col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
