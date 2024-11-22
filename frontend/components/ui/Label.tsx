import React from "react";

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

const Label = ({ htmlFor, children }: LabelProps) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
    {children}
  </label>
);

export default Label;
