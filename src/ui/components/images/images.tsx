import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { IoIosClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { FaImage, FaExclamationTriangle } from "react-icons/fa";

interface PhotoZoomProps {
   src?: string;
   alt: string;
   description?: string;
   title?: string;
   placeholderText?: string;
}

const PhotoZoom: React.FC<PhotoZoomProps> = ({ src, alt, description, title, placeholderText = "Sin imagen" }) => {
   const [isZoomed, setIsZoomed] = useState(false);
   const [imageError, setImageError] = useState(false);
   const [imageLoaded, setImageLoaded] = useState(false);

   const hasImage = src && !imageError;
   const toggleZoom = () => hasImage && setIsZoomed((prev) => !prev);
   const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsZoomed(false);
   };

   // Reset estados cuando cambia la src
   useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
   }, [src]);

   // Cerrar con tecla ESC
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Escape") setIsZoomed(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
   }, []);

   // Bloquear scroll cuando está abierto
   useEffect(() => {
      if (isZoomed) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "auto";
      }
   }, [isZoomed]);

   const handleImageError = () => {
      setImageError(true);
      setImageLoaded(false);
   };

   const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
   };

   return (
      <div className="relative inline-block">
         {/* Miniatura - Muestra placeholder si no hay imagen */}
         {hasImage ? (
            <div className="relative cursor-zoom-in group">
               <img
                  src={src}
                  alt={alt}
                  className={`rounded-lg shadow-md transition-transform transform group-hover:scale-105 w-10 h-10 object-cover ${
                     !imageLoaded ? "opacity-0" : "opacity-100"
                  }`}
                  onClick={toggleZoom}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
               />
               {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg animate-pulse">
                     <FaImage className="text-gray-400 text-sm" />
                  </div>
               )}
            </div>
         ) : (
            <div
               className="w-10 h-10 rounded-lg bg-gray-200 flex flex-col items-center justify-center cursor-not-allowed border border-gray-300"
               title="No hay imagen disponible"
            >
               <FaExclamationTriangle className="text-gray-400 text-xs mb-0.5" />
               <span className="text-[8px] text-gray-500 text-center leading-tight">Sin img</span>
            </div>
         )}

         {/* Descripción debajo de la miniatura */}
         {description && hasImage && <p className="mt-2 text-sm text-gray-600 text-center max-w-xs break-words">{description}</p>}

         {/* Modal de zoom - Solo se muestra si hay imagen */}
         {ReactDOM.createPortal(
            <AnimatePresence>
               {isZoomed && hasImage && (
                  <motion.div
                     className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 backdrop-blur-sm"
                     onClick={toggleZoom}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                  >
                     <motion.div
                        className="relative flex flex-col items-center max-w-4xl max-h-[90vh] mx-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        onClick={(e) => e.stopPropagation()}
                     >
                        {/* Botón cerrar */}
                        <button
                           onClick={handleClose}
                           className="absolute -top-12 hover:cursor-pointer right-0 p-2 bg-white rounded-full shadow-lg transition-transform hover:scale-110 hover:bg-gray-200 focus:outline-none z-10"
                           aria-label="Cerrar imagen"
                        >
                           <IoIosClose size={32} className="text-black" />
                        </button>

                        {/* Título */}
                        {title && <h2 className="mb-4 text-white text-2xl font-semibold drop-shadow-lg text-center px-4">{title}</h2>}

                        {/* Contenedor de imagen con loading */}
                        <div className="relative bg-transparent rounded-lg overflow-hidden">
                           {!imageLoaded && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                                 <div className="text-white text-lg">Cargando imagen...</div>
                              </div>
                           )}

                           {/* Imagen grande en zoom */}
                           <img
                              src={src}
                              alt={alt}
                              className={`rounded-lg shadow-2xl object-contain max-w-full max-h-[70vh] transition-opacity duration-300 ${
                                 imageLoaded ? "opacity-100" : "opacity-0"
                              }`}
                              onLoad={handleImageLoad}
                              onError={handleImageError}
                           />
                        </div>

                        {/* Descripción */}
                        {description && <p className="mt-4 text-gray-200 text-sm text-center max-w-2xl px-4 bg-black bg-opacity-50 rounded-lg py-2">{description}</p>}
                     </motion.div>
                  </motion.div>
               )}
            </AnimatePresence>,
            document.body
         )}
      </div>
   );
};

export default PhotoZoom;
