import { useState, type ReactNode } from "react";

import { AiOutlineClose, AiOutlineExpandAlt } from "react-icons/ai";
type Direction = "izq" | "der" | "modal";

interface PropsCompositePage {
  table?: () => ReactNode;
  form?: () => ReactNode;
  tableDirection?: Direction;
  formDirection?: Direction;
  isOpen?: boolean;
  onClose?: () => void;
  modalTitle?: string;
}

const CompositePage: React.FC<PropsCompositePage> = ({
  table,
  form,
  tableDirection = "izq",
  formDirection = "der",
  isOpen,
  onClose,
  modalTitle,
}) => {

const renderModal = (content?: () => React.ReactNode) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
    onClose &&  onClose();
      setIsClosing(false);
    }, 300);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isOpen || !content) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isExpanded 
            ? "w-full h-full m-4 rounded-none" 
            : "w-11/12 max-w-4xl max-h-[90vh]"
        } ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera mejorada */}
        <div className="flex justify-between items-center border-b border-gray-200 p-4 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 truncate flex-1 mr-4">
            {modalTitle || "Modal"}
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Botón Expandir/Contraer */}
            <button
              onClick={toggleExpand}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
              title={isExpanded ? "Contraer" : "Expandir"}
            >
              <AiOutlineExpandAlt 
                size={20} 
                className={isExpanded ? "rotate-180 transition-transform" : ""} 
              />
            </button>

            {/* Botón Cerrar */}
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
              title="Cerrar"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div 
          className={`overflow-auto ${
            isExpanded ? "h-[calc(100vh-80px)]" : "max-h-[calc(90vh-80px)]"
          } custom-scrollbar`}
        >
          <div className="p-6">
            {content()}
          </div>
        </div>
      </div>
    </div>
  );
};
  return (
   <div className="flex flex-row w-full gap-1.5">
  {/* IZQUIERDA */}
  {(tableDirection === "izq" || formDirection === "izq") && (
    <div
      className={`${
        (tableDirection === "izq" && formDirection === "der") ||
        (formDirection === "izq" && tableDirection === "der")
          ? tableDirection === "izq"
            ? "w-3/4"
            : "w-1/4"
          : "w-full"
      } transition-all duration-300`}
    >
      {tableDirection === "izq" && table && table()}
      {formDirection === "izq" && form && form()}
    </div>
  )}

  {/* DERECHA */}
  {(tableDirection === "der" || formDirection === "der") && (
    <div
      className={`${
        (tableDirection === "izq" && formDirection === "der") ||
        (formDirection === "izq" && tableDirection === "der")
          ? tableDirection === "der"
            ? "w-3/4"
            : "w-1/4"
          : "w-full"
      } transition-all duration-300`}
    >
      {formDirection === "der" && form && form()}
      {tableDirection === "der" && table && table()}
    </div>
  )}

  {/* MODALES */}
  {tableDirection === "modal" && renderModal(table)}
  {formDirection === "modal" && renderModal(form)}
</div>


  );
};

export default CompositePage;
