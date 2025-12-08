import React from 'react'

export const Checkbox: React.FC<
  React.InputHTMLAttributes<HTMLInputElement>
> = ({ className, ...props }) => (
  <input
    type="checkbox"
    className={`w-4 h-4 rounded border-gray-300 ${className ?? ''}`}
    {...props}
  />
)
