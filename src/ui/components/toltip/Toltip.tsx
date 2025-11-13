import React, { useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
   children: React.ReactNode;
   content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
   const [isHovered, setIsHovered] = useState(false);
   const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

   const handleMouseEnter = (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const tooltipWidth = 150; // ancho aproximado del tooltip
      const tooltipHeight = 28; // altura aproximada del tooltip
      let left = rect.left + window.scrollX + 70;
      let top = rect.top + window.scrollY + rect.height - 28;

      // Ajuste horizontal si se va a salir de la pantalla
      if (left + tooltipWidth > window.scrollX + window.innerWidth) {
         left = rect.left + window.scrollX - tooltipWidth - 10; // coloca a la izquierda
      }

      // Ajuste vertical si se va a salir de la pantalla
      if (top + tooltipHeight > window.scrollY + window.innerHeight) {
         top = rect.top + window.scrollY - tooltipHeight - 10; // coloca arriba
      }

      setTooltipPosition({ top, left });
      setIsHovered(true);
   };

   const handleMouseLeave = () => {
      setIsHovered(false);
   };

   return (
      <div className="inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
         {children}
         {isHovered &&
            createPortal(
               <div
                  style={{
                     position: "absolute",
                     top: tooltipPosition.top,
                     left: tooltipPosition.left,
                     zIndex: 800000000,
                     maxWidth: "200px"
                  }}
                  className="px-2 py-1 text-sm font-bold text-white transform rounded bg-black -translate-y-3/4"
               >
                  {content}
               </div>,
               document.body
            )}
      </div>
   );
};

export default Tooltip;
