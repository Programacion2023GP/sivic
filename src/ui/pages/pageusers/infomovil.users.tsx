import { FiAlertCircle, FiCalendar, FiClock, FiCreditCard, FiFileText, FiMapPin, FiPhone, FiUser, FiTruck } from "react-icons/fi";

import { DataDisplayConfig } from "../../components/movil/view/customviewmovil";

export const userMovilView: DataDisplayConfig = {
   title: (data) => data.name || "Acta",
   subtitle: (data) => `Folio: ${data.id || "N/A"}`,
   badge: "Usuario",
   badgeColor: "bg-green-100 text-green-800 border border-green-200",

   fields: [
      {
         key: "id",
         label: "id",
         type: "text",
         icon: <FiFileText className="text-red-600 text-lg" />,
         color: "bg-red-50 border border-red-100"
      },

      // FECHA & HORA
      {
         key: "firstName",
         label: "Nombre",
         type: "text",
         icon: <FiCalendar className="text-blue-600 text-lg" />,
         color: "bg-blue-50 border border-blue-100"
      },
      {
         key: "paternalSurname",
         label: "Ap Paterno",
         type: "text",
         icon: <FiClock className="text-blue-600 text-lg" />,
         color: "bg-blue-50 border border-blue-100"
      },

      // DATOS DEL DETENIDO
      {
         key: "maternalSurname",
         label: "Ap Materno",
         type: "text",
         icon: <FiUser className="text-purple-600 text-lg" />,
         color: "bg-purple-50 border border-purple-100"
      },
      {
         key: "fullName",
         label: "Nombre Completo",
         type: "number",
         icon: <FiUser className="text-green-600 text-lg" />,
         color: "bg-green-50 border border-green-100"
      },
      {
         key: "role",
         label: "Rol",
         type: "number",
         icon: <FiUser className="text-green-600 text-lg" />,
         color: "bg-green-50 border border-green-100"
      }
   ],

   sections: [
      {
         title: "Detalles de la persona",
         icon: <FiFileText className="text-gray-600" />,
         fields: ["id", "firstName", "paternalSurname", "maternalSurname", "fullName", "role"]
      }
   ]
};
