import { useEffect, useState, useMemo } from "react";
import { PenaltiesApi } from "../../../../infrastructure/penalties/penalties.infra";
import { usePenaltiesStore } from "../../../../store/penalties/penalties.store";
import CustomMap from "../../../components/map/custommap";
import CustomModal from "../../../components/modal/modal";
import PdfPreview from "../../../components/pdfview/pdfview";
import MultaPDF from "../../courts/pdf/pdfpenalties";

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

      // Formatear selectedDate a YYYY-MM-DD en zona local
     const nextDate = new Date(selectedDate);
     nextDate.setDate(nextDate.getDate() + 1);

     const year = nextDate.getFullYear();
     const month = String(nextDate.getMonth() + 1).padStart(2, "0");
     const day = String(nextDate.getDate()).padStart(2, "0");
     const selectedDateStr = `${year}-${month}-${day}`;

     console.log("Fecha original:", selectedDate);
     console.log("Fecha +1 día:", selectedDateStr);

     const filtered = limitedPenalties.filter((p) => {
      console.log(p.id, p.date, selectedDateStr, p.date == selectedDateStr);
        return p.date == selectedDateStr;
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
                  value={selectedDate && selectedDate !== "ALL" ? selectedDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                     if (!e.target.value) {
                        setSelectedDate(null);
                        return;
                     }
                     setSelectedDate(new Date(e.target.value));
                  }}
               />
            </div>

            {/* ========== BOTÓN HOY ========== */}
            <button
               className="px-4 h-10 mt-6 rounded-xl shadow bg-cyan-600 hover:bg-cyan-700 
                          text-white font-medium"
               onClick={() => setSelectedDate(today)}
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

export default PageReportMap;
