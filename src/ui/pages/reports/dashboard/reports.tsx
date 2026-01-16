import React, { useEffect, useState } from "react";
import { usePenaltiesStore } from "../../../../store/penalties/penalties.store";
import { PenaltiesApi } from "../../../../infrastructure/penalties/penalties.infra";
import AdvancedAnalyticsDashboard from "../../../components/dashboard/dashboard";
const PENALTIES_DICTIONARY = {
   id: "Folio",
   time: "Hora",
   date: "Fecha de creación",
   has_history: "Tiene Historial",

   // lat: "Latitud",
   // lon: "Longitud",
   cp: "Código Postal",
   city: "Ciudad",

   person_contraloria: "Persona de Contraloría",
   oficial_payroll: "Nómina del Oficial",
   person_oficial: "Persona Oficial",
   vehicle_service_type: "Tipo de Servicio del Vehículo",
   vehicle_brand: "Marca del Vehículo",

   alcohol_concentration: "Grado de Alcohol",
   amountAlcohol: "Cantidad de Alcohol",
   number_of_passengers: "Número de Pasajeros",

   detainee_released_to: "Detenido Liberado a",
   detainee_phone_number: "Teléfono del Detenido",
   // curp: "CURP",

   municipal_police: "Policía Municipal",
   civil_protection: "Protección Civil",

   command_vehicle: "Vehículo de Comando",
   command_troops: "Tropas de Comando",
   command_details: "Detalles del Comando",
   filter_supervisor: "Supervisor de Filtro",

   detention_reason: "Motivo de Detención",
   fine_amount: "Monto de la Multa",
   exit_reason: "Motivo de Salida",
   patrol_unit_number: "Número de Unidad",

   image_penaltie: "Imagen de la Infracción",
   images_evidences: "Evidencias",
   images_evidences_car: "Evidencias del Vehículo",

   doctor: "Doctor",
   cedula: "Cédula Profesional",

   observations: "Observaciones",
   finish: "Finalizado",
   // active: "Activo",

   // created_at: "Fecha de Creación",
   // updated_at: "Última Actualización",
   created_by: "Creado Por",
   created_by_name: "Nombre del Creador"
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
            <AdvancedAnalyticsDashboard data={penalties} fieldLabels={PENALTIES_DICTIONARY} />
         </div>
      );
   }

   // Si hay datos, mostrar el dashboard
   return (
      <div>
         <AdvancedAnalyticsDashboard data={penalties} fieldLabels={PENALTIES_DICTIONARY} />
      </div>
   );
};

export default PageReports;
