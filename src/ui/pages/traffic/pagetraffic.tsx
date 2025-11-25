import { useEffect } from "react";
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

const PagTraffic = () => {
   //    const {
   //       fetchUsers,
   //       setModalForm,
   //       modalForm,
   //       initialValues,
   //       fetchAddUser,
   //       users,
   //       loading,
   //       setInitialValues,
   //       deleteUser,
   //       resetValues,
   //       permissions,
   //       fetchPermissions
   //    } = useUsersState();
   //    const { dependence, fetchDependence, loading: loadingDependece } = useDependenceStore();
   const api = new ApiUsers();
   const apiDependence = new DependenceApi();
   const { contraloria, oficiales, proteccionCivil } = useEmployesData();

   useEffect(() => {
      oficiales.refetch();
   }, []);
   const responsive = {
      "2xl": 12,
      xl: 12,
      lg: 12,
      md: 12,
      sm: 12
   };
   const validationSchema = Yup.object({
      firstName: Yup.string()
         .trim() // elimina espacios en blanco al inicio y al final
         .required("El Nombre es requerido")
         .test("not-empty", "El Nombre no puede estar vacío", (value) => !!value && value.trim() !== ""),

      paternalSurname: Yup.string()
         .trim()
         .required("El Apellido paterno es requerido")
         .test("not-empty", "El Apellido paterno no puede estar vacío", (value) => !!value && value.trim() !== ""),

      dependence_id: Yup.number().min(1, "Selecciona una dependencia").required("Selecciona una dependencia"),
      permissions: Yup.array().of(Yup.number()).min(1, "Debe asignar al menos un permiso").required("Debe asignar al menos un permiso")
   });

   return (
      <>
         {/* {loading && <Spinner />} */}
         <CompositePage
            formDirection="modal"
            onClose={() => {}}
            isOpen={true}
            modalTitle="Transito y vialidad"
            // tableDirection="izq"
            form={() => (
               <div className="pt-4">
                  {/* <Typography variant="h2" className="mb-2" size="lg" >Dependencia</Typography> */}
                  <FormikForm
                     initialValues={{}}
                     validationSchema={validationSchema}
                      buttonMessage={ "Registrar"}
                     //  initialValues={initialValues}
                     children={(values, setFieldValue, setTouched, errors, touched) => (
                        <>
                           <FormikInput label={"Nombre del ciudadano"} name={""} />
                           <FormikInput label={"Edad"} name={""} />
                           <FormikInput label={"Grado"} name={""} />
                           <FormikInput label={"N° de placa"} name={""} />
                           <FormikInput label={"Folio"} name={""} />
                           <FormikInput label={"Marca vehiculo"} name={""} />
                           <FormikNativeTimeInput label={"Hora"} name={""} />
                           <FormikInput label={"Lugar donde se encuentran"} name={""} />
                           <FormikAutocomplete
                              label="Oficial"
                              name="person_oficial"
                              options={oficiales.employes}
                              loading={oficiales.loading}
                              idKey="value"
                              labelKey="text"
                           />
                        </>
                     )}
                     onSubmit={(values) => {
                        // fetchAddUser(api, values as Users);
                     }}
                  />
               </div>
            )}
            table={() => (
               <>
                  <PermissionRoute requiredPermission={"usuarios_ver"}>
                     <div className="absolute z-20 right-2 bottom-2">
                        <FloatingActionButton
                           onClick={() => {
                              //   resetValues();
                              //   setModalForm();
                           }}
                           icon={<FaPlus />}
                           color="primary"
                           size="normal"
                        />
                     </div>
                     <CustomTable
                        data={[]}
                        mobileConfig={{
                           listTile: {
                              leading: (user) => (
                                 <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-red-500 rounded-full">
                                    {user.fullName?.charAt(0) || "P"}
                                 </div>
                              ),
                              title: (user) => <span className="font-semibold">{user.fullName || "Sin nombre"}</span>
                              // subtitle: (penalty) => <span className="text-gray-600">{penalty.description || "Sin descripción"}</span>
                           },

                           swipeActions: {
                              left: [
                                 //  {
                                 //     icon: <FiTrash2 size={18} />,
                                 //     color: "bg-red-500",
                                 //     action: (user) => {
                                 //        showConfirmationAlert(`Eliminar`, { text: "Se eliminará la multa" }).then((isConfirmed) => {
                                 //           if (isConfirmed) {
                                 //             //  deleteUser(api, user);
                                 //           } else {
                                 //              showToast("La acción fue cancelada.", "error");
                                 //           }
                                 //        });
                                 //     }
                                 //  }
                              ],
                              right: [
                                 //  {
                                 //     icon: <FiEdit size={18} />,
                                 //     color: "bg-blue-500",
                                 //     action: (user) => setInitialValues(user, "form")
                                 //  }
                              ]
                           }
                           //    bottomSheet: {
                           //       height: 100,
                           //       showCloseButton: true,
                           //       builder: (user, onClose) => <CustomDataDisplay data={user} config={userMovilView} />
                           //    }
                        }}
                        headerActions={() => (
                           <>
                              <PermissionRoute requiredPermission={"usuarios_crear"}>
                                 <Tooltip content="Agregar usuario">
                                    <CustomButton
                                       onClick={() => {
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
                        conditionExcel={"usuarios_exportar"}
                        paginate={[10, 25, 50]}
                        // loading={loading}
                        columns={[
                           {
                              field: "payroll",
                              headerName: "Nomina"
                           },
                           {
                              field: "fullName",
                              headerName: "Nombre Completo"
                           },
                           {
                              field: "active",
                              headerName: "Usuario funcionando",
                              renderField: (v) => (
                                 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {v ? "Activo" : "Desactivado"}
                                 </span>
                              )
                           }
                        ]}
                        actions={(row) => (
                           <>
                              {row.active ? (
                                 <>
                                    <PermissionRoute requiredPermission={"usuarios_actualizar"}>
                                       <Tooltip content="Editar usuario">
                                          <CustomButton
                                             size="sm"
                                             color="yellow"
                                             onClick={() => {
                                                // setInitialValues(row, "form");
                                                // setModalForm()
                                             }}
                                          >
                                             <CiEdit />
                                          </CustomButton>
                                       </Tooltip>
                                    </PermissionRoute>
                                    <PermissionRoute requiredPermission={"usuarios_eliminar"}>
                                       <>
                                          <Tooltip content="Desactivar usuario">
                                             <CustomButton
                                                size="sm"
                                                color="red"
                                                onClick={() => {
                                                   //    showConfirmationAlert(`Eliminar`, {
                                                   //       text: "Se desactiva el usuario"
                                                   //    }).then((isConfirmed) => {
                                                   //       if (isConfirmed)
                                                   //          deleteUser(api, row);
                                                   //       else showToast("La acción fue cancelada.", "error");
                                                   //    });
                                                }}
                                             >
                                                <FaTrash />
                                             </CustomButton>
                                          </Tooltip>
                                       </>
                                    </PermissionRoute>
                                 </>
                              ) : (
                                 <Tooltip content="Reactivar usuario">
                                    <CustomButton
                                       size="sm"
                                       color="green"
                                       onClick={() => {
                                          //   showConfirmationAlert(`Reactivar`, {
                                          //      text: "Se reactivará el usuario"
                                          //   }).then((isConfirmed) => {
                                          //      if (isConfirmed) deleteUser(api, row);
                                          //      else showToast("La acción fue cancelada.", "error");
                                          //   });
                                       }}
                                    >
                                       <FaSync />
                                    </CustomButton>
                                 </Tooltip>
                              )}
                           </>
                        )}
                     />
                  </PermissionRoute>
               </>
            )}
         />
      </>
   );
};
export default PagTraffic;
