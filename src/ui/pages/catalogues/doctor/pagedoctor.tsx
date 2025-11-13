import { useEffect } from "react";
import { CustomButton } from "../../../components/button/custombuttom";
import CompositePage from "../../../components/compositecustoms/compositePage";
import CustomTable from "../../../components/table/customtable";
import FormikForm from "../../../formik/Formik";
import { FormikColorPicker, FormikInput } from "../../../formik/FormikInputs/FormikInput";
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

const PageDoctor = () => {
   const {doctor,fetchDoctor,handleChangeDoctor,initialValues,loading,open,setOpen,postDoctor,removeDoctor } = useDoctorStore();
   const api = new DoctorApi();
   useEffect(() => {
      fetchDoctor(api);
   }, []);
   const validationSchema = Yup.object({
      name: Yup.string().required("La dependencia es requerida"),
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
         modalTitle="Doctor"
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
                        <FormikInput name="certificate" label="Cedula" responsive={responsive} />
                     </>
                  )}
                  onSubmit={(values) => {
                     postDoctor(values as Doctor, api);
                  }}
               />
            </div>
         )}
         table={() => (
            <>
               <CustomTable
                  headerActions={() => (
                     <>
                        <PermissionRoute requiredPermission={"catalogo_doctor_crear"}>
                           <CustomButton onClick={setOpen}>
                              {" "}
                              <VscDiffAdded />
                           </CustomButton>
                        </PermissionRoute>

                        <CustomButton
                           color="purple"
                           onClick={() => {
                              fetchDoctor(api);
                           }}
                        >
                           {" "}
                           <LuRefreshCcw />
                        </CustomButton>
                     </>
                  )}
                  data={doctor}
                  paginate={[10, 25, 50]}
                  conditionExcel={"catalogo_doctor_exportar"}
                  loading={loading}
                  columns={[
                     {
                        field: "name",
                        headerName: "nombre"
                     },
                     {
                        field: "certificate",
                        headerName: "Cedula"
                     }
                  ]}
                  actions={(row) => (
                     <>
                        <PermissionRoute requiredPermission={"catalogo_doctor_actualizar"}>
                           <CustomButton
                              size="sm"
                              color="yellow"
                              onClick={() => {
                                 handleChangeDoctor(row);
                                 setOpen();
                              }}
                           >
                              {" "}
                              <CiEdit />
                           </CustomButton>
                        </PermissionRoute>
                        <PermissionRoute requiredPermission={"catalogo_doctor_eliminar"}>
                           <CustomButton
                              size="sm"
                              color="red"
                              onClick={() => {
                                 showConfirmationAlert(`Eliminar `, { text: "Se eliminara el doctor" }).then((isConfirmed) => {
                                    if (isConfirmed) {
                                       removeDoctor(row, api);
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

export default PageDoctor;
