// components/sidebar/Sidebar.tsx
import type { ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
  name?:string,
  borderR?:boolean
}

export const Sidebar = ({ children,name,borderR=true }: SidebarProps) => {
  return (
    <aside className={`w-full h-screen bg-white text-gray-700  border-gray-200 ${borderR && 'border-r'} flex flex-col shadow-lg`}>
     {name && (
       <div className="p-4 text-lg font-bold text-gray-800 border-b border-gray-200">
       {name}
      </div>
     )}
      <nav className="flex-1 overflow-y-auto px-2 py-4">{children}</nav>
    </aside>
  );
};
