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
   const today = new Date();
   const [selectedDate, setSelectedDate] = useState<DateFilter>(today);

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

   /* ---------- FILTRAR LOCALMENTE POR FECHA ----------- */
   useEffect(() => {
      if (selectedDate === "ALL") {
         setFilteredPenalties(limitedPenalties);
         return;
      }

      if (!selectedDate) {
         setFilteredPenalties(limitedPenalties);
         return;
      }

      // Formatear selectedDate a YYYY-MM-DD en zona local (sin hora)
      const formatDateToLocalYYYYMMDD = (date: Date) => {
         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, "0");
         const day = String(date.getDate()).padStart(2, "0");
         return `${year}-${month}-${day}`;
      };

      const selectedDateStr = formatDateToLocalYYYYMMDD(selectedDate);

      const filtered = limitedPenalties.filter((p) => {
         // Comparar solo la parte de fecha (sin hora)
         const penaltyDate = p.date ? p.date.split("T")[0] : "";
         return penaltyDate === selectedDateStr;
      });

      setFilteredPenalties(filtered);
   }, [selectedDate, limitedPenalties]);

   /* -------- PDF Memo -------- */
   const pdfDocument = useMemo(() => {
      if (!openPdf.data) return null;
      return <MultaPDF data={openPdf.data} />;
   }, [openPdf.data]);

   return (
      <>
         {/* ================= FILTRO DE FECHA ================= */}
         <div className="w-full flex justify-center gap-4 py-4 bg-gray-50 border-b">
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
                     // Crear fecha en zona local (no UTC)
                     const dateString = e.target.value; // Formato YYYY-MM-DD
                     const [year, month, day] = dateString.split("-").map(Number);

                     // Crear fecha en hora local, sin ajustes de zona horaria
                     const localDate = new Date(year, month - 1, day);
                     setSelectedDate(localDate);
                  }}
               />
            </div>

            {/* ========== BOTÓN HOY ========== */}
            <button
               className="px-4 h-10 mt-6 rounded-xl shadow bg-cyan-600 hover:bg-cyan-700 
                          text-white font-medium"
               onClick={() => {
                  // Establecer la fecha de hoy a medianoche en hora local
                  const now = new Date();
                  const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  setSelectedDate(todayAtMidnight);
               }}
            >
               Hoy
            </button>

            {/* ========== BOTÓN TODOS ========== */}
            <button
               className="px-4 h-10 mt-6 rounded-xl shadow bg-gray-700 hover:bg-gray-800 
                          text-white font-medium"
               onClick={() => setSelectedDate("ALL")}
            >
               Todos
            </button>
         </div>

         {/* ================= MAPA ================= */}
         {isLoading ? (
            <div className="flex justify-center items-center h-screen text-gray-500">Cargando datos...</div>
         ) : (
            <CustomMap
               penaltiesData={filteredPenalties}
               onCaseSelect={(row) => {
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

// Función auxiliar para formatear fecha a valor de input
const formatDateToInputValue = (date: Date): string => {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

export default PageReportMap;
