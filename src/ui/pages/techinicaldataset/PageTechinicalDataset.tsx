import { FaPlus, FaTrash } from "react-icons/fa";
import { useTechinicalStore } from "../../../store/storetechinaldataset/technical.store";
import { CustomButton } from "../../components/button/custombuttom";
import CompositePage from "../../components/compositecustoms/compositePage";
import FormikForm from "../../formik/Formik";
import { FormikAutocomplete, FormikInput, FormikTextArea } from "../../formik/FormikInputs/FormikInput";
import type { Neighborhood, ResponseApi, Techinical } from "../../../domain/models/techinical/techinical.domain";
import { useEffect, useRef, useState } from "react";
import { useProcedureStore } from "../../../store/procedure/procedure.store";
import { useDependenceStore } from "../../../store/dependence/dependence.store";
import { ProcedureApi } from "../../../infrastructure/procedure/procedure.infra";
import { DependenceApi } from "../../../infrastructure/dependence/dependence.infra";
import CustomTable from "../../components/table/customtable";
import { VscDiffAdded } from "react-icons/vsc";
import { LuRefreshCcw } from "react-icons/lu";
import { CiEdit } from "react-icons/ci";
import { TechinicalApi } from "../../../infrastructure/techinical/techinical.infra";
import type { FormikProps } from "formik";
import * as Yup from "yup";
import { PermissionRoute } from "../../../App";
import { showConfirmationAlert } from "../../../sweetalert/Sweetalert";

// Esquema de validación con Yup
const validationSchema = Yup.object({
    firstName: Yup.string()
        .required("El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),

    paternalSurname: Yup.string()
        .required("El apellido paterno es requerido")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(100, "El apellido no puede exceder 100 caracteres"),

    maternalSurname: Yup.string()
        .max(100, "El apellido no puede exceder 100 caracteres"),

    street: Yup.string()
        .required("La calle es requerida")
        .min(3, "La calle debe tener al menos 3 caracteres"),

    number: Yup.number()
        .required("El número es requerido")
        .positive("El número debe ser positivo")
        .integer("El número debe ser entero"),

    section: Yup.string()
        .required("La sección es requerida"),

    cellphone: Yup.string()
        .required("El teléfono es requerido")
        .matches(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos"),

    postalCode: Yup.number()
        .required("El código postal es requerido")
        .min(10000, "El código postal debe tener 5 dígitos")
        .max(99999, "El código postal debe tener 5 dígitos"),

    city: Yup.number()
        .required("La colonia es requerida")
        .min(1, "Debe seleccionar una colonia"),

    municipality: Yup.string()
        .required("El municipio es requerido"),

    locality: Yup.string()
        .required("La localidad es requerida"),

    reference: Yup.string()
        .max(500, "La referencia no puede exceder 500 caracteres"),

    procedureId: Yup.number()
        .required("El trámite es requerido")
        .min(1, "Debe seleccionar un trámite"),

    dependeceAssignedId: Yup.number()
        .required("La dependencia es requerida")
        .min(1, "Debe seleccionar una dependencia"),

    requestDescription: Yup.string()
        .required("La solicitud es requerida")
        .min(10, "La solicitud debe tener al menos 10 caracteres"),

    solutionDescription: Yup.string()
        .max(220, "La solución no puede exceder 1000 caracteres"),
});

const PageTechnicalDataset = () => {
    const { techinical, fetchTechinical, handleChangeTechinical, initialValues, loading, postTechinical, removeTechinical, open, setOpen,resetValues } = useTechinicalStore()
    const { fetchProcedure, procedure, loading: loadingProcedure } = useProcedureStore();
    const { fetchDependence, dependence, loading: loadingDependence } = useDependenceStore()
    const formik = useRef<FormikProps<any>>(null);

    const procedures = new ProcedureApi()
    const dependences = new DependenceApi()
    const api = new TechinicalApi()
    const [dataCps, setDataCps] = useState<Neighborhood[]>([])
    const [loadingCps, setLoadingCps] = useState<boolean>(false)
    const [types, setTypes] = useState<{ type: "" }[]>([])

    const init = async () => {
        fetchTechinical(api)
        await fetchProcedure(procedures)
        await fetchDependence(dependences)
        const types = await fetch(`${import.meta.env.VITE_API_TYPES}`);
        const typesponse: ResponseApi<{ type: "" }> = await types.json()
        setTypes(typesponse.data.result)
    }

    useEffect(() => {
        init()
    }, [])

    const handleChangeCp = async (
        values: Record<string, any>,
      
    ) => {
        const valuesForm = values as Techinical
        if (valuesForm.postalCode > 9999) {
           
            setLoadingCps(true)

            const res = await fetch(`${import.meta.env.VITE_API_URLCODIGOSPOSTALES}${valuesForm.postalCode}`);
            const response: ResponseApi<Neighborhood> = await res.json();
            const neighborhoods: Neighborhood[] = response.data.result;
            setDataCps(neighborhoods)

            setLoadingCps(false)
        }
    }

    // Función helper para buscar el nombre de dependencia
    const getDependenceName = (id: number) => {
        const dep = dependence.find(d => d.id == id);
        return dep ? dep.name : 'N/A'; // Return the name string instead of the object
    }
 const getProcedureName = (id: number) => {
        const pro = procedure.find(d => d.id == id);
        return pro ? pro.name : 'N/A'; // Return the name string instead of the object
    }



    // Función helper para buscar localidad
    const handleModified =(  values: Record<string, any>,
      setFieldValue: (
         name: string,
         value: any,
         shouldValidate?: boolean,
      ) => void,)=>{
  if (values.firstName && values.paternalSurname && values.maternalSurname && values.id == 0) {
    const foundTechnical = techinical.find(it => 
        it.firstName?.trim().toUpperCase() == values.firstName?.trim().toUpperCase() && 
        it.paternalSurname?.trim().toUpperCase() == values.paternalSurname?.trim().toUpperCase() && 
        it.maternalSurname?.trim().toUpperCase() == values.maternalSurname?.trim().toUpperCase()
    )

    if (foundTechnical) {
    showConfirmationAlert("Error", {
    text: "ya existe la persona en el sistema"
}).then((confirmed) => {
    formik.current?.resetForm()
    
});
    }
}
        }
    

    const responsive = {
        "2xl": 6,
        xl: 6,
        lg: 12,
        md: 12,
        sm: 12,
    };

    return (
            <PermissionRoute requiredPermission={["CapturistaFichas","AdministrarFichas"]}>
        
        <CompositePage
            isOpen={open}
            formDirection="modal"
            onClose={setOpen}
                        modalTitle="Ficha Técnica"
            form={() => (
                <FormikForm
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    buttonMessage={initialValues.id>0?"Actualizar":"Registrar"}
                    ref={formik}
                    children={() => (
                        <>
                            <div className="mt-4">
                                <FormikInput
                                    name="firstName"
                                    label="Nombre"
                                    responsive={responsive}
                                    handleModified={handleModified}

                                />
                                <FormikInput
                                    name="paternalSurname"
                                    label="Apellido paterno"
                                    responsive={responsive}
                                    handleModified={handleModified}

                                />
                                <FormikInput
                                    name="maternalSurname"
                                    label="Apellido Materno"
                                    responsive={responsive}
                                    handleModified={handleModified}
                                />
                                <FormikInput
                                    name="street"
                                    label="Calle"
                                    responsive={responsive}
                                />
                                <FormikInput
                                    name="number"
                                    label="Número"
                                    type="number"
                                    responsive={responsive}
                                />
                                <FormikInput
                                    name="section"
                                    label="Sección"
                                    responsive={responsive}
                                />
                                <FormikInput
                                    name="cellphone"
                                    label="Teléfono"
                                    responsive={responsive}
                                />
                                <FormikInput
                                    name="postalCode"
                                    label="Código postal"
                                    type="number"
                                    responsive={responsive}
                                    handleModified={handleChangeCp}
                                />
                                <FormikAutocomplete
                                    label="Colonia"
                                    name="city"
                                    loading={loadingCps}
                                    responsive={responsive}
                                    options={dataCps}
                                    idKey="id"
                                    labelKey="Colonia"
                                />
                                <FormikInput
                                    name="municipality"
                                    label="Municipio"
                                    responsive={responsive}
                                />
                                <FormikAutocomplete
                                    label="Localidad"
                                    name="locality"
                                    loading={loadingCps}
                                    responsive={responsive}
                                    options={types}
                                    idKey="type"
                                    labelKey="type"
                                />
                                <FormikTextArea
                                    name="reference"
                                    label="Referencia"
                                    responsive={responsive}
                                />
                                <FormikAutocomplete
                                    label="Trámite"
                                    name="procedureId"
                                    loading={loadingProcedure}
                                    responsive={responsive}
                                    options={procedure}
                                    idKey="id"
                                    labelKey="name"
                                />
                                <FormikAutocomplete
                                    label="Dependencia"
                                    name="dependeceAssignedId"
                                    loading={loadingDependence}
                                    responsive={responsive}
                                    options={dependence}
                                    idKey="id"
                                    labelKey="name"
                                />
                                <FormikTextArea
                                    name="requestDescription"
                                    label="Solicitud"
                                    responsive={responsive}
                                />
                                <FormikTextArea
                                    name="solutionDescription"
                                    label="Solución"
                                    responsive={responsive}
                                />
                            </div>
                        </>
                    )}
                    onSubmit={(values) => {
                        postTechinical(values as Techinical, api)
                    }}
                />
            )}
            table={() => (
                <>
                    <CustomTable
                        headerActions={() => (
                            <>
                                <CustomButton onClick={()=>{
                                    resetValues()
                                    setOpen()
                                }}>
                                    <VscDiffAdded />
                                </CustomButton>
                                <CustomButton color="purple" onClick={() => { fetchTechinical(api) }}>
                                    <LuRefreshCcw />
                                </CustomButton>
                            </>
                        )}
                        data={techinical}
                        paginate={[10, 25, 50]}
                        loading={loading}
                        columns={[
                            {
                                field: "fullName",
                                headerName: "Nombre",
                            },
                            {
                                field: "cellphone",
                                headerName: "Teléfono"
                            },
                            {
                                field: "dependeceAssignedId",
                                headerName: "Dependencia",
                                renderField: (id) => getDependenceName(Number(id))
                            },
                            {
                                field: "procedureId",
                                headerName: "Tramite",
                                renderField: (id) => getProcedureName(Number(id))

                            },
                          
                       
                        ]}
                        actions={(row) => (
                            <>
                                <CustomButton size="sm" color="yellow" onClick={async () => {
                                    const res = await fetch(`${import.meta.env.VITE_API_URLCODIGOSPOSTALES}${row.postalCode}`);
                                    const response: ResponseApi<Neighborhood> = await res.json();
                                    const neighborhoods: Neighborhood[] = response.data.result;
                                    setDataCps(neighborhoods)
                                    handleChangeTechinical(row)
                                    setOpen()
                                }}>
                                    <CiEdit />
                                </CustomButton>
                                <CustomButton size="sm" color="red" onClick={() => {
                                    removeTechinical(row, api)
                                }}>
                                    <FaTrash />
                                </CustomButton>
                            </>
                        )}
                    />
                </>
            )}
        />
        </PermissionRoute>
    )
}

export default PageTechnicalDataset;       