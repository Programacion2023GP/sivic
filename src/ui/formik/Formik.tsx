import { Formik, Form, type FormikProps } from "formik";
import { forwardRef } from "react";
import { RowComponent } from "../components/responsive/Responsive";
import type { FormikType } from "./types/FormikType";
import { useWindowSize } from "../../hooks/windossize";

// FormikForm ahora es un componente de tipo React.FC que usa forwardRef
const FormikForm = forwardRef<FormikProps<Record<string, any>>, FormikType>(
   ({ onSubmit, initialValues, validationSchema, children, buttonMessage, handleActions, id }, ref) => {
      const { width } = useWindowSize();

      // Determinar si es dispositivo móvil o tablet
      const isMobile = width < 1048; // Tablet: 768px o menos
      const isSmallMobile = width < 768; // Móvil pequeño: 480px o menos

      return (
         <Formik
            innerRef={ref} // Pasamos el ref al Formik usando innerRef
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
               setStatus(1);
               setSubmitting(true);
               onSubmit(values as Record<string, any>);
            }}
         >
            {({ isSubmitting, values, setFieldValue, setTouched, errors, touched }) => {
               return (
                  <Form encType="multipart/form-data" className="space-y-4">
                     <RowComponent>{children(values, setFieldValue, setTouched, errors, touched)}</RowComponent>

                     {/* Botón responsivo */}
                     <div
                        className={`
                        flex w-full
                        ${isMobile ? "justify-center sticky bottom-4" : "justify-end"}
                     `}
                     >
                        {buttonMessage && (
                           <button
                              id={id}
                              type="submit"
                              className={`
                                 hover:cursor-pointer 
                                 text-white bg-blue-600 rounded-lg shadow-md 
                                 hover:bg-blue-700 active:bg-blue-800 
                                 focus:outline-none focus:ring focus:ring-blue-300
                                 transition-all duration-200 ease-in-out
                                 transform hover:scale-105 active:scale-95
                                 
                                 // Estilos responsivos
                                 ${
                                    isSmallMobile
                                       ? "w-11/12 py-4 px-8 text-lg font-semibold"
                                       : isMobile
                                       ? "w-10/12 py-3 px-6 text-base font-medium"
                                       : "px-6 py-2 text-sm"
                                 }
                                 
                                 // Efectos de sombra para móviles
                                 ${isMobile ? "shadow-lg" : "shadow-md"}
                                 
                                 // Posicionamiento sticky para móviles
                                 ${
                                    isMobile &&
                                    `
                                    sticky-important 
                                    z-50 
                                    backdrop-blur-sm 
                                    bg-blue-600/95
                                    border border-blue-400
                                 `
                                 }
                              `}
                              onClick={(e) => {
                                 e.preventDefault();

                                 // Marcar todos los campos como touched
                                 const touchedFields = Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: true }), {});

                                 console.log(initialValues);
                                 console.log(touchedFields);

                                 setTouched(touchedFields);

                                 // Envío del formulario
                                 setTimeout(() => {
                                    (e.target as HTMLButtonElement).form?.requestSubmit();
                                 }, 0);
                              }}
                              // Mejorar accesibilidad en móviles
                              style={{
                                 WebkitTapHighlightColor: "transparent",
                                 WebkitTouchCallout: "none",
                                 WebkitUserSelect: "none",
                                 KhtmlUserSelect: "none",
                                 MozUserSelect: "none",
                                 msUserSelect: "none",
                                 userSelect: "none"
                              }}
                           >
                              {buttonMessage}
                           </button>
                        )}
                     </div>

                     {/* Espacio adicional en móviles para evitar que el botón tape contenido */}
                     {isMobile && <div className="h-6"></div>}
                  </Form>
               );
            }}
         </Formik>
      );
   }
);

// Exportamos el componente FormikForm
export default FormikForm;
