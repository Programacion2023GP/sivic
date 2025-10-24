import { useEffect, useState } from "react";
import { DependenceApi } from "../../../../infrastructure/dependence/dependence.infra";
import { useDependenceStore } from "../../../../store/dependence/dependence.store";
import { CustomButton } from "../../../components/button/custombuttom";
import CustomCard from "../../../components/card/customcard";
import CompositePage from "../../../components/compositecustoms/compositePage";
import CustomTable from "../../../components/table/customtable";
import Typography from "../../../components/typografy/Typografy";
import FormikForm from "../../../formik/Formik";
import { FormikInput } from "../../../formik/FormikInputs/FormikInput";
import type { Dependence } from "../../../../domain/models/dependence/dependence";
import { CiEdit } from "react-icons/ci";
import { VscDiffAdded } from "react-icons/vsc";
import { FaTrash } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import { showConfirmationAlert, showToast } from "../../../../sweetalert/Sweetalert";
import * as Yup from "yup";
import { PermissionRoute } from "../../../../App";

const PageDependence = () => {
    const { dependence, fetchDependence, loading, postDependence, initialValues, open, setOpen, handleChangeDependence, removeDependence } = useDependenceStore()
    const api = new DependenceApi()
    useEffect(() => {
        fetchDependence(api)
    }, [])
    const validationSchema = Yup.object({
            name: Yup.string().required("La dependencia es requerida"),
        });
    const responsive = {
        "2xl": 12,
        xl: 12,
        lg: 12,
        md: 12,
        sm: 12,
    };
    return (
                    <PermissionRoute requiredPermission="Catalogos">
        
        <CompositePage
            formDirection="modal"
            onClose={setOpen}
            isOpen={open}
            modalTitle="Dependencia"
            // tableDirection="izq"
            form={() => (

                <div className="pt-4">
                    {/* <Typography variant="h2" className="mb-2" size="lg" >Dependencia</Typography> */}
                    <FormikForm
                        validationSchema={validationSchema}
                        buttonMessage={initialValues.id > 0 ? "Actualizar" : "Registrar"}
                        initialValues={initialValues} children={() => (
                            <>
                                <FormikInput
                                    name="name"
                                    label="Nombre"
                                    responsive={responsive}
                                />

                            </>
                        )}
                        onSubmit={(values) => {

                            postDependence(values as Dependence, api)


                        }} />
                </div>

            )}
            table={() => (
                <>
                    <CustomTable
                        headerActions={() => (
                            <>
                                <CustomButton onClick={setOpen}> <VscDiffAdded /></CustomButton>
                                <CustomButton color="purple" onClick={() => { fetchDependence(api) }}> <LuRefreshCcw /></CustomButton>
                            </>

                        )}
                        data={dependence} paginate={[10, 25, 50]} loading={loading} columns={[{
                            field: "name", headerName: "nombre"
                        }]}
                        actions={(row) => (
                            <>
                                <CustomButton size="sm" color="yellow" onClick={() => {
                                    handleChangeDependence(row)
                                    setOpen()
                                }}> <CiEdit /></CustomButton>
                                <CustomButton size="sm" color="red" onClick={() => {

                                    showConfirmationAlert(
                                        `Eliminar `,
                                        {text:"Se eliminara la dependencia"}
                                    ).then((isConfirmed) => {
                                        if (isConfirmed) {
                                            removeDependence(row, api)
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

export default PageDependence;