import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { useFormikContext, type FormikProps, type FormikValues } from "formik";
import * as Yup from "yup";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { FormikAutocomplete, FormikImageInput, FormikInput, FormikNativeTimeInput, FormikRadio, FormikTextArea } from "../../formik/FormikInputs/FormikInput";
import { CustomButton } from "../../components/button/custombuttom";
import type { Penalties } from "../../../domain/models/penalties/penalties.model";
import { showConfirmationAlert, showToast } from "../../../sweetalert/Sweetalert";
import CustomModal from "../../components/modal/modal";
import PdfPreview from "../../components/pdfview/pdfview";
import MultaPDF from "../pdf/pdfpenalties";
import { useWindowSize } from "../../../hooks/windossize";
import LocationButton from "../../components/locationbutton/LocationButton";
import Typography from "../../components/typografy/Typografy";
import useEmployesData from "../../../hooks/employesdata";
import { useLocation } from "../../../hooks/localization";
import { useAlcohol } from "../../../hooks/alcohol.hook";
import { useDoctorStore } from "../../../store/doctor/doctor.store";
import { DoctorApi } from "../../../infrastructure/doctor/doctor.infra";
import { findMostSimilar } from "../../../utils/match";
import CustomHistoryCase from "../components/historycases";
import TableAlcoholCases from "../components/alcoholcases";


const Stepper = memo(({ steps, activeStep, setActiveStep }: { steps: string[]; activeStep: number; setActiveStep: (i: number) => void }) => {
   const { errors, touched } = useFormikContext<any>();

   const hasStepError = useMemo(() => {
      const stepFields: Record<number, string[]> = {
         0: ["init_date", "final_date"],
         1: ["time", "date", "person_oficial", "alcohol_concentration"],
         2: ["name", "cp", "city"]
      };

      return (stepIndex: number) => {
         const fields = stepFields[stepIndex] || [];
         return fields.some((field) => touched[field] && errors[field]);
      };
   }, [errors, touched]);

   return (
      <div className="w-full p-4 mb-6 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
         <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
            {steps.map((step, i) => {
               const isActive = activeStep === i;
               const isCompleted = activeStep > i;
               const hasError = hasStepError(i);
               const isLast = i === steps.length - 1;

               return (
                  <div key={i} className="relative flex flex-col items-center flex-1 text-center">
                     {!isLast && (
                        <div
                           className={`absolute top-[18px] left-[50%] w-full h-[3px] transition-all duration-500 ease-out z-0
                  ${isCompleted && !hasError ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gray-300"}`}
                        />
                     )}

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
                }`}
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

                     <p
                        className={`mt-3 text-xs sm:text-sm font-semibold leading-tight max-w-[100px] transition-colors duration-300
                ${isActive ? "text-blue-700" : isCompleted && !hasError ? "text-green-700" : hasError ? "text-red-600" : "text-gray-500"}`}
                     >
                        {step}
                     </p>
                  </div>
               );
            })}
         </div>
      </div>
   );
});

Stepper.displayName = "Stepper";

// -----------------------------
// Componente principal optimizado
// -----------------------------
const PagePenalities = ({section}:{section:string}) => {
   // Consolidar estados relacionados
   const [uiState, setUiState] = useState({
      open: false,
      activeStep: 0,
      pdfPenalties: { open: false, row: {} }
   });

   const [citys, setCity] = useState({ loading: false, citys: [] });
   const { location, address, getLocation, loading: LoadingCp } = useLocation();
   const [duplicate, setDuplicate] = useState<{
      duplicate: boolean;
      value: string;
   }>({
      duplicate: false,
      value: ""
   });
   const [history, setHistory] = useState<{open:boolean,idSearch:number}>({
      open: false,
      idSearch: null
   });
   // Hooks externos
   const { width: windowWidth } = useWindowSize();
   const isMobile = windowWidth < 1024;
   const { contraloria, oficiales, proteccionCivil } = useEmployesData();

   // Store principal
   const { data, loading, loadData, create, initialValues, editInitialValues, resetInitialValues, deleteRow, nextProccess } = useAlcohol();

   // Store doctor
   const { doctor, fetchDoctor, loading: doctorLoading } = useDoctorStore();
   const apiDoc = useMemo(() => new DoctorApi(), []);

   // Referencias
   const formikRef = useRef<FormikProps<FormikValues>>(null);

   // Valores memoizados
   const steps = useMemo(() => ["Configuración", "Detención", "Evidencias"], []);

   const RESPONSIVE_CONFIG = useMemo(
      () => ({
         "2xl": 6,
         xl: 6,
         lg: 12,
         md: 12,
         sm: 12
      }),
      []
   );

   const validationSchema = useMemo(
      () =>
         Yup.object({
            alcohol_concentration: Yup.number().typeError("Debe ser un número").required("Campo obligatorio").min(0.1, "Debe ser mínimo 0.1")
         }),
      []
   );

   // Memoizar datos del formulario
   const initialFormValues = useMemo(() => {
      return initialValues;
   }, [initialValues]);

   // -----------------------------
   // Handlers optimizados
   // -----------------------------
   const handleCp = useCallback(async (cpValue: string) => {
      const cpNumber = Number(cpValue);
      if (!isNaN(cpNumber) && cpNumber > 9999) {
         setCity({ loading: true, citys: [] });

         try {
            const res = await fetch(`${import.meta.env.VITE_API_URLCODIGOSPOSTALES}${cpNumber}`);
            if (!res.ok) throw new Error("Error en la petición");

            const data = await res.json();
            setCity({
               loading: false,
               citys: data?.data?.result || []
            });
         } catch {
            setCity({ loading: false, citys: [] });
         }
      }
   }, []);

   const handleOficialChange = useCallback(
      (name, value: any) => {
        
         if (formikRef.current) {
            const oficialSeleccionado = oficiales.employes?.find((oficial) => oficial.value == value);
            if (oficialSeleccionado) {
               formikRef.current.setFieldValue("oficial_payroll", oficialSeleccionado.codigoEmpleado);
               formikRef.current.setFieldValue("person_oficial", value);
            }
         }
      },
      [oficiales.employes]
   );

   const handleStepNavigation = useCallback((direction: "next" | "prev") => {
      setUiState((prev) => ({
         ...prev,
         activeStep: direction === "next" ? prev.activeStep + 1 : prev.activeStep - 1
      }));
   }, []);

   const handleSubmit = useCallback(
      async (values: FormikValues) => {
         if (uiState.activeStep < steps.length - 1) {
            handleStepNavigation("next");
            return;
         }

         try {
            await create(values as Penalties);
            setDuplicate({
               duplicate: false,
               value: null
            });
            setUiState((prev) => ({
               ...prev,
               open: false,
               activeStep: 0
            }));

            // Recargar datos después de crear
            await loadData("penaltie");
         } catch (error) {
            console.error("Error al crear multa:", error);
            showToast("Error al crear la multa", "error");
         }
      },
      [uiState.activeStep, steps.length, create, loadData, handleStepNavigation]
   );

   const handleDelete = useCallback((row: any) => {
      showConfirmationAlert(`Eliminar`, {
         text: "Se eliminará la multa"
      }).then((isConfirmed) => {
         if (isConfirmed) {
            deleteRow(row);
         } else {
            showToast("La acción fue cancelada.", "error");
         }
      });
   }, []);
const handleNext = useCallback((row: any) => {
   showConfirmationAlert(`Continuar`, {
      text: "Al aceptar, se dará continuidad a su proceso."
   }).then((isConfirmed) => {
      if (isConfirmed) {
         nextProccess(row.id);
      } else {
         showToast("La acción fue cancelada.", "error");
      }
   });
}, []);
   const handleEdit = useCallback(async (row: any) => {
      editInitialValues("penaltie", row as Penalties);
   }, []);

   // -----------------------------
   // Efectos optimizados
   // -----------------------------
   useEffect(() => {
      let mounted = true;

      const initializeData = async () => {
         try {
            //   const localization =  await getLocation(true);
            //    editInitialValues(
            //       "penaltie",
            //       {
            //          cp: localization?.address?.postcode,
            //          lat: localization?.lat,
            //          lon: localization?.lon,
            //          city: localization?.address?.city
            //       } as Penalties,
            //       ["cp", "city", "lat", "lon"]
            //    );
            await loadData("penaltie");

            if (mounted) {
               await fetchDoctor(apiDoc);

               // Cargar datos de empleados en paralelo
               await Promise.allSettled([contraloria.refetch(), oficiales.refetch(), proteccionCivil.refetch()]);
            }
         } catch (err) {
            console.error("Error inicializando:", err);
         }
      };

      initializeData();

      return () => {
         mounted = false;
      };
   }, []);

   // -----------------------------
   // Render del formulario memoizado
   // -----------------------------

   const renderStepContent = useMemo(() => {
      const Step0 = () => (
         <div className="space-y-2">
            <FormikNativeTimeInput icon="date" label={"Inicio del turno"} name={"init_date"} type="datetime-local" responsive={RESPONSIVE_CONFIG} />
            <FormikNativeTimeInput icon="date" label={"Final del turno"} name={"final_date"} type="datetime-local" responsive={RESPONSIVE_CONFIG} />
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
            <FormikAutocomplete label="Doctor" name="doctor_id" options={doctor} responsive={RESPONSIVE_CONFIG} idKey="id" labelKey="name" />
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
            <FormikAutocomplete
               label="Protección Civil"
               name="civil_protection"
               options={proteccionCivil.employes}
               loading={proteccionCivil.loading}
               responsive={RESPONSIVE_CONFIG}
               idKey="value"
               labelKey="text"
            />
            <FormikInput icon="auto" name="command_vehicle" label="Vehículo" responsive={RESPONSIVE_CONFIG} />
            <FormikInput icon="usuario-corbata" name="command_troops" label="Tropas" responsive={RESPONSIVE_CONFIG} />
            <FormikInput icon="usuario-corbata" name="command_details" label="Datos de Mando Único" responsive={RESPONSIVE_CONFIG} />
            <FormikInput icon={"usuario-corbata"} name="filter_supervisor" label="Datos del Encargado del Filtro" responsive={RESPONSIVE_CONFIG} />
         </div>
      );

      const Step1 = () => {
         return (
            <div className="space-y-2">
               <FormikNativeTimeInput name="time" label="Hora" responsive={RESPONSIVE_CONFIG} />
               <FormikNativeTimeInput type="date" name="date" label="Fecha de Operativo" responsive={RESPONSIVE_CONFIG} />
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
               <FormikInput icon="usuario-corbata" name="municipal_police" label="Policía Municipal" responsive={RESPONSIVE_CONFIG} />

               <div className="my-6">
                  <Typography variant="h2" className="mb-4 text-center">
                     DATOS DEL DETENIDO
                  </Typography>

                  <div className="lg:flex">
                     <FormikInput icon="cantidad" responsive={RESPONSIVE_CONFIG} name="alcohol_concentration" label="Grado de alcohol" type="number" />
                     <FormikInput icon="cantidad" type="number" name="amountAlcohol" label="Cantidad de alcohol" responsive={RESPONSIVE_CONFIG} />
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
                  </div>
               </div>
               <FormikInput
                  icon="user"
                  name="name"
                  label="Nombre"
                  responsive={RESPONSIVE_CONFIG}
                  render={() => (
                     <>
                        {duplicate.duplicate ? (
                           <div className="mt-2">
                              <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                 <div className="mr-2 mt-0.5">
                                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                       <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                          clipRule="evenodd"
                                       />
                                    </svg>
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-sm font-medium text-yellow-800"> Se agregara como residencia a {duplicate.value}</p>
                                 </div>
                              </div>
                           </div>
                        ) : null}
                     </>
                  )}
                  onBlur={(e, values) => {
                     const probality = findMostSimilar(data as Penalties[], "name", values["name"]);

                     if (probality?.similarity > 50) {
                        showConfirmationAlert(``, {
                           html: `
        <div class="p-4 text-center">
          <!-- Icono de residencia -->
          <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          
          <!-- Título -->
          <h3 class="text-lg font-bold text-gray-900 mb-2">
            🏠 Residencia Similar Encontrada
          </h3>
          
          <!-- Porcentaje de similitud -->
          <div class="text-3xl font-bold text-blue-600 mb-3">
            ${Math.round(probality.similarity)}%
          </div>
          
          <!-- Mensaje -->
          <p class="text-gray-600 mb-4">
            Se encontró una posible residencia similar en el sistema
          </p>
          
          <!-- Información de la residencia (si existe) -->
          <div class="bg-gray-50 p-3 rounded-lg mb-4 text-left">
            <p class="text-sm font-medium text-gray-900 mb-1">Datos de la residencia:</p>
            <div class="text-sm text-gray-600 space-y-1">
              ${probality.item?.name ? `<div><strong>Nombre:</strong> ${probality.item.name}</div>` : ""}
               ${probality.item?.detainee_phone_number ? `<div><strong>Telefono:</strong> ${probality.item.detainee_phone_number}</div>` : ""}
              ${probality.item?.plate_number ? `<div><strong>N° de placa:</strong> ${probality.item.plate_number}</div>` : ""}
              ${probality.item?.age ? `<div><strong>Edad:</strong> ${probality.item.age}</div>` : ""}
            
            </div>
          </div>
          
          <!-- Instrucción -->
          <p class="text-sm text-gray-500">
            ¿Deseas aceptar esta residencia o cancelar el registro?
          </p>
        </div>
      `
                        }).then((isConfirmed) => {
                           if (isConfirmed) {
                            
                              formikRef.current.setFieldValue("residence_folio", probality.item.id);
                           
                              formikRef.current.setFieldValue("name", probality?.item?.name);
                              formikRef.current.setFieldValue("plate_number", probality?.item?.plate_number);
                              formikRef.current.setFieldValue("age", probality?.item?.age);
                              formikRef.current.setFieldValue("detainee_phone_number", probality?.item?.detainee_phone_number);

                              setDuplicate({
                                 duplicate: true,
                                 value: probality?.item?.name
                              });
                              showToast("Residencia aceptada correctamente.", "success");
                           } else {
                              setDuplicate({
                                 duplicate: false,
                                 value: null
                              });
                              showToast("Registro de residencia cancelado.", "error");
                           }
                        });
                     }
                  }}
               />

               <FormikInput disabled value={location?.address?.postcode} label="Código postal" name="cp" responsive={RESPONSIVE_CONFIG} />
               <FormikInput disabled value={location?.address?.city} label="Lugar donde se encuentran" name="location" responsive={RESPONSIVE_CONFIG} />
               <FormikInput type="number" icon="cantidad" name="age" label="Edad" responsive={RESPONSIVE_CONFIG} />
               <FormikInput type="number" icon="cantidad" name="number_of_passengers" label="Número de pasajeros" responsive={RESPONSIVE_CONFIG} />
               <FormikInput name="plate_number" icon="cantidad" label="Número de placa" responsive={RESPONSIVE_CONFIG} />
               <FormikInput icon="user" name="detainee_released_to" label="Nombre de la persona que acudio" responsive={RESPONSIVE_CONFIG} />
               <FormikInput maskType="phone" name="detainee_phone_number" mask={"phone"} label="Teléfono del detenido" icon="phone" responsive={RESPONSIVE_CONFIG} />
               <FormikInput name="curp" label="CURP" responsive={RESPONSIVE_CONFIG} />
               <FormikTextArea name="observations" label="Observaciones" />
            </div>
         );
      };

      const Step2 = () => (
         <div className={`flex ${isMobile ? "flex-col" : "space-x-4"}`}>
            <FormikImageInput name="image_penaltie" maxFiles={1} label="Multa" />
            <FormikImageInput name="images_evidences" maxFiles={1} label="Evidencia del ciudadano" />
            <FormikImageInput name="images_evidences_car" maxFiles={1} label="Evidencia del vehículo" />
            <LocationButton idNameLat="lat" idNameLng="lon" idNameUbi="ubication" label="Ubicación" />
         </div>
      );

      return () => {
         switch (uiState.activeStep) {
            case 0:
               return <Step0 />;
            case 1:
               return <Step1 />;
            case 2:
               return <Step2 />;
            default:
               return null;
         }
      };
   }, [
      uiState.activeStep,
      contraloria,
      oficiales,
      proteccionCivil,
      doctor,
      citys,
      isMobile,
      handleCp,
      handleOficialChange,
      duplicate,
      formikRef?.current?.values["name"]
   ]);


   return (
      <>

         <CompositePage
            formDirection="modal"
            isOpen={uiState.open}
            modalTitle="Nueva Multa"
            fullModal={true}
            onClose={() => setUiState((prev) => ({ ...prev, open: false }))}
            form={() => (
               <div className="p-4">
                  <FormikForm ref={formikRef} validationSchema={validationSchema} initialValues={initialFormValues} onSubmit={handleSubmit}>
                     {() => (
                        <div className="w-full space-y-2">
                           <Stepper steps={steps} activeStep={uiState.activeStep} setActiveStep={(step) => setUiState((prev) => ({ ...prev, activeStep: step }))} />

                           <div className="bg-white rounded-xl p-2 shadow-sm min-h-[400px] w-full">{renderStepContent()}</div>

                           <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div className="text-sm text-gray-500">
                                 Paso {uiState.activeStep + 1} de {steps.length}
                              </div>
                              <div className="flex gap-3">
                                 {uiState.activeStep > 0 && (
                                    <CustomButton type="button" variant="secondary" size="md" color="cyan" onClick={() => handleStepNavigation("prev")}>
                                       ← Regresar
                                    </CustomButton>
                                 )}
                                 <CustomButton
                                    type="button"
                                    onClick={() => {
                                       if (uiState.activeStep < steps.length - 1) {
                                          handleStepNavigation("next");
                                       } else {
                                          formikRef.current?.submitForm();
                                       }
                                    }}
                                 >
                                    {uiState.activeStep < steps.length - 1 ? " Continuar →" : "✓ Registrar"}
                                 </CustomButton>
                              </div>
                           </div>
                        </div>
                     )}
                  </FormikForm>
               </div>
            )}
            table={() => (
              <TableAlcoholCases
              handleEdit={handleEdit}
              handleNext={handleNext}
              loadData={loadData}
              resetInitialValues={resetInitialValues}
              setUiState={setUiState}
              setHistory={setHistory}  
              data={data as Penalties[]}
              loading={loading}
              />
            )}
         />
         <CustomHistoryCase
            open={history.open}
            id={history.idSearch}
            setOpen={() => {
               setHistory({
                  idSearch: null,
                  open: false
               });
            }}
         />
         <CustomModal
            isOpen={uiState.pdfPenalties.open}
            onClose={() =>
               setUiState((prev) => ({
                  ...prev,
                  pdfPenalties: { open: false, row: {} }
               }))
            }
         >
            <PdfPreview children={<MultaPDF data={uiState.pdfPenalties.row} />} name="Multa" />
         </CustomModal>
      </>
   );
};

export default PagePenalities;


