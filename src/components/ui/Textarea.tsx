import React from 'react'

export const Textarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className, ...props }) => (
  <textarea
    className={`w-full rounded-md border border-gray-300 p-2 text-sm ${className || ''}`}
    {...props}
  />
)
