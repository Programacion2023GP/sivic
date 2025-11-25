import { FiDroplet, FiUser } from "react-icons/fi";
import { DataDisplayConfig } from "../../../components/movil/view/customviewmovil";

// Ejemplo de configuración para usuario
export const doctorMovilView: DataDisplayConfig = {
   title: (data) => data.name || "Doctor",
   subtitle: (data) => `ID: ${data.id || "N/A"}`,
   badge: (data) => data.role || "Doctor",
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
         key: "certificate",
         label: "Certificado",
         type: "text",
         icon: <FiUser className="text-purple-600 text-lg" />,
         color: "bg-purple-50 border border-purple-100",
         format: "capitalize"
      }
   ],

   sections: [
      {
         title: "Información",
         icon: <FiUser className="text-gray-600" />,
         fields: ["name", "certificate"]
      }
   ]
};
