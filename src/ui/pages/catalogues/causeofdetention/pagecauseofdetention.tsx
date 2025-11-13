import { useEffect } from "react";
import { CustomButton } from "../../../components/button/custombuttom";
import CompositePage from "../../../components/compositecustoms/compositePage";
import CustomTable from "../../../components/table/customtable";
import FormikForm from "../../../formik/Formik";
import {  FormikInput } from "../../../formik/FormikInputs/FormikInput";
import { CiEdit } from "react-icons/ci";
import { VscDiffAdded } from "react-icons/vsc";
import { FaTrash } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import { showConfirmationAlert, showToast } from "../../../../sweetalert/Sweetalert";
import * as Yup from "yup";
import { PermissionRoute } from "../../../../App";
import { useDoctorStore } from "../../../../store/doctor/doctor.store";
import { DoctorApi } from "../../../../infrastructure/doctor/doctor.infra";
import { Doctor } from "../../../../domain/models/doctor/dependence";
import { useCauseOfDetentionStore } from "../../../../store/causeofdetention/causeofdetention.store";
import { CauseOfDetentionApi } from "../../../../infrastructure/causeofdetention/cause_of_detention.infra";

const PageCauseOfDetention = () => {
   const {initialValues,causesofdetention,fetchCauseOfDetention,handleCauseOfDetention,loading,open,setOpen,postCauseOfDetention,removeCauseOfDetention } = useCauseOfDetentionStore();
   const api = new CauseOfDetentionApi();
   useEffect(() => {
      fetchCauseOfDetention(api);
   }, []);
   const validationSchema = Yup.object({
      name: Yup.string().required("Motivo de detención es requerido"),
   });
   const responsive = {
      "2xl": 12,
      xl: 12,
      lg: 12,
      md: 12,
      sm: 12
   };
 
 
   return (
      <CompositePage
         formDirection="modal"
         onClose={setOpen}
         isOpen={open}
         modalTitle="Causas de detención"
         // tableDirection="izq"
         form={() => (
            <div className="pt-4">
               {/* <Typography variant="h2" className="mb-2" size="lg" >Dependencia</Typography> */}
               <FormikForm
                  validationSchema={validationSchema}
                  buttonMessage={initialValues.id > 0 ? "Actualizar" : "Registrar"}
                  initialValues={initialValues}
                  children={() => (
                     <>
                        <FormikInput name="name" label="Nombre" responsive={responsive} />
                     
                     </>
                  )}
                  onSubmit={(values) => {
                     postCauseOfDetention(values as Doctor, api);
                  }}
               />
            </div>
         )}
         table={() => (
            <>
               <CustomTable
                  headerActions={() => (
                     <>
                        <PermissionRoute requiredPermission={"catalogo_motivo_detencion_crear"}>
                           <CustomButton onClick={setOpen}>
                              {" "}
                              <VscDiffAdded />
                           </CustomButton>
                        </PermissionRoute>

                        <CustomButton
                           color="purple"
                           onClick={() => {
                              fetchCauseOfDetention(api);
                           }}
                        >
                           {" "}
                           <LuRefreshCcw />
                        </CustomButton>
                     </>
                  )}
                  data={causesofdetention}
                  paginate={[10, 25, 50]}
                  conditionExcel={"catalogo_motivo_detencion_exportar"}
                  loading={loading}
                  columns={[
                     {
                        field: "name",
                        headerName: "nombre"
                     },
                   
                  ]}
                  actions={(row) => (
                     <>
                        <PermissionRoute requiredPermission={"catalogo_motivo_detencion_actualizar"}>
                           <CustomButton
                              size="sm"
                              color="yellow"
                              onClick={() => {
                                 handleCauseOfDetention(row);
                                 setOpen();
                              }}
                           >
                              {" "}
                              <CiEdit />
                           </CustomButton>
                        </PermissionRoute>
                        <PermissionRoute requiredPermission={"catalogo_motivo_detencion_eliminar"}>
                           <CustomButton
                              size="sm"
                              color="red"
                              onClick={() => {
                                 showConfirmationAlert(`Eliminar `, { text: "Se eliminara el motivo de detención" }).then((isConfirmed) => {
                                    if (isConfirmed) {
                                       removeCauseOfDetention(row, api);
                                    } else {
                                       showToast("La acción fue cancelada.", "error");
                                    }
                                 });
                              }}
                           >
                              {" "}
                              <FaTrash />
                           </CustomButton>
                        </PermissionRoute>
                     </>
                  )}
               />
            </>
         )}
      />
   );
};

export default PageCauseOfDetention;
