import { ReactNode } from "react";
import { AiOutlineExpandAlt, AiOutlineClose } from "react-icons/ai";

interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   title?: string;
   children: ReactNode;
   isExpanded?: boolean;
   onToggleExpand?: () => void;
   isClosing?: boolean;
}

const CustomModal = ({ isOpen, onClose, title = "Modal", children, isExpanded = true, onToggleExpand, isClosing = false }: ModalProps) => {
   if (!isOpen) return null;

   const handleClose = () => {
      onClose();
   };

   const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
         handleClose();
      }
   };

   return (
      <div
         className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
            isClosing ? "opacity-0" : "opacity-100"
         }`}
         onClick={handleBackdropClick}
      >
         <div
            className={`bg-white shadow-2xl transform transition-all duration-300 overflow-hidden ${
               isExpanded ? "w-full h-full rounded-none" : "w-[95vw] sm:w-11/12 max-w-6xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl"
            } ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
            onClick={(e) => e.stopPropagation()}
         >
            {/* Header del modal */}
            <div className="flex justify-between items-center border-b presidencia px-3 py-2.5 sm:px-4 sm:py-3 sticky top-0 z-10">
               <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate flex-1 mr-2">{title}</h2>
               <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {onToggleExpand && (
                     <button
                        onClick={onToggleExpand}
                        className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title={isExpanded ? "Contraer" : "Expandir"}
                     >
                        <AiOutlineExpandAlt size={18} className={`sm:w-5 sm:h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                     </button>
                  )}
                  <button
                     onClick={handleClose}
                     className="p-1.5 hover:cursor-pointer sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                     title="Cerrar"
                  >
                     <AiOutlineClose size={18} className="sm:w-5 sm:h-5" />
                  </button>
               </div>
            </div>

            {/* Contenido del modal */}
            <div className={`overflow-auto ${isExpanded ? "h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]" : "max-h-[calc(95vh-48px)] sm:max-h-[calc(90vh-56px)]"}`}>
               <div className="p-3 sm:p-4 md:p-6">{children}</div>
            </div>
         </div>
      </div>
   );
};

export default CustomModal;
