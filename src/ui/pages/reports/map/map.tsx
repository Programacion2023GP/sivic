import { useEffect, useState, useMemo } from "react";
import { PenaltiesApi } from "../../../../infrastructure/penalties/penalties.infra";
import { usePenaltiesStore } from "../../../../store/penalties/penalties.store";
import CustomMap from "../../../components/map/custommap";
import CustomModal from "../../../components/modal/modal";
import PdfPreview from "../../../components/pdfview/pdfview";
import MultaPDF from "../../courts/pdf/pdfpenalties";

const PageReportMap = () => {
   const { penalties, fetchPenalties } = usePenaltiesStore();
   const api = new PenaltiesApi();
   const [isLoading, setIsLoading] = useState(true);
   const [openPdf, setOpenpdf] = useState({
      open: false,
      data: {}
   });

   useEffect(() => {
      const loadData = async () => {
         setIsLoading(true);
         await fetchPenalties(api);
         setIsLoading(false);
      };
      loadData();
   }, []);

   // Memoizar el procesamiento de datos
   const limitedPenalties = useMemo(() => {
      const defaultLat = 25.6596;
      const defaultLng = -103.4586;

      return penalties.map((penalty, index) => {
         const lat = penalty.lat ? Number(penalty.lat) : defaultLat;
         const lon = penalty.lon ? Number(penalty.lon) : defaultLng;

         const validLat = isNaN(lat) ? defaultLat : lat;
         const validLng = isNaN(lon) ? defaultLng : lon;

         return {
            ...penalty,
            lat: validLat,
            lon: validLng,
            cp: String(penalty.cp || "35000"),
            id: penalty.id.toString()
         };
      });
   }, [penalties]);

   // Memoizar el PDF para evitar re-renderizados innecesarios
   const pdfDocument = useMemo(() => {
      if (!openPdf.data) return null;
      return <MultaPDF data={openPdf.data} />;
   }, [openPdf.data]);

   return (
      <>
         <div className="bg-gray-100 p-6">
            {isLoading ? (
               <div className="flex justify-center items-center h-screen text-gray-500">Cargando datos...</div>
            ) : (
               <div className="rounded-lg overflow-hidden shadow-md" style={{ height: "screen" }}>
                  <CustomMap
                     penaltiesData={limitedPenalties}
                     onCaseSelect={(row) => {
                        setOpenpdf({
                           open: true,
                           data: row
                        });
                     }}
                  />
               </div>
            )}
         </div>

         <CustomModal
            title="Multa"
            
            isOpen={openPdf.open}
            onClose={() => {
               setOpenpdf({
                  data: {},
                  open: false
               });
            }}
         >
            {pdfDocument && <PdfPreview children={pdfDocument} name={`multa-`} />}
         </CustomModal>
      </>
   );
};

export default PageReportMap;
