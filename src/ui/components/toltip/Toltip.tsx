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
    setTooltipPosition({
      top: rect.top + window.scrollY + rect.height -28,
      left: rect.left + window.scrollX + 70, 
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  return (
    <div
      className="inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isHovered &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              zIndex: 800000000,
            }}
            className="px-2 py-1 text-sm font-bold text-white transform rounded bg-presidencia -translate-y-3/4"
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;
