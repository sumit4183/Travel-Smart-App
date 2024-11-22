import React from "react";

interface ListProps {
  children: React.ReactNode;
  className?: string;
}

const List = ({ children, className }: ListProps) => (
  <ul className={`list-disc space-y-2 ${className}`}>{children}</ul>
);

export default List;
