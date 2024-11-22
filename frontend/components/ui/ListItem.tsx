import React from "react";

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
}

const ListItem = ({ children, className }: ListItemProps) => (
  <li className={`p-4 border border-gray-200 rounded-md ${className}`}>
    {children}
  </li>
);

export default ListItem;
