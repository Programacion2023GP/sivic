import { FiAlertCircle, FiCalendar, FiClock, FiCreditCard, FiFileText, FiMapPin, FiPhone, FiUser, FiTruck } from "react-icons/fi";

import { DataDisplayConfig } from "../../components/movil/view/customviewmovil";
import { DateFormat, formatDatetime } from "../../../utils/formats";

export const trafficMovilView: DataDisplayConfig = {
    title: (data) => data.citizen_name || "Multa",
               subtitle: (data) => `Vehículo: ${data.vehicle_brand || "N/A"}`,
               badge: "Tránsito",
               badgeColor: "bg-blue-100 text-blue-800 border border-blue-200",

               fields: [
                  {
                     key: "citizen_name",
                     label: "Nombre del ciudadano",
                     type: "text",
                     icon: <FiUser className="text-blue-500" />,
                     color: "bg-blue-50 border border-blue-100"
                  },
                  {
                     key: "plate_number",
                     label: "Número de placa",
                     type: "text",
                     icon: <FiCreditCard className="text-indigo-500" />,
                     color: "bg-indigo-50 border border-indigo-100"
                  },
                  {
                     key: "vehicle_brand",
                     label: "Marca del vehículo",
                     type: "text",
                     icon: <FiTruck className="text-emerald-500" />,
                     color: "bg-emerald-50 border border-emerald-100"
                  },
                  {
                     key: "time",
                     label: "Hora",
                     type: "text",
                     icon: <FiClock className="text-purple-600" />,
                     color: "bg-purple-50 border border-purple-100",
                     render: (value) =>
                        formatDatetime(`2025-01-01 ${value}`, true, DateFormat.H_MM_SS_A)
                  },
                  {
                     key: "location",
                     label: "Lugar",
                     type: "text",
                     icon: <FiMapPin className="text-red-500" />,
                     color: "bg-red-50 border border-red-100"
                  },
                  {
                     key: "person_oficial",
                     label: "Oficial asignado",
                     type: "text",
                     icon: <FiUser className="text-teal-700" />,
                     color: "bg-teal-50 border border-teal-100"
                  }
               ],

               sections: [
                  {
                     title: "Datos del reporte",
                     icon: <FiFileText className="text-gray-500" />,
                     fields: [
                        "citizen_name",
                        "plate_number",
                        "vehicle_brand",
                        "time",
                        "location",
                        "person_oficial"
                     ]
                  }
               ]
            
};
