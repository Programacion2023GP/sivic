import { Formik, Form, type FormikProps   } from "formik";
import { forwardRef} from "react";
import { RowComponent } from "../components/responsive/Responsive";
import type { FormikType } from "./types/FormikType";

// FormikForm ahora es un componente de tipo React.FC que usa forwardRef
const FormikForm = forwardRef<FormikProps<Record<string, any>>, FormikType>(
   (
      {
         onSubmit,
         initialValues,
         validationSchema,
         children,
         buttonMessage,
         handleActions,
         id,
      },
      ref,
   ) => {
      return (
         <Formik
            innerRef={ref} // Pasamos el ref al Formik usando innerRef
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
               // Llamamos a onSubmit del componente padre
               setStatus(1);
               setSubmitting(true);
               onSubmit(values as Record<string, any>);

               // Después de enviar, cambiamos el estado de submitting a false
            }}>
            {({
               isSubmitting,
               values,
               setFieldValue,
               setTouched,
               errors,
               touched,
            }) => {
               if (isSubmitting) {
               }
               return (
                  <Form encType="multipart/form-data" className="space-y-4">
                     <RowComponent>
                        {children(
                           values,
                           setFieldValue,
                           setTouched,
                           errors,
                           touched,
                        )}
                     </RowComponent>
                     <div className="flex justify-end">
                        {buttonMessage && (
                           <button
                              id={id}
                              type="submit"
                              className="hover:cursor-pointer px-6 py-2 text-sm text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring focus:ring-blue-300"
                              onClick={(e) => {
                                 e.preventDefault(); // Evita el envío inmediato

                                 // Marcar todos los campos como touched
                                 const touchedFields = Object.keys(
                                    initialValues,
                                 ).reduce(
                                    (acc, key) => ({ ...acc, [key]: true }),
                                    {},
                                 );
                                 console.log(initialValues);

                                 console.log(touchedFields);
                                 setTouched(touchedFields);

                                 // Ahora sí, enviamos el formulario
                                 setTimeout(() => {
                                    (
                                       e.target as HTMLButtonElement
                                    ).form?.requestSubmit();
                                 }, 0);
                              }}>
                              {buttonMessage}
                           </button>
                        )}
                     </div>
                  </Form>
               );
            }}
         </Formik>
      );
   },
);

// Exportamos el componente FormikForm
export default FormikForm;
