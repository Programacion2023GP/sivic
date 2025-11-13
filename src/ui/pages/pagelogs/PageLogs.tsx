import { useEffect } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import { FaUser, FaCalendarAlt, FaInfoCircle, FaExclamationTriangle, FaDatabase, FaExchangeAlt } from "react-icons/fa";
import { CustomButton } from "../../components/button/custombuttom";
import CustomTable from "../../components/table/customtable";
import Tooltip from "../../components/toltip/Toltip";
import { useLogsState } from "../../../store/logs/logs.store";
import { LogsApi } from "../../../infrastructure/logs/logs.infra";
import { FaCheck, FaTimes, FaEdit, FaKey, FaCalendar, FaEnvelope, FaPhone, FaMapMarker, FaIdCard } from "react-icons/fa";

interface ValueDisplayProps {
   values: any;
   type: "old" | "new";
}

const ValueDisplay = ({ values, type }: ValueDisplayProps) => {
   if (!values || Object.keys(values).length === 0) {
      return (
         <div className="flex items-center justify-center p-3 text-gray-400">
            <FaTimes className="mr-2" />
            Sin datos
         </div>
      );
   }

   // Iconos para campos comunes
   const getFieldIcon = (key: string) => {
      const iconMap: Record<string, React.ReactNode> = {
         name: <FaUser className="text-blue-500" />,
         email: <FaEnvelope className="text-green-500" />,
         phone: <FaPhone className="text-purple-500" />,
         address: <FaMapMarker className="text-red-500" />,
         id: <FaIdCard className="text-orange-500" />,
         password: <FaKey className="text-gray-500" />,
         created_at: <FaCalendar className="text-teal-500" />,
         updated_at: <FaEdit className="text-indigo-500" />,
         active: <FaCheck className="text-green-500" />,
         status: <FaCheck className="text-blue-500" />
      };
      return iconMap[key] || <FaEdit className="text-gray-400" />;
   };

   // Formatear valores según el tipo
   const formatValue = (key: string, value: any) => {
      if (value === null || value === undefined) return "N/A";

      // Valores booleanos
      if (typeof value === "boolean") {
         return (
            <span
               className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
               {value ? "Sí" : "No"}
            </span>
         );
      }

      // Fechas
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
         try {
            const date = new Date(value);
            return (
               <div className="flex flex-col">
                  <span className="font-medium">{date.toLocaleDateString()}</span>
                  <span className="text-xs text-gray-500">{date.toLocaleTimeString()}</span>
               </div>
            );
         } catch {
            return String(value);
         }
      }

      // IDs y códigos
      if (key.includes("id") || key.includes("code") || key.includes("payroll")) {
         return <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{value}</code>;
      }

      // Texto largo
      if (String(value).length > 30) {
         return (
            <div className="max-w-xs">
               <p className="text-sm truncate" title={String(value)}>
                  {String(value).substring(0, 30)}...
               </p>
            </div>
         );
      }

      return String(value);
   };

   // Estilos según el tipo
   const containerClass = type === "new" ? "border-l-4 border-green-400 bg-green-50" : "border-l-4 border-red-400 bg-red-50";

   const titleClass = type === "new" ? "text-green-800 bg-green-100" : "text-red-800 bg-red-100";

   return (
      <div className={`rounded-lg p-3 ${containerClass} max-w-md`}>
         <div className={`flex items-center gap-2 px-2 py-1 rounded-t text-xs font-semibold mb-2 ${titleClass}`}>
            {type === "new" ? (
               <>
                  <FaCheck className="text-green-600" /> Valores Nuevos
               </>
            ) : (
               <>
                  <FaTimes className="text-red-600" /> Valores Anteriores
               </>
            )}
         </div>

         <div className="space-y-2 max-h-60 overflow-y-auto">
            {Object.entries(values).map(([key, value]) => (
               <div key={key} className="flex items-start gap-3 p-2 bg-white rounded border">
                  <div className="flex-shrink-0 mt-1">{getFieldIcon(key)}</div>

                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{key.replace(/_/g, " ")}</span>
                     </div>

                     <div className={`text-sm ${type === "new" ? "text-green-700" : "text-red-700"}`}>{formatValue(key, value)}</div>
                  </div>
               </div>
            ))}
         </div>

         {Object.keys(values).length > 0 && (
            <div className={`text-xs mt-2 px-2 py-1 rounded-b ${type === "new" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>
               {Object.keys(values).length} campo{Object.keys(values).length !== 1 ? "s" : ""} modificado{Object.keys(values).length !== 1 ? "s" : ""}
            </div>
         )}
      </div>
   );
};

const PageLogs = () => {
   const { fetchLogs, logs, loading } = useLogsState();
   const api = new LogsApi();

   useEffect(() => {
      fetchLogs(api);
   }, []);

   /** 🎯 Traducción de nombres de modelo */
   const translateModelName = (model: string) => {
      const map: Record<string, string> = {
         Penalty: "Multas",
         User: "Usuarios",
         Official: "Oficiales",
         Driver: "Conductores"
      };
      return map[model] || model;
   };

   /** 🎨 Iconos por acción */
   const getActionIcon = (accion: string) => {
      switch (accion?.toLowerCase()) {
         case "creado":
            return <FaInfoCircle className="text-green-500" />;
         case "actualizado":
            return <FaExchangeAlt className="text-yellow-500" />;
         case "eliminado":
            return <FaExclamationTriangle className="text-red-500" />;
         case "login":
            return <FaUser className="text-blue-500" />;
         default:
            return <FaDatabase className="text-gray-500" />;
      }
   };

   /** 🎨 Colores por acción */
   const getActionColor = (accion: string) => {
      switch (accion?.toLowerCase()) {
         case "creado":
            return "bg-green-100 text-green-800 border-green-200";
         case "actualizado":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
         case "eliminado":
            return "bg-red-100 text-red-800 border-red-200";
         case "login":
            return "bg-blue-100 text-blue-800 border-blue-200";
         default:
            return "bg-gray-100 text-gray-800 border-gray-200";
      }
   };

   /** 🕒 Formato fecha */
   const formatDateTime = (dateString: string) => {
      if (!dateString) return "-";
      const date = new Date(dateString.replace(" ", "T"));
      return (
         <div className="flex flex-col text-xs">
            <span className="font-medium">{date.toLocaleDateString()}</span>
            <span className="text-gray-500">{date.toLocaleTimeString()}</span>
         </div>
      );
   };

   /** 🔄 Adaptar datos del backend */
   const formattedLogs = logs.map((log: any) => ({
      id: log.id,
      action: log.accion,
      user: log.usuario,
      model: translateModelName(log.modelo),
      ipAddress: log.ip,
      httpMethod: log.metodo_http,
      createdAt: log.fecha,
      oldValues: log.valores_anteriores || {},
      newValues: log.valores_nuevos || {}
   }));

   /** 🔹 Función para extraer campos modificados */
   const getChangedFields = (oldValues: any = {}, newValues: any = {}) => {
      const changedFields: string[] = [];

      // Buscar campos en nuevos valores que son diferentes
      Object.keys(newValues).forEach((key) => {
         if (oldValues[key] !== newValues[key]) {
            changedFields.push(key);
         }
      });

      // Buscar campos en valores antiguos que no existen en nuevos (eliminados)
      Object.keys(oldValues).forEach((key) => {
         if (!(key in newValues) && oldValues[key] !== undefined) {
            changedFields.push(`${key} (eliminado)`);
         }
      });

      return changedFields;
   };

   /** 🔹 Renderizar campos modificados */
   const renderChangedFields = (oldValues: any = {}, newValues: any = {}) => {
      const changedFields = getChangedFields(oldValues, newValues);

      if (changedFields.length === 0) {
         return <span className="text-gray-500 text-sm">Sin cambios</span>;
      }

      return (
         <div className="space-y-1">
            {changedFields.map((field, index) => (
               <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                  {field}
               </span>
            ))}
         </div>
      );
   };

   /** 🔹 Renderizar valores antiguos */
   const renderOldValues = (oldValues: any = {}, newValues: any = {}) => {
      const changedFields = getChangedFields(oldValues, newValues);

      if (changedFields.length === 0) {
         return <span className="text-gray-400 text-sm">-</span>;
      }

      return (
         <div className="space-y-1 max-w-xs">
            {changedFields.map((fieldName, index) => {
               const field = fieldName.replace(" (eliminado)", "");
               const value = oldValues[field];

               if (value === undefined || value === null) return null;

               return (
                  <div key={index} className="text-sm">
                     <span className="font-medium text-red-600 line-through">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                  </div>
               );
            })}
         </div>
      );
   };

   /** 🔹 Renderizar valores nuevos */
   const renderNewValues = (oldValues: any = {}, newValues: any = {}) => {
      const changedFields = getChangedFields(oldValues, newValues);

      if (changedFields.length === 0) {
         return <span className="text-gray-400 text-sm">-</span>;
      }

      return (
         <div className="space-y-1 max-w-xs">
            {changedFields.map((fieldName, index) => {
               const field = fieldName.replace(" (eliminado)", "");
               const value = newValues[field];

               if (fieldName.includes("(eliminado)")) {
                  return (
                     <div key={index} className="text-sm">
                        <span className="text-red-500 font-medium">[ELIMINADO]</span>
                     </div>
                  );
               }

               return (
                  <div key={index} className="text-sm">
                     <span className="font-medium text-green-600">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                  </div>
               );
            })}
         </div>
      );
   };

   return (
      <div className="p-6">
         {/* 🔹 Header */}
         <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#130D0E] mb-2">Registro de Actividades</h1>
            <p className="text-[#474C55]">Monitorea todas las acciones realizadas en el sistema</p>
         </div>

         {/* 🔹 Tabla de registros */}
         <CustomTable
            headerActions={() => (
               <div className="flex items-center gap-2">
                  <Tooltip content="Actualizar registros">
                     <CustomButton color="purple" onClick={() => fetchLogs(api)}>
                        <LuRefreshCcw className={`${loading ? "animate-spin" : ""}`} />
                        <span className="ml-2">Actualizar</span>
                     </CustomButton>
                  </Tooltip>
               </div>
            )}
            data={formattedLogs}
            paginate={[10, 25, 50, 100]}
            loading={loading}
            columns={[
               {
                  field: "action",
                  headerName: "Acción",
                  renderField: (action) => (
                     <div className="flex items-center gap-2">
                        {getActionIcon(action)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getActionColor(action)}`}>
                           {action ? action.charAt(0).toUpperCase() + action.slice(1) : "N/A"}
                        </span>
                     </div>
                  )
               },
               {
                  field: "user",
                  headerName: "Usuario",
                  renderField: (user) => (
                     <div className="flex items-center gap-2">
                        <FaUser className="text-[#727372]" />
                        <span className="font-medium">{user || "Desconocido"}</span>
                     </div>
                  )
               },
               {
                  field: "model",
                  headerName: "Módulo",
                  renderField: (model) => <span className="font-semibold text-[#38393B] bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">{model || "-"}</span>
               },

{
  field: "newValues",
  headerName: "Valores Nuevos",
  renderField: (values) => <ValueDisplay values={values} type="new" />
},
{
  field: "oldValues", 
  headerName: "Valores Anteriores",
  renderField: (values) => <ValueDisplay values={values} type="old" />
},
               {
                  field: "ipAddress",
                  headerName: "IP",
                  renderField: (ip) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{ip || "N/A"}</span>
               },
               {
                  field: "createdAt",
                  headerName: "Fecha/Hora",
                  renderField: (date) => (
                     <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-[#727372]" />
                        {formatDateTime(date)}
                     </div>
                  )
               }
            ]}
         />

         {/* 🔹 Estadísticas rápidas */}
         {formattedLogs.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-600 font-bold text-2xl">{formattedLogs.length}</div>
                  <div className="text-blue-800 text-sm">Total de registros</div>
               </div>
               <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-600 font-bold text-2xl">{formattedLogs.filter((log) => log.action?.toLowerCase() === "creado").length}</div>
                  <div className="text-green-800 text-sm">Creaciones</div>
               </div>
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-yellow-600 font-bold text-2xl">{formattedLogs.filter((log) => log.action?.toLowerCase() === "actualizado").length}</div>
                  <div className="text-yellow-800 text-sm">Actualizaciones</div>
               </div>
               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-600 font-bold text-2xl">{formattedLogs.filter((log) => log.action?.toLowerCase() === "eliminado").length}</div>
                  <div className="text-red-800 text-sm">Eliminaciones</div>
               </div>
            </div>
         )}
      </div>
   );
};

export default PageLogs;
