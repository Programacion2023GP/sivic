import { useEffect } from "react"
import CompositePage from "../../../components/compositecustoms/compositePage"
import Typography from "../../../components/typografy/Typografy"
import FormikForm from "../../../formik/Formik"
import { FormikInput } from "../../../formik/FormikInputs/FormikInput"
import { CustomButton } from "../../../components/button/custombuttom"
import { VscDiffAdded } from "react-icons/vsc"
import { LuRefreshCcw } from "react-icons/lu"
import CustomTable from "../../../components/table/customtable"
import { CiEdit } from "react-icons/ci"
import { FaTrash } from "react-icons/fa"
import type { Procedure } from "../../../../domain/models/procedure/procedure.model"
import { useProcedureStore } from "../../../../store/procedure/procedure.store"
import { ProcedureApi } from "../../../../infrastructure/procedure/procedure.infra"
import * as Yup from "yup";
import { PermissionRoute } from "../../../../App"

const PageProcedure = () => {
    const { procedure, fetchProcedure, loading, postProcedure, initialValues, open, setOpen, handleChangeProcedure, removeProcedure } = useProcedureStore()
    const api = new ProcedureApi()
    useEffect(() => {
        fetchProcedure(api)
    }, [])
    const responsive = {
        "2xl": 12,
        xl: 12,
        lg: 12,
        md: 12,
        sm: 12,
    };
    const validationSchema = Yup.object({
        name: Yup.string().required("El tramite es requerido"),
    });
    return (
        <PermissionRoute requiredPermission="Catalogos">

            <CompositePage
                formDirection="modal"
                onClose={setOpen}
                modalTitle="Tramite"
                isOpen={open}
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

                                postProcedure(values as Procedure, api)


                            }} />
                    </div>

                )}
                table={() => (
                    <>
                        <CustomTable
                            headerActions={() => (
                                <>
                                    <CustomButton onClick={setOpen}> <VscDiffAdded /></CustomButton>
                                    <CustomButton color="purple" onClick={() => { fetchProcedure(api) }}> <LuRefreshCcw /></CustomButton>
                                </>

                            )}
                            data={procedure} paginate={[10, 25, 50]} loading={loading} columns={[{
                                field: "name", headerName: "nombre"
                            },]}
                            actions={(row) => (
                                <>
                                    <CustomButton size="sm" color="yellow" onClick={() => {
                                        handleChangeProcedure(row)
                                        setOpen()
                                    }}> <CiEdit /></CustomButton>
                                    <CustomButton size="sm" color="red" onClick={() => {
                                        removeProcedure(row, api)
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
export default PageProcedure;