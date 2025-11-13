// components/sidebar/Sidebar.tsx
import { useEffect, type ReactNode } from "react";

interface SidebarProps {
   children: ReactNode;
   name?: string;
   borderR?: boolean;
}

export const Sidebar = ({ children, name, borderR = true }: SidebarProps) => {
   return (
      <aside className={`w-full  h-screen presidencia ${borderR && "border-r"} flex flex-col shadow-lg`}>
         {name && <div className="p-4 text-lg font-bold text-white border-b border-[#651D32] bg-[#651D32]">{name}</div>}
         <nav className="flex-1 overflow-y-auto px-2 py-4">{children}</nav>
      </aside>
   );
};
