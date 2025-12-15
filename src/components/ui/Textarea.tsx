import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        ref={ref}
        className={`w-full rounded-lg border ${
          error ? 'border-red-500' : 'border-gray-300'
        } px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-samba-orange/20 focus:border-samba-orange transition-colors resize-none ${className || ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);

Textarea.displayName = 'Textarea';
