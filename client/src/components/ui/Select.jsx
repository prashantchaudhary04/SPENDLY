import { forwardRef, useId } from 'react';

const Select = forwardRef(function Select({ label, error, className = '', children, ...props }, ref) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={`field-input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

export default Select;
