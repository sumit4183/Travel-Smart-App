import React from "react";

interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className }: SpinnerProps) => (
  <div
    className={`animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 ${className}`}
  />
);

export default Spinner;
