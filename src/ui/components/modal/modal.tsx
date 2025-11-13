import { ReactNode, useEffect, useState } from "react";
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

// const CustomModal = ({ isOpen, onClose, title = "Modal", children, isExpanded = true, onToggleExpand, isClosing = false }: ModalProps) => {
//    if (!isOpen) return null;

//    const handleClose = () => {
//       onClose();
//    };

//    const handleBackdropClick = (e: React.MouseEvent) => {
//       if (e.target === e.currentTarget) {
//          handleClose();
//       }
//    };

//    return (
//       <div
//          className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
//             isClosing ? "opacity-0" : "opacity-100"
//          }`}
//          onClick={handleBackdropClick}
//       >
//          <div
//             className={`bg-white shadow-2xl transform transition-all duration-300 overflow-hidden ${
//                isExpanded ? "w-full h-full rounded-none" : "w-[95vw] sm:w-11/12 max-w-6xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl"
//             } ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
//             onClick={(e) => e.stopPropagation()}
//          >
//             {/* Header del modal */}
//             <div className="flex justify-between items-center border-b presidencia px-3 py-2.5 sm:px-4 sm:py-3 sticky top-0 z-10">
//                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate flex-1 mr-2">{title}</h2>
//                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
//                   {onToggleExpand && (
//                      <button
//                         onClick={onToggleExpand}
//                         className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
//                         title={isExpanded ? "Contraer" : "Expandir"}
//                      >
//                         <AiOutlineExpandAlt size={18} className={`sm:w-5 sm:h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
//                      </button>
//                   )}
//                   <button
//                      onClick={handleClose}
//                      className="p-1.5 hover:cursor-pointer sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
//                      title="Cerrar"
//                   >
//                      <AiOutlineClose size={18} className="sm:w-5 sm:h-5" />
//                   </button>
//                </div>
//             </div>

//             {/* Contenido del modal */}
//             <div className={`overflow-auto ${isExpanded ? "h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]" : "max-h-[calc(95vh-48px)] sm:max-h-[calc(90vh-56px)]"}`}>
//                <div className="p-3 sm:p-4 md:p-6">{children}</div>
//             </div>
//          </div>
//       </div>
//    );
// };

// export default CustomModal;



import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "../../../hooks/windossize";

interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   title?: string;
   children: ReactNode;
   isExpanded?: boolean;
   onToggleExpand?: () => void;
}

const CustomModal = ({ isOpen, onClose, title = "Modal", children, isExpanded = true, onToggleExpand }: ModalProps) => {
   const { width: windowWidth } = useWindowSize();
   const [internalIsOpen, setInternalIsOpen] = useState(false);
   const [isClosing, setIsClosing] = useState(false);

   const isMobile = windowWidth < 1024;

   // Sincronizar estados cuando cambia isOpen
   useEffect(() => {
      if (isOpen) {
         setInternalIsOpen(true);
         setIsClosing(false);
      } else {
         setIsClosing(true);
         const timer = setTimeout(() => {
            setInternalIsOpen(false);
         }, 300);
         return () => clearTimeout(timer);
      }
   }, [isOpen]);

   const handleClose = () => {
      if (isMobile) {
         setIsClosing(true);
         const timer = setTimeout(() => {
            onClose();
         }, 300);
         return () => clearTimeout(timer);
      } else {
         onClose();
      }
   };

   const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
         handleClose();
      }
   };

   // Render para móvil (BottomSheet)
   const renderBottomSheet = () => {
      if (!internalIsOpen) return null;

      return (
         <AnimatePresence>
            <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               {/* Backdrop */}
               <motion.div
                  className="absolute inset-0 bg-black bg-opacity-40"
                  onClick={handleClose}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
               />

               {/* Sheet */}
               <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-100"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{
                     type: "spring",
                     damping: 30,
                     stiffness: 300,
                     mass: 0.8
                  }}
               >
                  {/* Handle */}
                  <div className="flex justify-center pt-3 pb-2">
                     <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
                  </div>

                  {/* Close Button */}
                  <motion.button
                     className="absolute top-3 right-3 z-10 w-7 h-7 hover:cursor-pointer text-red-400 hover:text-red-600 rounded-full flex items-center justify-center transition-colors shadow-md border"
                     onClick={handleClose}
                     whileHover={{
                        scale: 1.05,
                        backgroundColor: "rgb(249, 250, 251)"
                     }}
                     whileTap={{ scale: 0.95 }}
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.1 }}
                  >
                     <AiOutlineClose className="text-red-400 hover:text-red-600 text-xl" />
                  </motion.button>

                  <div className="mb-5"></div>

                  {/* Content */}
                  <div className="max-h-[82vh] overflow-y-auto pb-6 px-4">
                     {/* Header móvil */}
                     <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                     </div>
                     {children}
                  </div>
               </motion.div>
            </motion.div>
         </AnimatePresence>
      );
   };

   // Render para desktop (Modal)
   const renderModal = () => {
      if (!internalIsOpen) return null;

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

   // Render condicional según el tamaño de pantalla
   if (isMobile) {
      return renderBottomSheet();
   } else {
      return renderModal();
   }
};

export default CustomModal;