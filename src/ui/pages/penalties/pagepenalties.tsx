import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useFormikContext, type FormikProps, type FormikValues } from "formik";
import { usePenaltiesStore } from "../../../store/penalties/penalties.store";
import * as Yup from "yup";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { FormikAutocomplete, FormikImageInput, FormikInput, FormikNativeTimeInput, FormikRadio, FormikTextArea } from "../../formik/FormikInputs/FormikInput";
import { CustomButton } from "../../components/button/custombuttom";
import { PenaltiesApi } from "../../../infrastructure/penalties/penalties.infra";
import type { Penalties } from "../../../domain/models/penalties/penalties.model";
import CustomTable from "../../components/table/customtable";
import { VscDiffAdded } from "react-icons/vsc";
import { LuRefreshCcw } from "react-icons/lu";
import { CiEdit } from "react-icons/ci";
import { showConfirmationAlert, showToast } from "../../../sweetalert/Sweetalert";
import { FaPlus, FaRegFilePdf, FaTrash } from "react-icons/fa";
import { PermissionRoute } from "../../../App";
import PhotoZoom from "../../components/images/images";
import Spinner from "../../components/loading/loading";
import CustomModal from "../../components/modal/modal";
import { TbReportSearch } from "react-icons/tb";
import Tooltip from "../../components/toltip/Toltip";
import { useDoctorStore } from "../../../store/doctor/doctor.store";
import { DoctorApi } from "../../../infrastructure/doctor/doctor.infra";
import PdfPreview from "../../components/pdfview/pdfview";
import MultaPDF from "../courts/pdf/pdfpenalties";
import { FiEdit, FiMoreVertical, FiTrash, FiTrash2 } from "react-icons/fi";
import { ArrowDownToDotIcon } from "lucide-react";
import CustomDataDisplay from "../../components/movil/view/customviewmovil";
import { penaltyDisplayConfig } from "./model";
import { FloatingActionButton } from "../../components/movil/button/custombuttommovil";
import { DateFormat, formatDatetime } from "../../../utils/formats";
import { useWindowSize } from "../../../hooks/windossize";
import LocationButton from "../../components/locationbutton/LocationButton";
// -----------------------------
// Tipos y Constantes
// -----------------------------
type FormSectionProps = {
   title?: string;
   children: React.ReactNode;
};

type StepperProps = {
   steps: string[];
   activeStep: number;
   setActiveStep: (i: number) => void;
};

// Mapeo de campos por step
const FIELDS_BY_STEP: Record<number, string[]> = {
   0: ["time", "date"],
   1: ["person_contraloria", "oficial_payroll", "person_oficial", "vehicle_service_type", "alcohol_concentration", "group"],
   2: ["municipal_police", "civil_protection"],
   3: ["command_vehicle", "command_troops", "command_details", "filter_supervisor"],
   4: ["name", "cp", "city", "age", "amountAlcohol", "number_of_passengers", "plate_number", "detainee_phone_number", "curp", "observations"],
   5: ["image_penaltie", "images_evidences", "images_evidences_car"]
};

const RESPONSIVE_CONFIG = { "2xl": 6, xl: 6, lg: 12, md: 12, sm: 12 };

// -----------------------------
// Componentes auxiliares
// -----------------------------
const FormSection = ({ title, children }: FormSectionProps) => (
   <div className="relative w-full mb-8 bg-white rounded-xl">
      {title && <h3 className="mb-4 text-lg font-bold text-gray-800">{title}</h3>}
      {children}
   </div>
);

const Stepper = ({ steps, activeStep, setActiveStep }: StepperProps) => {
   const { errors, touched } = useFormikContext<any>();

   // Verificar si un step tiene errores
   const hasStepError = useCallback(
      (stepIndex: number) => {
         const fields = FIELDS_BY_STEP[stepIndex] || [];
         return fields.some((field) => touched[field] && errors[field]);
      },
      [errors, touched]
   );

   return (
      <div className="w-full p-6 mb-8 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
         <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
            {steps.map((step, i) => {
               const isActive = activeStep === i;
               const isCompleted = activeStep > i;
               const hasError = hasStepError(i);
               const isLast = i === steps.length - 1;

               return (
                  <div key={i} className="relative flex flex-col items-center flex-1 text-center">
                     {/* Línea de conexión */}
                     {!isLast && (
                        <div
                           className={`absolute top-[18px] left-[50%] w-full h-[3px] transition-all duration-500 ease-out z-0
                              ${isCompleted && !hasError ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gray-300"}
                           `}
                        />
                     )}

                     {/* Círculo del step */}
                     <div
                        className={`z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold text-base 
                           shadow-lg transition-all duration-300 ease-out transform
                           ${
                              isActive
                                 ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white scale-125 shadow-blue-400/50 ring-4 ring-blue-200"
                                 : isCompleted && !hasError
                                 ? "bg-gradient-to-br from-green-400 to-green-600 text-white scale-110 shadow-green-400/50"
                                 : hasError
                                 ? "bg-gradient-to-br from-red-400 to-red-600 text-white scale-105 shadow-red-400/50 ring-2 ring-red-300"
                                 : "bg-white text-gray-500 border-2 border-gray-300 hover:border-gray-400"
                           }
                        `}
                     >
                        {isCompleted && !hasError ? (
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                 clipRule="evenodd"
                              />
                           </svg>
                        ) : hasError ? (
                           <span className="text-xl">!</span>
                        ) : (
                           <span>{i + 1}</span>
                        )}
                     </div>

                     {/* Texto del step */}
                     <p
                        className={`mt-3 text-xs sm:text-sm font-semibold leading-tight max-w-[100px] transition-colors duration-300
                           ${isActive ? "text-blue-700" : isCompleted && !hasError ? "text-green-700" : hasError ? "text-red-600" : "text-gray-500"}
                        `}
                     >
                        {step}
                     </p>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

// -----------------------------
// Componente principal
// -----------------------------
const PagePenalities = () => {
   const {
      initialValues,
      postPenaltie,
      open,
      setOpen,
      fetchPenalties,
      penalties,
      history,
      loading,
      handleChangePenaltie,
      removePenaltie,
      resetInitialValues,
      showHistoryCurp,
      openHistory,
      setOpenHistory
   } = usePenaltiesStore();
   const { doctor, fetchDoctor, loading: doctorLoading } = useDoctorStore();
   const api = useMemo(() => new PenaltiesApi(), []);
   const apiDoc = useMemo(() => new DoctorApi(), []);

   const { width: windowWidth } = useWindowSize();
   const isMobile = windowWidth < 1024;

   const [activeStep, setActiveStep] = useState(0);
   const formikRef = useRef<FormikProps<FormikValues>>(null);
   const [pdfPenalties, setPdfPenalties] = useState({
      open: false,
      data: {}
   });
   const steps = useMemo(() => ["Fecha", "Información del personal", "Personal operativo", "Mando Único", "Datos del detenido", "Evidencias"], []);

   // Estados para datos externos
   const [citys, setCity] = useState({ loading: false, citys: [] });
   const [contraloria, setContraloria] = useState({ loading: false, employes: [] as any[], error: null as string | null });
   const [oficiales, setOficiales] = useState({ loading: false, employes: [] as any[], error: null as string | null });
   const [proteccionCivil, setProteccionCivil] = useState({ loading: false, employes: [] as any[], error: null as string | null });

   // -----------------------------
   // Validación Schema
   // -----------------------------
   const validationSchema = useMemo(
      () =>
         Yup.object({
            // Paso 0
            // time: Yup.string().required("La hora es obligatoria"),
            // date: Yup.string().required("La fecha es obligatoria"),
            // // Paso 1
            // person_contraloria: Yup.string().required("Campo obligatorio"),
            // oficial_payroll: Yup.string().required("Campo obligatorio"),
            // person_oficial: Yup.string().required("Campo obligatorio"),
            // vehicle_service_type: Yup.string().required("El tipo de servicio es obligatorio"),
            // // alcohol_concentration: Yup.number().typeError("Debe ser un número").required("Campo obligatorio").min(1, "Debe ser mínimo 1"),
            // group: Yup.number().typeError("Debe ser un número").required("Campo obligatorio").min(1, "Debe ser mínimo 1"),
            // // Paso 2
            // // municipal_police: Yup.string().required("Campo obligatorio"),
            // // civil_protection: Yup.string().required("Campo obligatorio"),
            // // Paso 3 - Opcional
            // command_vehicle: Yup.string().nullable(),
            // command_troops: Yup.string().nullable(),
            // command_details: Yup.string().nullable(),
            // filter_supervisor: Yup.string().nullable(),
            // // Paso 4
            // name: Yup.string().required("El nombre es obligatorio"),
            // cp: Yup.string()
            //    .required("El código postal es obligatorio")
            //    .matches(/^\d{5}$/, "Debe tener 5 dígitos"),
            // city: Yup.string().required("La colonia es obligatoria"),
            // age: Yup.number()
            //    .typeError("Debe ser un número")
            //    .required("La edad es obligatoria")
            //    .positive("Debe ser un número positivo")
            //    .integer("Debe ser un número entero")
            //    .min(1, "Debe ser mínimo 1"),
            // amountAlcohol: Yup.number().typeError("Debe ser un número").required("Campo obligatorio").min(0, "No puede ser negativo"),
            // number_of_passengers: Yup.number().typeError("Debe ser un número").required("Campo obligatorio").min(0, "No puede ser negativo"),
            // plate_number: Yup.string().required("El número de placa es obligatorio"),
            // detainee_phone_number: Yup.string()
            //    .required("El teléfono es obligatorio")
            //    .matches(/^[0-9]{10}$/, "Debe tener 10 dígitos"),
            // curp: Yup.string().required("El CURP es obligatorio").length(18, "Debe tener 18 caracteres"),
            // observations: Yup.string().nullable()
         }),
      []
   );

   // -----------------------------
   // Fetch data logic (Optimizado)
   // -----------------------------
   const fetchData = useCallback(async (url: string) => {
      try {
         const res = await window.fetch(`${import.meta.env.VITE_API_EMPLOYES}/${url}`);
         if (!res.ok) throw new Error("Error al obtener datos");
         const data = await res.json();
         return data;
      } catch (error: any) {
         throw new Error(error.message || "Error desconocido");
      }
   }, []);

   const initContraloria = useCallback(async () => {
      setContraloria({ loading: true, employes: [], error: null });
      try {
         const data = await fetchData("controlaloria");
         setContraloria({ loading: false, employes: data?.data?.result || [], error: null });
      } catch (error: any) {
         setContraloria({ loading: false, employes: [], error: error.message });
      }
   }, [fetchData]);

   const initOficiales = useCallback(async () => {
      setOficiales({ loading: true, employes: [], error: null });
      try {
         const data = await fetchData("transitovialidad");
         setOficiales({ loading: false, employes: data?.data?.result || [], error: null });
      } catch (error: any) {
         setOficiales({ loading: false, employes: [], error: error.message });
      }
   }, [fetchData]);

   const initProteccionCivil = useCallback(async () => {
      setProteccionCivil({ loading: true, employes: [], error: null });
      try {
         const data = await fetchData("proteccioncivil");
         setProteccionCivil({ loading: false, employes: data?.data?.result || [], error: null });
      } catch (error: any) {
         setProteccionCivil({ loading: false, employes: [], error: error.message });
      }
   }, [fetchData]);

   useEffect(() => {
      fetchPenalties(api);
      fetchDoctor(apiDoc);
      initContraloria();
      initOficiales();
      initProteccionCivil();
   }, []);

   // -----------------------------
   // Handlers optimizados
   // -----------------------------
   const handleCp = useCallback(
      async (values: Record<string, any>, setFieldValue?: (field: string, value: any) => void) => {
         const cpNumber = Number(values?.cp);
         if (!isNaN(cpNumber) && cpNumber > 9999) {
            try {
               setCity({ loading: true, citys: [] });
               const res: Response = await window.fetch(`${import.meta.env.VITE_API_URLCODIGOSPOSTALES}${cpNumber}`);
               if (!res.ok) throw new Error("Error");

               const data = await res.json();
               const result = data?.data?.result || [];

               // Manejar selección de colonia para edición
               if (Number(values.id) > 0) {
                  let selectedColony;

                  if (typeof values.city === "number") {
                     selectedColony = result.find((it: { id: number }) => it.id === values.city);
                  } else if (typeof values.city === "string") {
                     selectedColony = result.find((it: { Colonia: string }) => it.Colonia === values.city);
                  }

                  if (selectedColony) {
                     values.city = selectedColony.id;
                     await handleChangePenaltie(values as Penalties, formikRef.current?.setFieldValue);
                  }
               }

               setCity({ loading: false, citys: result });
            } catch {
               setCity({ loading: false, citys: [] });
            }
         }
      },
      [handleChangePenaltie]
   );

   const handleOficialChange = useCallback(
      (field: string, value: any) => {
         if (formikRef.current) {
            const oficialSeleccionado = oficiales.employes.find((oficial) => oficial.value == value);
            if (oficialSeleccionado) {
               formikRef.current.setFieldValue("oficial_payroll", oficialSeleccionado.codigoEmpleado);
               formikRef.current.setFieldValue("person_oficial", value);
            }
         }
      },
      [oficiales.employes]
   );
   const handleProteccionCivilChange = useCallback(
      (field: string, value: any) => {
         if (formikRef.current) {
            const proteccionCivilSeleccionado = proteccionCivil.employes.find((proteccionCivil) => proteccionCivil.value == value);
            if (proteccionCivilSeleccionado) {
               formikRef.current.setFieldValue("proteccionCivil_payroll", proteccionCivilSeleccionado.codigoEmpleado);
               formikRef.current.setFieldValue("person_oficial", value);
            }
         }
      },
      [proteccionCivil.employes]
   );

   const handleStepNavigation = useCallback((direction: "next" | "prev") => {
      setActiveStep((prev) => (direction === "next" ? prev + 1 : prev - 1));
   }, []);

   const handleSubmit = useCallback(
      async (values: FormikValues) => {
         if (activeStep <= steps.length - 1) {
            handleStepNavigation("next");
         } else {
            await postPenaltie(values as Penalties, api);
            resetInitialValues();
            setActiveStep(0);
            setOpen();
         }
      },
      [activeStep, steps.length, postPenaltie, api, resetInitialValues, setOpen, handleStepNavigation]
   );

   const handleEdit = useCallback(
      (row: any) => {
         setActiveStep(0);
         handleCp(row, formikRef.current?.setFieldValue);
      },
      [handleCp]
   );

   const handleDelete = useCallback(
      (row: any) => {
         showConfirmationAlert(`Eliminar`, { text: "Se eliminará la multa" }).then((isConfirmed) => {
            if (isConfirmed) {
               removePenaltie(row, api);
            } else {
               showToast("La acción fue cancelada.", "error");
            }
         });
      },
      [removePenaltie, api]
   );
   const handleHistory = useCallback(
      (row: any) => {
         showHistoryCurp(row, api);
      },
      [removePenaltie, api]
   );
   // -----------------------------
   // Render del formulario
   // -----------------------------

   const renderStepContent = useCallback(() => {
      switch (activeStep) {
         case 0:
            return (
               <div className="space-y-4">
                  <FormikNativeTimeInput name="time" label="Hora" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput type="date" name="date" label="Fecha de Operativo" responsive={RESPONSIVE_CONFIG} />
               </div>
            );
         case 1:
            return (
               <div className="space-y-4">
                  <FormikAutocomplete
                     label="Persona de contraloría a cargo"
                     name="person_contraloria"
                     options={contraloria.employes}
                     loading={contraloria.loading}
                     responsive={RESPONSIVE_CONFIG}
                     idKey="value"
                     labelKey="text"
                     disabled
                  />
                  <FormikAutocomplete
                     label="Oficial"
                     name="person_oficial"
                     options={oficiales.employes}
                     loading={oficiales.loading}
                     responsive={RESPONSIVE_CONFIG}
                     idKey="value"
                     labelKey="text"
                     handleModified={handleOficialChange}
                  />
                  <FormikAutocomplete
                     label="Doctor"
                     name="doctor_id"
                     options={doctor}
                     loading={doctorLoading}
                     responsive={RESPONSIVE_CONFIG}
                     idKey="id"
                     labelKey="name"
                  />
                  <FormikInput responsive={RESPONSIVE_CONFIG} name="alcohol_concentration" label="Grado de alcohol" type="number" />
                  <FormikRadio
                     name="vehicle_service_type"
                     label="Tipo de servicio"
                     options={[
                        { id: "Servicio público", name: "Servicio público" },
                        { id: "Carga", name: "Carga" },
                        { id: "Particular", name: "Particular" }
                     ]}
                     responsive={RESPONSIVE_CONFIG}
                     idKey="id"
                     labelKey="name"
                  />
                  <FormikRadio
                     name="group"
                     label="Grupo"
                     options={[
                        { id: 1, name: "1" },
                        { id: 2, name: "2" }
                     ]}
                     responsive={RESPONSIVE_CONFIG}
                     idKey="id"
                     labelKey="name"
                  />
               </div>
            );
         case 2:
            return (
               <div className="space-y-4">
                  <FormikInput name="municipal_police" label="Policía Municipal" responsive={RESPONSIVE_CONFIG} />
                  <FormikAutocomplete
                     label="Protección Civil"
                     name="civil_protection"
                     options={proteccionCivil.employes}
                     loading={proteccionCivil.loading}
                     responsive={RESPONSIVE_CONFIG}
                     idKey="value"
                     labelKey="text"
                     // handleModified={handleProteccionCivilChange}
                  />
               </div>
            );
         case 3:
            return (
               <div className="space-y-4">
                  <FormikInput name="command_vehicle" label="Vehículo" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput name="command_troops" label="Tropas" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput name="command_details" label="Datos de Mando Único" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput name="filter_supervisor" label="Datos del Encargado del Filtro" responsive={RESPONSIVE_CONFIG} />
               </div>
            );
         case 4:
            return (
               <div className="space-y-4">
                  <FormikInput name="name" label="Nombre" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput name="cp" handleModified={handleCp} label="Código postal" responsive={RESPONSIVE_CONFIG} />
                  <FormikAutocomplete
                     label="Colonia"
                     name="city"
                     options={citys.citys}
                     loading={citys.loading}
                     responsive={RESPONSIVE_CONFIG}
                     idKey="Colonia"
                     labelKey="Colonia"
                  />
                  <FormikInput type="number" name="age" label="Edad" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput type="number" name="amountAlcohol" label="Cantidad de alcohol" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput type="number" name="number_of_passengers" label="Número de pasajeros" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput name="plate_number" label="Número de placa" responsive={RESPONSIVE_CONFIG} />

                  <FormikInput name="detainee_released_to" label="Nombre de la persona que acudio" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput name="detainee_phone_number" label="Teléfono del detenido" responsive={RESPONSIVE_CONFIG} />
                  <FormikInput name="curp" label="CURP" responsive={RESPONSIVE_CONFIG} />
                  <FormikTextArea name="observations" label="Observaciones" />
               </div>
            );
         case 5:
            return (
               <div className={`flex justify-between ${isMobile ? "flex-col" : ""} `}>
                  <FormikImageInput name="image_penaltie" maxFiles={1} label="Multa" />
                  <FormikImageInput name="images_evidences" maxFiles={1} label="Evidencia del ciudadano" />
                  <FormikImageInput name="images_evidences_car" maxFiles={1} label="Evidencia del vehículo" />
                  <LocationButton idNameLat="lat" idNameLng="lon" idNameUbi="ubication" />
               </div>
            );
         default:
            return null;
      }
   }, [activeStep, contraloria, oficiales, citys, handleCp, handleOficialChange]);

   return (
      <>
         {loading && <Spinner />}
         <CompositePage
            formDirection="modal"
            isOpen={open}
            modalTitle="Multa"
            onClose={setOpen}
            form={() => (
               <div className="relative w-full mt-1 mb-6">
                  <FormikForm
                     ref={formikRef}
                     validationSchema={validationSchema}
                     initialValues={initialValues}
                     onSubmit={(v) => {
                        activeStep == steps.length && handleSubmit(v);
                     }}
                  >
                     {() => (
                        <div className="w-full space-y-6">
                           {/* Stepper */}
                           <Stepper steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />

                           {/* Contenedor del contenido con animación */}
                           <div className="bg-white rounded-xl p-6 shadow-sm min-h-[400px] w-full">{renderStepContent()}</div>

                           {/* Botones de navegación */}
                           <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div className="text-sm text-gray-500">
                                 Paso {activeStep + 1} de {steps.length}
                              </div>
                              <div className="flex gap-3">
                                 {activeStep > 0 && (
                                    <CustomButton type="button" variant="secondary" size="md" color="cyan" onClick={() => handleStepNavigation("prev")}>
                                       ← Regresar
                                    </CustomButton>
                                 )}
                                 {activeStep < steps.length ? (
                                    <CustomButton type="button" onClick={() => handleStepNavigation("next")}>
                                       {activeStep < steps.length - 1 ? " Continuar →" : "✓ Registrar"}
                                    </CustomButton>
                                 ) : (
                                    <CustomButton type="submit">✓ Registrar</CustomButton>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}
                  </FormikForm>
               </div>
            )}
            table={() => (
               <PermissionRoute requiredPermission={"multas_ver"}>
                  <div className="absolute z-20 right-2 bottom-2">
                     <FloatingActionButton
                        onClick={() => {
                           resetInitialValues();
                           setActiveStep(0);
                           setOpen();
                        }}
                        icon={<FaPlus />}
                        color="primary"
                        size="normal"
                     />
                  </div>
                  <CustomTable
                     conditionExcel={"multas_exportar"}
                     headerActions={() => (
                        <>
                           <PermissionRoute requiredPermission={"multas_crear"}>
                              <Tooltip content="Agregar una multa">
                                 <CustomButton
                                    onClick={() => {
                                       resetInitialValues();
                                       setActiveStep(0);
                                       setOpen();
                                    }}
                                 >
                                    <VscDiffAdded />
                                 </CustomButton>
                              </Tooltip>
                           </PermissionRoute>
                           <Tooltip content="Refrescar la tabla">
                              <CustomButton color="purple" onClick={() => fetchPenalties(api)}>
                                 <LuRefreshCcw />
                              </CustomButton>
                           </Tooltip>
                        </>
                     )}
                     data={penalties}
                     paginate={[5, 10, 25, 50, 100, 500, 1000]}
                     loading={loading}
                     mobileConfig={{
                        listTile: {
                           leading: (penalty) => (
                              <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-red-500 rounded-full">
                                 {penalty.name?.charAt(0) || "P"}
                              </div>
                           ),
                           title: (penalty) => <span className="font-semibold">{penalty.name || "Sin nombre"}</span>,
                           subtitle: (penalty) => <span className="text-gray-600">{penalty.description || "Sin descripción"}</span>
                        },

                        swipeActions: {
                           left: [
                              {
                                 icon: <FiTrash2 size={18} />,
                                 color: "bg-red-500",
                                 action: (penalty) => removePenaltie(penalty, api)
                              }
                           ],
                           right: [
                              {
                                 icon: <FiEdit size={18} />,
                                 color: "bg-blue-500",
                                 action: (penalty) => handleChangePenaltie(penalty)
                              }
                           ]
                        },
                        bottomSheet: {
                           height: 100,
                           showCloseButton: true,
                           builder: (penalty, onClose) => <CustomDataDisplay data={penalty} config={penaltyDisplayConfig} />
                        }
                     }}
                     columns={[
                        { field: "id", headerName: "Folio" },
                        { field: "name", headerName: "Nombre" },
                        { field: "detainee_released_to", headerName: "Persona que acudio" },

                        { field: "image_penaltie", headerName: "Foto Multa", renderField: (value) => <PhotoZoom src={value} alt={value} /> },
                        { field: "images_evidences", headerName: "Foto evidencia del ciudadano", renderField: (value) => <PhotoZoom src={value} alt={value} /> },
                        { field: "images_evidences_car", headerName: "Foto evidencia del vehículo", renderField: (value) => <PhotoZoom src={value} alt={value} /> },
                        { field: "doctor", headerName: "Doctor" },
                        { field: "cedula", headerName: "Cedula del doctor" },

                        { field: "time", headerName: "Hora", renderField: (v) => <>{formatDatetime(`2025-01-01 ${v}`, true, DateFormat.H_MM_SS_A)}</> },
                        { field: "date", headerName: "Fecha", renderField: (v) => <>{formatDatetime(v, true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)}</> },
                        { field: "person_contraloria", headerName: "Contraloría" },
                        { field: "oficial_payroll", headerName: "Nómina Oficial" },
                        { field: "person_oficial", headerName: "Oficial" },
                        { field: "vehicle_service_type", headerName: "Tipo de Servicio Vehicular" },
                        { field: "alcohol_concentration", headerName: "Concentración Alcohol" },
                        { field: "group", headerName: "Grupo" },
                        { field: "municipal_police", headerName: "Policía Municipal" },
                        { field: "civil_protection", headerName: "Protección Civil" },
                        { field: "command_vehicle", headerName: "Vehículo Comando" },
                        { field: "command_troops", headerName: "Tropa Comando" },
                        { field: "command_details", headerName: "Detalles Comando" },
                        { field: "filter_supervisor", headerName: "Supervisor Filtro" },
                        { field: "cp", headerName: "Código Postal" },
                        { field: "city", headerName: "Ciudad" },
                        { field: "age", headerName: "Edad" },
                        { field: "amountAlcohol", headerName: "Cantidad Alcohol" },
                        { field: "number_of_passengers", headerName: "Número de Pasajeros" },
                        { field: "plate_number", headerName: "Número de Placa" },
                        { field: "detainee_phone_number", headerName: "Teléfono del Detenido" },
                        { field: "curp", headerName: "CURP" },
                        { field: "observations", headerName: "Observaciones" },
                        { field: "created_by_name", headerName: "Creado Por" }
                     ]}
                     actions={(row) => (
                        <>
                           <CustomButton
                              color="purple"
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                 setPdfPenalties({
                                    data: row,
                                    open: true
                                 });
                              }}
                           >
                              <FaRegFilePdf />
                           </CustomButton>

                           <PermissionRoute requiredPermission={"multas_historial"}>
                              {row.has_history ? (
                                 <Tooltip content="Historial de la persona">
                                    <CustomButton size="sm" color="purple" onClick={() => handleHistory(row)}>
                                       <TbReportSearch />
                                    </CustomButton>
                                 </Tooltip>
                              ) : null}
                           </PermissionRoute>
                           <PermissionRoute requiredPermission={"multas_actualizar"}>
                              <Tooltip content="Editar multa">
                                 <CustomButton size="sm" color="yellow" onClick={() => handleChangePenaltie(row)}>
                                    <CiEdit />
                                 </CustomButton>
                              </Tooltip>
                           </PermissionRoute>
                           <PermissionRoute requiredPermission={"multas_eliminar"}>
                              <Tooltip content="Eliminar la multa y sus antecedentes de la persona">
                                 <CustomButton size="sm" color="red" onClick={() => handleDelete(row)}>
                                    <FaTrash />
                                 </CustomButton>
                              </Tooltip>
                           </PermissionRoute>
                        </>
                     )}
                  />
               </PermissionRoute>
            )}
         />
         <CustomModal
            title={`HISTORIAL DE ${initialValues.name}`}
            isOpen={openHistory}
            onClose={setOpenHistory}
            children={
               <CustomTable
                  data={history}
                  paginate={[5, 10, 25, 50]}
                  loading={loading}
                  columns={[
                     { field: "id", headerName: "Folio" },
                     { field: "image_penaltie", headerName: "Foto Multa", renderField: (value) => <PhotoZoom src={value} alt={value} /> },
                     { field: "images_evidences", headerName: "Foto evidencia del ciudadano", renderField: (value) => <PhotoZoom src={value} alt={value} /> },
                     { field: "images_evidences_car", headerName: "Foto evidencia del vehículo", renderField: (value) => <PhotoZoom src={value} alt={value} /> },
                     { field: "time", headerName: "Hora" },
                     { field: "date", headerName: "Fecha" },
                     { field: "person_contraloria", headerName: "Contraloría" },
                     { field: "oficial_payroll", headerName: "Nómina Oficial" },
                     { field: "person_oficial", headerName: "Oficial" },
                     { field: "vehicle_service_type", headerName: "Tipo de Servicio Vehicular" },
                     { field: "alcohol_concentration", headerName: "Concentración Alcohol" },
                     { field: "group", headerName: "Grupo" },
                     { field: "municipal_police", headerName: "Policía Municipal" },
                     { field: "civil_protection", headerName: "Protección Civil" },
                     { field: "command_vehicle", headerName: "Vehículo Comando" },
                     { field: "command_troops", headerName: "Tropa Comando" },
                     { field: "command_details", headerName: "Detalles Comando" },
                     { field: "filter_supervisor", headerName: "Supervisor Filtro" },
                     { field: "name", headerName: "Nombre" },
                     { field: "cp", headerName: "Código Postal" },
                     { field: "city", headerName: "Ciudad" },
                     { field: "age", headerName: "Edad" },
                     { field: "amountAlcohol", headerName: "Cantidad Alcohol" },
                     { field: "number_of_passengers", headerName: "Número de Pasajeros" },
                     { field: "plate_number", headerName: "Número de Placa" },
                     { field: "detainee_phone_number", headerName: "Teléfono del Detenido" },
                     { field: "curp", headerName: "CURP" },
                     { field: "observations", headerName: "Observaciones" },
                     { field: "created_by", headerName: "Creado Por" }
                  ]}
               />
            }
         />
         <CustomModal
            isOpen={pdfPenalties.open}
            onClose={() => {
               setPdfPenalties({
                  data: {},
                  open: false
               });
            }}
         >
            <PdfPreview children={<MultaPDF data={pdfPenalties.data} />} name="OTRO" />
         </CustomModal>
      </>
   );
};

export default PagePenalities;
