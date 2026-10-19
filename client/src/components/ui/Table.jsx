import React from 'react';
import clsx from 'clsx';

export const Table = ({ columns = [], data = [], keyField = 'id', emptyMessage = 'No records found', className = '' }) => {
  return (
    <div className={clsx('w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white', className)}>
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={clsx('px-4 py-3.5', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row[keyField] || rowIdx} className="hover:bg-slate-50/60 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={clsx('px-4 py-3.5', col.cellClassName)}>
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
