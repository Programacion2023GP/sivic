import { useState, type ReactNode } from "react";
import { AiOutlineClose, AiOutlineExpandAlt } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
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

const CompositePage: React.FC<PropsCompositePage> = ({
   table,
   form,
   tableDirection = "izq",
   formDirection = "der",
   isOpen,
   onClose,
   modalTitle,
   fullModal = false
}) => {
   const [isExpanded, setIsExpanded] = useState(fullModal);
   const [isClosing, setIsClosing] = useState(false);
   const { width: windowWidth } = useWindowSize(); // ✅ Movido aquí

   const isMobile = windowWidth < 1024;

   const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => {
         onClose && onClose();
         setIsClosing(false);
         setIsExpanded(false);
      }, 300);
   };

   const toggleExpand = () => setIsExpanded(!isExpanded);

   // Renderizar contenido del modal
   const renderModalContent = (content?: () => ReactNode) => {
      if (!isOpen || !content) return null;

      // Versión Mobile - Bottom Sheet
      if (isMobile) {
         return (
            <AnimatePresence>
               <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Backdrop */}
                  <motion.div
                     className="absolute inset-0 bg-black bg-opacity-40" // ✅ Agregado bg-opacity
                     onClick={handleClose}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                  />

                  {/* Sheet */}
                  <motion.div
                     className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-100" // ✅ Corregido rounded-t
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
                        className="absolute z-10 flex items-center justify-center text-red-400 transition-colors border rounded-full shadow-md top-3 right-3 w-7 h-7 hover:cursor-pointer hover:text-red-600"
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
                        <AiOutlineClose className="text-xl text-red-400 hover:text-red-600" />
                     </motion.button>

                     <div className="mb-5"></div>

                     {/* Content */}
                     <div className="max-h-[82vh] overflow-y-auto pb-6 px-4">
                        {/* Header móvil */}
                        <div className="flex items-center justify-between pb-3 mb-4 border-b">
                           <h2 className="text-lg font-bold text-gray-800">{modalTitle || "Modal"}</h2>
                        </div>
                        {content()}
                     </div>
                  </motion.div>
               </motion.div>
            </AnimatePresence>
         );
      }

      // Versión Desktop - Modal tradicional
      return (
         <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
               isClosing ? "opacity-0" : "opacity-100"
            }`}
            onClick={handleClose}
         >
            <div
               className={`bg-white shadow-2xl transform transition-all duration-300 overflow-hidden ${
                  isExpanded ? "w-full h-full rounded-none" : "w-[95vw] sm:w-11/12 max-w-6xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl"
               } ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
               onClick={(e) => e.stopPropagation()}
            >
               {/* Header del modal */}
               <div className="flex justify-between items-center border-b presidencia px-3 py-2.5 sm:px-4 sm:py-3 sticky top-0 z-10">
                  <h2 className="flex-1 mr-2 text-base font-bold text-gray-800 truncate sm:text-lg md:text-xl">{modalTitle || "Modal"}</h2>
                  <div className="flex items-center flex-shrink-0 gap-1 sm:gap-2">
                     <button
                        onClick={toggleExpand}
                        className="hover:cursor-pointer p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title={isExpanded ? "Contraer" : "Expandir"}
                     >
                        <AiOutlineExpandAlt size={18} className={`sm:w-5 sm:h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                     </button>
                     <button
                        onClick={handleClose}
                        className=" hover:cursor-pointer p-1.5 sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Cerrar"
                     >
                        <AiOutlineClose size={18} className="sm:w-5 sm-h-5" />
                     </button>
                  </div>
               </div>

               {/* Contenido del modal */}
               <div className={`overflow-auto ${isExpanded ? "h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]" : "max-h-[calc(95vh-48px)] sm:max-h-[calc(90vh-56px)]"}`}>
                  <div className="p-3 sm:p-4 md:p-6">{content()}</div>
               </div>
            </div>
         </div>
      );
   };

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
};

export default CompositePage;
