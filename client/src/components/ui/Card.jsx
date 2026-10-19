import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden',
        hover && 'hover:shadow-md hover:border-slate-300 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={clsx('px-5 py-4 border-b border-slate-100 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={clsx('text-base font-semibold text-slate-800', className)} {...props}>
    {children}
  </h3>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={clsx('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={clsx('px-5 py-3.5 bg-slate-50/50 border-t border-slate-100', className)} {...props}>
    {children}
  </div>
);
