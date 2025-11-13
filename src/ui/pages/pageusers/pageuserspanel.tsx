import { useEffect } from "react";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";
import { useUsersState } from "../../../store/storeusers/users.store";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { FormikAutocomplete, FormikInput } from "../../formik/FormikInputs/FormikInput";
import type { Users } from "../../../domain/models/users/users.domain";
import CustomTable from "../../components/table/customtable";
import { CustomButton } from "../../components/button/custombuttom";
import { LuRefreshCcw } from "react-icons/lu";
import { VscDiffAdded } from "react-icons/vsc";
import { showConfirmationAlert, showToast } from "../../../sweetalert/Sweetalert";
import { FaTrash } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import * as Yup from "yup";
import FTransferList from "../../components/transferlist/TransferList";
import { PermissionRoute } from "../../../App";
import Spinner from "../../components/loading/loading";
import Tooltip from "../../components/toltip/Toltip";
import { useDependenceStore } from "../../../store/dependence/dependence.store";
import { DependenceApi } from "../../../infrastructure/dependence/dependence.infra";

const PageUsersPanel = () => {
   const {
      fetchUsers,
      setModalForm,
      modalForm,
      initialValues,
      fetchAddUser,
      users,
      loading,
      setInitialValues,
      deleteUser,
      resetValues,
      permissions,
      fetchPermissions
   } = useUsersState();
   const {dependence,fetchDependence, loading :loadingDependece} = useDependenceStore()
   const api = new ApiUsers();
   const apiDependence = new DependenceApi()
   useEffect(() => {
      fetchUsers(api);
      fetchPermissions(api);
      fetchDependence(apiDependence)
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

   const getEmployed = async (values: Record<string, any>, setFieldValue: (name: string, value: any) => void) => {
      if (initialValues.id > 0) return; // No hace fetch al editar

      if (values?.payroll?.length >= 4) {
         try {
            const res = await fetch(`https://apideclaracionesgp.gomezpalacio.gob.mx:4434/api/compaq/show/${values.payroll}`);

            if (!res.ok) {
               showToast("falla de la petición", "info");
            }

            const employed = await res.json();

            // Verificamos si hay resultados
            if (employed?.data?.result?.length > 0) {
               const emp = employed.data.result[0];

               setFieldValue("firstName", emp.nombreE || "");
               setFieldValue("paternalSurname", emp.apellidoP || "");
               setFieldValue("maternalSurname", emp.apellidoM || "");
            } else {
               showToast("El empleado no existe", "error");

               // No se encontró empleado
               setFieldValue("firstName", "");
               setFieldValue("paternalSurname", "");
               setFieldValue("maternalSurname", "");
               // Opcional: puedes mostrar un toast o alerta al usuario
            }
         } catch (error) {}
      } else {
         // Si el payroll es menor a 4 caracteres, limpiamos campos
         setFieldValue("firstName", "");
         setFieldValue("paternalSurname", "");
         setFieldValue("maternalSurname", "");
      }
   };

   return (
      <>
         {loading && <Spinner />}
         <CompositePage
            formDirection="modal"
            onClose={setModalForm}
            isOpen={modalForm}
            modalTitle="Usuarios"
            // tableDirection="izq"
            form={() => (
               <div className="pt-4">
                  {/* <Typography variant="h2" className="mb-2" size="lg" >Dependencia</Typography> */}
                  <FormikForm
                     validationSchema={validationSchema}
                     buttonMessage={initialValues.id > 0 ? "Actualizar" : "Registrar"}
                     initialValues={initialValues}
                     children={(values, setFieldValue, setTouched, errors, touched) => (
                        <>
                           <FormikInput name="payroll" label="Nomina" handleModified={getEmployed} responsive={responsive} />
                           <FormikAutocomplete
                              label="Dependencia"
                              name="dependence_id"
                              options={dependence}
                              loading={loadingDependece}
                              responsive={responsive}
                              idKey="id"
                              labelKey="name"
                           />
                           <FormikAutocomplete
                              label="Rol"
                              name="role"
                              options={[
                                 {id:"administrativo",name:"administrativo"},
                                 {id:"director",name:"director"},
                                 {id:"usuario",name:"usuario"},

                              ]}
                              loading={loadingDependece}
                              responsive={responsive}
                              idKey="id"
                              labelKey="name"
                           />
                           <FormikInput name="firstName" label="Nombre" disabled responsive={responsive} />
                           <FormikInput name="paternalSurname" label="Apellido Paterno" disabled responsive={responsive} />
                           <FormikInput name="maternalSurname" label="Apellido Materno" disabled responsive={responsive} />
                           <FTransferList name="permissions" label="Asignar Permissos" departamentos={permissions} idKey="id" labelKey="name" />
                        </>
                     )}
                     onSubmit={(values) => {
                        fetchAddUser(api, values as Users);
                     }}
                  />
               </div>
            )}
            table={() => (
               <>
                  <PermissionRoute requiredPermission={"usuarios_ver"}>
                     <CustomTable
                        headerActions={() => (
                           <>
                              <PermissionRoute requiredPermission={"usuarios_crear"}>
                                 <Tooltip content="Agregar usuario">
                                    <CustomButton
                                       onClick={() => {
                                          resetValues();
                                          setModalForm();
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
                                       fetchUsers(api);
                                    }}
                                 >
                                    {" "}
                                    <LuRefreshCcw />
                                 </CustomButton>
                              </Tooltip>
                           </>
                        )}
                        data={users}
                        conditionExcel={"usuarios_exportar"}
                        paginate={[10, 25, 50]}
                        loading={loading}
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
                                                setInitialValues(row, "form");
                                                // setModalForm()
                                             }}
                                          >
                                             <CiEdit />
                                          </CustomButton>
                                       </Tooltip>
                                    </PermissionRoute>
                                    <PermissionRoute requiredPermission={"usuarios_eliminar"}>
                                       <Tooltip content="Desactivar usuario">
                                          <CustomButton
                                             size="sm"
                                             color="red"
                                             onClick={() => {
                                                showConfirmationAlert(`Eliminar `, {
                                                   text: "Se desactiva el usuario"
                                                }).then((isConfirmed) => {
                                                   if (isConfirmed) {
                                                      deleteUser(api, row);
                                                   } else {
                                                      showToast("La acción fue cancelada.", "error");
                                                   }
                                                });
                                             }}
                                          >
                                             <FaTrash />
                                          </CustomButton>
                                       </Tooltip>
                                    </PermissionRoute>
                                 </>
                              ) : null}
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
export default PageUsersPanel;
