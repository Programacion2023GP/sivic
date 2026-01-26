import { useEffect, useMemo, useCallback, useState } from "react";
import type { FormikValues } from "formik";
import * as Yup from "yup";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { CustomButton } from "../../components/button/custombuttom";
import type { Penalties } from "../../../domain/models/penalties/penalties.model";
import { showConfirmationAlert, showToast } from "../../../sweetalert/Sweetalert";
import CustomModal from "../../components/modal/modal";
import PdfPreview from "../../components/pdfview/pdfview";
import MultaPDF from "../pdf/pdfpenalties";
import { useWindowSize } from "../../../hooks/windossize";
import useEmployesData from "../../../hooks/employesdata";
import { useLocation } from "../../../hooks/localization";
import { useAlcohol } from "../../../hooks/alcohol.hook";
import { useDoctorStore } from "../../../store/doctor/doctor.store";
import { DoctorApi } from "../../../infrastructure/doctor/doctor.infra";
import CustomHistoryCase from "../components/historycases";
import TableAlcoholCases from "../components/alcoholcases";
import PenaltiesStepper from "./components/penalties/penaltiesstepper";
import { Step0, Step1, Step2 } from "./components/penalties/penaltiesformstep";
import { useCityData, usePenaltiesForm, usePenaltiesHandlers } from "./hook/penalties.hook";
import { Public_Securrity } from "../../../domain/models/security/security";
import { Traffic } from "../../../domain/models/traffic/traffic";
import { VscDebugContinueSmall } from "react-icons/vsc";
import { Court } from "../../../domain/models/courts/courts.model";
import PageCourt from "../court/courtpage";
import { CustomTab } from "../../components/tab/customtab";

type section = "penaltie" | "traffic" | "securrity" | "courts" | "general";

const PagePenalities = ({ section }: { section: section }) => {
   // Estados personalizados
   const { uiState, setUiState, duplicate, setDuplicate, history, setHistory, formikRef } = usePenaltiesForm();
   const { citys, handleCp } = useCityData();

   // Hooks externos
   const { width: windowWidth } = useWindowSize();
   const isMobile = windowWidth < 1024;
   const { contraloria, oficiales, proteccionCivil } = useEmployesData();
   const { location, address, getLocation, loading: LoadingCp } = useLocation();

   // Store principal
   const { data, allData, loading, loadData, create, initialValues, editInitialValues, resetInitialValues, deleteRow, nextProccess, setInitialValues } = useAlcohol();
   // Store doctor
   const { doctor, fetchDoctor, loading: doctorLoading,  } = useDoctorStore();
   const apiDoc = useMemo(() => new DoctorApi(), []);
   const [itemsData, setItemsData] = useState<Penalties[] | Court[] | Traffic[] | Public_Securrity[]>();
   // Valores memoizados
   const steps = useMemo(() => ["Configuración", "Detención", ...(section == "traffic" ? ["Evidencias"] : [])], [section]);

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
   const validations = {
      penaltie: () =>
         Yup.object({
         //   init_date: Yup.string().required("Campo obligatorio"),
           // final_date: Yup.string().required("Campo obligatorio"),
            //doctor_id: Yup.string().required("Campo obligatorio"),
            //group: Yup.number().required("Campo obligatorio").min(1, "campo obligatorio"),
            //filter_supervisor: Yup.string().required("Campo obligatorio"),

            alcohol_concentration: Yup.number().typeError("Debe ser un número").required("Campo obligatorio").min(0.001, "Campo obligatorio"),
            name: Yup.string().required("Campo obligatorio").min(1, "El nombre es requerido"),
            //person_oficial: Yup.string().required("Campo obligatorio").min(1, "Campo obligatorio"),
            //amountAlcohol: Yup.number().required("Campo obligatorio").min(0.001, "Debe ser minimo 0.1"),
           // vehicle_service_type: Yup.string().required("Campo obligatorio").min(1, "Campo obligatorio"),
            //age: Yup.number().required("Campo obligatorio").min(0.001, "Campo obligatorio"),
           // number_of_passengers: Yup.number().required("Campo obligatorio").min(0.001, "Campo obligatorio"),
           // plate_number: Yup.string().required("Campo obligatorio").min(1, "La placa es requerida")
         }),

      traffic: () =>
         Yup.object({
            alcohol_concentration: Yup.number().typeError("Debe ser un número").required("Campo obligatorio").min(0.1, "Debe ser mínimo 0.1"),

            age: Yup.number().typeError("Debe ser un número").required("Campo obligatorio").min(1, "Debe ser mínimo 1"),

            vehicle_brand: Yup.string().required("Campo obligatorio").min(1, "El nombre es requerido"),
            // Campos que probablemente deberían ser strings:

            plate_number: Yup.string().required("Campo obligatorio").min(1, "La placa es requerida"),

            time: Yup.string().required("Campo obligatorio"),

            image_penaltie: Yup.string().required("Campo obligatorio"),
            images_evidences: Yup.string().required("Campo obligatorio"),
            images_evidences_car: Yup.string().required("Campo obligatorio")

            // Yup.string()
            //    .notRequired()
            //    .test("image_car", "campo obligatorio", (value) => {
            //       const alcohol = Number(formikRef?.current?.values?.alcohol_concentration ?? 0);
            //       return value != null && alcohol < 3;
            //    })
         }),
      securrity: () =>
         Yup.object({
            municipal_police: Yup.string().required("Campo obligatorio"),
            detention_reason: Yup.string().required("Campo obligatorio").min(1, "El motivo es requerida"),
            patrol_unit_number: Yup.string().required("Campo obligatorio").min(1, "El numero de patrulla es requerida")
         }),

      courts: () =>
         Yup.object({
            exit_reason: Yup.string().required("Campo obligatorio").min(1, "El motivo de salida es requerido")
            // fine_amount: Yup.string().required("Campo obligatorio").min(1, "La cantidad es requerida")
         })
   };

   const validationSchema = useMemo(() => validations[section]?.(), [section]);

   const initialFormValues = useMemo(() => {
      return initialValues;
   }, [initialValues]);
   // Handlers del componente principal
   const { handleOficialChange, handleNameBlur } = usePenaltiesHandlers(formikRef, oficiales, allData as Penalties[], setDuplicate);

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
            await create(values as Penalties, section);
            setDuplicate({
               duplicate: false,
               value: null
            });
            setUiState((prev) => ({
               ...prev,
               open: false,
               activeStep: 0
            }));
            await loadData(section);
         } catch (error) {
            console.error("Error al crear multa:", error);
            showToast("Error al crear la multa", "error");
         }
      },
      [uiState.activeStep, steps.length, create, loadData, handleStepNavigation, setDuplicate, setUiState]
   );

   const handleDelete = useCallback(
      (row: any) => {
         showConfirmationAlert(`Eliminar`, {
            text: "Se eliminará la multa"
         }).then((isConfirmed) => {
            if (isConfirmed) {
               deleteRow(row, section);
            } else {
               showToast("La acción fue cancelada.", "error");
            }
         });
      },
      [deleteRow]
   );

   const handleNext = useCallback(
      (row: any) => {
         showConfirmationAlert(`Continuar`, {
            text: "Al aceptar, se dará continuidad a su proceso."
         }).then((isConfirmed) => {
            if (isConfirmed) {
               nextProccess(row, section);
            } else {
               showToast("La acción fue cancelada.", "error");
            }
         });
      },
      [nextProccess]
   );

   const handleEdit = useCallback(
      async (row: any) => {
         editInitialValues("penaltie", row as Penalties);
      },
      [editInitialValues]
   );

   // Efectos
   useEffect(() => {
      let mounted = true;
      const initializeData = async () => {
         try {
            await getLocation(true);
            await loadData(section);

            if (mounted) {
               await fetchDoctor(apiDoc);
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
   useEffect(() => {
      loadData(section);
      // initializeData();
   }, [section]);
   // Render de steps
   const renderStepContent = useCallback(
      (section: "penaltie" | "traffic" | "securrity" | "courts") => {
         switch (uiState.activeStep) {
            case 0:
               return <Step0 RESPONSIVE_CONFIG={RESPONSIVE_CONFIG} contraloria={contraloria} doctor={doctor} proteccionCivil={proteccionCivil} />;
            case 1:
               return (
                  <Step1
                     section={section}
                     RESPONSIVE_CONFIG={RESPONSIVE_CONFIG}
                     oficiales={oficiales}
                     handleOficialChange={handleOficialChange}
                     duplicate={duplicate}
                     location={location}
                     onNameBlur={handleNameBlur}
                  />
               );
            case 2:
               return <Step2 isMobile={isMobile} />;
            default:
               return null;
         }
      },
      [
         uiState.activeStep,
         RESPONSIVE_CONFIG,
         contraloria,
         doctor,
         proteccionCivil,
         oficiales,
         handleOficialChange,
         duplicate,
         location,
         handleNameBlur,
         isMobile,
         section
      ]
   );

   return (
      <>
         <CustomTab
            variant="minimal"
            tabs={[
               ...(section == "courts"
                  ? [
                       {
                          id: "Juzgados",
                          label: "Juzgados",
                          content: <PageCourt />
                       }
                    ]
                  : []),
               {
                  id: "Alcolimetro",
                  label: "Alcolimetro",
                  content: (
                     <CompositePage
                        formDirection="modal"
                        isOpen={uiState.open}
                        modalTitle="Nueva Multa"
                        fullModal={true}
                        onClose={() => {
                           setUiState((prev) => ({ ...prev, open: false }));
                           setDuplicate({
                              duplicate: false,
                              value: null
                           });
                        }}
                        form={() => {
                           if (section == "general") {
                              return null;
                           }
                           return (
                              <div className="p-4">
                                 <FormikForm ref={formikRef} validationSchema={validationSchema} initialValues={initialFormValues} onSubmit={handleSubmit}>
                                    {(vakues) => (
                                       <div className="w-full space-y-2">
                                          {/* {JSON.stringify(vakues)} */}
                                          <PenaltiesStepper
                                             section={section}
                                             steps={steps}
                                             activeStep={uiState.activeStep}
                                             setActiveStep={(step) => setUiState((prev) => ({ ...prev, activeStep: step }))}
                                          />

                                          <div className="bg-white rounded-xl p-2 shadow-sm min-h-[400px] w-full">{renderStepContent(section)}</div>

                                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                             <div className="text-sm text-gray-500">
                                                Paso {uiState.activeStep + 1} de {steps.length}
                                             </div>
                                             <div className="flex gap-3 flex-wrap">
                                                {uiState.activeStep > 0 && (
                                                   <CustomButton type="button" variant="secondary" size="md" color="cyan" onClick={() => handleStepNavigation("prev")}>
                                                      Regresar
                                                   </CustomButton>
                                                )}
                                                <CustomButton
                                                   type="button"
                                                   color="slate"
                                                   variant={uiState.activeStep < steps.length - 1 ? "outline" : "neon"}
                                                   loading={loading}
                                                   onClick={() => {
                                                      if (uiState.activeStep < steps.length - 1) {
                                                         handleStepNavigation("next");
                                                      } else {
                                                         console.log(formikRef.current?.errors);
                                                         formikRef.current?.submitForm();
                                                      }
                                                   }}
                                                >
                                                   {uiState.activeStep < steps.length - 1 ? " Continuar →" : "💾 Guardar"}
                                                </CustomButton>
                                                {uiState.activeStep < steps.length - 1 ? null : (
                                                   <CustomButton
                                                      loading={loading}
                                                      onClick={async () => {
                                                         const formik = formikRef.current;

                                                         // Fuerza validación
                                                         const errors = await formik.validateForm();

                                                         // Marca todos los campos como tocados (para mostrar errores)
                                                         formik.setTouched(
                                                            Object.keys(formik.values).reduce((acc, key) => {
                                                               acc[key] = true;
                                                               return acc;
                                                            }, {})
                                                         );

                                                         // Si hay errores, no continúes
                                                         if (Object.keys(errors).length > 0) {
                                                            return;
                                                         }

                                                         // Si todo está bien
                                                         setUiState((prev) => ({ ...prev, open: false }));
                                                         handleNext(formik.values);
                                                      }}
                                                      variant="primary"
                                                   >
                                                      Registrar y continuar
                                                   </CustomButton>
                                                )}
                                             </div>
                                          </div>
                                       </div>
                                    )}
                                 </FormikForm>
                              </div>
                           );
                        }}
                        table={() => (
                           <TableAlcoholCases
                              section={section}
                              handleEdit={handleEdit}
                              //   handleNext={handleNext}
                              handleDelete={handleDelete}
                              loadData={loadData}
                              resetInitialValues={resetInitialValues}
                              setUiState={setUiState}
                              setHistory={setHistory}
                              data={
                                 data
                                 // data.filter((it:any) => it.current_process_id==1) as Penalties[]
                              }
                              loading={loading}
                           />
                        )}
                     />
                  )
               }
            ]}
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
