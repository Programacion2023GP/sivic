import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  icon?: ReactNode;
  rightIcon?:ReactNode;
  label: string;
  active?: boolean;
  route?:string,
  id?:string,
  onClick?: () => void;
}


export const SidebarItem = ({ icon, label, active, rightIcon, route,onClick,id }: SidebarItemProps) => {
  return (
    <Link
      id={id}
      to={route||""}
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
        ${active
          ? "bg-cyan-50 text-cyan-700 border-l-4 border-cyan-500 shadow-sm"
          : "text-gray-600 hover:bg-cyan-50 hover:text-cyan-600"
        } cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-300`}
    >
      {icon && (
        <span className={`text-lg transition-colors duration-200 ${active ? "text-cyan-600" : "text-gray-400 group-hover:text-cyan-500"}`}>
          {icon}
        </span>
      )}
      {label}
      {rightIcon && <>{rightIcon}</>}
    </Link>
  );
};
