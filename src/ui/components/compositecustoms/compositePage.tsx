import { useEffect, useState, type ReactNode } from "react";
import { AiOutlineClose, AiOutlineExpandAlt } from "react-icons/ai";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useWindowSize } from "../../../hooks/windossize";

type Direction = "izq" | "der" | "modal";

interface PropsCompositePage {
   table?: () => ReactNode;
   form?: () => ReactNode;
   tableDirection?: Direction;
   formDirection?: Direction;
   isOpen?: boolean;
   onClose?: () => void;
   modalTitle?: string;
   fullModal?: boolean;
}

const CompositePage: React.FC<PropsCompositePage> = ({ table, form, tableDirection = "izq", formDirection = "der", isOpen, onClose, modalTitle, fullModal = false }) => {
   const [isExpanded, setIsExpanded] = useState(fullModal);
   const [isClosing, setIsClosing] = useState(false);
   const { width: windowWidth, height: windowHeight } = useWindowSize();

   // Estados para el modal móvil
   const [sheetHeight, setSheetHeight] = useState("100vh");
   const [isDragging, setIsDragging] = useState(false);
   const [currentDragY, setCurrentDragY] = useState(0);

   // Motion values para el arrastre suave
   const dragY = useMotionValue(0);
   const heightTransform = useTransform(dragY, [0, -300], [85, 95]);

   // Determinar tipo de dispositivo
   const isSmallMobile = windowWidth < 400;
   const isMediumMobile = windowWidth >= 400 && windowWidth < 768;
   const isTablet = windowWidth >= 768 && windowWidth < 1024;
   const isDesktop = windowWidth >= 1024;
   const isMobile = windowWidth < 1024;

   useEffect(() => {
      if (isSmallMobile) {
         setSheetHeight("100vh");
      } else if (isMediumMobile) {
         setSheetHeight("100vh");
      } else if (isTablet) {
         setSheetHeight("100vh");
      }
   }, [isSmallMobile, isMediumMobile, isTablet, table, form]);

   const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => {
         onClose && onClose();
         setIsClosing(false);
         setIsExpanded(false);
         setSheetHeight("100vh"); // Resetear altura al cerrar
      }, 300);
   };

   const toggleExpand = () => setIsExpanded(!isExpanded);

   // Función para calcular altura durante el arrastre
   const calculateDragHeight = (dragOffset: number) => {
      const baseHeight = isSmallMobile ? 90 : isMediumMobile ? 85 : 80;
      const maxDrag = -200; // Máximo arrastre hacia arriba
      const dragPercentage = Math.min(Math.max(dragOffset / maxDrag, 0), 1);
      const additionalHeight = 15 * dragPercentage; // Hasta 15% adicional

      return baseHeight + additionalHeight;
   };

   // Renderizar contenido del modal
   // Si necesitas una versión aún más robusta, aquí está:

const renderModalContent = (content?: () => ReactNode) => {
   if (!isOpen || !content) return null;

   // Función para calcular altura del contenido (más precisa)
   const getContentHeight = () => {
      if (isMobile) return `calc(100vh - 132px)`; // handle(32px) + header(68px) + padding(32px)
      if (isTablet) return `calc(90vh - 100px)`; // header(68px) + handle(32px)
      return isExpanded ? `calc(100vh - 100px)` : `calc(90vh - 100px)`;
   };

   // Render común para backdrop
   const renderBackdrop = () => (
      <motion.div
         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
         onClick={handleClose}
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
      />
   );

   // Render común para header
   const renderHeader = () => (
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
         <h2 className="text-xl font-bold text-gray-900 truncate">{modalTitle || "Modal"}</h2>

         <div className="flex items-center gap-2">
            {!isMobile && (
               <button
                  onClick={toggleExpand}
                  className="p-2 text-gray-500 transition-colors rounded-lg hover:text-blue-600 hover:bg-blue-50"
                  title={isExpanded ? "Contraer" : "Expandir"}
               >
                  <AiOutlineExpandAlt size={18} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
               </button>
            )}

            <button
               onClick={handleClose}
               className={`text-gray-500 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50 ${
                  isMobile ? "absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow-md" : "p-2"
               }`}
               title="Cerrar"
            >
               <AiOutlineClose size={18} />
            </button>
         </div>
      </div>
   );

   // MOBILE: Modal desde abajo con drag
   if (isMobile) {
      return (
         <AnimatePresence>
            <motion.div className="fixed inset-0 z-50">
               {renderBackdrop()}

               <motion.div
                  className="absolute bottom-0 left-0 right-0 overflow-hidden bg-white shadow-2xl rounded-t-3xl"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{
                     type: "spring",
                     damping: 30,
                     stiffness: 300,
                     mass: 0.8
                  }}
                  style={{ height: "100vh" }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(event, info) => {
                     if (info.offset.y > 120 || info.velocity.y > 800) {
                        handleClose();
                     }
                  }}
               >
                  {/* Handle para arrastrar */}
                  <div className="flex justify-center pt-3 pb-3">
                     <div className="w-20 h-2 bg-gray-300 rounded-full" />
                  </div>

                  {renderHeader()}

                  {/* Contenido scrollable */}
                  <div
                     className="overflow-y-auto"
                     style={{
                        height: getContentHeight(),
                        paddingBottom: "env(safe-area-inset-bottom, 20px)"
                     }}
                  >
                     <div className="px-6 py-4">{content()}</div>
                  </div>
               </motion.div>
            </motion.div>
         </AnimatePresence>
      );
   }

   // TABLET & DESKTOP: Modal desde abajo con drag (igual que móvil)
   return (
      <AnimatePresence>
         <motion.div className="fixed inset-0 z-50">
            {renderBackdrop()}

            <motion.div
               className={`absolute bottom-0 left-0 right-0 overflow-hidden bg-white shadow-2xl ${
                  isTablet ? "rounded-t-3xl" : isExpanded ? "rounded-none" : "rounded-t-3xl"
               }`}
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8
               }}
               style={{
                  height: isTablet ? "90vh" : isExpanded ? "100vh" : "90vh",
                  maxWidth: isTablet ? "100%" : isExpanded ? "100%" : "1280px",
                  left: isTablet ? 0 : isExpanded ? 0 : "50%",
                  transform: isTablet ? "none" : isExpanded ? "none" : "translateX(-50%)"
               }}
               drag="y"
               dragConstraints={{ top: 0, bottom: 0 }}
               dragElastic={0.15}
               onDragEnd={(event, info) => {
                  if (info.offset.y > 150 || info.velocity.y > 800) {
                     handleClose();
                  }
               }}
            >
               {/* Handle para arrastrar - visible en todos los tamaños */}
               <div className="flex justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing">
                  <div className="w-20 h-1.5 bg-gray-300 rounded-full transition-colors hover:bg-gray-400" />
               </div>

               {renderHeader()}

               {/* Contenido scrollable */}
               <div className="overflow-y-auto" style={{ height: getContentHeight() }}>
                  <div className="p-6">{content()}</div>
               </div>
            </motion.div>
         </motion.div>
      </AnimatePresence>
   );
};
   // El resto del componente sin cambios...
   // Determinar si ambas secciones están visibles (no modales)
   const bothVisible =
      (tableDirection === "izq" || tableDirection === "der") && (formDirection === "izq" || formDirection === "der") && tableDirection !== formDirection;

   // Determinar el ancho de cada sección
   const getLeftWidth = () => {
      if (!bothVisible) return "w-full";
      return tableDirection === "izq" ? "w-full lg:w-3/4" : "w-full lg:w-1/4";
   };

   const getRightWidth = () => {
      if (!bothVisible) return "w-full";
      return tableDirection === "der" ? "w-full lg:w-3/4" : "w-full lg:w-1/4";
   };

   return (
      <>
         {/* Layout principal - Responsive */}
         <div className={`flex flex-col ${bothVisible ? "lg:flex-row" : ""} gap-3 sm:gap-4 w-full`}>
            {/* SECCIÓN IZQUIERDA */}
            {(tableDirection === "izq" || formDirection === "izq") && (
               <div className={`${getLeftWidth()} min-w-0 transition-all duration-300`}>
                  <div className="overflow-hidden bg-white rounded-lg shadow-sm">
                     {tableDirection === "izq" && table && table()}
                     {formDirection === "izq" && form && form()}
                  </div>
               </div>
            )}

            {/* SECCIÓN DERECHA */}
            {(tableDirection === "der" || formDirection === "der") && (
               <div className={`${getRightWidth()} min-w-0 transition-all duration-300`}>
                  <div className="overflow-hidden bg-white rounded-lg shadow-sm">
                     {formDirection === "der" && form && form()}
                     {tableDirection === "der" && table && table()}
                  </div>
               </div>
            )}
         </div>

         {/* MODALES */}
         {tableDirection === "modal" && renderModalContent(table)}
         {formDirection === "modal" && renderModalContent(form)}
      </>
   );
};;

export default CompositePage;
