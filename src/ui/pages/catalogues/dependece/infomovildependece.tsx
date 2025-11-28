import { FiDroplet, FiUser } from "react-icons/fi";
import { DataDisplayConfig } from "../../../components/movil/view/customviewmovil";

// Ejemplo de configuración para usuario
export const dependenceMovilView: DataDisplayConfig = {
   title: (data) => data.name || "Dependencia",
   subtitle: (data) => `ID: ${data.id || "N/A"}`,
   badge: (data) => data.role || "Dependencia",
   badgeColor: (data) => {
      const role = data.role?.toLowerCase();
      if (role === "admin") return "bg-purple-100 text-purple-800 border-purple-200";
      if (role === "premium") return "bg-yellow-100 text-yellow-800 border-yellow-200";
      return "bg-green-100 text-green-800 border-green-200";
   },

   fields: [
      {
         key: "name",
         label: "Nombre completo",
         type: "text",
         icon: <FiUser className="text-purple-600 text-lg" />,
         color: "bg-purple-50 border border-purple-100",
         format: "capitalize"
      },

      {
         key: "color",
         label: "Color",
         type: "color",
         icon: <FiDroplet className="text-pink-600 text-lg" />,
         color: "bg-pink-50 border border-pink-100",
         // Ejemplo de render personalizado
         render: (value, data) => (
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-md" style={{ backgroundColor: value }} />
               <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold">{value}</span>
                  <span className="text-xs text-gray-500">Haz clic para copiar</span>
               </div>
            </div>
         )
      }
   ],

   sections: [
      {
         title: "Información personal",
         icon: <FiUser className="text-gray-600" />,
         fields: ["name"]
      },
      {
         title: "Preferencias",
         icon: <FiDroplet className="text-gray-600" />,
         fields: ["color"],
         columns: 1
      }
   ]
};
