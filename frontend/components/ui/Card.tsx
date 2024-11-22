import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => (
  <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

export default Card;
