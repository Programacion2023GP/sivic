import React, { useState, useEffect, useMemo } from "react";
import { useGenericStore } from "../../../store/generic/generic.store";
import { Recidences } from "../../../domain/models/recidences/recidences";
import CustomTable from "../../components/table/customtable";
import { GenericApi } from "../../../infrastructure/generic/infra.generic";
import { Eye, ChevronRight, User, Car, TrendingUp, AlertTriangle, Copy } from "lucide-react";
import CustomModal from "../../components/modal/modal";
import { CustomButton } from "../../components/button/custombuttom";
import PdfPreview from "../../components/pdfview/pdfview";
import MultaPDF from "../pdf/pdfpenalties";
import { FaRegFilePdf } from "react-icons/fa";

const PageReincidencias = () => {
   const [selectedCadena, setSelectedCadena] = useState<string>("");
   const [modalOpen, setModalOpen] = useState(false);
   const [parsedEvents, setParsedEvents] = useState<any[]>([]);
   const [driverInfo, setDriverInfo] = useState<any>(null);
   const [openPdf, setOpenpdf] = useState({
      open: false,
      data: {}
   });
   const useRecidences = useMemo(
      () =>
         useGenericStore<Recidences>({
            id: 0,
            Nombre: "",
            "Cadena Completa": "",
            "Historial por Niveles": "",
            "Total Reincidencias": 0,
            Placa: ""
         }),
      []
   );

   const { fetchData, items, loading, setPrefix, request } = useRecidences();
   const Recidences = new GenericApi<Recidences>();

   useEffect(() => {
      setPrefix("reportsrecidences");
      fetchData(Recidences);
   }, []);
   const pdfDocument = useMemo(() => {
      if (!openPdf.data) return null;
      return <MultaPDF data={openPdf.data} />;
   }, [openPdf.data]);
   return (
      <>
         <CustomTable
            mobileConfig={{
               listTile: {
                  leading: (item) => (
                     <div className="relative">
                        <div className="flex items-center justify-center w-12 h-12 font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
                           {item.Nombre?.charAt(0) || "P"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                           {item?.["recidencias"]}
                        </div>
                     </div>
                  ),
                  title: (item) => (
                     <div>
                        <span className="font-bold text-gray-800">{item.Nombre || "Sin nombre"}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-sm font-medium bg-gray-100 px-2 py-0.5 rounded">{item.Placa || "Sin placa"}</span>
                           <span className="text-sm text-red-600 font-semibold">{item?.["recidencias"]} reincidencias</span>
                        </div>
                     </div>
                  ),
                  subtitle: (item) => (
                     <div className="mt-2">
                        <div className="text-sm text-gray-600">
                           <span className="font-medium">Historial: </span>
                        </div>
                     </div>
                  )
               }
            }}
            data={items}
            paginate={[10, 25, 50]}
            loading={loading}
            columns={[
               {
                  field: "UltimoFolio",
                  headerName: "Ultimo Folio"
               },

               {
                  field: "Nombre",
                  headerName: "Nombre"
               },

               {
                  field: "recidencias",
                  headerName: "Reincidencias"
               },
               {
                  field: "FoliosReincidencias",
                  headerName: "Residencias",
                  renderField: (v) => {
                     if (!v) return null;

                     const list = v.split(",").map((item) => item.trim());

                     return (
                        <div className="flex flex-wrap gap-1.5 p-0.5 items-center">
                           {list.map((it, index) => (
                              <CustomButton
                                 onClick={async () => {
                                    setOpenpdf({
                                       open: true,
                                       data: await request(
                                          {
                                             data: {
                                                cid: it
                                             },
                                             method: "POST",
                                             url: "alcohol_cases/show",
                                             formData: false
                                          },
                                          Recidences
                                       )
                                    });
                                 }}
                                 color="purple"
                                 key={index}
                                 variant="neon"
                                 size="sm"
                                 badgeColor="black"
                                 className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium m-0 transition-all hover:-translate-y-0.5 hover:shadow-md"
                                 badge={it}
                              >
                                 <FaRegFilePdf />
                              </CustomButton>
                           ))}
                        </div>
                     );
                  }
               }
            ]}
            actions={(row) => (
               <>
                  <CustomButton
                     size="sm"
                     color="purple"
                     variant="neon"
                     onClick={async () => {
                        console.log("aqui", row);
                        setOpenpdf({
                           open: true,
                           data: await request(
                              {
                                 data: {
                                    cid: row.UltimoFolio
                                 },
                                 method: "POST",
                                 url: "alcohol_cases/show",
                                 formData: false
                              },
                              Recidences
                           )
                        });
                     }}
                  >
                     <FaRegFilePdf />
                  </CustomButton>
               </>
            )}
         />
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

export default PageReincidencias;
