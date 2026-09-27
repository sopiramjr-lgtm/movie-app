import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPageIndex: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-900 dark:text-white">{pageIndex * pageSize + 1}</span> to{" "}
        <span className="font-medium text-slate-900 dark:text-white">
          {Math.min((pageIndex + 1) * pageSize, totalElements)}
        </span>{" "}
        of <span className="font-medium text-slate-900 dark:text-white">{totalElements}</span> entries
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Rows per page</p>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 w-[70px] rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] text-xs focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(0)}
            disabled={pageIndex === 0}
            className="hidden h-8 w-8 p-0 lg:flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center justify-center text-xs font-medium text-slate-900 dark:text-white min-w-[3rem]">
            {pageIndex + 1} / {totalPages || 1}
          </div>
          <button
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
            className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={pageIndex >= totalPages - 1}
            className="hidden h-8 w-8 p-0 lg:flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
