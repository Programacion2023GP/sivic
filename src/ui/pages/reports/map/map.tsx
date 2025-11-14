import { useEffect, useState } from "react";
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

   // 10 datos simulados en Gómez Palacio
   const defaultLat = 25.6596;
   const defaultLng = -103.4586;

   // Procesar los datos para asegurar que tengan coordenadas válidas
   const limitedPenalties = penalties.map((penalty, index) => {
      // Convertir lat y lon a números, y si no son válidos, usar los valores por defecto
      const lat = penalty.lat ? Number(penalty.lat) : defaultLat;
      const lon = penalty.lon ? Number(penalty.lon) : defaultLng;

      // Asegurarse de que son números válidos, si no, usar por defecto
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

   return (
      <>
         <div className="bg-gray-100 p-6">
            {isLoading ? (
               <div className="flex justify-center items-center h-[400px] text-gray-500">Cargando datos...</div>
            ) : (
               <div className="rounded-lg overflow-hidden shadow-md" style={{ height: "600px" }}>
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
            <PdfPreview children={<MultaPDF data={openPdf.data} />} name="OTRO" />
         </CustomModal>
      </>
   );
};

export default PageReportMap;
