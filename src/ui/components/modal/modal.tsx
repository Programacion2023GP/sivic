import { ReactNode, useEffect, useState, useRef } from "react";
import { AiOutlineClose, AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { motion, AnimatePresence, PanInfo, Transition, Easing } from "framer-motion";
import { useWindowSize } from "../../../hooks/windossize";

interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   title?: string;
   children: ReactNode;
   size?: "sm" | "md" | "lg" | "xl" | "full";
   showCloseButton?: boolean;
   backdropBlur?: boolean;
   showHeader?: boolean;
   closeOnBackdropClick?: boolean;
   preventScroll?: boolean;
   maxWidth?: string;
   padding?: "none" | "sm" | "md" | "lg";
   borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
}

const CustomModal = ({
   isOpen,
   onClose,
   title = "Modal",
   children,
   size = "lg",
   showCloseButton = true,
   backdropBlur = true,
   showHeader = true,
   closeOnBackdropClick = true,
   preventScroll = true,
   maxWidth = "max-w-4xl",
   padding = "md",
   borderRadius = "lg"
}: ModalProps) => {
   const { width: windowWidth, height: windowHeight } = useWindowSize();
   const modalRef = useRef<HTMLDivElement>(null);
   const [isFullscreen, setIsFullscreen] = useState(false);
   const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
   const [isDragging, setIsDragging] = useState(false);
   const [showDragHandle, setShowDragHandle] = useState(false);

   const isMobile = windowWidth < 768;
   const isTablet = windowWidth >= 768 && windowWidth < 1024;

   // Prevenir scroll del body cuando el modal está abierto
   useEffect(() => {
      if (preventScroll && isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "unset";
      }
      return () => {
         document.body.style.overflow = "unset";
      };
   }, [isOpen, preventScroll]);

   // Efecto para manejar tecla ESC
   useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
         if (e.key === "Escape" && isOpen) {
            onClose();
         }
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
   }, [isOpen, onClose]);

   const handleClose = () => {
      onClose();
      setIsFullscreen(false);
      setDragPosition({ x: 0, y: 0 });
   };

   const handleBackdropClick = (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
         handleClose();
      }
   };

   const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
      setDragPosition({ x: 0, y: 0 });
   };

   // Configuraciones de tamaño
   const sizeConfig = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-3xl",
      xl: "max-w-6xl",
      full: "max-w-full"
   };

   // Configuraciones de padding
   const paddingConfig = {
      none: "p-0",
      sm: "p-3",
      md: "p-6",
      lg: "p-8"
   };

   // Configuraciones de borderRadius
   const borderRadiusConfig = {
      none: "rounded-none",
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-2xl",
      xl: "rounded-3xl"
   };

   // CORREGIDO: Definir transition correctamente para Framer Motion
   const backdropTransition: Transition = {
      duration: 0.3,
      ease: "easeOut" as Easing // Usar 'as Easing' o usar una constante
   };

   const modalTransition: Transition = {
      type: "spring",
      damping: 25,
      stiffness: 300,
      mass: 0.8
   };

   const bottomSheetTransition: Transition = {
      type: "spring",
      damping: 30,
      stiffness: 400,
      mass: 0.9
   };

   // CORREGIDO: Variantes con tipos correctos
   const backdropVariants = {
      hidden: {
         opacity: 0,
         backdropFilter: "blur(0px)"
      },
      visible: {
         opacity: 1,
         backdropFilter: backdropBlur ? "blur(4px)" : "blur(0px)",
         transition: backdropTransition
      },
      exit: {
         opacity: 0,
         backdropFilter: "blur(0px)",
         transition: {
            duration: 0.2,
            ease: "easeIn" as Easing
         }
      }
   };

   const modalVariants = {
      hidden: {
         opacity: 0,
         scale: 0.95,
         y: 20,
         x: 0
      },
      visible: {
         opacity: 1,
         scale: 1,
         y: 0,
         x: dragPosition.x,
         transition: modalTransition
      },
      exit: {
         opacity: 0,
         scale: 0.95,
         y: 20,
         transition: {
            duration: 0.2,
            ease: "easeIn" as Easing
         }
      }
   };

   const bottomSheetVariants = {
      hidden: {
         y: "100%",
         opacity: 0
      },
      visible: {
         y: 0,
         opacity: 1,
         transition: bottomSheetTransition
      },
      exit: {
         y: "100%",
         opacity: 0,
         transition: {
            duration: 0.25,
            ease: "easeInOut" as Easing
         }
      }
   };

   // Render para móvil (BottomSheet mejorado)
   const renderBottomSheet = () => (
      <AnimatePresence mode="wait">
         {isOpen && (
            <motion.div className="fixed inset-0 z-50" initial="hidden" animate="visible" exit="exit">
               {/* Backdrop táctil */}
               <motion.div className="absolute inset-0 bg-black/40" onClick={handleClose} variants={backdropVariants} />

               {/* Sheet con arrastre */}
               <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
                  variants={bottomSheetVariants}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(event, info) => {
                     if (info.offset.y > 100) {
                        handleClose();
                     }
                  }}
               >
                  {/* Handle de arrastre */}
                  <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                     <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  </div>

                  {/* Header */}
                  {showHeader && (
                     <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                           <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                           {showCloseButton && (
                              <motion.button
                                 onClick={handleClose}
                                 className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                 whileHover={{ scale: 1.1 }}
                                 whileTap={{ scale: 0.9 }}
                              >
                                 <AiOutlineClose size={20} />
                              </motion.button>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Contenido con scroll perfecto */}
                  <div
                     className="overflow-y-auto overscroll-contain"
                     style={{
                        height: "calc(85vh - 60px)",
                        WebkitOverflowScrolling: "touch"
                     }}
                  >
                     <div className={`${paddingConfig[padding]}`}>{children}</div>
                     {/* Espacio para iPhone */}
                     <div className="h-6"></div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );

   // Render para desktop
   const renderModal = () => (
      <AnimatePresence mode="wait">
         {isOpen && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial="hidden" animate="visible" exit="exit">
               {/* Backdrop */}
               <motion.div className="absolute inset-0 bg-black/50" onClick={handleBackdropClick} variants={backdropVariants} />

               {/* Modal */}
               <motion.div
                  ref={modalRef}
                  className={`
                     relative bg-white dark:bg-gray-900 shadow-2xl 
                     ${
                        isFullscreen
                           ? "w-full h-full m-0 rounded-none"
                           : `
                        ${sizeConfig[size]} 
                        ${maxWidth} 
                        ${borderRadiusConfig[borderRadius]}
                        w-full
                     `
                     }
                     overflow-hidden
                  `}
                  variants={modalVariants}
                  animate={{
                     x: isFullscreen ? 0 : dragPosition.x,
                     y: isFullscreen ? 0 : dragPosition.y
                  }}
                  style={{
                     cursor: "auto"
                  }}
                  drag={!isFullscreen && !isMobile}
                  dragMomentum={false}
                  dragElastic={0.1}
                  onDragStart={() => setIsDragging(true)}
                  onDrag={(event, info) => {
                     if (!isFullscreen && !isMobile) {
                        setDragPosition({
                           x: dragPosition.x + info.delta.x,
                           y: dragPosition.y + info.delta.y
                        });
                     }
                  }}
                  onDragEnd={() => setIsDragging(false)}
               >
                  {/* Header */}
                  {showHeader && (
                     <motion.div
                        className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                     >
                        <div className="flex items-center gap-3">
                           <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{title}</h2>
                        </div>

                        <div className="flex items-center gap-1">
                           {/* Botón de pantalla completa */}
                           {!isMobile && (
                              <motion.button
                                 onClick={toggleFullscreen}
                                 className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                 title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                                 whileHover={{ scale: 1.1 }}
                                 whileTap={{ scale: 0.9 }}
                              >
                                 {isFullscreen ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
                              </motion.button>
                           )}

                           {/* Botón de cerrar */}
                           {showCloseButton && (
                              <motion.button
                                 onClick={handleClose}
                                 className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                 title="Cerrar"
                                 whileHover={{ scale: 1.1 }}
                                 whileTap={{ scale: 0.9 }}
                              >
                                 <AiOutlineClose size={18} />
                              </motion.button>
                           )}
                        </div>
                     </motion.div>
                  )}

                  {/* Contenido con scroll perfecto */}
                  <div
                     className={`
                        overflow-y-auto overscroll-contain
                        ${isFullscreen ? "h-[calc(100vh-73px)]" : "max-h-[70vh]"}
                     `}
                     style={{
                        WebkitOverflowScrolling: "touch"
                     }}
                  >
                     <div className={`${paddingConfig[padding]} ${isFullscreen ? "p-8" : ""}`}>{children}</div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );

   // Render para tablet (híbrido)
   if (isTablet) {
      return (
         <AnimatePresence mode="wait">
            {isOpen && (
               <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial="hidden" animate="visible" exit="exit">
                  <motion.div className="absolute inset-0 bg-black/50" onClick={handleClose} variants={backdropVariants} />

                  <motion.div
                     className={`
                        relative bg-white dark:bg-gray-900 shadow-2xl 
                        ${sizeConfig[size === "full" ? "xl" : size]} 
                        ${maxWidth} 
                        ${borderRadiusConfig[borderRadius]}
                        w-full max-h-[85vh]
                        overflow-hidden
                     `}
                     variants={modalVariants}
                  >
                     {/* Header simplificado para tablet */}
                     {showHeader && (
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                           <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{title}</h2>
                           <div className="flex items-center gap-2">
                              {showCloseButton && (
                                 <button
                                    onClick={handleClose}
                                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                 >
                                    <AiOutlineClose size={18} />
                                 </button>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Contenido */}
                     <div className="overflow-y-auto max-h-[calc(85vh-60px)]">
                        <div className={paddingConfig[padding]}>{children}</div>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      );
   }

   return isMobile ? renderBottomSheet() : renderModal();
};

export default CustomModal;
