import React from 'react'

interface InputProps {
  label: string;
  type: string;
  id: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({
  label,
  type,
  id,
  placeholder,
  required,
  value,
  onChange
}: InputProps) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      placeholder={placeholder}
      required={required}
      {...(value !== undefined ? { value } : {})}  // Pass `value` only if provided
      disabled={false}
      onChange={onChange}
      className="mt-1 block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
)

export default Input