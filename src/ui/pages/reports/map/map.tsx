import { useEffect, useState, useMemo } from "react";
import { PenaltiesApi } from "../../../../infrastructure/penalties/penalties.infra";
import { usePenaltiesStore } from "../../../../store/penalties/penalties.store";
import CustomMap from "../../../components/map/custommap";
import CustomModal from "../../../components/modal/modal";
import PdfPreview from "../../../components/pdfview/pdfview";
import MultaPDF from "../../pdf/pdfpenalties";

// 👌 Corrección: tipo para selectedDate
type DateFilter = Date | "ALL" | null;

const PageReportMap = () => {
   const { penalties, fetchPenalties } = usePenaltiesStore();
   const api = new PenaltiesApi();

   const [isLoading, setIsLoading] = useState(true);

   // 👉 HOY POR DEFECTO
   const [selectedDate, setSelectedDate] = useState<DateFilter>(new Date());

   const [filteredPenalties, setFilteredPenalties] = useState([]);

   const [openPdf, setOpenpdf] = useState({
      open: false,
      data: {}
   });

   /* --------- CARGA INICIAL --------- */
   useEffect(() => {
      const loadData = async () => {
         setIsLoading(true);
         await fetchPenalties(api);
         setIsLoading(false);
      };
      loadData();
   }, []);

   /* --------- Normalización --------- */
   const limitedPenalties = useMemo(() => {
      const defaultLat = 25.6596;
      const defaultLng = -103.4586;

      return penalties.map((penalty) => {
         const lat = Number(penalty.lat) || defaultLat;
         const lon = Number(penalty.lon) || defaultLng;

         return {
            ...penalty,
            lat: isNaN(lat) ? defaultLat : lat,
            lon: isNaN(lon) ? defaultLng : lon,
            cp: String(penalty.cp || "35000"),
            id: penalty.id.toString()
         };
      });
   }, [penalties]);

   /* ---------- FUNCIONES AUXILIARES DE FECHA ----------- */

   // Función para convertir cualquier formato de fecha a YYYY-MM-DD
   const normalizeDate = (dateInput: any): string => {
      // Si es undefined, null o vacío, retornar string vacío
      if (!dateInput && dateInput !== 0) {
         console.log(`Fecha vacía o indefinida: ${dateInput}`);
         return "";
      }

      console.log(`Normalizando fecha: ${dateInput}, tipo: ${typeof dateInput}`);

      try {
         // Si ya es un string
         if (typeof dateInput === "string") {
            // Limpiar espacios
            const dateStr = dateInput.trim();

            // Verificar si ya está en formato YYYY-MM-DD
            const yyyyMmDdRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})/;
            const yyyyMmDdMatch = dateStr.match(yyyyMmDdRegex);
            if (yyyyMmDdMatch) {
               const year = yyyyMmDdMatch[1];
               const month = yyyyMmDdMatch[2].padStart(2, "0");
               const day = yyyyMmDdMatch[3].padStart(2, "0");
               return `${year}-${month}-${day}`;
            }

            // Verificar formato DD/MM/YYYY
            const ddMmYyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/;
            const ddMmYyyyMatch = dateStr.match(ddMmYyyyRegex);
            if (ddMmYyyyMatch) {
               const day = ddMmYyyyMatch[1].padStart(2, "0");
               const month = ddMmYyyyMatch[2].padStart(2, "0");
               const year = ddMmYyyyMatch[3];
               return `${year}-${month}-${day}`;
            }

            // Verificar formato MM/DD/YYYY
            const mmDdYyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/;
            const mmDdYyyyMatch = dateStr.match(mmDdYyyyRegex);
            if (mmDdYyyyMatch) {
               const month = mmDdYyyyMatch[1].padStart(2, "0");
               const day = mmDdYyyyMatch[2].padStart(2, "0");
               const year = mmDdYyyyMatch[3];
               return `${year}-${month}-${day}`;
            }

            // Verificar formato DD-MM-YYYY
            const ddMmYyyyDashRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})/;
            const ddMmYyyyDashMatch = dateStr.match(ddMmYyyyDashRegex);
            if (ddMmYyyyDashMatch) {
               const day = ddMmYyyyDashMatch[1].padStart(2, "0");
               const month = ddMmYyyyDashMatch[2].padStart(2, "0");
               const year = ddMmYyyyDashMatch[3];
               return `${year}-${month}-${day}`;
            }

            // Intentar parsear con Date
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
               const year = parsedDate.getFullYear();
               const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
               const day = String(parsedDate.getDate()).padStart(2, "0");
               return `${year}-${month}-${day}`;
            }
         }

         // Si es un número (timestamp)
         if (typeof dateInput === "number") {
            const parsedDate = new Date(dateInput);
            if (!isNaN(parsedDate.getTime())) {
               const year = parsedDate.getFullYear();
               const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
               const day = String(parsedDate.getDate()).padStart(2, "0");
               return `${year}-${month}-${day}`;
            }
         }

         // Si es un objeto Date
         if (dateInput instanceof Date) {
            if (!isNaN(dateInput.getTime())) {
               const year = dateInput.getFullYear();
               const month = String(dateInput.getMonth() + 1).padStart(2, "0");
               const day = String(dateInput.getDate()).padStart(2, "0");
               return `${year}-${month}-${day}`;
            }
         }

         console.log(`No se pudo normalizar la fecha: ${dateInput}`);
         return "";
      } catch (error) {
         console.error(`Error al normalizar fecha ${dateInput}:`, error);
         return "";
      }
   };

   // Función para formatear fecha a valor de input (YYYY-MM-DD)
   const formatDateToInputValue = (date: Date): string => {
      if (!date) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
   };

   // Función para obtener la fecha de hoy a medianoche
   const getTodayAtMidnight = (): Date => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
   };

   /* ---------- FILTRAR LOCALMENTE POR FECHA ----------- */
   useEffect(() => {
      // Primero, debug de todas las fechas disponibles
      console.log("=== DEBUG DE FECHAS ===");
      console.log("Total de casos:", limitedPenalties.length);

      limitedPenalties.forEach((p, i) => {
         try {
            const normalized = normalizeDate(p.date);
            console.log(`Caso ${i + 1} - ID: ${p.id}, Fecha original: ${p.date}, Normalizada: ${normalized}`);
         } catch (error) {
            console.error(`Error en caso ${i + 1} - ID: ${p.id}:`, error);
         }
      });
      console.log("=== FIN DEBUG ===");

      if (selectedDate === "ALL") {
         setFilteredPenalties(limitedPenalties);
         console.log(`Mostrando TODOS los casos: ${limitedPenalties.length} registros`);
         return;
      }

      if (!selectedDate) {
         setFilteredPenalties(limitedPenalties);
         console.log(`Fecha nula - Mostrando todos: ${limitedPenalties.length} registros`);
         return;
      }

      // Obtener la fecha seleccionada en formato YYYY-MM-DD
      const selectedDateStr = normalizeDate(selectedDate);
      console.log(`Filtrando por fecha: ${selectedDateStr} (fecha seleccionada: ${selectedDate})`);

      const filtered = limitedPenalties.filter((p) => {
         try {
            // Normalizar la fecha de la infracción
            const penaltyDateStr = normalizeDate(p.date);

            if (!penaltyDateStr) {
               console.log(`Caso ${p.id}: fecha inválida o vacía - ${p.date}`);
               return false;
            }

            const matches = penaltyDateStr === selectedDateStr;

            if (matches) {
               console.log(`✓ Caso ${p.id} COINCIDE: ${penaltyDateStr} = ${selectedDateStr}`);
            }

            return matches;
         } catch (error) {
            console.error(`Error procesando fecha para caso ${p.id}:`, p.date, error);
            return false;
         }
      });

      console.log(`Resultado del filtro: ${filtered.length} casos encontrados para ${selectedDateStr}`);

      if (filtered.length > 0) {
         console.log("Casos encontrados:");
         filtered.forEach((p) => {
            console.log(`  - ID: ${p.id}, Fecha: ${p.date}, Normalizada: ${normalizeDate(p.date)}`);
         });
      } else {
         console.log("No se encontraron casos para esta fecha");
      }

      setFilteredPenalties(filtered);
   }, [selectedDate, limitedPenalties]);

   /* -------- PDF Memo -------- */
   const pdfDocument = useMemo(() => {
      if (!openPdf.data || Object.keys(openPdf.data).length === 0) return null;
      return <MultaPDF data={openPdf.data} />;
   }, [openPdf.data]);

   return (
      <>
         {/* ================= FILTRO DE FECHA ================= */}
         <div className="w-full flex flex-wrap justify-center gap-4 py-4 bg-gray-50 border-b">
            {/* INPUT */}
            <div className="flex flex-col">
               <label className="text-sm text-gray-500 mb-1 font-medium">Filtrar por fecha:</label>
               <input
                  type="date"
                  disabled={selectedDate === "ALL"}
                  className={`px-3 py-2 rounded-xl border shadow-sm text-gray-700 
                     focus:ring-2 focus:ring-cyan-500 focus:outline-none
                     ${selectedDate === "ALL" ? "bg-gray-200 cursor-not-allowed" : ""}`}
                  value={selectedDate && selectedDate !== "ALL" ? formatDateToInputValue(selectedDate) : ""}
                  onChange={(e) => {
                     if (!e.target.value) {
                        setSelectedDate(null);
                        return;
                     }

                     // Crear fecha en zona local
                     const dateString = e.target.value; // Formato YYYY-MM-DD
                     const [year, month, day] = dateString.split("-").map(Number);

                     // Crear fecha a medianoche (hora local)
                     const localDate = new Date(year, month - 1, day);
                     localDate.setHours(0, 0, 0, 0);

                     console.log("Fecha seleccionada desde input:", localDate, "valor:", dateString);
                     setSelectedDate(localDate);
                  }}
               />
            </div>

            {/* ========== BOTÓN HOY ========== */}
            <div className="flex flex-col">
               <label className="text-sm text-gray-500 mb-1 font-medium opacity-0">Hoy</label>
               <button
                  className="px-4 h-10 rounded-xl shadow bg-cyan-600 hover:bg-cyan-700 
                            text-white font-medium transition-colors"
                  onClick={() => {
                     const today = getTodayAtMidnight();
                     console.log("Botón HOY clickeado - Fecha:", today);
                     setSelectedDate(today);
                  }}
               >
                  Hoy
               </button>
            </div>

            {/* ========== BOTÓN TODOS ========== */}
            <div className="flex flex-col">
               <label className="text-sm text-gray-500 mb-1 font-medium opacity-0">Todos</label>
               <button
                  className="px-4 h-10 rounded-xl shadow bg-gray-700 hover:bg-gray-800 
                            text-white font-medium transition-colors"
                  onClick={() => {
                     console.log("Botón TODOS clickeado");
                     setSelectedDate("ALL");
                  }}
               >
                  Todos
               </button>
            </div>

            {/* ========== INDICADOR DE RESULTADOS ========== */}
            {/* <div className="flex flex-col justify-center">
               <label className="text-sm text-gray-500 mb-1 font-medium opacity-0">Resultados</label>
               <div className="px-4 h-10 flex items-center bg-white rounded-xl border">
                  <span className="text-sm text-gray-600">
                     {selectedDate === "ALL" ? (
                        <>
                           Mostrando <strong>{filteredPenalties.length}</strong> casos
                        </>
                     ) : selectedDate ? (
                        <>
                           <strong>{filteredPenalties.length}</strong> casos para <strong>{formatDateToInputValue(selectedDate)}</strong>
                        </>
                     ) : (
                        <>
                           Total: <strong>{filteredPenalties.length}</strong> casos
                        </>
                     )}
                  </span>
               </div>
            </div> */}

            {/* Botón para debug */}
            <div className="flex flex-col">
               <label className="text-sm text-gray-500 mb-1 font-medium opacity-0">Debug</label>
               {/* <button
                  className="px-4 h-10 rounded-xl shadow bg-yellow-600 hover:bg-yellow-700 
                            text-white font-medium transition-colors text-sm"
                  onClick={() => {
                     console.log("=== DEPURACIÓN MANUAL ===");
                     const today = getTodayAtMidnight();
                     const todayStr = normalizeDate(today);
                     console.log("Fecha de hoy normalizada:", todayStr);

                     limitedPenalties.forEach((p) => {
                        try {
                           const normalized = normalizeDate(p.date);
                           const matches = normalized === todayStr;
                           console.log(`ID ${p.id}: "${p.date}" → "${normalized}" → ${matches ? "✓ COINCIDE" : "✗ NO COINCIDE"}`);
                        } catch (error) {
                           console.error(`Error en ID ${p.id}:`, error);
                        }
                     });
                  }}
               >
                  Depurar Fechas
               </button> */}
            </div>
         </div>

         {/* ================= MAPA ================= */}
         {isLoading ? (
            <div className="flex justify-center items-center h-screen text-gray-500">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p>Cargando datos...</p>
               </div>
            </div>
         ) : (
            <CustomMap
               penaltiesData={filteredPenalties}
               onCaseSelect={(row) => {
                  console.log("Caso seleccionado en mapa:", row);
                  setOpenpdf({
                     open: true,
                     data: row
                  });
               }}
            />
         )}

         {/* ================= PDF ================= */}
         <CustomModal
            title="Multa"
            isOpen={openPdf.open}
            onClose={() =>
               setOpenpdf({
                  data: {},
                  open: false
               })
            }
         >
            {pdfDocument && <PdfPreview children={pdfDocument} name={`multa-`} />}
         </CustomModal>
      </>
   );
};

export default PageReportMap;
