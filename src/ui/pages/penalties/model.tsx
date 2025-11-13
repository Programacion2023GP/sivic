import { FiAlertCircle, FiCalendar, FiClock, FiCreditCard, FiDollarSign, FiFileText, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { DataDisplayConfig } from "../../components/movil/view/customviewmovil";

export const penaltyDisplayConfig: DataDisplayConfig = {
   title: (data) => data.name || "Multa",
   subtitle: (data) => `Folio: ${data.id || "N/A"}`,
   badge: "Multa Activa",
   badgeColor: "bg-red-100 text-red-800 border border-red-200",

   fields: [
      // Información Principal
      {
         key: "amount",
         label: "Monto",
         type: "currency",
         icon: <FiDollarSign className="text-red-600 text-lg" />,
         color: "bg-red-50 border border-red-100"
      },
      {
         key: "date",
         label: "Fecha",
         type: "date",
         icon: <FiCalendar className="text-blue-600 text-lg" />,
         color: "bg-blue-50 border border-blue-100"
      },
      {
         key: "time",
         label: "Hora",
         type: "text",
         icon: <FiClock className="text-blue-600 text-lg" />,
         color: "bg-blue-50 border border-blue-100"
      },
      {
         key: "description",
         label: "Descripción",
         type: "text",
         icon: <FiAlertCircle className="text-orange-600 text-lg" />,
         color: "bg-orange-50 border border-orange-100"
      },

      // Información Personal
      {
         key: "detainee_released_to",
         label: "Persona que acudió",
         type: "text",
         icon: <FiUser className="text-purple-600 text-lg" />,
         color: "bg-purple-50 border border-purple-100"
      },
      {
         key: "age",
         label: "Edad",
         type: "number",
         icon: <FiUser className="text-green-600 text-lg" />,
         color: "bg-green-50 border border-green-100"
      },
      {
         key: "detainee_phone_number",
         label: "Teléfono",
         type: "phone",
         icon: <FiPhone className="text-blue-600 text-lg" />,
         color: "bg-blue-50 border border-blue-100"
      },
      {
         key: "curp",
         label: "CURP",
         type: "text",
         icon: <FiCreditCard className="text-orange-600 text-lg" />,
         color: "bg-orange-50 border border-orange-100"
      },

      // Información Vehicular
      {
         key: "plate_number",
         label: "Placa",
         type: "text",
         icon: <FiMapPin className="text-red-600 text-lg" />,
         color: "bg-red-50 border border-red-100"
      },
      {
         key: "vehicle_service_type",
         label: "Tipo de servicio",
         type: "text",
         icon: <FiMapPin className="text-indigo-600 text-lg" />,
         color: "bg-indigo-50 border border-indigo-100"
      },
      {
         key: "number_of_passengers",
         label: "Número de pasajeros",
         type: "number",
         icon: <FiUser className="text-teal-600 text-lg" />,
         color: "bg-teal-50 border border-teal-100"
      },

      // Ubicación
      {
         key: "city",
         label: "Ciudad",
         type: "text",
         icon: <FiMapPin className="text-green-600 text-lg" />,
         color: "bg-green-50 border border-green-100"
      },
      {
         key: "cp",
         label: "Código Postal",
         type: "text",
         icon: <FiMapPin className="text-green-600 text-lg" />,
         color: "bg-green-50 border border-green-100"
      },

      // Alcohol
      {
         key: "alcohol_concentration",
         label: "Concentración de alcohol",
         type: "text",
         icon: <FiAlertCircle className="text-red-600 text-lg" />,
         color: "bg-red-50 border border-red-100"
      },
      {
         key: "amountAlcohol",
         label: "Cantidad de alcohol",
         type: "text",
         icon: <FiAlertCircle className="text-red-600 text-lg" />,
         color: "bg-red-50 border border-red-100"
      },

      // Observaciones
      {
         key: "observations",
         label: "Observaciones",
         type: "text",
         icon: <FiFileText className="text-gray-600 text-lg" />,
         color: "bg-gray-50 border border-gray-100"
      }
   ],

   sections: [
      {
         title: "Información Principal",
         icon: <FiFileText className="text-gray-600" />,
         fields: ["amount", "date", "time", "description"]
      },
      {
         title: "Datos Personales",
         icon: <FiUser className="text-gray-600" />,
         columns: 2,
         fields: ["detainee_released_to", "age", "detainee_phone_number", "curp"]
      },
      {
         title: "Información Vehicular",
         icon: <FiMapPin className="text-gray-600" />,
         columns: 2,
         fields: ["plate_number", "vehicle_service_type", "number_of_passengers"]
      },
      {
         title: "Ubicación",
         icon: <FiMapPin className="text-gray-600" />,
         fields: ["city", "cp"]
      },
      {
         title: "Prueba de Alcohol",
         icon: <FiAlertCircle className="text-gray-600" />,
         columns: 2,
         fields: ["alcohol_concentration", "amountAlcohol"]
      },
      {
         title: "Observaciones",
         icon: <FiFileText className="text-gray-600" />,
         fields: ["observations"]
      }
   ]
};

// Componente específico para Multas (opcional)
