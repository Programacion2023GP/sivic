import { useState, useCallback, useRef } from "react";
import type { FormikProps, FormikValues } from "formik";
import { Penalties } from "../../../../domain/models/penalties/penalties.model";
import { findMostSimilar } from "../../../../utils/match";
import { showConfirmationAlert, showToast } from "../../../../sweetalert/Sweetalert";

export const usePenaltiesForm = () => {
   const [uiState, setUiState] = useState({
      open: false,
      activeStep: 0,
      pdfPenalties: { open: false, row: {} }
   });

   const [duplicate, setDuplicate] = useState<{
      duplicate: boolean;
      value: string;
   }>({
      duplicate: false,
      value: ""
   });

   const [history, setHistory] = useState<{ open: boolean; idSearch: number }>({
      open: false,
      idSearch: null
   });

   const formikRef = useRef<FormikProps<FormikValues>>(null);

   return {
      uiState,
      setUiState,
      duplicate,
      setDuplicate,
      history,
      setHistory,
      formikRef
   };
};

// ============================================
// Hook: useCityData
// Lógica para obtener ciudades por código postal
// ============================================
export const useCityData = () => {
   const [citys, setCity] = useState({ loading: false, citys: [] });

   const handleCp = useCallback(async (cpValue: string) => {
      const cpNumber = Number(cpValue);

      if (!isNaN(cpNumber) && cpNumber > 9999) {
         setCity({ loading: true, citys: [] });

         try {
            const res = await fetch(`${import.meta.env.VITE_API_URLCODIGOSPOSTALES}${cpNumber}`);

            if (!res.ok) {
               throw new Error("Error en la petición");
            }

            const data = await res.json();

            setCity({
               loading: false,
               citys: data?.data?.result || []
            });
         } catch (error) {
            console.error("Error al obtener ciudades:", error);
            setCity({ loading: false, citys: [] });
         }
      }
   }, []);

   return { citys, handleCp };
};

// ============================================
// Hook: usePenaltiesHandlers
// Handlers para oficial y validación de nombres duplicados
// Incluye toda la lógica de detección de residencias similares
// ============================================
export const usePenaltiesHandlers = (
   formikRef: React.RefObject<FormikProps<FormikValues>>,
   oficiales: any,
   data: Penalties[],
   setDuplicate: React.Dispatch<React.SetStateAction<{ duplicate: boolean; value: string }>>
) => {
   // Handler para cambio de oficial
   const handleOficialChange = useCallback(
      (name: string, value: any) => {
         if (formikRef.current) {
            const oficialSeleccionado = oficiales.employes?.find((oficial: any) => oficial.value == value);

            if (oficialSeleccionado) {
               formikRef.current.setFieldValue("oficial_payroll", oficialSeleccionado.codigoEmpleado);
               formikRef.current.setFieldValue("person_oficial", value);
            }
         }
      },
      [oficiales.employes, formikRef]
   );

   // Handler para validación de nombres duplicados/similares
   // Detecta residencias similares y ofrece autocompletar datos
   const handleNameBlur = useCallback(
      (e: any, values: any) => {
         const probality = findMostSimilar(data, "name", values["name"]);

         // Si encuentra similitud mayor al 50%
         if (probality?.similarity > 50) {
            showConfirmationAlert(``, {
               html: `
      ${
         probality.item.image_penaltie || probality.item.images_evidences_car
            ? `
      <div class="p-4 text-center">
        <img 
          src="${probality.item.image_penaltie ?? probality.item.images_evidences_car}"
          alt="Evidencia"
          class="w-full h-48 object-cover rounded-lg"
        />
      </div>
    `
            : ""
      }


                     <!-- Icono de residencia -->
                     <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                     </div>
                     
                     <!-- Título -->
                     <h3 class="text-lg font-bold text-gray-900 mb-2">
                        🏠 Residencia Similar Encontrada
                     </h3>
                     
                     <!-- Porcentaje de similitud -->
                     <div class="text-3xl font-bold text-blue-600 mb-3">
                        ${Math.round(probality.similarity)}%
                     </div>
                     
                     <!-- Mensaje -->
                     <p class="text-gray-600 mb-4">
                        Se encontró una posible residencia similar en el sistema
                     </p>
                     
                     <!-- Información de la residencia -->
                     <div class="bg-gray-50 p-3 rounded-lg mb-4 text-left">
                        <p class="text-sm font-medium text-gray-900 mb-1">Datos de la residencia:</p>
                        <div class="text-sm text-gray-600 space-y-1">
                           ${probality.item?.name ? `<div><strong>Nombre:</strong> ${probality.item.name}</div>` : ""}
                           ${probality.item?.detainee_phone_number ? `<div><strong>Teléfono:</strong> ${probality.item.detainee_phone_number}</div>` : ""}
                           ${probality.item?.plate_number ? `<div><strong>N° de placa:</strong> ${probality.item.plate_number}</div>` : ""}
                           ${probality.item?.age ? `<div><strong>Edad:</strong> ${probality.item.age}</div>` : ""}
                        </div>
                     </div>
                     
                     <!-- Instrucción -->
                     <p class="text-sm text-gray-500">
                        ¿Deseas aceptar esta residencia o cancelar el registro?
                     </p>
                  </div>
               `
            }).then((isConfirmed) => {
               if (isConfirmed && formikRef.current) {
                  // Autocompletar datos de la residencia encontrada
                  formikRef.current.setFieldValue("residence_folio", probality.item.id);
                  formikRef.current.setFieldValue("name", probality?.item?.name);
                  formikRef.current.setFieldValue("plate_number", probality?.item?.plate_number);
                  formikRef.current.setFieldValue("age", probality?.item?.age);
                  formikRef.current.setFieldValue("detainee_phone_number", probality?.item?.detainee_phone_number);

                  setDuplicate({
                     duplicate: true,
                     value: probality?.item?.name
                  });

                  showToast("Residencia aceptada correctamente.", "success");
               } else {
                  // Cancelar y limpiar
                  setDuplicate({
                     duplicate: false,
                     value: null
                  });
                  formikRef.current.setFieldValue("residence_folio", null);

                  showToast("Registro de residencia cancelado.", "error");
               }
            });
         }
      },
      [data, formikRef, setDuplicate]
   );

   return {
      handleOficialChange,
      handleNameBlur
   };
};
