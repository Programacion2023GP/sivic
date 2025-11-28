import { useEffect, useMemo } from "react";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";
import { useUsersState } from "../../../store/storeusers/users.store";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { FormikAutocomplete, FormikInput, FormikNativeTimeInput } from "../../formik/FormikInputs/FormikInput";
import type { Users } from "../../../domain/models/users/users.domain";
import CustomTable from "../../components/table/customtable";
import { CustomButton } from "../../components/button/custombuttom";
import { LuRefreshCcw } from "react-icons/lu";
import { VscDiffAdded } from "react-icons/vsc";
import { showConfirmationAlert, showToast } from "../../../sweetalert/Sweetalert";
import { FaPlus, FaSync, FaTrash } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import * as Yup from "yup";
import FTransferList from "../../components/transferlist/TransferList";
import { PermissionRoute } from "../../../App";
import Spinner from "../../components/loading/loading";
import Tooltip from "../../components/toltip/Toltip";
import { useDependenceStore } from "../../../store/dependence/dependence.store";
import { DependenceApi } from "../../../infrastructure/dependence/dependence.infra";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import CustomDataDisplay from "../../components/movil/view/customviewmovil";
import { FloatingActionButton } from "../../components/movil/button/custombuttommovil";
import useEmployesData from "../../../hooks/employesdata";
import { useGenericStore } from "../../../store/generic/generic.store";
import { Traffic } from "../../../domain/models/traffic/traffic";
import { GenericApi } from "../../../infrastructure/generic/infra.generic";
import { useLocation } from "../../../hooks/localization";
import { DateFormat, formatDatetime } from "../../../utils/formats";
import { trafficMovilView } from "./trafficmovil";

const PagTraffic = () => {
   const useTrafficStore = useMemo(
      () =>
         useGenericStore<Traffic>({
            active: true,
            id: 0,
            rank: "",
            age: null,
            citizen_name: "",
            location: "",
            person_oficial: "",
            plate_number: "",
            time: "",
            vehicle_brand: ""
         }),
      []
   );

   const { location,address, getLocation,loading:LoadingCp } = useLocation();
   const { initialValues, fetchData, handleChangeItem, items, loading, open, postItem, error, removeItemData, setOpen, setPrefix } = useTrafficStore();
   const { contraloria, oficiales, proteccionCivil } = useEmployesData();
   const trafficApi = new GenericApi<Traffic>();
   // useEffect corregido
   useEffect(() => {
      const initializeData = async () => {
         try {
             await getLocation(true);
            setPrefix("traffic");
            await fetchData(trafficApi);
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
         <CompositePage
            formDirection="modal"
            onClose={setOpen}
            isOpen={open}
            modalTitle="Transito y vialidad"
            form={() => (
               <div className="pt-4">
                  <FormikForm
                     initialValues={initialValues}
                     validationSchema={validationSchema}
                     buttonMessage={initialValues.id == 0 ? "Registrar" : "Actualizar"}
                     children={(values, setFieldValue, setTouched, errors, touched) => (
                        <>
                           {LoadingCp && <Spinner message="cargando tu ubicación" size="sm" fixed={false} />}
                           <FormikInput label="Nombre del ciudadano" name="citizen_name" responsive={responsive} />
                           <FormikInput label="Edad" name="age" responsive={responsive} type="number" />
                           <FormikInput label="Grado" name="rank" responsive={responsive} />
                           <FormikInput label="N° de placa" name="plate_number" responsive={responsive} />
                           <FormikInput label="Marca vehiculo" name="vehicle_brand" responsive={responsive} />
                           <FormikNativeTimeInput label="Hora" name="time" responsive={responsive} />
                           <FormikInput disabled value={location?.address?.city} label="Lugar donde se encuentran" name="location" responsive={responsive} />
                           <FormikAutocomplete
                              label="Oficial"
                              name="person_oficial"
                              options={oficiales.employes}
                              loading={oficiales.loading}
                              idKey="value"
                              labelKey="text"
                              responsive={responsive}
                           />
                        </>
                     )}
                     onSubmit={(values) => {
                        postItem(values as Traffic, trafficApi);
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
                           leading: (user) => (
                              <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-red-500 rounded-full">
                                 {user.citizen_name?.charAt(0) || "P"}
                              </div>
                           ),
                           title: (user) => <span className="font-semibold">{user.citizen_name || "Sin nombre"}</span>
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
                                          removeItemData(row, trafficApi);
                                       } else {
                                          showToast("La acción fue cancelada.", "error");
                                       }
                                    });
                                 },
                                 hasPermission: "transito_vialidad__eliminar"
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
                                 hasPermission: "transito_vialidad__actualizar"
                              }
                           ]
                        },
                        bottomSheet: {
                           height: 100,
                           showCloseButton: true,
                           builder: (row, onClose) => <CustomDataDisplay data={row} config={trafficMovilView} />
                        }
                     }}
                     headerActions={() => (
                        <>
                           <PermissionRoute requiredPermission={"transito_vialidad__crear"}>
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
                     conditionExcel={"transito_vialidad__exportar"}
                     paginate={[10, 25, 50]}
                     // loading={loading}
                     columns={[
                        {
                           field: "id",
                           headerName: "Folio"
                        },
                        {
                           field: "citizen_name",
                           headerName: "Nombre"
                        },
                        {
                           field: "age",
                           headerName: "Edad"
                        },
                        {
                           field: "rank",
                           headerName: "Grado"
                        },
                        {
                           field: "plate_number",
                           headerName: "N° de placa"
                        },
                        {
                           field: "vehicle_brand",
                           headerName: "Marca vehículo"
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
                        }
                     ]}
                     actions={(row) => (
                        <>
                           <>
                              <PermissionRoute requiredPermission={"transito_vialidad__actualizar"}>
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
                              <PermissionRoute requiredPermission={"transito_vialidad__eliminar"}>
                                 <>
                                    <Tooltip content="Eliminar multa">
                                       <CustomButton
                                          size="sm"
                                          color="red"
                                          onClick={() => {
                                             showConfirmationAlert(`Eliminar`, {
                                                text: "Se eliminara la multa"
                                             }).then((isConfirmed) => {
                                                if (isConfirmed) removeItemData(row, trafficApi);
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
      </>
   );
};
export default PagTraffic;
