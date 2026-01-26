import { useEffect, useMemo } from "react";
import { useGenericStore } from "../../../store/generic/generic.store";
import { Court } from "../../../domain/models/courts/courts.model";
import { GenericApi } from "../../../infrastructure/generic/infra.generic";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { FormikAutocomplete, FormikImageInput, FormikInput, FormikNativeTimeInput } from "../../formik/FormikInputs/FormikInput";
import { causeOfDetention } from "../../../domain/models/causeofdetention/cause_of_detention";
import * as Yup from "yup";
import { FloatingActionButton } from "../../components/movil/button/custombuttommovil";
import { FaPlus, FaTrash } from "react-icons/fa";
import CustomTable from "../../components/table/customtable";
import { PermissionRoute } from "../../../App";
import { CustomButton } from "../../components/button/custombuttom";
import { VscDiffAdded } from "react-icons/vsc";
import { LuRefreshCcw } from "react-icons/lu";
import { CiEdit } from "react-icons/ci";
import { showConfirmationAlert, showToast } from "../../../sweetalert/Sweetalert";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { DateFormat, formatDatetime } from "../../../utils/formats";
import PhotoZoom from "../../components/images/images";
import { Senders } from "../../../domain/models/senders/senders.model";
import CustomDataDisplay from "../../components/movil/view/customviewmovil";
import { juzgadosMovilView } from "./infomovilcourts";

const PageCourt = () => {
const now = new Date();
const getLocalDateTime = () => {
   const now = new Date();

   // Ajustar por la diferencia de zona horaria
   const timezoneOffset = now.getTimezoneOffset() * 60000; // en milisegundos
   const localTime = new Date(now.getTime() - timezoneOffset);

   return localTime.toISOString().slice(0, 16);
};
   const useCourts = useMemo(
      () =>
         useGenericStore<Court>({
            id: 0,
            date: new Date().toISOString().split("T")[0], // "2024-01-15"
            referring_agency: "",
            detainee_name: "",
            detention_reason: "",
            entry_time: now.toLocaleTimeString("en-US", {
               hour: "2-digit",
               minute: "2-digit",
               hour12: false
            }),
            exit_datetime: getLocalDateTime(),
            exit_reason: "",
            fine_amount: 0,
            image_court: "",
            created_at: "",
            updated_at: ""
         }),
      []
   );
   const useMotives = useMemo(
      () =>
         useGenericStore<causeOfDetention>({
            id: 0,
            name: "",
            active: false
         }),
      []
   );
   const useSenders = useMemo(
      () =>
         useGenericStore<Senders>({
            id: 0,
            name: "",
            active: false
         }),
      []
   );

   const validationSchema = Yup.object({
      date: Yup.date().required("La fecha es requerida"),
      referring_agency: Yup.string().required("El remitente es requerido"),
      detainee_name: Yup.string().required("El nombre del detenido es requerido"),
      detention_reason: Yup.string().required("El motivo de detención es requerido"),
      image_court: Yup.string().required("El campo es requerido")
   });
   const responsive = {
      "2xl": 12,
      xl: 12,
      lg: 12,
      md: 12,
      sm: 12
   };

   const { fetchData, items, loading, setPrefix, request, open, setOpen, initialValues, postItem, removeItemData, handleChangeItem } = useCourts();
   const senders = useSenders();
   const motives = useMotives();

   const CourtApi = new GenericApi<Court>();
   const SendersApi = new GenericApi<Senders>();
   const MotivesApi = new GenericApi<causeOfDetention>();

   useEffect(() => {
      setPrefix("court");
      senders.setPrefix("sender");
      motives.setPrefix("causeOfDetention");
      senders.fetchData(SendersApi);
      motives.fetchData(MotivesApi);
      fetchData(CourtApi);
   }, []);
   return (
      <CompositePage
         formDirection="modal"
         onClose={setOpen}
         isOpen={open}
         modalTitle="Motivo de detención"
         // tableDirection="izq"
         form={() => (
            <div className="pt-4">
               {/* <Typography variant="h2" className="mb-2" size="lg" >Dependencia</Typography> */}
               <FormikForm
                  buttonLoading={loading}
                  validationSchema={validationSchema}
                  buttonMessage={initialValues.id > 0 ? "Actualizar" : "Registrar"}
                  initialValues={initialValues}
                  children={() => (
                     <>
                        <FormikInput type="date" name="date" label="Fecha" />

                        {/* <FormikInput name="referring_agency" disabled={disabled} label="Remite" /> */}
                        <FormikAutocomplete label="Remitente" name="referring_agency" options={senders.items} idKey="id" labelKey="name" loading={senders.loading} />

                        <FormikInput name="detainee_name" label="Nombre del detenido" />
                        <FormikAutocomplete
                           label="Motivo de detención"
                           name="detention_reason"
                           options={motives.items}
                           idKey="id"
                           labelKey="name"
                           loading={motives.loading}
                        />
                        <FormikNativeTimeInput name="entry_time" label="Hora de entrada" />
                        <FormikInput type="datetime-local" name="exit_datetime" label="Hora y Fecha de salida" />
                        <FormikInput name="exit_reason" label="Causa de salida" />

                        <FormikInput name="fine_amount" label="Multa" type="number" />
                        <FormikImageInput name="image_court" maxFiles={1} label="Multa" />
                     </>
                  )}
                  onSubmit={(values) => {
                     postItem(values as Court, CourtApi, true);
                  }}
               />
            </div>
         )}
         table={() => (
            <>
               <div className="absolute z-20 right-2 bottom-2">
                  <FloatingActionButton
                     onClick={() => {
                        setOpen();
                     }}
                     icon={<FaPlus />}
                     color="primary"
                     size="normal"
                  />
               </div>
               <CustomTable
                  headerActions={() => (
                     <>
                        <PermissionRoute requiredPermission={"juzgados_crear"}>
                           <CustomButton onClick={setOpen}>
                              {" "}
                              <VscDiffAdded />
                           </CustomButton>
                        </PermissionRoute>

                        <CustomButton
                           color="purple"
                           onClick={() => {
                              fetchData(CourtApi);
                           }}
                        >
                           {" "}
                           <LuRefreshCcw />
                        </CustomButton>
                     </>
                  )}
                  data={items}
                  paginate={[10, 25, 50]}
                  conditionExcel={"juzgados_exportar"}
                  loading={loading}
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
                        field: "image_court",
                        visibility: "expanded",
                        headerName: "Foto Multa",
                        renderField: (value) => <PhotoZoom src={String(value)} alt={String(value)} />
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
                        visibility: "expanded",
                        headerName: "Causa de salida"
                     },
                     {
                        visibility: "expanded",

                        field: "fine_amount",
                        headerName: "Multa"
                     }
                  ]}
                  actions={(row) => (
                     <>
                        <PermissionRoute requiredPermission={"juzgados_actualizar"}>
                           <CustomButton
                              size="sm"
                              color="yellow"
                              onClick={() => {
                                 setOpen();
                                 handleChangeItem(row);
                              }}
                           >
                              {" "}
                              <CiEdit />
                           </CustomButton>
                        </PermissionRoute>
                        <PermissionRoute requiredPermission={"juzgados_eliminar"}>
                           <CustomButton
                              size="sm"
                              color="red"
                              onClick={() => {
                                 showConfirmationAlert(`Eliminar `, { text: "Se eliminara el motivo de detención" }).then((isConfirmed) => {
                                    if (isConfirmed) {
                                       removeItemData(row, CourtApi);
                                    } else {
                                       showToast("La acción fue cancelada.", "error");
                                    }
                                 });
                              }}
                           >
                              {" "}
                              <FaTrash />
                           </CustomButton>
                        </PermissionRoute>
                     </>
                  )}
                  mobileConfig={{
                     listTile: {
                        leading: (user) => (
                           <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-red-500 rounded-full">
                              {user.detainee_name?.charAt(0) || "P"}
                           </div>
                        ),
                        title: (user) => <span className="font-semibold">{user.detainee_name || "Sin nombre"}</span>
                        // subtitle: (penalty) => <span className="text-gray-600">{penalty.description || "Sin descripción"}</span>
                     },

                     swipeActions: {
                        left: [
                           {
                              icon: <FiTrash2 size={18} />,
                              color: "bg-red-500",
                              action: (row) => {
                                 showConfirmationAlert(`Eliminar`, { text: "Se eliminará el motivo de detención" }).then((isConfirmed) => {
                                    if (isConfirmed) {
                                       removeItemData(row, CourtApi);
                                    } else {
                                       showToast("La acción fue cancelada.", "error");
                                    }
                                 });
                              },
                              hasPermission: "juzgados_eliminar"
                           }
                        ],
                        right: [
                           {
                              icon: <FiEdit size={18} />,
                              color: "bg-blue-500",
                              action: (row) => {
                                 setOpen();
                                 handleChangeItem(row);
                              },
                              hasPermission: "juzgados_actualizar"
                           }
                        ]
                     },
                      bottomSheet: {
                         height: 100,
                         showCloseButton: true,
                         builder: (row, onClose) => <CustomDataDisplay data={row} config={juzgadosMovilView} />
                      }
                  }}
               />
            </>
         )}
      />
   );
};
export default PageCourt;
