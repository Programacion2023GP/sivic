import { useEffect, useMemo, useState } from "react";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";
import { useUsersState } from "../../../store/storeusers/users.store";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { FormikAutocomplete, FormikImageInput, FormikInput, FormikNativeTimeInput } from "../../formik/FormikInputs/FormikInput";
import type { Users } from "../../../domain/models/users/users.domain";
import CustomTable from "../../components/table/customtable";
import { CustomButton } from "../../components/button/custombuttom";
import { LuRefreshCcw } from "react-icons/lu";
import { VscDiffAdded } from "react-icons/vsc";
import { showConfirmationAlert, showToast } from "../../../sweetalert/Sweetalert";
import { FaPlus, FaRegFilePdf, FaSync, FaTrash } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import * as Yup from "yup";
import { PermissionRoute } from "../../../App";
import Spinner from "../../components/loading/loading";
import Tooltip from "../../components/toltip/Toltip";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { FloatingActionButton } from "../../components/movil/button/custombuttommovil";
import useEmployesData from "../../../hooks/employesdata";
import { useGenericStore } from "../../../store/generic/generic.store";
import { Traffic } from "../../../domain/models/traffic/traffic";
import { GenericApi } from "../../../infrastructure/generic/infra.generic";
import { useLocation } from "../../../hooks/localization";
import { DateFormat, formatDatetime } from "../../../utils/formats";
import { Public_Securrity } from "../../../domain/models/security/security";
import CustomDataDisplay from "../../components/movil/view/customviewmovil";
import { securityMovilView } from "./securitymovil";
import CustomModal from "../../components/modal/modal";
import PdfPreview from "../../components/pdfview/pdfview";
import PublicSecurrityPDF from "../pdf/pdfsecurity";
import PhotoZoom from "../../components/images/images";

const PagePublicSecurity = () => {
   const usePublicSecurityStore = useMemo(
      () =>
         useGenericStore<Public_Securrity>({
            image_security:"",
            id: 0,
            detainee_name: "",
            officer_name: "",
            patrol_unit_number: "",
            detention_reason: "",
            date: "",
            time: "",
            age: null,
            location: "",
            active: true
         }),
      []
   );

   const { location, address, getLocation, loading: LoadingCp } = useLocation();
   const { initialValues, fetchData, handleChangeItem, items, loading, open, postItem, error, removeItemData, setOpen, setPrefix } = usePublicSecurityStore();
   const { contraloria, oficiales, proteccionCivil } = useEmployesData();
   const Security = new GenericApi<Public_Securrity>();
   const [pdf, setPdf] = useState({
      open: false,
      data: {}
   });
   // useEffect corregido
   useEffect(() => {
      const initializeData = async () => {
         try {
            await getLocation(true);
            setPrefix("public_security");
            await fetchData(Security);
            oficiales.refetch();
         } catch (err) {
            console.error("❌ Error inicializando datos:", err);
         }
      };

      initializeData();
   }, []);

   // Agrega este useEffect para debuggear cambios en la ubicación

   const responsive = {
      "2xl": 6,
      xl: 6,
      lg: 12,
      md: 12,
      sm: 12
   };
   const validationSchema = Yup.object({});

   return (
      <>
         {/* {loading && <Spinner />} */}
         {LoadingCp && <Spinner message="cargando tu ubicación" size="sm" fixed={false} />}
         <CompositePage
            formDirection="modal"
            onClose={setOpen}
            isOpen={open}
            modalTitle="Seguridad Publica"
            form={() => (
               <div className="pt-4">
                  <FormikForm
                     initialValues={initialValues}
                     validationSchema={validationSchema}
                     buttonMessage={initialValues.id == 0 ? "Registrar" : "Actualizar"}
                     children={(values, setFieldValue, setTouched, errors, touched) => (
                        <>
                           <FormikInput label="Nombre del detenido" name="detainee_name" responsive={responsive} />
                           <FormikInput label="Nombre del Asente" name="officer_name" responsive={responsive} />
                           <FormikInput label="Edad" name="age" responsive={responsive} type="number" />
                           <FormikInput label="N° de patrulla" name="patrol_unit_number" responsive={responsive} />
                           <FormikInput label="Motivo de detención" name="detention_reason" responsive={responsive} />
                           <FormikNativeTimeInput label="Hora" name="time" responsive={responsive} />
                           <FormikNativeTimeInput label="Fecha de operativo" type="date" name="date" responsive={responsive} />
                           <FormikInput disabled value={location?.address?.city} label="Lugar donde se encuentran" name="location" responsive={responsive} />
                           <FormikImageInput name="image_security" label="Multa" />
                        </>
                     )}
                     onSubmit={(values) => {
                        postItem(values as Public_Securrity, Security, true);
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
                           //   resetValues();
                           //   setModalForm();
                        }}
                        icon={<FaPlus />}
                        color="primary"
                        size="normal"
                     />
                  </div>
                  <CustomTable
                     data={items}
                     mobileConfig={{
                        listTile: {
                           leading: (row) => (
                              <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-red-500 rounded-full">
                                 {row.detainee_name?.charAt(0) || "P"}
                              </div>
                           ),
                           title: (row) => <span className="font-semibold">{row.detainee_name || "Sin nombre"}</span>
                           // subtitle: (penalty) => <span className="text-gray-600">{penalty.description || "Sin descripción"}</span>
                        },

                        swipeActions: {
                           left: [
                              {
                                 icon: <FiTrash2 size={18} />,
                                 color: "bg-red-500",
                                 action: (row) => {
                                    showConfirmationAlert(`Eliminar`, { text: "Se eliminará la multa" }).then((isConfirmed) => {
                                       if (isConfirmed) {
                                          removeItemData(row, Security);
                                       } else {
                                          showToast("La acción fue cancelada.", "error");
                                       }
                                    });
                                 },
                                 hasPermission: "seguridad_publica__eliminar"
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
                                 hasPermission: "seguridad_publica__actualizar"
                              }
                           ]
                        },
                        bottomSheet: {
                           height: 100,
                           showCloseButton: true,
                           builder: (row, onClose) => <CustomDataDisplay data={row} config={securityMovilView} />
                        }
                     }}
                     headerActions={() => (
                        <>
                           <PermissionRoute requiredPermission={"seguridad_publica__crear"}>
                              <Tooltip content="Agregar Multa">
                                 <CustomButton
                                    onClick={() => {
                                       setOpen();
                                       //   resetValues();
                                       //   setModalForm();
                                    }}
                                 >
                                    {" "}
                                    <VscDiffAdded />
                                 </CustomButton>
                              </Tooltip>
                           </PermissionRoute>
                           <Tooltip content="Refrescar la tabla">
                              <CustomButton
                                 color="purple"
                                 onClick={() => {
                                    fetchData(Security);
                                    //    fetchUsers(api);
                                 }}
                              >
                                 {" "}
                                 <LuRefreshCcw />
                              </CustomButton>
                           </Tooltip>
                        </>
                     )}
                     // data={users}
                     conditionExcel={"seguridad_publica__exportar"}
                     paginate={[10, 25, 50]}
                     // loading={loading}
                     columns={[
                        {
                           field: "id",
                           headerName: "Folio"
                        },
                        {
                           field: "detainee_name",
                           headerName: "Nombre"
                        },
                        {
                           field: "officer_name",
                           headerName: "Nombre del asente"
                        },

                        {
                           field: "patrol_unit_number",
                           headerName: "Número de patrulla"
                        },
                        {
                           field: "detention_reason",
                           headerName: "Motivo de la detención"
                        },
                        {
                           field: "date",
                           headerName: "Fecha",
                           visibility: "expanded",
                           renderField: (v) => <>{formatDatetime(`${v}`, true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)}</>,
                           getFilterValue: (v) => formatDatetime(`${v}`, true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)
                        },
                        {
                           field: "time",
                           headerName: "Hora",
                           visibility: "expanded",
                           renderField: (v) => <>{formatDatetime(`2025-01-01 ${v}`, true, DateFormat.H_MM_SS_A)}</>,
                           getFilterValue: (v) => formatDatetime(`2025-01-01 ${v}`, true, DateFormat.H_MM_SS_A)
                        },
                        {
                           field: "location",
                           headerName: "Ubicación",
                           visibility: "expanded"
                        },
                        {
                           field: "image_security",
                           headerName: "Multa",
                           visibility: "expanded",
                           renderField: (value) => <PhotoZoom src={String(value)} alt={String(value)} />
                        }
                     ]}
                     actions={(row) => (
                        <>
                           <>
                              <CustomButton
                                 color="purple"
                                 size="sm"
                                 variant="primary"
                                 onClick={() => {
                                    setPdf({
                                       data: row,
                                       open: true
                                    });
                                 }}
                              >
                                 <FaRegFilePdf />
                              </CustomButton>
                              <PermissionRoute requiredPermission={"seguridad_publica__actualizar"}>
                                 <Tooltip content="Editar Multa">
                                    <CustomButton
                                       size="sm"
                                       color="yellow"
                                       onClick={() => {
                                          setOpen();
                                          handleChangeItem(row);
                                          // setInitialValues(row, "form");
                                          // setModalForm()
                                       }}
                                    >
                                       <CiEdit />
                                    </CustomButton>
                                 </Tooltip>
                              </PermissionRoute>
                              <PermissionRoute requiredPermission={"seguridad_publica__eliminar"}>
                                 <>
                                    <Tooltip content="Eliminar multa">
                                       <CustomButton
                                          size="sm"
                                          color="red"
                                          onClick={() => {
                                             showConfirmationAlert(`Eliminar`, {
                                                text: "Se eliminara la multa"
                                             }).then((isConfirmed) => {
                                                if (isConfirmed) removeItemData(row, Security);
                                                else showToast("La acción fue cancelada.", "error");
                                             });
                                          }}
                                       >
                                          <FaTrash />
                                       </CustomButton>
                                    </Tooltip>
                                 </>
                              </PermissionRoute>
                           </>
                        </>
                     )}
                  />
               </>
            )}
         />
         <CustomModal
            isOpen={pdf.open}
            onClose={() => {
               setPdf({
                  data: {},
                  open: false
               });
            }}
         >
            <PdfPreview children={<PublicSecurrityPDF data={pdf.data as Public_Securrity} />} name="OTRO" />
         </CustomModal>
      </>
   );
};
export default PagePublicSecurity;
