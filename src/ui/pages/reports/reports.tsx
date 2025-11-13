import React, { useEffect, useState } from "react";
import { usePenaltiesStore } from "../../../store/penalties/penalties.store";
import { PenaltiesApi } from "../../../infrastructure/penalties/penalties.infra";
import AdvancedAnalyticsDashboard from "../../components/dashboard/dashboard";
const PENALTIES_DICTIONARY = {
   // IDs y fechas
   id: "Folio",
   time: "Hora",
   // date: "Fecha",
   has_history: "Tiene Historial",
   
   // Paso 1 - Información del operativo
   person_contraloria: "Persona de Contraloría",
   oficial_payroll: "Nómina del Oficial",
   person_oficial: "Persona Oficial",
   vehicle_service_type: "Tipo de Servicio del Vehículo",
   alcohol_concentration: "Concentración de Alcohol",
   group: "Grupo",
   detainee_released_to: "Detenido Liberado a",
   
   // Paso 2 - Autoridades participantes
   municipal_police: "Policía Municipal",
   civil_protection: "Protección Civil",
   
   // Paso 3 - Comando y supervisión
   command_vehicle: "Vehículo de Comando",
   command_troops: "Tropas de Comando",
   command_details: "Detalles del Comando",
   filter_supervisor: "Supervisor de Filtro",
   
   // Paso 4 - Información del infractor
   name: "Nombre",
   cp: "Código Postal",
   city: "Ciudad",
   age: "Edad",
   amountAlcohol: "Cantidad de Alcohol",
   number_of_passengers: "Número de Pasajeros",
   plate_number: "Número de Placa",
   detainee_phone_number: "Teléfono del Detenido",
   curp: "CURP",
   observations: "Observaciones",
   
   // Paso 5 - Evidencias
 
   
   // Campos adicionales comunes
   created_at: "Fecha de creación",
   created_by: "Creado Por"
};

// También puedes crear un tipo para las opciones del diccionario
export type PenaltiesField = keyof typeof PENALTIES_DICTIONARY;

// Función helper para obtener la traducción
export const getPenaltiesFieldLabel = (field: string): string => {
   return PENALTIES_DICTIONARY[field as PenaltiesField] || field;
};
const PageReports = () => {
   const { fetchPenalties, penalties } = usePenaltiesStore();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const loadData = async () => {
         try {
            setLoading(true);
            setError(null);
            const api = new PenaltiesApi();
            await fetchPenalties(api);
         } catch (err) {
            setError(err.message || "Error al cargar los reportes");
            console.error("Error loading penalties:", err);
         } finally {
            setLoading(false);
         }
      };

      loadData();
   }, [fetchPenalties]);

   // Estados de carga y error
   if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
               <p className="text-gray-600">Cargando reportes...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg max-w-md">
               <div className="text-lg font-semibold mb-2">Error</div>
               <p>{error}</p>
               <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                  Reintentar
               </button>
            </div>
         </div>
      );
   }

   // Si no hay datos
   if (!penalties || penalties.length === 0) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-lg max-w-md">
               <div className="text-lg font-semibold mb-2">V1 - Reportes</div>
               <p className="mb-4">No hay datos de reportes disponibles</p>
               <div className="text-sm text-gray-400">Los reportes se mostrarán aquí cuando existan datos</div>
            </div>
            <AdvancedAnalyticsDashboard data={penalties} fieldLabels={PENALTIES_DICTIONARY} />
         </div>
      );
   }

   // Si hay datos, mostrar el dashboard
   return (
      <div>
         <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800">V1 - Reportes</h2>
            <p className="text-sm text-blue-600">Total de registros: {penalties.length}</p>
         </div>
         <AdvancedAnalyticsDashboard data={penalties} fieldLabels={PENALTIES_DICTIONARY} />
      </div>
   );
};

export default PageReports;
