import { FiCalendar, FiClock, FiUser, FiDollarSign, FiFileText, FiHome, FiFlag } from "react-icons/fi";
import { DataDisplayConfig } from "../../components/movil/view/customviewmovil";
import { DateFormat, formatDatetime } from "../../../utils/formats";

export const juzgadosMovilView: DataDisplayConfig = {
   title: (data) => data.detainee_name || "Sin nombre",
   subtitle: (data) => `Folio: ${data.id || "N/A"}`,
   badge: (data) => {

      return "Detenido";
   },
   badgeColor: (data) => {
      if (data.exit_datetime) return "bg-red-100 text-red-800 border-red-200";
      if (data.entry_time) return "bg-yellow-100 text-yellow-800 border-yellow-200";
      return "bg-gray-100 text-gray-800 border-gray-200";
   },

   fields: [
      {
         key: "id",
         label: "Folio",
         type: "text",
         icon: <FiFileText className="text-blue-600 text-lg" />,
         color: "bg-blue-50 border border-blue-100",
         format: "uppercase"
      },
      {
         key: "date",
         label: "Fecha de detención",
         type: "text",
         icon: <FiCalendar className="text-purple-600 text-lg" />,
         color: "bg-purple-50 border border-purple-100",
         render: (value) => formatDatetime(String(value), true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)
      },
      {
         key: "referring_agency",
         label: "Agencia remitente",
         type: "text",
         icon: <FiHome className="text-green-600 text-lg" />,
         color: "bg-green-50 border border-green-100",
         format: "capitalize"
      },
      {
         key: "detainee_name",
         label: "Nombre del detenido",
         type: "text",
         icon: <FiUser className="text-red-600 text-lg" />,
         color: "bg-red-50 border border-red-100",
         format: "capitalize"
      },
      {
         key: "detention_reason",
         label: "Motivo de detención",
         type: "text",
         icon: <FiFlag className="text-orange-600 text-lg" />,
         color: "bg-orange-50 border border-orange-100",
         format: "capitalize"
      },
      {
         key: "entry_time",
         label: "Hora de entrada",
         type: "text",
         icon: <FiClock className="text-indigo-600 text-lg" />,
         color: "bg-indigo-50 border border-indigo-100",
         render: (value) => formatDatetime(`2025-01-01 ${value}`, false, DateFormat.HH_MM_SS_A)
      },
      {
         key: "exit_datetime",
         label: "Fecha y hora de salida",
         type: "text",
         icon: <FiCalendar className="text-teal-600 text-lg" />,
         color: "bg-teal-50 border border-teal-100",
         render: (value) => (value ? formatDatetime(String(value), true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY) : "No liberado")
      },
      {
         key: "exit_reason",
         label: "Causa de salida",
         type: "text",
         icon: <FiFlag className="text-cyan-600 text-lg" />,
         color: "bg-cyan-50 border border-cyan-100",
         format: "capitalize",
         render: (value) => value || "No especificado"
      },
      {
         key: "fine_amount",
         label: "Monto de multa",
         type: "text",
         icon: <FiDollarSign className="text-emerald-600 text-lg" />,
         color: "bg-emerald-50 border border-emerald-100",
         render: (value) => (value ? `$${parseFloat(value).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Sin multa")
      }
   ],

   sections: [
      {
         title: "Información general",
         icon: <FiFileText className="text-gray-600" />,
         fields: ["id", "date", "referring_agency"]
      },
      {
         title: "Datos del detenido",
         icon: <FiUser className="text-gray-600" />,
         fields: ["detainee_name", "detention_reason"]
      },
      {
         title: "Horarios",
         icon: <FiClock className="text-gray-600" />,
         fields: ["entry_time", "exit_datetime"]
      },
      {
         title: "Información de salida",
         icon: <FiFlag className="text-gray-600" />,
         fields: ["exit_reason", "fine_amount"],
         columns: 1
      }
   ]
};
