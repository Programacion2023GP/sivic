import { useEffect } from "react";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";
import { useUsersState } from "../../../store/storeusers/users.store";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { FormikInput } from "../../formik/FormikInputs/FormikInput";
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

const PageUsersPanel = () => {
    const { fetchUsers, setModalForm, modalForm, initialValues, fetchAddUser, users, loading, setInitialValues, deleteUser, resetValues, permissions, fetchPermissions } = useUsersState()

    const api = new ApiUsers();

    useEffect(() => {
        fetchUsers(api);
        fetchPermissions(api)
    }, []);
    const responsive = {
        "2xl": 12,
        xl: 12,
        lg: 12,
        md: 12,
        sm: 12,
    };
    const validationSchema = Yup.object({
        firstName: Yup.string().required("El Nombre es requerido"),
        paternalSurname: Yup.string().required("El Apellido paterno es requerido"),
        email: Yup.string().required("El Correo es requerido"),
        permissions: Yup.array()
    .of(Yup.number()) // el array debe contener números (IDs)
    .min(1, "Debe asignar al menos un permiso") // 👈 aquí está la validación clave
    .required("Debe asignar al menos un permiso"),
    });
    return (
    <PermissionRoute requiredPermission="Usuarios">

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
                        initialValues={initialValues} children={(values,
                            setFieldValue,
                            setTouched,
                            errors,
                            touched,) => (
                            <>
                                <FormikInput
                                    name="firstName"
                                    label="Nombre"
                                    responsive={responsive}
                                />
                                <FormikInput
                                    name="paternalSurname"
                                    label="Apellido Paterno"
                                    responsive={responsive}
                                />
                                <FormikInput
                                    name="maternalSurname"
                                    label="Apellido Materno"
                                    responsive={responsive}
                                />
                                <FormikInput
                                    name="email"
                                    label="Correo"
                                    responsive={responsive}
                                />
                                <FTransferList
                                    name="permissions"
                                    label="Asignar Permissos"
                                    departamentos={permissions}
                                    idKey="id"
                                    labelKey="name"
                                />

                            </>
                        )}
                        onSubmit={(values) => {

                            fetchAddUser(api, values as Users)


                        }} />
                </div>

            )}
            table={() => (
                <>
                    <CustomTable
                        headerActions={() => (
                            <>
                                <CustomButton onClick={() => { resetValues(); setModalForm() }}> <VscDiffAdded /></CustomButton>
                                <CustomButton color="purple" onClick={() => { fetchUsers(api) }}> <LuRefreshCcw /></CustomButton>
                            </>

                        )}
                        data={users} paginate={[10, 25, 50]} loading={loading} columns={[{
                            field: "fullName", headerName: "Nombre Completo",


                        }, {
                            field: "email", headerName: "Correo",
                        }]}
                        actions={(row) => (
                            <>
                                <CustomButton size="sm" color="yellow" onClick={() => {
                                    setInitialValues(row, "form")
                                    // setModalForm()
                                }}> <CiEdit /></CustomButton>
                                <CustomButton size="sm" color="red" onClick={() => {

                                    showConfirmationAlert(
                                        `Eliminar `,
                                       {
                                        text: "Se eliminara el usuario"
                                       }
                                    ).then((isConfirmed) => {
                                        if (isConfirmed) {
                                            deleteUser(api, row)
                                        } else {
                                            showToast("La acción fue cancelada.", "error");
                                        }
                                    });

                                }}> <FaTrash /></CustomButton>
                            </>
                        )}

                    />
                </>
            )}
        />
    </PermissionRoute>
    )
}
export default PageUsersPanel;