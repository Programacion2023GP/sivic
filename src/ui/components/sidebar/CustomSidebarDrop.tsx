import { useState, type ReactNode } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

interface SidebarDropProps {
  icon?: ReactNode;
  id?:string;
  label: string;
  children: ReactNode;
}

export const SidebarDrop = ({ icon, label, children,id }: SidebarDropProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        id={id}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="group w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-all duration-200 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-300"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-lg text-gray-400 group-hover:text-cyan-500">{icon}</span>}
          <span>{label}</span>
        </div>
        <span
          className={`transition-transform duration-300 ease-in-out ${open ? "rotate-90" : "rotate-0"}`}
        >
          <FiChevronRight size={16} />
        </span>
      </button>

      <div
        className={`ml-6 border-l border-gray-200 overflow-hidden transition-all duration-300 ease-in-out
        ${open ? "max-h-96 opacity-100 pl-2 py-1" : "max-h-0 opacity-0 pl-0 py-0"}`}
      >
        <div className="flex flex-col">{children}</div>
      </div>
    </div>
  );
};
