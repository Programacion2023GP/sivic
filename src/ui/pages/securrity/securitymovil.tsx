import { FiUser, FiShield, FiTruck, FiFileText, FiMapPin, FiClock, FiCalendar } from "react-icons/fi";

import { DataDisplayConfig } from "../../components/movil/view/customviewmovil";
import { DateFormat, formatDatetime } from "../../../utils/formats";

export const securityMovilView: DataDisplayConfig = {
   title: (data) => data.detainee_name || "Detención",
   subtitle: (data) => `Folio: ${data.id || "N/A"}`,

   badge: "Detenciones",
   badgeColor: "bg-indigo-100 text-indigo-800 border border-indigo-200",

   fields: [
      {
         key: "id",
         label: "Folio",
         type: "text",
         icon: <FiFileText className="text-indigo-500" />,
         color: "bg-indigo-50 border border-indigo-100"
      },
      {
         key: "detainee_name",
         label: "Nombre del detenido",
         type: "text",
         icon: <FiUser className="text-blue-500" />,
         color: "bg-blue-50 border border-blue-100"
      },
      {
         key: "officer_name",
         label: "Nombre del agente",
         type: "text",
         icon: <FiShield className="text-teal-600" />,
         color: "bg-teal-50 border border-teal-100"
      },
      {
         key: "patrol_unit_number",
         label: "Número de patrulla",
         type: "text",
         icon: <FiTruck className="text-emerald-600" />,
         color: "bg-emerald-50 border border-emerald-100"
      },
      {
         key: "detention_reason",
         label: "Motivo de la detención",
         type: "text",
         icon: <FiFileText className="text-purple-600" />,
         color: "bg-purple-50 border border-purple-100"
      },
      {
         key: "date",
         label: "Fecha",
         type: "text",
         icon: <FiCalendar className="text-orange-600" />,
         color: "bg-orange-50 border border-orange-100",
         render: (value) => formatDatetime(`${value}`, true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)
      },
      {
         key: "time",
         label: "Hora",
         type: "text",
         icon: <FiClock className="text-red-600" />,
         color: "bg-red-50 border border-red-100",
         render: (value) => formatDatetime(`2025-01-01 ${value}`, true, DateFormat.H_MM_SS_A)
      },
      {
         key: "location",
         label: "Ubicación",
         type: "text",
         icon: <FiMapPin className="text-pink-600" />,
         color: "bg-pink-50 border border-pink-100"
      }
   ],

   sections: [
      {
         title: "Datos de la detención",
         icon: <FiFileText className="text-gray-500" />,
         fields: ["id", "detainee_name", "officer_name", "patrol_unit_number", "detention_reason", "date", "time", "location"]
      }
   ]
};
