import { useEffect, useState } from "react";
import { CourtsApi } from "../../../infrastructure/courts/courts.infra";
import { useCourtStore } from "../../../store/courts/courts.store";
import * as Yup from "yup";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { PermissionRoute } from "../../../App";
import { CustomButton } from "../../components/button/custombuttom";
import { FiBell, FiSettings, FiUser } from "react-icons/fi";
import { CustomTab } from "../../components/tab/customtab";
import { usePenaltiesStore } from "../../../store/penalties/penalties.store";
import { PenaltiesApi } from "../../../infrastructure/penalties/penalties.infra";
import CustomModal from "../../components/modal/modal";
import MultaPDF from "./pdf/pdfpenalties";
import PdfPreview from "../../components/pdfview/pdfview";
import { FaRegFilePdf } from "react-icons/fa6";
import { FormikInput, FormikNativeTimeInput } from "../../formik/FormikInputs/FormikInput";
import CustomTable from "../../components/table/customtable";
import { DateFormat, formatDatetime } from "../../../utils/formats";
import { FaEye, FaPlay, FaTrash } from "react-icons/fa";
import Tooltip from "../../components/toltip/Toltip";
import { VscDiffAdded } from "react-icons/vsc";
import { LuRefreshCcw } from "react-icons/lu";
import { CiEdit } from "react-icons/ci";
import { showConfirmationAlert, showToast } from "../../../sweetalert/Sweetalert";

const PageCourts = () => {
   const { courts, fetchCourts, handleChangeCourt, initialValues, loading, open, postCourt, removeCourt, setOpen, handleCourtValues, disabled, handleResetValues } =
      useCourtStore();
   const { fetchPenaltiesCourts, penalties, loading: loadingPenalties } = usePenaltiesStore();
   const api = new CourtsApi();
   const apiPenalties = new PenaltiesApi();
   const [pdfPenalties, setPdfPenalties] = useState({
      open: false,
      data: {}
   });
   const [openTab, setOpenTab] = useState<"juzgados" | "alcohol">("juzgados");
   const tabs = [
      {
         id: "juzgados",

         label: "Juzgados",
         icon: <FiSettings />,
         content: (
            <CompositePage
               formDirection="modal"
               onClose={setOpen}
               isOpen={open}
               modalTitle="Juzgados"
               form={() => (
                  <div className="pt-4">
                     <FormikForm
                        validationSchema={validationSchema}
                        buttonMessage={initialValues.id > 0 ? "Actualizar" : "Registrar"}
                        initialValues={initialValues}
                        children={() => (
                           <>
                              <FormikInput type="date" name="date" label="Fecha" />
                              <FormikInput name="referring_agency" disabled={disabled} label="Remite" />
                              <FormikInput name="detainee_name" label="Nombre del detenido" />
                              <FormikInput name="detention_reason" label="Motivo de detención" />
                              <FormikNativeTimeInput name="entry_time" label="Hora de entrada" />
                              <FormikInput type="datetime-local" name="exit_datetime" label="Hora y Fecha de salida" />
                              <FormikInput name="exit_reason" label="Causa de salida" />
                              <FormikInput name="fine_amount" label="Multa" />
                           </>
                        )}
                        onSubmit={(values) => {
                           postCourt(values as Court, api);
                           fetchPenaltiesCourts(apiPenalties);
                        }}
                     />
                  </div>
               )}
               table={() => (
                  <CustomTable
                     headerActions={() => (
                        <>
                           <Tooltip content="Agregar juicio">
                              <CustomButton
                                 onClick={() => {
                                    handleResetValues();
                                    setOpen();
                                 }}
                              >
                                 {" "}
                                 <VscDiffAdded />
                              </CustomButton>
                           </Tooltip>
                           <Tooltip content="Refrescar la tabla">
                              <CustomButton
                                 color="purple"
                                 onClick={() => {
                                    fetchCourts(api);
                                 }}
                              >
                                 {" "}
                                 <LuRefreshCcw />
                              </CustomButton>
                           </Tooltip>
                        </>
                     )}
                     data={courts}
                     actions={(row) => (
                        <>
                           <Tooltip content="Editar Juicio">
                              <CustomButton
                                 size="sm"
                                 color="yellow"
                                 onClick={() => {
                                    handleChangeCourt(row);
                                    // setModalForm()
                                 }}
                              >
                                 <CiEdit />
                              </CustomButton>
                           </Tooltip>
                           <Tooltip content="Eliminar Juicio">
                              <CustomButton
                                 size="sm"
                                 color="red"
                                 onClick={() => {
                                    showConfirmationAlert(`Eliminar `, {
                                       text: "Se elimina el juicio"
                                    }).then((isConfirmed) => {
                                       if (isConfirmed) {
                                          removeCourt(row, api);
                                       } else {
                                          showToast("La acción fue cancelada.", "error");
                                       }
                                    });
                                 }}
                              >
                                 <FaTrash />
                              </CustomButton>
                           </Tooltip>
                        </>
                     )}
                     paginate={[5, 10, 25, 50, 100, 500]}
                     columns={[
                        {
                           field: "id",
                           headerName: "Folio"
                        },
                        {
                           field: "date",
                           headerName: "Fecha",
                           renderField: (v) => <>{formatDatetime(String(v), true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)}</>
                        },
                        {
                           field: "referring_agency",
                           headerName: "Remite"
                        },
                        {
                           field: "detainee_name",
                           headerName: "Nombre del detenido"
                        },
                        {
                           field: "detention_reason",
                           headerName: "Motivo de detención"
                        },
                        {
                           field: "entry_time",
                           headerName: "Hora de entrada",
                           renderField: (v) => <>{formatDatetime(`2025-01-01 ${v}`, false, DateFormat.HH_MM_SS_A)}</>
                        },
                        {
                           field: "exit_datetime",
                           headerName: "Hora y Fecha de salida",
                           renderField: (v) => <>{formatDatetime(String(v), true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)}</>
                        },
                        {
                           field: "exit_reason",
                           headerName: "Causa de salida"
                        },
                        {
                           field: "fine_amount",
                           headerName: "Multa"
                        }
                     ]}
                  />
               )}
            />
         )
      },
      {
         id: "alcohol",
         label: "Alcoholimetros",
         icon: <FiUser />,
         content: (
            <div className="p-4">
               {loadingPenalties ? (
                  <div className="text-center py-8">Cargando multas...</div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                     {penalties.map((penalty) => (
                        <CardPenalty
                           key={penalty.id}
                           penalty={penalty}
                           onViewDetails={() => {
                              console.log("first", openTab);
                              setOpenTab("juzgados");
                              setOpen();
                              handleCourtValues(penalty.id);
                           }}
                           onViewPdf={() => {
                              setPdfPenalties({
                                 data: penalty,
                                 open: true
                              });
                           }}
                        />
                     ))}
                  </div>
               )}
            </div>
         )
      }
   ];

   useEffect(() => {
      fetchCourts(api);
      fetchPenaltiesCourts(apiPenalties);
   }, []);

   const validationSchema = Yup.object({
      date: Yup.date().required("La fecha es requerida"),
      referring_agency: Yup.string().required("El remitente es requerido"),
      detainee_name: Yup.string().required("El nombre del detenido es requerido"),
      detention_reason: Yup.string().required("El motivo de detención es requerido")
   });

   return (
      <>
         <CompositePage
            formDirection="modal"
            onClose={setOpen}
            isOpen={open}
            modalTitle="Juzgados"
            table={() => (
               <CustomTab
                  tabs={tabs}
                  defaultTab={openTab}
                  onTabChange={(tabId) => {
                     setOpenTab(tabId as "juzgados" | "alcohol");
                  }}
               />
            )}
         />

         {/* Modal para vista previa del PDF */}
         <CustomModal
            title="Vista de PDF"
            isOpen={pdfPenalties.open}
            onClose={() => {
               setPdfPenalties({
                  data: {},
                  open: false
               });
            }}
         >
            {pdfPenalties.open && (
               <PdfPreview name="">
                  <MultaPDF data={pdfPenalties.data} />
               </PdfPreview>
            )}
         </CustomModal>
      </>
   );
};

// Componente Card para cada multa
const CardPenalty = ({ penalty, onViewPdf, onViewDetails }: { penalty: any; onViewPdf: () => void; onViewDetails: () => void }) => {
   return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-md transition-shadow  group">
         {/* Icono PDF */}
         <div className="flex justify-center mb-2">
            <div className="bg-red-100 p-2 rounded-full group-hover:bg-red-200 transition-colors">
               <FaRegFilePdf className="text-red-600 text-lg" />
            </div>
         </div>

         {/* Folio/ID */}
         <div className="text-center mb-1">
            <h3 className="text-xl font-bold text-guinda-primary">{penalty.id}</h3>
            <p className="text-xs text-gray-500">Folio</p>
         </div>

         {/* Nombre */}
         <div className="text-center mb-3">
            <p className="text-sm font-medium text-gray-700">{penalty.name || "Nombre no disponible"}</p>
            <p className="text-xs text-gray-500">Pendiente</p>
         </div>

         {/* Botones de acción */}
         <div className="flex gap-2">
            <button
               onClick={onViewPdf}
               className="flex-1 presidencia hover:cursor-pointer text-white py-2 px-3 rounded text-sm hover:bg-guinda-secondary transition-colors flex items-center justify-center gap-1"
            >
               <FaRegFilePdf className="text-xs" />
               Ver PDF
            </button>
            <button
               onClick={onViewDetails}
               className="flex-1 bg-blue-600 hover:cursor-pointer text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
            >
               <FaPlay className="text-xs" />
               Iniciar proceso
            </button>
         </div>
      </div>
   );
};
export default PageCourts;
