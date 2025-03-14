import React from 'react';
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

interface CustomInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
    label,
    name,
    value,
    onChange,
    placeholder = "",  // Default to empty string if not provided
    required,
    type = "text"
  }) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          label={label}
        />
      </div>
    );
  };  

export default CustomInput;