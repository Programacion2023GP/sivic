import { useEffect } from "react";
import { DependenceApi } from "../../../../infrastructure/dependence/dependence.infra";
import { useDependenceStore } from "../../../../store/dependence/dependence.store";
import { CustomButton } from "../../../components/button/custombuttom";
import CompositePage from "../../../components/compositecustoms/compositePage";
import CustomTable from "../../../components/table/customtable";
import FormikForm from "../../../formik/Formik";
import { FormikColorPicker, FormikInput } from "../../../formik/FormikInputs/FormikInput";
import type { Dependence } from "../../../../domain/models/dependence/dependence";
import { CiEdit } from "react-icons/ci";
import { VscDiffAdded } from "react-icons/vsc";
import { FaTrash } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import { showConfirmationAlert, showToast } from "../../../../sweetalert/Sweetalert";
import * as Yup from "yup";
import { PermissionRoute } from "../../../../App";

const PageDependence = () => {
   const { dependence, fetchDependence, loading, postDependence, initialValues, open, setOpen, handleChangeDependence, removeDependence } = useDependenceStore();
   const api = new DependenceApi();
   useEffect(() => {
      fetchDependence(api);
   }, []);
   const validationSchema = Yup.object({
      name: Yup.string().required("La dependencia es requerida"),
      color: Yup.string().required("Color obligatorio")
   });
   const responsive = {
      "2xl": 12,
      xl: 12,
      lg: 12,
      md: 12,
      sm: 12
   };
 
  const allColors = [
     "#FF0000",
     "#FF1493",
     "#FF4500",
     "#FF8C00",
     "#FFD700",
     "#FFFF00",
     "#00FF00",
     "#006400",
     "#0000FF",
     "#1E90FF",
     "#000080",
     "#00BFFF",
     "#800080",
     "#8A2BE2",
     "#FF00FF",
     "#00FFFF",
     "#FFFFFF",
     "#C0C0C0",
     "#8B4513"
  ];

  // 🔹 Filtrar los colores ya usados
  const usedColors = dependence.map((dep) => dep.color).filter(Boolean);
  const availableColors = allColors.filter((color) => !usedColors.includes(color));

   return (
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
                  initialValues={initialValues}
                  children={() => (
                     <>
                        <FormikInput name="name" label="Nombre" responsive={responsive} />
                        <FormikColorPicker
                           colorPalette={availableColors.length ? availableColors : allColors} // si ya no quedan colores disponibles, mostramos todos
                           label="Color principal"
                           name="color"
                        />
                     </>
                  )}
                  onSubmit={(values) => {
                     postDependence(values as Dependence, api);
                  }}
               />
            </div>
         )}
         table={() => (
            <>
               <CustomTable
                  headerActions={() => (
                     <>
                        <PermissionRoute requiredPermission={"catalogo_dependencia_crear"}>
                           <CustomButton onClick={setOpen}>
                              {" "}
                              <VscDiffAdded />
                           </CustomButton>
                        </PermissionRoute>

                        <CustomButton
                           color="purple"
                           onClick={() => {
                              fetchDependence(api);
                           }}
                        >
                           {" "}
                           <LuRefreshCcw />
                        </CustomButton>
                     </>
                  )}
                  data={dependence}
                  paginate={[10, 25, 50]}
                  conditionExcel={"catalogo_dependencia_exportar"}
                  loading={loading}
                  columns={[
                     {
                        field: "name",
                        headerName: "nombre"
                     },
                     {
                        field: "color",
                        headerName: "color",
                        renderField: (value) => {
                           console.log(dependence);
                           const color = value ? String(value) : "#FFFFFF"; // fallback blanco si es undefined

                           return (
                              <div className="flex items-center gap-2">
                                 {/* Cuadro del color */}
                                 <div className="w-6 h-6 rounded-md border border-gray-300 shadow-sm" style={{ backgroundColor: color }} title={color} />
                                 {/* Código de color */}
                                 <span className="text-sm font-mono text-gray-700">{color}</span>
                              </div>
                           );
                        }
                     }
                  ]}
                  actions={(row) => (
                     <>
                        <PermissionRoute requiredPermission={"catalogo_dependencia_actualizar"}>
                           <CustomButton
                              size="sm"
                              color="yellow"
                              onClick={() => {
                                 handleChangeDependence(row);
                                 setOpen();
                              }}
                           >
                              {" "}
                              <CiEdit />
                           </CustomButton>
                        </PermissionRoute>
                        <PermissionRoute requiredPermission={"catalogo_dependencia_eliminar"}>
                           <CustomButton
                              size="sm"
                              color="red"
                              onClick={() => {
                                 showConfirmationAlert(`Eliminar `, { text: "Se eliminara la dependencia" }).then((isConfirmed) => {
                                    if (isConfirmed) {
                                       removeDependence(row, api);
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

export default PageDependence;
