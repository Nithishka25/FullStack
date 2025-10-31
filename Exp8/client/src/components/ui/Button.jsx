export default function Button({ as: Comp = 'button', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:pointer-events-none';
  const styles = 'bg-white text-black hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 px-4 py-2';
  return (
    <Comp className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </Comp>
  );
}
