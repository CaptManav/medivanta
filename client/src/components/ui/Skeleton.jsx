import React from 'react';
import clsx from 'clsx';

export const Skeleton = ({ className = '', variant = 'rect', width, height }) => {
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={clsx('animate-pulse bg-slate-200/80', variants[variant], className)}
      style={style}
    />
  );
};
