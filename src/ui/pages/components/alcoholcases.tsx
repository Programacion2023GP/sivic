import { PermissionRoute } from "../../../App";
import { FloatingActionButton } from "../../components/movil/button/custombuttommovil";
import CustomTable from "../../components/table/customtable";
import { CustomButton } from "../../components/button/custombuttom";
import { VscDiffAdded } from "react-icons/vsc";
import { LuRefreshCcw } from "react-icons/lu";
import { Penalties } from "../../../domain/models/penalties/penalties.model";
import PhotoZoom from "../../components/images/images";
import { DateFormat, formatDatetime } from "../../../utils/formats";
import { TbCheck } from "react-icons/tb";
import { CiEdit } from "react-icons/ci";
import { BsClockHistory } from "react-icons/bs";
import { FaPlus, FaRegFilePdf } from "react-icons/fa";
import { useAlcohol } from "../../../hooks/alcohol.hook";
import Tooltip from "../../components/toltip/Toltip";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { Traffic } from "../../../domain/models/traffic/traffic";
import { Public_Securrity } from "../../../domain/models/security/security";
import { VscDebugContinueSmall } from "react-icons/vsc";
import CustomDataDisplay from "../../components/movil/view/customviewmovil";
import { penalizacionesMovilView } from "./penaltiesmovil";
import CustomModal from "../../components/modal/modal";
import { showToast } from "../../../sweetalert/Sweetalert";

type section = "penaltie" | "traffic" | "securrity" | "courts" | "general";
interface AlcoholProps {
   setUiState?: (callback: (prev: any) => any) => void;
   resetInitialValues?: (type: string) => void;
   handleEdit?: (row: {}) => void;
   data: Penalties[] | Court[] | Traffic[] | Public_Securrity[];
   loading?: boolean;
   loadData?: (type: string) => void;
   section: section;
   setHistory?: Dispatch<SetStateAction<{ open: boolean; idSearch: number }>>;
   buttons?: ReactNode;
}

const TableAlcoholCases = ({ loadData, resetInitialValues, setUiState, buttons, setHistory, handleEdit, data, loading, section }: AlcoholProps) => {
   const { seguimiento, open, setClose } = useAlcohol();
   const [segData, seSegData] = useState<any>([]);
   const typeData = (section: section, row: Penalties): ReactNode => {
      switch (section) {
         case "penaltie":
            return (
               <>
                  <Tooltip content="Seguimiento">
                     <CustomButton
                        size="sm"
                        variant="neon"
                        color="blue"
                        onClick={async () => {
                           seSegData(await seguimiento(row.id));
                        }}
                     >
                        <BsClockHistory />
                     </CustomButton>
                  </Tooltip>
                  {row.current_process_id == 1 && !row.finish && (
                     <>
                        <CustomButton
                           size="sm"
                           color="purple"
                           variant="neon"
                           onClick={() =>
                              setUiState((prev) => ({
                                 ...prev,
                                 pdfPenalties: { open: true, row }
                              }))
                           }
                        >
                           <FaRegFilePdf />
                        </CustomButton>

                        {/* <Tooltip content="Continuar">
                <CustomButton
                  size="sm"
                  color="green"
                  variant="neon"
                  onClick={() => {
                    handleNext(row);
                  }}
                >
                  <TbCheck />
                </CustomButton>
              </Tooltip> */}
                  {row.finish != 1 && (

                        <PermissionRoute requiredPermission={"multas_actualizar"}>
                           <Tooltip content="Continuar">
                              <CustomButton
                                 size="sm"
                                 color="green"
                                 variant="neon"
                                 onClick={() => {
                                    setUiState((prev) => ({
                                       ...prev,
                                       open: true,
                                       activeStep: 0
                                    }));
                                    handleEdit(row);
                                 }}
                              >
                                 <VscDebugContinueSmall />
                              </CustomButton>
                           </Tooltip>
                        </PermissionRoute>
                  )}
                     </>
                              
)}

                  {row.residencias ? (
                     <PermissionRoute requiredPermission={"multas_historial"}>
                        <Tooltip content="Historial">
                           <CustomButton
                              size="sm"
                              variant="neon"
                              color="slate"
                              badge={row.residencias}
                              badgeVariant="solid"
                              badgeColor="green"
                              onClick={() => {
                                 setHistory({
                                    open: true,
                                    idSearch: row.id
                                 });
                              }}
                           >
                              <BsClockHistory />
                           </CustomButton>
                        </Tooltip>
                     </PermissionRoute>
                  ) : null}
               </>
            );

         case "traffic":
         case "securrity":
         case "courts":
            // Aquí deberías retornar JSX para el caso "traffic"
            return (
               <>
                  <Tooltip content="Seguimiento">
                     <CustomButton
                        size="sm"
                        variant="neon"
                        color="blue"
                        onClick={async () => {
                           seSegData(await seguimiento(row.id));
                        }}
                     >
                        <BsClockHistory />
                     </CustomButton>
                  </Tooltip>
                  {row.finish != 1 && (
                     <PermissionRoute requiredPermission={["multas_actualizar", "seguridad_publica_editar", "seguridad_publica_actualizar", "juzgados_actualizar"]}>
                        <Tooltip content="Continuar">
                           <CustomButton
                              size="sm"
                              color="green"
                              variant="neon"
                              onClick={() => {
                                 setUiState((prev) => ({
                                    ...prev,
                                    open: true,
                                    activeStep: 0
                                 }));
                                 handleEdit(row);
                              }}
                           >
                              <VscDebugContinueSmall />
                           </CustomButton>
                        </Tooltip>
                     </PermissionRoute>
                  )}
               </>
            );
         case "general":
            return (
               <Tooltip content="Seguimiento">
                  <CustomButton
                     size="sm"
                     variant="neon"
                     color="blue"
                     onClick={async () => {
                        seSegData(await seguimiento(row.id));
                     }}
                  >
                     <BsClockHistory />
                  </CustomButton>
               </Tooltip>
            );
         default:
            return null;
      }
   };
   const permissionMovilContinue = (section: section): string => {
      switch (section) {
         case "courts":
            return "juzgados_actualizar";

            break;
         case "penaltie":
            return "multas_actualizar";
            break;
         case "securrity":
            return "seguridad_publica_actualizar";

            break;
         case "traffic":
            return "transito_vialidad__actualizar";

            break;

         default:
            return "";
            break;
      }
   };
   return (
      <>
         {open && (
            <CustomModal title="Seguimiento del caso" isOpen={open} onClose={setClose}>
               <CustomTable
                  data={segData}
                  paginate={[10, 100]}
                  columns={[
                     {
                        field: "nombre",
                        headerName: "Usuario"
                     },
                     {
                        field: "proceso",
                        headerName: "proceso"
                     },
                     {
                        field: "estatus",
                        headerName: "Estado"
                     },

                     {
                        field: "created_at",
                        headerName: "Fecha",
                        renderField: (v) => <>{formatDatetime(v, true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)}</>
                     }
                  ]}
               />
            </CustomModal>
         )}
         <PermissionRoute requiredPermission={["multas_ver", "juzgados_ver", "transito_vialidad__ver", "seguridad_publica_ver"]}>
            <div className="absolute z-20 right-4 bottom-4">
               <PermissionRoute requiredPermission={["multas_crear", "juzgados_crear", "transito_vialidad__crear", "seguridad_publica_crear"]}>
                  <FloatingActionButton onClick={() => setUiState((prev) => ({ ...prev, open: true }))} icon={<FaPlus />} color="primary" size="normal" />
               </PermissionRoute>
            </div>

            <CustomTable
               conditionExcel={["multas_exportar", "transito_vialidad__exportar"]}
               headerActions={() => (
                  <>
                     {section == "penaltie" && (
                        <>
                           <PermissionRoute requiredPermission={"multas_crear"}>
                              <Tooltip content="Agregar multa">
                                 <CustomButton
                                    onClick={() => {
                                       resetInitialValues("penaltie");
                                       setUiState((prev) => ({
                                          ...prev,
                                          open: true,
                                          activeStep: 0
                                       }));
                                    }}
                                 >
                                    <VscDiffAdded />
                                 </CustomButton>
                              </Tooltip>
                           </PermissionRoute>
                           <Tooltip content="Refrescar">
                              <CustomButton color="purple" onClick={() => loadData(section)}>
                                 <LuRefreshCcw />
                              </CustomButton>
                           </Tooltip>
                        </>
                     )}
                  </>
               )}
               data={data as Penalties[]}
               paginate={[5, 10, 25, 50]}
               loading={loading}
               columns={[
                  { field: "id", headerName: "Folio", visibility: "always" },
                  {
                     field: "images_evidences",
                     priority: 1,
                     headerName: "Foto  ciudadano",
                     visibility: "always",
                     renderField: (value) => <PhotoZoom src={value} alt={value} />
                  },
                  { field: "name", headerName: "Nombre del detenido", visibility: "always" },
                  { field: "detainee_released_to", headerName: "Persona que acudió", visibility: "always" },
                  {
                     field: "image_penaltie",
                     visibility: "expanded",
                     headerName: "Foto Multa",
                     renderField: (value) => <PhotoZoom src={value} alt={value} />
                  },
                  { field: "doctor", headerName: "Doctor", visibility: "expanded" },
                  { field: "cedula", headerName: "Cédula del doctor", visibility: "expanded" },
                  {
                     field: "time",
                     headerName: "Hora",
                     visibility: "always",
                     renderField: (v) => <>{formatDatetime(`2025-01-01 ${v}`, true, DateFormat.H_MM_SS_A)}</>,
                     getFilterValue: (v) => formatDatetime(`2025-01-01 ${v}`, true, DateFormat.H_MM_SS_A)
                  },

                  { field: "person_contraloria", headerName: "Contraloría", visibility: "expanded" },
                  { field: "oficial_payroll", headerName: "Nómina Oficial", visibility: "expanded" },
                  { field: "person_oficial", headerName: "Oficial", visibility: "expanded" },
                  { field: "vehicle_service_type", headerName: "Tipo de Servicio Vehicular", visibility: "expanded" },
                  { field: "alcohol_concentration", headerName: "Concentración Alcohol", visibility: "expanded" },
                  { field: "group", headerName: "Grupo", visibility: "expanded" },
                  { field: "municipal_police", headerName: "Policía Municipal", visibility: "expanded" },
                  { field: "civil_protection", headerName: "Protección Civil", visibility: "expanded" },
                  { field: "command_vehicle", headerName: "Vehículo Comando", visibility: "expanded" },
                  { field: "command_troops", headerName: "Tropa Comando", visibility: "expanded" },
                  { field: "command_details", headerName: "Detalles Comando", visibility: "expanded" },
                  { field: "filter_supervisor", headerName: "Supervisor Filtro", visibility: "expanded" },
                  { field: "cp", headerName: "Código Postal", visibility: "always" },
                  { field: "city", headerName: "Ciudad", visibility: "always" },
                  ...(section == "general"
                     ? [
                          {
                             field: "current_process_id",
                             headerName: "Progreso",
                             renderField: (v) => {
                                const configs = {
                                   1: { short: "Contraloría", full: "Contraloría", color: "bg-red-100 text-red-800" },
                                   2: { short: "Tránsito", full: "Tránsito y Vialidad", color: "bg-amber-100 text-amber-800" },
                                   3: { short: "Seguridad", full: "Seguridad Pública", color: "bg-blue-100 text-blue-800" },
                                   4: { short: "Juzgados", full: "Juzgados", color: "bg-purple-100 text-purple-800" }
                                };

                                const config = configs[v] || { short: "N/A", full: "Desconocido", color: "bg-gray-100 text-gray-800" };

                                return (
                                   <div className="group relative inline-block">
                                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${config.color} cursor-help`}>{config.short}</span>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                         {config.full}
                                         <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                   </div>
                                );
                             }
                          }
                       ]
                     : []),
                  {
                     field: "finish",
                     headerName: "Estado",
                     visibility: "always",
                     renderField: (field) => (
                        <span
                           style={{
                              color: field === 1 ? "green" : "orange",
                              fontWeight: "bold",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px"
                           }}
                        >
                           {field === 1 ? (
                              <>
                                 <span style={{ fontSize: "12px" }}>✓</span>
                                 Terminado
                              </>
                           ) : (
                              <>
                                 <span style={{ fontSize: "12px" }}>●</span>
                                 Pendiente
                              </>
                           )}
                        </span>
                     )
                  },

                  { field: "age", headerName: "Edad", visibility: "expanded" },
                  { field: "amountAlcohol", headerName: "Cantidad Alcohol", visibility: "expanded" },
                  { field: "number_of_passengers", headerName: "Número de Pasajeros", visibility: "expanded" },
                  { field: "plate_number", headerName: "Número de Placa", visibility: "expanded" },
                  { field: "detainee_phone_number", headerName: "Teléfono del Detenido", visibility: "expanded" },
                  { field: "curp", headerName: "CURP", visibility: "expanded" },
                  { field: "observations", headerName: "Observaciones", visibility: "expanded" },
                  { field: "created_by_name", headerName: "Creado Por", visibility: "expanded" },
                  {
                     field: "active",
                     headerName: "Activo",
                     visibility: "expanded",
                     renderField: (v) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        </span>
                     )
                  }
               ]}
               actions={(row) => <>{typeData(section, row)}</>}
               mobileConfig={{
                  swipeActions: {
                     left: [
                        {
                           icon: <VscDebugContinueSmall size={18} />,
                           color: "bg-green-200",
                           action: (row) => {
                              if (row.finish == 1) {
                                 showToast("Lo sentimos ya no se puede editar");
                                 return;
                              }
                              setUiState((prev) => ({
                                 ...prev,
                                 open: true,
                                 activeStep: 0
                              }));
                              handleEdit(row);
                           },
                           hasPermission: permissionMovilContinue(section)
                        }
                     ]
                  },
                  bottomSheet: {
                     height: 100,
                     showCloseButton: true,
                     builder: (user, onClose) => <CustomDataDisplay data={user} config={penalizacionesMovilView} />
                  }
               }}
            />
         </PermissionRoute>
      </>
   );
};

export default TableAlcoholCases;
