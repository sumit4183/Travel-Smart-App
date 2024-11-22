import React from "react";

interface AlertProps {
  type: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

const Alert = ({ type, children, className }: AlertProps) => {
  const baseStyles = "p-4 rounded-md";
  const typeStyles = {
    error: "bg-red-100 text-red-700 border border-red-300",
    success: "bg-green-100 text-green-700 border border-green-300",
    info: "bg-blue-100 text-blue-700 border border-blue-300",
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${className}`}>
      {children}
    </div>
  );
};

export default Alert;
