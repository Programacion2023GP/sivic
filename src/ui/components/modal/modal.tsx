import { ReactNode, useEffect, useState } from "react";
import { AiOutlineExpandAlt, AiOutlineClose } from "react-icons/ai";
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

   const isMobile = windowWidth < 1024;

   useEffect(() => {
      if (isOpen) {
         setInternalIsOpen(true);
      } else {
         const timer = setTimeout(() => {
            setInternalIsOpen(false);
         }, 500);
         return () => clearTimeout(timer);
      }
   }, [isOpen]);

   const handleClose = () => {
      onClose();
   };

   const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
         handleClose();
      }
   };

   // Variantes para la animación de expansión desde el centro
   const backdropVariants = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: { duration: 0.3 }
      },
      exit: {
         opacity: 0,
         transition: { duration: 0.4 }
      }
   };

   const modalVariants = {
      hidden: {
         scale: 0,
         opacity: 0,
         borderRadius: "50%"
      },
      visible: {
         scale: 1,
         opacity: 1,
         borderRadius: isExpanded ? "0px" : "16px",
         transition: {
            type: "spring" as const, // <-- IMPORTANTE: usar 'as const'
            damping: 25,
            stiffness: 200,
            duration: 0.5
         }
      },
      exit: {
         scale: 0,
         opacity: 0,
         borderRadius: "50%",
         transition: {
            duration: 0.4,
            ease: "easeInOut" as const
         }
      }
   };

   // Variantes para la versión móvil (BottomSheet) - CORREGIDO
   const bottomSheetVariants = {
      hidden: {
         y: "100%",
         opacity: 0
      },
      visible: {
         y: 0,
         opacity: 1,
         transition: {
            type: "spring" as const, // <-- 'as const' aquí también
            damping: 30,
            stiffness: 300,
            mass: 0.8
         }
      },
      exit: {
         y: "100%",
         opacity: 0,
         transition: {
            duration: 0.3,
            ease: "easeInOut" as const
         }
      }
   };

   // Render para móvil (BottomSheet)
   const renderBottomSheet = () => {
      return (
         <AnimatePresence>
            {isOpen && (
               <motion.div className="fixed inset-0 z-50" initial="hidden" animate="visible" exit="exit">
                  {/* Backdrop */}
                  <motion.div
                     className="absolute inset-0 bg-black bg-opacity-40"
                     onClick={handleClose}
                     variants={backdropVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                  />

                  {/* Sheet */}
                  <motion.div
                     className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-100"
                     variants={bottomSheetVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
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
                        transition={{ delay: 0.2 }}
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
            )}
         </AnimatePresence>
      );
   };

   // Render para desktop (Modal con animación de expansión)
   const renderModal = () => {
      return (
         <AnimatePresence>
            {isOpen && (
               <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden"
                  onClick={handleBackdropClick}
                  variants={backdropVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
               >
                  {/* Contenedor del modal con animación de expansión */}
                  <motion.div
                     className={`bg-white shadow-2xl overflow-hidden ${isExpanded ? "w-full h-full" : "w-[95vw] sm:w-11/12 max-w-6xl max-h-[95vh] sm:max-h-[90vh]"}`}
                     onClick={(e) => e.stopPropagation()}
                     variants={modalVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                  >
                     {/* Header del modal */}
                     <motion.div
                        className="flex justify-between items-center border-b presidencia px-3 py-2.5 sm:px-4 sm:py-3 sticky top-0 z-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                     >
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate flex-1 mr-2">{title}</h2>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                           {onToggleExpand && (
                              <motion.button
                                 onClick={onToggleExpand}
                                 className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                 title={isExpanded ? "Contraer" : "Expandir"}
                                 whileHover={{ scale: 1.1 }}
                                 whileTap={{ scale: 0.95 }}
                              >
                                 <AiOutlineExpandAlt size={18} className={`sm:w-5 sm:h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                              </motion.button>
                           )}
                           <motion.button
                              onClick={handleClose}
                              className="p-1.5 hover:cursor-pointer sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Cerrar"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                           >
                              <AiOutlineClose size={18} className="sm:w-5 sm:h-5" />
                           </motion.button>
                        </div>
                     </motion.div>

                     {/* Contenido del modal */}
                     <motion.div
                        className={`overflow-auto ${
                           isExpanded ? "h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]" : "max-h-[calc(95vh-48px)] sm:max-h-[calc(90vh-56px)]"
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                     >
                        <div className="p-3 sm:p-4 md:p-6">{children}</div>
                     </motion.div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      );
   };

   return isMobile ? renderBottomSheet() : renderModal();
};

export default CustomModal;
