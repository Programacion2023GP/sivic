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
import { Dispatch, ReactNode, SetStateAction } from "react";
import { Traffic } from "../../../domain/models/traffic/traffic";
import { Public_Securrity } from "../../../domain/models/security/security";

type section  ="penaltie"|"traffic"
interface AlcoholProps {
   setUiState?: (callback: (prev: any) => any) => void;
   resetInitialValues?: (type: string) => void;
   handleEdit?: (row: {}) => void;
   data: Penalties[] | Court[] | Traffic[] | Public_Securrity[],
   loading?: boolean;
   loadData?: (type: string) => void;
   section:section
   setHistory?: Dispatch<SetStateAction<{ open: boolean; idSearch: number }>>;
   buttons?:ReactNode,
}



const TableAlcoholCases = ({ loadData, resetInitialValues, setUiState, buttons,setHistory,handleEdit,data,loading,section }: AlcoholProps) => {


const typeData = (section: section, row: Penalties): ReactNode => {
   switch (section) {
      case "penaltie":
         return (
            <>
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

                     <PermissionRoute requiredPermission={"multas_actualizar"}>
                        <Tooltip content="Editar">
                           <CustomButton
                              size="sm"
                              color="yellow"
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
                              <CiEdit />
                           </CustomButton>
                        </Tooltip>
                     </PermissionRoute>
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
               ):null}
            </>
         );

      case "traffic":
         // Aquí deberías retornar JSX para el caso "traffic"
         return (
            <>
               <PermissionRoute requiredPermission={"multas_actualizar"}>
                  <Tooltip content="Editar">
                     <CustomButton
                        size="sm"
                        color="yellow"
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
                        <CiEdit />
                     </CustomButton>
                  </Tooltip>
               </PermissionRoute>
            </>
         );

      default:
         return null;
   }
};
   return (
      <PermissionRoute requiredPermission={"multas_ver"}>
         <div className="absolute z-20 right-4 bottom-4">
            <PermissionRoute requiredPermission={"multas_crear"}>
               <FloatingActionButton onClick={() => setUiState((prev) => ({ ...prev, open: true }))} icon={<FaPlus />} color="primary" size="normal" />
            </PermissionRoute>
         </div>

         <CustomTable
            conditionExcel={"multas_exportar"}
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
               { field: "name", headerName: "Nombre del detenido", visibility: "always" },
               { field: "detainee_released_to", headerName: "Persona que acudió", visibility: "always" },
               {
                  field: "image_penaltie",
                  visibility: "expanded",
                  headerName: "Foto Multa",
                  renderField: (value) => <PhotoZoom src={value} alt={value} />
               },
               {
                  field: "images_evidences",
                  headerName: "Foto evidencia del ciudadano",
                  visibility: "expanded",
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
                  renderField: (v) => (
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {v ? "Activo" : "Desactivado"}
                     </span>
                  )
               }
            ]}
            actions={(row) => <>{typeData(section, row)}</>}
         />
      </PermissionRoute>
   );
};

export default TableAlcoholCases;
