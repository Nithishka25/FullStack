import { forwardRef } from 'react';

const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  const base = [
    'block w-full rounded-md text-sm',
    'border border-gray-300 focus:border-brand focus:ring-brand',
    'bg-white text-gray-900 placeholder-gray-400',
    'dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-700',
  ].join(' ');
  return <input ref={ref} className={`${base} ${className}`} {...props} />;
});

export default Input;
