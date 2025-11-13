import { useState, useRef, useEffect, type ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";

interface SidebarDropProps {
   icon?: ReactNode;
   id?: string;
   label: string;
   children: ReactNode;
}

export const SidebarDrop = ({ icon, label, children, id }: SidebarDropProps) => {
   const [open, setOpen] = useState(false);
   const [maxHeight, setMaxHeight] = useState(0);
   const contentRef = useRef<HTMLDivElement>(null);

   // 🔥 RE-CALCULAR altura cada vez que children cambia
   useEffect(() => {
      if (contentRef.current) {
         const height = contentRef.current.scrollHeight;
         setMaxHeight(height);
      }
   }, [children, open]);

   // 🔥 ADEMÁS: Observar cambios en el DOM con ResizeObserver
   useEffect(() => {
      if (!contentRef.current) return;

      const resizeObserver = new ResizeObserver((entries) => {
         for (const entry of entries) {
            const height = entry.target.scrollHeight;
            setMaxHeight(height);
         }
      });

      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
   }, []);

   return (
      <div className="mb-1">
         <button
            id={id}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="group w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white hover:bg-[#651D32] hover:text-white transition-all duration-200 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
         >
            <div className="flex items-center gap-3">
               {icon && <span className="text-lg text-white group-hover:text-white">{icon}</span>}
               <span className="font-medium">{label}</span>
            </div>
            <span className={`transition-transform duration-300 ease-in-out ${open ? "rotate-90" : "rotate-0"}`}>
               <FiChevronRight size={16} />
            </span>
         </button>

         <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
               maxHeight: open ? `${maxHeight}px` : "0px"
            }}
         >
            <div ref={contentRef} className="ml-6 pl-3 border-l-2 border-[#651D32]/40 flex flex-col gap-1.5 py-2">
               {children}
            </div>
         </div>
      </div>
   );
};
