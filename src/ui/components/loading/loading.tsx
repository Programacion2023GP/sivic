import React from "react";
import ReactDOM from "react-dom";

// Spinner.tsx
const Spinner = () => {
   return ReactDOM.createPortal(
      <div className="fixed z-[3000] inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
         <div className="w-16 h-16 border-4 border-white border-dashed rounded-full animate-spin border-t-transparent"></div>
      </div>,
      document.body // Aquí lo renderizamos directamente en el body
   );
};

export default Spinner;
