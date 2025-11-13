// components/sidebar/SidebarItem.tsx
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarItemProps {
   icon?: ReactNode;
   rightIcon?: ReactNode;
   label: string;
   active?: boolean;
   route?: string;
   id?: string;
   onClick?: () => void;
   exact?: boolean; // Si quieres coincidencia exacta
}

export const SidebarItem = ({ icon, label, active, rightIcon, route, onClick, id, exact = false }: SidebarItemProps) => {
   const location = useLocation();

   // Determinar si está activo basado en la ruta actual
   const isActive = active || (route && (exact ? location.pathname === route : location.pathname.startsWith(route)));

   return (
      <Link
         id={id}
         to={route || ""}
         onClick={onClick}
         className={`group w-full flex items-center gap-3  px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
        ${
           isActive ? "bg-[#651D32] text-white border-l-4 border-white shadow-sm" : "text-white hover:bg-[#651D32] hover:text-white"
        } cursor-pointer focus:outline-none focus:ring-2 focus:ring-white`}
      >
         {icon && <span className={`text-lg transition-colors duration-200 ${isActive ? "text-white" : "text-white group-hover:text-white"}`}>{icon}</span>}
         {label}
         {rightIcon && <>{rightIcon}</>}
      </Link>
   );
};
