import { FastField, Field, useField, useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { ColComponent } from "../../components/responsive/Responsive";
import { IoIosEyeOff, IoMdEye } from "react-icons/io";
import { FaCheck, FaEyeDropper, FaMinus, FaPalette, FaPlus } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { AiOutlineCamera, AiOutlineClose, AiOutlineEye } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

type InputWithLabelProps = {
   id?: string;
   label: string;
   name: string;
   responsive?: {
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
      "2xl"?: number;
   };
   type?: "number" | "text" | "date" | "checkbox" | "datetime-local";
   disabled?: boolean;
   padding?: boolean;
   value?: any;
   hidden?: boolean;
   render?: React.ReactNode;
   handleModified?: (values: Record<string, any>, setFieldValue: (name: string, value: any, shouldValidate?: boolean) => void) => void;
   onBlur?: (e: React.FocusEvent<HTMLInputElement>, values: Record<string, any>) => void;
   maskType?: "phone" | "curp" | "cp" | "plate" | "email" | "date" | "time" | "money" | "percentage" | "onlyLetters" | "onlyNumbers" | "alphanumeric" | "rfc";
   mask?: "phone" | "cpf" | "cnpj" | "date" | "currency" | "custom" | ((value: string) => string);
   maskPattern?: string;
   icon?: React.ReactNode;
   iconPosition?: "left" | "right";
   onIconClick?: () => void;
   saveUnmasked?: boolean;
};
export const FormikTextArea: React.FC<InputWithLabelProps> = ({
   label,
   name,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   handleModified,
   disabled = false,
   id,
   padding = true,
   value
}) => {
   const formik = useFormikContext();
   const [isFocused, setIsFocused] = useState(false);

   useEffect(() => {
      if (value !== undefined && value !== null) {
         formik.setFieldValue(name, value, false);
      }
   }, [value]);

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <FastField name={name}>
            {({ field, form: { errors, touched, values, setFieldValue, setFieldTouched } }: any) => {
               const error = touched?.[name] && errors?.[name] ? String(errors[name]) : null;
               const hasValue = values?.[name] && values[name].toString().length > 0;
               const isActive = hasValue || isFocused;

               const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const newValue = e.target.value;
                  setFieldValue(name, newValue);

                  // Add a safety check before calling handleModified
                  if (values && newValue !== field.value && handleModified) {
                     handleModified({ ...values, [name]: newValue }, setFieldValue);
                  }
               };

               const handleFocus = () => setIsFocused(true);
               const handleBlur = () => {
                  setIsFocused(false);
                  setFieldTouched(name, true, true);
               };

               return (
                  <div className={`relative w-full mb-1 group ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}>
                     {disabled ? (
                        <div className="relative">
                           {/* Label flotante para disabled */}
                           <label
                              className={`
                                 absolute left-3 -top-2.5 text-xs px-1 transition-all duration-300
                                 ${error ? "text-red-600 bg-white" : "text-gray-600 bg-white"} font-medium
                              `}
                           >
                              {label}
                           </label>

                           {/* Contenedor del campo disabled */}
                           <div
                              className={`relative pt-3 pb-2 px-3 border-2 rounded-lg transition-colors duration-200 ${
                                 error ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-100"
                              }`}
                           >
                              <span className="text-gray-700 block min-h-[80px] whitespace-pre-wrap">{values?.[name] || ""}</span>
                           </div>
                        </div>
                     ) : (
                        <div className="relative mb-3">
                           {/* Fieldset para el borde animado */}
                           <fieldset
                              className={`
                                 absolute -inset-[2px] m-0 px-2 pointer-events-none
                                 border-2 rounded-lg transition-all duration-300
                                 ${error ? "border-red-500" : isFocused ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-400 group-hover:border-gray-600"}
                                 ${isActive ? "border-2" : ""}
                              `}
                           >
                              {/* <legend
                                 className={`
                                    ml-2 px-1 text-xs transition-all duration-300
                                    ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-600"}
                                    ${isActive ? "max-w-full opacity-100" : "max-w-0 opacity-0"}
                                 `}
                              >
                                 {label}
                              </legend> */}
                           </fieldset>

                           {/* Textarea principal */}
                           <textarea
                              {...field}
                              id={id || name}
                              placeholder=" "
                              autoComplete="off"
                              value={values?.[name] ?? ""}
                              onChange={handleChange}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                              rows={4}
                              className={`
                                 block w-full px-3 pt-4 pb-2 bg-transparent rounded-lg
                                 transition-all duration-200 focus:outline-none
                                 text-gray-900 placeholder-transparent resize-none
                                 ${error ? "caret-red-500" : "caret-blue-500"}
                                 ${disabled ? "cursor-not-allowed" : ""}
                              `}
                           />

                           {/* Label flotante */}
                           <label
                              htmlFor={id || name}
                              className={`
                                 absolute left-3 transition-all duration-300 pointer-events-none
                                 transform origin-left
                                 ${
                                    isActive
                                       ? `-top-2.5 text-xs px-1 bg-white ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-700"} font-medium`
                                       : "top-4 text-base text-gray-500"
                                 }
                                 ${disabled ? "text-gray-400" : ""}
                              `}
                           >
                              {label}
                           </label>
                        </div>
                     )}

                     {/* Mensaje de error mejorado */}
                     {error ? (
                        <motion.div
                           initial={{ opacity: 0, y: -5 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.2 }}
                           className="flex items-center gap-2 mt-2 px-1"
                        >
                           <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                           <span className="text-sm font-medium text-red-600 leading-tight">{error}</span>
                        </motion.div>
                     ) : null}

                     {/* Contador de caracteres */}
                     {hasValue && !disabled ? (
                        <div className="absolute -bottom-6 right-0">
                           <span className="text-xs text-gray-400">{values?.[name]?.length || ""} caracteres</span>
                        </div>
                     ) : null}
                  </div>
               );
            }}
         </FastField>
      </ColComponent>
   );
};
// export const FormikInput: React.FC<InputWithLabelProps> = ({
//    label,
//    value,
//    name,
//    responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
//    type = "text",
//    disabled = false,
//    handleModified,
//    padding = true,
//    hidden = false,
//    onBlur,
//    render,

// }) => {
//    const formik = useFormikContext();
//    const [isFocused, setIsFocused] = useState(false);

//    useEffect(() => {
//       if (value !== undefined && value !== null) {
//          formik.setFieldValue(name, value, false);
//       }
//    }, [value]);

//    return (
//       <ColComponent responsive={responsive} autoPadding={padding}>
//          <FastField name={name}>
//             {({ field, form: { values, setFieldValue, setFieldTouched, touched, errors } }) => {
//                const error = touched?.[name] && errors?.[name] ? String(errors[name]) : null;
//                const hasValue = values?.[name] && values[name].toString().length > 0;
//                const isActive = hasValue || isFocused;
//                const isActiveDisabled = disabled && values?.[name]?.toString()?.length > 0;

//                const handleChange = (e) => {
//                   let newValue = e.target.value.toUpperCase();
//                   setFieldValue(name, newValue);

//                   if (newValue !== field.value && handleModified) {
//                      handleModified({ ...values, [name]: newValue }, setFieldValue);
//                   }
//                };

//                const handleFocus = () => setIsFocused(true);
//                const handleBlur = () => {
//                   setIsFocused(false);
//                   setFieldTouched(name, true, true);
//                };

//                return (
//                   <div className={`relative w-full mb-3 group ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}>
//                      {disabled ? (
//                         <div className="relative w-full mb-1">
//                            {/* LABEL flotante que tapa bien el borde */}
//                            <label
//                               htmlFor={name}
//                               className={`
//             absolute left-3 pointer-events-none transition-all duration-300
//             -top-2.5 text-xs px-1 bg-white font-medium z-[2]
//             ${error ? "text-red-500" : "text-gray-700"}
//          `}
//                            >
//                               {label}
//                            </label>

//                            {/* CONTENEDOR con borde visible */}
//                            <div
//                               className={`
//             relative px-3 pt-4 pb-2 rounded-lg border-2 transition-colors duration-200
//             ${error ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-100"}
//          `}
//                            >
//                               {/* Esta línea TAPA la parte superior del borde (efecto border-top abierto) */}
//                               <div
//                                  className={`
//                absolute -top-[2px] left-[10px] h-[4px]
//                ${error ? "bg-red-50" : "bg-gray-100"}
//                z-[1]
//             `}
//                                  style={{
//                                     width: `${label.length * 7 + 20}px` // tamaño dinámico según el label
//                                  }}
//                               />

//                               {/* Texto del campo deshabilitado */}
//                               <span className="text-gray-700 block min-h-[20px] relative z-[2]">{values?.[name] || ""}</span>
//                            </div>
//                         </div>
//                      ) : (
//                         <div className="relative mb-3">
//                            {/* Fieldset para el borde animado */}
//                            <fieldset
//                               className={`
//                                  absolute -inset-[2px] m-0 px-2 pointer-events-none
//                                  border-2 rounded-lg transition-all duration-300
//                                  ${error ? "border-red-500" : isFocused ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-400 group-hover:border-gray-600"}
//                                  ${isActive ? "border-2" : ""}
//                               `}
//                            >
//                               {/* <legend
//                                  className={`
//                                     ml-2 px-1 text-xs transition-all duration-300
//                                     ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-600"}
//                                     ${isActive ? "max-w-full opacity-100" : "max-w-0 opacity-0"}
//                                  `}
//                               >
//                                  {label}
//                               </legend> */}
//                            </fieldset>

//                            {/* Input principal */}
//                            <input
//                               {...field}
//                               id={name}
//                               type={type}
//                               placeholder=" "
//                               autoComplete="off"
//                               value={values?.[name] ?? ""}
//                               onChange={handleChange}
//                               onFocus={(e) => {
//                                  handleFocus();
//                               }}
//                               onBlur={(e) => {
//                                  onBlur?.(e, values);
//                               }}
//                               className={`
//                                  block w-full px-3 pt-4 pb-2 bg-transparent rounded-lg
//                                  transition-all duration-200 focus:outline-none
//                                  text-gray-900 placeholder-transparent
//                                  ${error ? "caret-red-500" : "caret-blue-500"}
//                                  ${disabled ? "cursor-not-allowed" : ""}
//                               `}
//                               hidden={hidden}
//                            />

//                            {/* Label flotante */}
//                            <label
//                               htmlFor={name}
//                               className={`
//                                  absolute left-3 transition-all duration-300 pointer-events-none
//                                  transform origin-left
//                                  ${
//                                     isActive
//                                        ? `-top-2.5 text-xs px-1 bg-white ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-700"} font-medium`
//                                        : "top-4 text-base text-gray-500"
//                                  }
//                                  ${disabled ? "text-gray-400" : ""}
//                               `}
//                            >
//                               {label}
//                            </label>
//                         </div>
//                      )}

//                      {/* Mensaje de error mejorado */}
//                      {error ? (
//                         <motion.div
//                            initial={{ opacity: 0, y: -5 }}
//                            animate={{ opacity: 1, y: 0 }}
//                            transition={{ duration: 0.2 }}
//                            className="flex items-center gap-2 mt-2 px-1"
//                         >
//                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
//                            <span className="text-sm font-medium text-red-600 leading-tight">{error}</span>
//                         </motion.div>
//                      ) : null}

//                      {render ? render() : null}

//                      {/* Contador de caracteres (opcional) */}
//                      {hasValue && type === "text" ? (
//                         <div className="absolute -bottom-6 right-0">
//                            <span className="text-xs text-gray-400">{values?.[name]?.length || ""} caracteres</span>
//                         </div>
//                      ) : null}
//                   </div>
//                );
//             }}
//          </FastField>
//       </ColComponent>
//    );
// };
export const FormikInput: React.FC<InputWithLabelProps> = ({
   label,
   value,
   name,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   type = "text",
   disabled = false,
   handleModified,
   padding = true,
   hidden = false,
   onBlur,
   render
}) => {
   const formik = useFormikContext();
   const [isFocused, setIsFocused] = useState(false);

   useEffect(() => {
      if (value !== undefined && value !== null) {
         formik.setFieldValue(name, value, false);
      }
   }, [value]);

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <FastField name={name}>
            {({ field, form: { values, setFieldValue, setFieldTouched, touched, errors } }) => {
               const error = touched?.[name] && errors?.[name] ? String(errors[name]) : null;
               const hasValue = values?.[name] && values[name].toString().length > 0;
               const isActive = hasValue || isFocused || type === "date" || type === "datetime-local";
               const isActiveDisabled = disabled && values?.[name]?.toString()?.length > 0;

               const handleChange = (e) => {
                  let newValue = e.target.value.toUpperCase();
                  setFieldValue(name, newValue);

                  if (newValue !== field.value && handleModified) {
                     handleModified({ ...values, [name]: newValue }, setFieldValue);
                  }
               };

               const handleFocus = () => setIsFocused(true);

               // CORRECCIÓN: Esta función combina el blur interno con el externo
               const handleBlurInternal = (e) => {
                  setIsFocused(false);
                  setFieldTouched(name, true, true); // Esto marca el campo como touched

                  // Llamar al callback externo si existe
                  if (onBlur) {
                     onBlur(e, values);
                  }
               };

               return (
                  <div className={`relative w-full mb-3 group ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}>
                     {disabled ? (
                        <div className="relative w-full mb-1">
                           {/* LABEL flotante que tapa bien el borde */}
                           <label
                              htmlFor={name}
                              className={`
            absolute left-3 pointer-events-none transition-all duration-300
            -top-2.5 text-xs px-1 bg-white font-medium z-[2]
            ${error ? "text-red-500" : "text-gray-700"}
         `}
                           >
                              {label}
                           </label>

                           {/* CONTENEDOR con borde visible */}
                           <div
                              className={`
            relative px-3 pt-4 pb-2 rounded-lg border-2 transition-colors duration-200
            ${error ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-100"}
         `}
                           >
                              {/* Esta línea TAPA la parte superior del borde (efecto border-top abierto) */}
                              <div
                                 className={`
               absolute -top-[2px] left-[10px] h-[4px] 
               ${error ? "bg-red-50" : "bg-gray-100"} 
               z-[1]
            `}
                                 style={{
                                    width: `${label.length * 7 + 20}px` // tamaño dinámico según el label
                                 }}
                              />

                              {/* Texto del campo deshabilitado */}
                              <span className="text-gray-700 block min-h-[20px] relative z-[2]">{values?.[name] || ""}</span>
                           </div>
                        </div>
                     ) : (
                        <div className="relative mb-3">
                           {/* Fieldset para el borde animado */}
                           <fieldset
                              className={`
                                 absolute -inset-[2px] m-0 px-2 pointer-events-none
                                 border-2 rounded-lg transition-all duration-300
                                 ${error ? "border-red-500" : isFocused ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-400 group-hover:border-gray-600"}
                                 ${isActive ? "border-2" : ""}
                              `}
                           >
                              {/* <legend
                                 className={`
                                    ml-2 px-1 text-xs transition-all duration-300
                                    ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-600"}
                                    ${isActive ? "max-w-full opacity-100" : "max-w-0 opacity-0"}
                                 `}
                              >
                                 {label}
                              </legend> */}
                           </fieldset>

                           {/* Input principal - CORRECCIÓN EN EL onBlur */}
                           <input
                              {...field}
                              id={name}
                              type={type}
                              placeholder=" "
                              autoComplete="off"
                              value={values?.[name] ?? ""}
                              onChange={handleChange}
                              onFocus={handleFocus}
                              onBlur={handleBlurInternal} // CAMBIADO: usar handleBlurInternal
                              className={`
                                 block w-full px-3 pt-4 pb-2 bg-transparent rounded-lg
                                 transition-all duration-200 focus:outline-none
                                 text-gray-900 placeholder-transparent
                                 ${error ? "caret-red-500" : "caret-blue-500"}
                                 ${disabled ? "cursor-not-allowed" : ""}
                              `}
                              hidden={hidden}
                           />

                           {/* Label flotante */}
                           <label
                              htmlFor={name}
                              className={`
                                 absolute left-3 transition-all duration-300 pointer-events-none
                                 transform origin-left
                                 ${
                                    isActive
                                       ? `-top-2.5 text-xs px-1 bg-white ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-700"} font-medium`
                                       : "top-4 text-base text-gray-500"
                                 }
                                 ${disabled ? "text-gray-400" : ""}
                              `}
                           >
                              {label}
                           </label>
                        </div>
                     )}

                     {/* Mensaje de error mejorado */}
                     {error ? (
                        <motion.div
                           initial={{ opacity: 0, y: -5 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.2 }}
                           className="flex items-center gap-2 mt-2 px-1"
                        >
                           <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                           <span className="text-sm font-medium text-red-600 leading-tight">{error}</span>
                        </motion.div>
                     ) : null}

                     {render}

                     {/* Contador de caracteres (opcional) */}
                     {hasValue && type === "text" ? (
                        <div className="absolute -bottom-6 right-0">
                           <span className="text-xs text-gray-400">{values?.[name]?.length || ""} caracteres</span>
                        </div>
                     ) : null}
                  </div>
               );
            }}
         </FastField>
      </ColComponent>
   );
};
export const FormikNativeTimeInput: React.FC<InputWithLabelProps> = ({
   label,
   value,
   name,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   disabled = false,
   handleModified,
   padding = true,
   type = "time"
}) => {
   const formik = useFormikContext();
   const [isFocused, setIsFocused] = useState(false);

   useEffect(() => {
      if (value !== undefined && value !== null) {
         formik.setFieldValue(name, value, false);
      }
   }, [value]);

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <FastField name={name}>
            {({ field, form: { values, setFieldValue, setFieldTouched, touched, errors } }: any) => {
               const error = touched?.[name] && errors?.[name] ? String(errors[name]) : null;
               const hasValue = values?.[name] && values[name].toString().length > 0;
               const isActive = hasValue || isFocused;

               const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  console.log("DEBUG - Before handleChange:");
                  console.log("values:", values);
                  console.log("field:", field);
                  console.log("field.value:", field?.value);

                  const newValue = e?.target?.value;
                  console.log("aqui ho")
                  console.log("newValue:", newValue);
                  if ( newValue !=undefined) {
                     setFieldValue(name, newValue);
                  }
                  console.log("DEBUG - After setFieldValue:");
                  console.log("values:", values);

                  // More comprehensive check
                  if (values && typeof values === "object" && newValue !== field?.value && handleModified) {
                     console.log("DEBUG - Calling handleModified");
                     handleModified({ ...values, [name]: newValue }, setFieldValue);
                  } else {
                     console.log("DEBUG - Skipping handleModified, condition not met");
                     console.log("values exists?", !!values);
                     console.log("type of values:", typeof values);
                     console.log("newValue !== field.value?", newValue !== field?.value);
                     console.log("handleModified exists?", !!handleModified);
                  }
               };
               const handleFocus = () => setIsFocused(true);
               const handleBlur = () => {
                  setIsFocused(false);
                  setFieldTouched(name, true, true);
               };

               return (
                  <div className={`relative w-full mb-3 group ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}>
                     {disabled ? (
                        <div
                           className={`relative pt-3 pb-2 px-3 border-2 rounded-lg transition-colors duration-200 ${
                              error ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-100"
                           }`}
                        >
                           <span className="text-gray-700 block min-h-[24px]">{values?.[name] || ""}</span>
                           <label
                              className={`absolute left-3 -top-2.5 text-xs px-1 transition-colors duration-200 ${
                                 error ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-100"
                              }`}
                           >
                              {/* {label} */}
                           </label>
                        </div>
                     ) : (
                        <div className="relative mb-3">
                           {/* Fieldset para el borde animado */}
                           <fieldset
                              className={`
                                 absolute -inset-[2px] m-0 px-2 pointer-events-none
                                 border-2 rounded-lg transition-all duration-300
                                 ${error ? "border-red-500" : isFocused ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-400 group-hover:border-gray-600"}
                                 ${isActive ? "border-2" : ""}
                              `}
                           >
                              {/* <legend
                                 className={`
                                    ml-2 px-1 text-xs transition-all duration-300
                                    ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-600"}
                                    ${isActive ? "max-w-full opacity-100" : "max-w-0 opacity-0"}
                                 `}
                              >
                                 {label}
                              </legend> */}
                           </fieldset>

                           {/* Input principal */}
                           <input
                              {...field}
                              id={name}
                              type={type}
                              placeholder=" "
                              autoComplete="off"
                              value={values?.[name] ?? ""}
                              onChange={handleChange}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                              className={`
                                 block w-full px-3 pt-4 pb-2 bg-transparent rounded-lg
                                 transition-all duration-200 outline-none
                                 text-gray-900 placeholder-transparent
                                 ${error ? "caret-red-500" : "caret-blue-500"}
                                 ${disabled ? "cursor-not-allowed" : ""}
                              `}
                           />

                           {/* Label flotante */}
                           <label
                              htmlFor={name}
                              className={`
                                 absolute left-3 transition-all duration-300 pointer-events-none
                                 transform origin-left
                                 ${`-top-2.5 text-xs px-1 bg-white ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-700"} font-medium`}
                                 ${disabled ? "text-gray-400" : ""}
                              `}
                           >
                              {label}
                           </label>
                        </div>
                     )}

                     {/* Mensaje de error mejorado */}
                     {error ? (
                        <motion.div
                           initial={{ opacity: 0, y: -5 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.2 }}
                           className="flex items-center gap-2 mt-2 px-1"
                        >
                           <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                           <span className="text-sm font-medium text-red-600 leading-tight">{error}</span>
                        </motion.div>
                     ) : null}
                  </div>
               );
            }}
         </FastField>
      </ColComponent>
   );
};
interface ColorPickerProps {
   label: string;
   name: string;
   colorPalette: Array<string>;
   value?: string;
   disabled?: boolean;
   responsive?: any;
   padding?: boolean;
}

export const FormikColorPicker: React.FC<ColorPickerProps> = ({
   label,
   name,
   value,
   disabled = false,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   padding = true,
   colorPalette
}) => {
   const formik = useFormikContext<any>();
   const [isOpen, setIsOpen] = useState(false);
   const [currentColor, setCurrentColor] = useState<string>(value);
   const pickerRef = useRef<HTMLDivElement>(null);

   // 🔁 Mantener sincronizado con Formik y valor inicial
   useEffect(() => {
      const val = formik.values[name] || value;
      setCurrentColor(val);
   }, [formik.values[name], value]);

   // 🔒 Cerrar dropdown al hacer clic fuera
   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
            setIsOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   // 🖱️ Selección de color
   const handleSelectColor = (color: string) => {
      formik.setFieldValue(name, color);
      setCurrentColor(color);
      setIsOpen(false);
   };

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <div className="relative w-full mb-5" ref={pickerRef}>
            {/* Botón principal mejorado */}
            <button
               type="button"
               onClick={() => !disabled && setIsOpen((prev) => !prev)}
               className={`w-full flex items-center justify-between p-4 bg-white border-2 rounded-xl transition-all duration-300 group ${
                  disabled
                     ? "opacity-50 cursor-not-allowed border-gray-200"
                     : isOpen
                       ? "border-purple-500 shadow-lg shadow-purple-100"
                       : "border-gray-200 hover:border-purple-300 hover:shadow-md"
               }`}
               disabled={disabled}
            >
               <div className="flex items-center gap-4">
                  {/* Indicador de color con efecto de brillo */}
                  <div className="relative">
                     <div
                        className="w-12 h-12 transition-transform duration-300 shadow-lg rounded-xl border-3 group-hover:scale-105 group-hover:shadow-xl"
                        style={{
                           backgroundColor: currentColor,
                           borderColor: isOpen ? "#8B5CF6" : "#E5E7EB"
                        }}
                     />
                     {/* Efecto de brillo */}
                     <div
                        className="absolute inset-0 transition-opacity duration-300 rounded-xl opacity-20 group-hover:opacity-30"
                        style={{
                           backgroundColor: "white",
                           background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)"
                        }}
                     />
                  </div>

                  {/* Texto con mejor tipografía */}
                  <div className="flex flex-col items-start text-left">
                     <span className="text-base font-semibold text-gray-800 transition-colors group-hover:text-gray-900">{label}</span>
                     <span className="mt-1 font-mono text-sm text-gray-500 transition-colors group-hover:text-gray-600">{currentColor}</span>
                  </div>
               </div>

               {/* Icono animado */}
               <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                  <svg
                     className={`w-5 h-5 transition-colors duration-300 ${isOpen ? "text-purple-500" : "text-gray-400 group-hover:text-gray-600"}`}
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
               </div>
            </button>

            {/* Dropdown de colores mejorado */}
            {isOpen && (
               <div className="absolute left-0 right-0 z-50 mt-3 overflow-hidden duration-200 bg-white border border-gray-200 shadow-2xl top-full rounded-2xl animate-in fade-in-50 slide-in-from-top-2">
                  {/* Header del dropdown */}
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                     <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Seleccionar color</h3>
                        <span className="px-2 py-1 text-sm text-gray-500 bg-white border rounded-full">{colorPalette.length} colores</span>
                     </div>

                     {/* Color actual destacado */}
                     <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="w-8 h-8 border-2 border-gray-300 rounded-lg shadow-sm" style={{ backgroundColor: currentColor }} />
                        <div className="flex-1">
                           <span className="text-sm font-medium text-gray-700">Color actual</span>
                           <span className="block font-mono text-xs text-gray-500">{currentColor}</span>
                        </div>
                     </div>
                  </div>

                  {/* Grid de colores con scroll suave */}
                  <div className="p-4 overflow-y-auto max-h-64 custom-scrollbar">
                     <div className="grid grid-cols-10 gap-3">
                        {colorPalette.map((color) => (
                           <button
                              key={color}
                              type="button"
                              onClick={() => handleSelectColor(color)}
                              className={`hover:cursor-pointer relative w-7 h-7 rounded-lg border-2 transition-all duration-200 hover:scale-125 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                 currentColor === color ? "border-white ring-3 ring-purple-500 scale-125 shadow-lg" : "border-gray-100 hover:border-white"
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                           >
                              {/* Checkmark para color seleccionado */}
                              {currentColor === color && (
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                                       <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                       />
                                    </svg>
                                 </div>
                              )}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Footer del dropdown */}
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                     <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                     >
                        Cerrar
                     </button>
                  </div>
               </div>
            )}

            {/* Error de Formik */}
            <FastField name={name}>
               {({ form: { touched, errors } }: any) => {
                  const error = touched?.[name] && typeof errors?.[name] === "string" ? errors[name] : null;
                  return error ? (
                     <div className="flex items-center gap-2 px-3 py-2 mt-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg bg-red-50">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                           <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                           />
                        </svg>
                        {error}
                     </div>
                  ) : null;
               }}
            </FastField>
         </div>

         {/* Estilos para scrollbar personalizado */}
      </ColComponent>
   );
};
type CheckboxWithLabelProps = {
   label: string;
   name: string;
   id?: string;
   value?: boolean;
   responsive?: {
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
      "2xl"?: number;
   };
   disabled?: boolean;
   handleModified?: (values: any, setFieldValue: any) => void;
   padding?: boolean;
};

export const FormikCheckbox: React.FC<CheckboxWithLabelProps> = ({
   label,
   value,
   name,
   id,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   disabled = false,
   handleModified,
   padding = true
}) => {
   const [field, meta] = useField({ name, type: "checkbox" });
   const formik = useFormikContext();

   useEffect(() => {
      if (value !== undefined && value !== null) {
         formik.setFieldValue(name, value, false);
      }
   }, [value]);

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <FastField name={name}>
            {({ field, form: { errors, touched, values, setFieldValue } }: any) => {
               const error = touched?.[name] && typeof errors?.[name] === "string" ? (errors?.[name] as string) : null;

               if (handleModified) {
                  handleModified(values, setFieldValue);
               }

               return (
                  <div id={id} className={`relative z-0 w-full mb-5 flex items-center gap-2 ${disabled ? "cursor-not-allowed opacity-40" : ""}`}>
                     <input
                        {...field}
                        id={name}
                        type="checkbox"
                        disabled={disabled}
                        // checked={values?.[name] || false}
                        onChange={(e) => setFieldValue(name, e.target.checked, true)}
                        className={`peer w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-black ${disabled ? "cursor-not-allowed" : ""}`}
                     />
                     <label htmlFor={name} className={`text-gray-700 peer-checked:text-black ${disabled ? "cursor-not-allowed" : ""}`}>
                        {label}
                     </label>

                     {meta.error && (meta.touched || formik.status) && (
                        <span className="absolute left-0 text-sm font-semibold text-red-600 top-6" id={`${name}-meta.error`}>
                           {meta.error}
                        </span>
                     )}
                  </div>
               );
            }}
         </FastField>
      </ColComponent>
   );
};

interface FormikImageInputProps {
   label: string;
   name: string;
   disabled?: boolean;
   acceptedFileTypes?: string;
   multiple?: boolean;
   maxFiles?: number;
}

interface UploadItem {
   id: string;
   preview: string;
   isExisting: boolean;
   file?: File;
   progress: number;
   loaded: boolean;
}

export const FormikImageInput: React.FC<FormikImageInputProps> = ({
   label,
   name,
   disabled = false,
   acceptedFileTypes = "image/*",
   multiple = false,
   maxFiles = 5
}) => {
   const { setFieldValue, values, errors, touched } = useFormikContext<any>();
   const [uploads, setUploads] = useState<UploadItem[]>([]);
   const [previewModal, setPreviewModal] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement | null>(null);
   const [isMobile, setIsMobile] = useState(false);
   const [useCamera, setUseCamera] = useState(true);

   useEffect(() => {
      const currentValue = values[name];
      const existingUrls: string[] = [];
      const newFiles: File[] = [];

      if (currentValue) {
         if (multiple && Array.isArray(currentValue)) {
            currentValue.forEach((item) => {
               if (typeof item === "string") {
                  existingUrls.push(item);
               } else if (item instanceof File) {
                  newFiles.push(item);
               }
            });
         } else if (!multiple) {
            if (typeof currentValue === "string") {
               existingUrls.push(currentValue);
            } else if (currentValue instanceof File) {
               newFiles.push(currentValue);
            }
         }
      }

      const newUploads: UploadItem[] = [];

      existingUrls.forEach((url, index) => {
         newUploads.push({
            id: `existing_${index}_${Date.now()}`,
            preview: url,
            isExisting: true,
            progress: 100,
            loaded: false
         });
      });

      newFiles.forEach((file, index) => {
         const preview = URL.createObjectURL(file);
         newUploads.push({
            id: `new_${index}_${Date.now()}`,
            preview,
            isExisting: false,
            file,
            progress: 100,
            loaded: false
         });
      });

      setUploads(newUploads);

      return () => {
         newUploads.forEach((item) => {
            if (!item.isExisting && item.preview.startsWith("blob:")) {
               URL.revokeObjectURL(item.preview);
            }
         });
      };
   }, [values[name], multiple, name]);

   useEffect(() => {
      if (typeof window !== "undefined") {
         const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
         setIsMobile(mobileCheck);
      }
   }, []);

   const handleImageLoad = (id: string) => {
      setUploads((prev) => prev.map((item) => (item.id === id ? { ...item, loaded: true } : item)));
   };

   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
      if (!selectedFiles.length) return;

      let newFiles = multiple ? selectedFiles : [selectedFiles[0]];
      if (multiple && uploads.length + newFiles.length > maxFiles) {
         newFiles = newFiles.slice(0, maxFiles - uploads.length);
      }

      const newUploads: UploadItem[] = newFiles.map((file, index) => ({
         id: `new_${uploads.length + index}_${Date.now()}`,
         preview: URL.createObjectURL(file),
         isExisting: false,
         file,
         progress: 0,
         loaded: false
      }));

      let updatedUploads: UploadItem[];
      if (!multiple) {
         // Limpiar URLs anteriores antes de reemplazar
         uploads.forEach((item) => {
            if (!item.isExisting && item.preview.startsWith("blob:")) {
               URL.revokeObjectURL(item.preview);
            }
         });
         updatedUploads = [...newUploads];
      } else {
         updatedUploads = [...uploads, ...newUploads];
      }

      setUploads(updatedUploads);

      const filesToSet: File[] = [];
      updatedUploads.forEach((item) => {
         if (!item.isExisting && item.file) {
            filesToSet.push(item.file);
         }
      });

      const existingUrls = updatedUploads.filter((item) => item.isExisting).map((item) => item.preview);

      if (multiple) {
         setFieldValue(name, filesToSet);
         setFieldValue(`${name}_existing`, existingUrls);
      } else {
         const value = filesToSet.length > 0 ? filesToSet[0] : null;
         setFieldValue(name, value);
         setFieldValue(`${name}_existing`, existingUrls.length > 0 ? existingUrls[0] : "");
      }

      newUploads.forEach((u) => {
         const interval = setInterval(() => {
            setUploads((prev) => prev.map((p) => (p.id === u.id ? { ...p, progress: Math.min(p.progress + 10, 100) } : p)));
         }, 100);

         setTimeout(() => clearInterval(interval), 1100);
      });

      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };

   const handleImageClick = () => {
      if (!disabled && fileInputRef.current) {
         fileInputRef.current.click();
      }
   };

   const handleRemove = (index: number) => {
      const uploadToRemove = uploads[index];

      const updatedUploads = uploads.filter((_, i) => i !== index);
      setUploads(updatedUploads);

      if (uploadToRemove.isExisting) {
         setFieldValue(`${name}_delete`, true);
      }

      const filesToSet: File[] = [];
      updatedUploads.forEach((item) => {
         if (!item.isExisting && item.file) {
            filesToSet.push(item.file);
         }
      });

      const existingUrls = updatedUploads.filter((item) => item.isExisting).map((item) => item.preview);

      if (multiple) {
         setFieldValue(name, filesToSet);
         setFieldValue(`${name}_existing`, existingUrls);
      } else {
         const value = filesToSet.length > 0 ? filesToSet[0] : null;
         setFieldValue(name, value);
         setFieldValue(`${name}_existing`, existingUrls.length > 0 ? existingUrls[0] : "");
      }

      if (!uploadToRemove.isExisting && uploadToRemove.preview.startsWith("blob:")) {
         URL.revokeObjectURL(uploadToRemove.preview);
      }

      if (updatedUploads.length === 0) {
         setFieldValue(`${name}_delete`, false);
      }
   };

   const getCaptureAttribute = (): boolean | "user" | "environment" | undefined => {
      if (!isMobile || !useCamera) return undefined;
      return "environment";
   };

   const getInputAccept = () => {
      if (isMobile && useCamera) {
         return "image/*";
      }
      return acceptedFileTypes;
   };

   return (
      <div className="relative w-full mb-6">
         <label className="block mb-3 text-base font-semibold text-gray-800">{label}</label>

         {/* Switch para móviles - Diseño moderno */}
         {isMobile && (
            <div className="relative p-4 mb-5 overflow-hidden border border-indigo-100 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm">
               <div className="flex flex-col space-y-3">
                  <span className="text-sm font-semibold text-gray-800">Modo de captura</span>
                  <div className="flex gap-3">
                     <button
                        type="button"
                        onClick={() => setUseCamera(true)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                           useCamera
                              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 scale-105"
                              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        }`}
                     >
                        <span className="text-lg">📷</span>
                        <span>Cámara</span>
                     </button>
                     <button
                        type="button"
                        onClick={() => setUseCamera(false)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                           !useCamera
                              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 scale-105"
                              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        }`}
                     >
                        <span className="text-lg">🖼️</span>
                        <span>Galería</span>
                     </button>
                  </div>
               </div>
            </div>
         )}

         <div className="flex flex-wrap gap-4">
            <AnimatePresence mode="popLayout">
               {uploads.map((upload, index) => (
                  <motion.div
                     key={upload.id}
                     initial={{ opacity: 0, scale: 0.8, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.8, y: -20 }}
                     transition={{ duration: 0.3, ease: "easeOut" }}
                     className="relative w-36 h-36 overflow-hidden rounded-2xl shadow-lg group bg-gradient-to-br from-gray-100 to-gray-200"
                  >
                     {/* Skeleton loader mientras carga */}
                     {!upload.loaded && <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />}

                     {/* Imagen */}
                     <div className="relative w-full h-full">
                        <img
                           src={upload.preview}
                           alt={`Preview ${index}`}
                           className={`object-cover w-full h-full transition-all duration-500 cursor-pointer ${
                              upload.loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                           }`}
                           onLoad={() => handleImageLoad(upload.id)}
                           onClick={() => upload.loaded && setPreviewModal(upload.preview)}
                           onError={(e) => {
                              console.error("Error loading image:", upload.preview);
                              handleImageLoad(upload.id);
                              e.currentTarget.src =
                                 "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='16' fill='%239ca3af'%3EError%3C/text%3E%3C/svg%3E";
                           }}
                        />

                        {/* Overlay gradiente en hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Info en hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                           <p className="text-xs font-semibold">{upload.isExisting ? "Imagen guardada" : "Nueva imagen"}</p>
                           <p className="text-[10px] opacity-80">Click para ampliar</p>
                        </div>
                     </div>

                     {/* Indicador de progreso */}
                     {upload.progress < 100 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                           <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                           <span className="text-white font-bold text-sm">{upload.progress}%</span>
                        </div>
                     )}

                     {/* Badge de imagen existente */}
                     {upload.isExisting && upload.loaded && (
                        <div className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg flex items-center gap-1">
                           <span>✓</span>
                           <span>Guardada</span>
                        </div>
                     )}

                     {/* Botones de acciones - Diseño moderno flotante */}
                     {upload.loaded && (
                        <div className="absolute flex gap-2 top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <button
                              type="button"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 setPreviewModal(upload.preview);
                              }}
                              className="p-2 text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 hover:scale-110 transition-all backdrop-blur-sm"
                              title="Ver imagen"
                           >
                              <AiOutlineEye size={16} />
                           </button>
                           <button
                              type="button"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleRemove(index);
                              }}
                              className="p-2 text-white bg-red-600 rounded-xl shadow-lg hover:bg-red-700 hover:scale-110 transition-all backdrop-blur-sm"
                              title="Eliminar"
                           >
                              <AiOutlineClose size={16} />
                           </button>
                        </div>
                     )}
                  </motion.div>
               ))}
            </AnimatePresence>

            {/* Botón para agregar imágenes - Diseño moderno */}
            {!disabled && (multiple || uploads.length === 0) && (
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative">
                  <div
                     className="flex flex-col items-center justify-center w-36 h-36 transition-all duration-300 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 hover:shadow-lg hover:scale-105 group bg-gray-50"
                     onClick={handleImageClick}
                  >
                     <div className="flex flex-col items-center">
                        {isMobile ? (
                           <>
                              <div className="mb-2 text-4xl transform group-hover:scale-110 transition-transform duration-300">{useCamera ? "📷" : "🖼️"}</div>
                              <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-600 transition-colors">
                                 {uploads.length === 0 ? (useCamera ? "Tomar foto" : "Subir imagen") : "Agregar más"}
                              </span>
                           </>
                        ) : (
                           <>
                              <div className="mb-3 p-3 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl group-hover:from-indigo-200 group-hover:to-blue-200 transition-all">
                                 <AiOutlineCamera className="text-3xl text-indigo-600" />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-600 transition-colors">
                                 {uploads.length === 0 ? "Subir imagen" : "Agregar más"}
                              </span>
                           </>
                        )}
                        {!multiple && uploads.length > 0 && <span className="mt-1 text-[10px] text-gray-400">(Reemplazar)</span>}
                     </div>
                  </div>
               </motion.div>
            )}
         </div>

         <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={getInputAccept()}
            multiple={multiple}
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
            capture={getCaptureAttribute()}
         />

         {/* Error message */}
         {touched && errors && (touched as Record<string, any>)[name] && (errors as Record<string, any>)[name] && (
            <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-3 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl"
            >
               {(errors as Record<string, any>)[name]}
            </motion.div>
         )}

         {/* Info adicional */}
         <div className="mt-4 space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-start gap-2 text-xs text-gray-600">
               <span className="text-sm">ℹ️</span>
               <span>Formatos: {acceptedFileTypes.replace("image/", "").split(",").join(", ")}</span>
            </div>
            {multiple && maxFiles && (
               <div className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-sm">📊</span>
                  <span>
                     Imágenes: {uploads.length}/{maxFiles}
                  </span>
               </div>
            )}
            {uploads.some((u) => u.isExisting) && (
               <div className="flex items-start gap-2 text-xs text-emerald-600 font-medium">
                  <span className="text-sm">✅</span>
                  <span>{uploads.filter((u) => u.isExisting).length} imagen(es) guardada(s)</span>
               </div>
            )}
         </div>

         {/* Modal de previsualización - Diseño moderno */}
         <AnimatePresence>
            {previewModal && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                  onClick={() => setPreviewModal(null)}
               >
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     transition={{ type: "spring", damping: 25, stiffness: 300 }}
                     className="relative max-w-5xl max-h-[90vh] w-full"
                     onClick={(e) => e.stopPropagation()}
                  >
                     <img
                        src={previewModal}
                        alt="Vista previa"
                        className="object-contain w-full h-full rounded-2xl shadow-2xl"
                        onError={(e) => {
                           console.error("Error loading modal image:", previewModal);
                           e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'%3EError al cargar imagen%3C/text%3E%3C/svg%3E";
                        }}
                     />
                     <button
                        onClick={() => setPreviewModal(null)}
                        className="absolute p-3 text-white transition-all bg-red-600 rounded-full shadow-xl -top-4 -right-4 hover:bg-red-700 hover:scale-110"
                     >
                        <AiOutlineClose size={20} />
                     </button>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};
// O usa otro ícono si prefieres
interface FormikNumberInputProps extends InputWithLabelProps {
   min?: number;
   max?: number;
   decimals?: boolean;
   romanNumerals?: boolean;
   padding?: boolean;
}

export const FormikNumberInput: React.FC<FormikNumberInputProps> = ({
   label,
   name,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   min,
   max,
   decimals = true,
   romanNumerals = false,
   padding = false,
   id
}) => {
   const formatNumber = (value: number) => {
      if (romanNumerals) {
         return toRoman(value);
      }
      return decimals ? value.toFixed(2) : Math.floor(value).toString();
   };
   const [field, meta] = useField(name);
   const formik = useFormikContext();
   // Conversión completa a números romanos
   const toRoman = (num: number) => {
      if (num < 1) return "";
      const romanNumeralMap = [
         ["M", 1000],
         ["CM", 900],
         ["D", 500],
         ["CD", 400],
         ["C", 100],
         ["XC", 90],
         ["L", 50],
         ["XL", 40],
         ["X", 10],
         ["IX", 9],
         ["V", 5],
         ["IV", 4],
         ["I", 1]
      ];
      const roman = "";
      // for (let [letter, value] of romanNumeralMap) {
      //   while (num >= value) {
      //     roman += letter;
      //     num -= value;
      //   }
      // }
      return roman;
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
      let value = e.target.value;

      if (!decimals) {
         // Si `decimals` es false, solo permitir enteros
         value = value.replace(/\.[^0-9]/g, ""); // Evitar decimales
      }

      // Validar que el valor sea un número válido
      if (/^\d*\.?\d*$/.test(value)) {
         setFieldValue(name, value);
      }
   };
   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <FastField name={name}>
            {({ field, form: { errors, touched, setFieldValue } }: any) => {
               const error = touched?.[name] && typeof errors?.[name] === "string" ? (errors?.[name] as string) : null;

               return (
                  <div className="relative z-0 w-full mb-5">
                     <div className="flex items-center border-b-2 border-gray-200 focus-within:border-black">
                        {/* Botón de decremento */}
                        <button
                           type="button"
                           onClick={() => setFieldValue(name, Math.max((field.value || 0) - (decimals ? 0.1 : 1), min || 0))}
                           className="px-3 py-2 text-gray-500 hover:text-black focus:outline-none"
                        >
                           <FaMinus />
                        </button>
                        {/* Input numérico */}
                        <input
                           {...field}
                           type="text" // Cambiado a texto
                           value={formatNumber(Number(field.value) || 0)} // Usamos el formato de número
                           id={id || name}
                           placeholder=" "
                           onChange={(e) => {
                              handleInputChange(e, setFieldValue);

                              formik.handleChange(e);
                           }} // Maneja el cambio del input
                           min={min}
                           max={max}
                           inputMode="numeric" // Para teclado numérico en dispositivos móviles
                           className="block w-full px-0 pt-4 pb-2 text-center bg-transparent border-0 appearance-none peer focus:outline-none focus:ring-0"
                        />
                        {/* Botón de incremento */}
                        <button
                           type="button"
                           onClick={() => setFieldValue(name, Math.min((field.value || 0) + (decimals ? 0.1 : 1), max || Infinity))}
                           className="px-3 py-2 text-gray-500 hover:text-black focus:outline-none"
                        >
                           <FaPlus />
                        </button>
                     </div>
                     <label
                        htmlFor={name}
                        className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black"
                     >
                        {label}
                     </label>
                     {meta.error && (meta.touched || formik.status) && (
                        <span className="text-sm font-semibold text-red-600" id={`${name}-meta.error`}>
                           {meta.error}
                        </span>
                     )}
                  </div>
               );
            }}
         </FastField>
      </ColComponent>
   );
};
export const FormikPasswordInput: React.FC<InputWithLabelProps> = ({ label, name, responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 } }) => {
   const [showPassword, setShowPassword] = useState(false);

   return (
      <ColComponent responsive={responsive}>
         <Field name={name}>
            {({ field, form: { errors, touched, values } }: any) => {
               const error = touched?.[name] && typeof errors?.[name] === "string" ? (errors?.[name] as string) : null;

               return (
                  <div className="relative z-0 w-full mb-5">
                     <input
                        {...field}
                        type={showPassword ? "text" : "password"} // Cambia el tipo según el estado
                        value={values?.[name] || ""}
                        id={name}
                        autoComplete="off"
                        placeholder=" "
                        className="block w-full px-0 pt-4 pb-2 mt-0 bg-transparent border-0 border-b-2 border-gray-200 appearance-none peer focus:outline-none focus:ring-0 focus:border-black"
                     />
                     <label
                        htmlFor={name}
                        className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black`}
                     >
                        {label}
                     </label>
                     <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)} // Cambia el estado
                        className="absolute right-0 text-gray-500 top-4 focus:outline-none"
                     >
                        {showPassword ? <IoMdEye className="w-5 h-5" /> : <IoIosEyeOff className="w-5 h-5" />}
                     </button>
                     {error && (
                        <span className="text-sm font-semibold text-red-600" id={`${name}-error`}>
                           {error}
                        </span>
                     )}
                  </div>
               );
            }}
         </Field>
      </ColComponent>
   );
};
type AutocompleteProps<T extends Record<string, any>> = {
   label: string;
   name: string | string[];
   options: T[];
   idKey: keyof T | (keyof T)[];
   labelKey: keyof T;
   loading?: boolean;
   responsive?: { sm?: number; md?: number; lg?: number; xl?: number; "2xl"?: number };
   disabled?: boolean;
   padding?: boolean;
   handleModified?: (name: string, value: any) => void;
};

export const FormikAutocomplete = <T extends Record<string, any>>({
   label,
   name,
   options,
   idKey,
   labelKey,
   loading,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   disabled = false,
   padding = true,
   handleModified
}: AutocompleteProps<T>) => {
   const formik = useFormikContext<any>();
   if (!formik) throw new Error("Formik context not found");

   const [filteredOptions, setFilteredOptions] = useState(options);
   const [activeIndex, setActiveIndex] = useState(-1);
   const [showOptions, setShowOptions] = useState(false);
   const [textSearch, setTextSearch] = useState("");
   const [isFocused, setIsFocused] = useState(false);
   const inputRef = useRef<HTMLInputElement>(null);
   const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
   const menuRef = useRef<HTMLUListElement>(null);

   // Obtener el error de Formik
   const getError = () => {
      const touched = formik.touched;
      const errors = formik.errors;

      if (Array.isArray(name)) {
         const fieldName = name[0];
         return touched[fieldName] && errors[fieldName] ? String(errors[fieldName]) : null;
      } else {
         return touched[name] && errors[name] ? String(errors[name]) : null;
      }
   };

   const error = getError();
   const hasValue = textSearch && textSearch.length > 0;
   const isActive = hasValue || isFocused;

   // Sincronizar con los valores de Formik
   useEffect(() => {
      const currentValue = getValueFromFormik();
      updateDisplayValue(currentValue);
   }, [formik.values, options]);

   // Sincronizar opciones filtradas cuando cambien las opciones originales
   useEffect(() => {
      setFilteredOptions(options);
   }, [options]);

   // Funciones para manejar paths anidados
   const getNestedValue = (obj: any, path: string[]) => path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);

   const setNestedValue = (obj: any, path: string[], value: any) => {
      const lastKey = path[path.length - 1];
      const deepObj = path.slice(0, -1).reduce((acc, key) => {
         if (!acc[key]) acc[key] = {};
         return acc[key];
      }, obj);
      deepObj[lastKey] = value;
   };

   const getValueFromFormik = () => {
      if (!formik || !formik.values) return undefined;

      if (Array.isArray(name)) {
         return getNestedValue(formik.values, name);
      }

      return formik.values?.[name];
   };

   // Nueva función para actualizar el valor mostrado basado en el valor actual de Formik
   const updateDisplayValue = (currentValue: any) => {
      if (!currentValue && currentValue !== 0) {
         setTextSearch("");
         return;
      }

      // Buscar la opción que coincida con el valor actual
      const match = options.find((opt) => {
         if (Array.isArray(idKey) && Array.isArray(name)) {
            return name.every((n, i) => {
               const path = n.split(".");
               const formikValue = getNestedValue(formik.values, path);
               return formikValue === opt[idKey[i]];
            });
         } else if (!Array.isArray(idKey)) {
            const path = Array.isArray(name) ? name[0].split(".") : [name as string];
            const formikValue = getNestedValue(formik.values, path);
            return formikValue === opt[idKey];
         }
         return false;
      });

      if (match) {
         setTextSearch(String(match[labelKey]));
      } else {
         // Si no hay match, mostrar el valor actual como texto
         setTextSearch(String(currentValue));
      }
   };

   const handleFilter = (query: string) => {
      setTextSearch(query);
      if (!query) {
         setFilteredOptions(options);
         setActiveIndex(-1);
         return;
      }
      const lowerQuery = query.toLowerCase();
      const filtered = options.filter((item) => String(item[labelKey]).toLowerCase().includes(lowerQuery));
      setFilteredOptions(filtered);
      setActiveIndex(-1);
   };

   const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node) && menuRef.current && !menuRef.current.contains(e.target as Node)) {
         setShowOptions(false);
         setIsFocused(false);
      }
   };

   useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const scrollToOption = (index: number) => {
      const el = optionRefs.current[index];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showOptions) return;

      switch (e.key) {
         case "ArrowDown":
            setActiveIndex((prev) => {
               const next = (prev + 1) % filteredOptions.length;
               scrollToOption(next);
               return next;
            });
            break;
         case "ArrowUp":
            setActiveIndex((prev) => {
               const next = prev <= 0 ? filteredOptions.length - 1 : prev - 1;
               scrollToOption(next);
               return next;
            });
            break;
         case "Enter":
            if (activeIndex >= 0) selectOption(filteredOptions[activeIndex]);
            e.preventDefault();
            break;
         case "Escape":
            setShowOptions(false);
            setIsFocused(false);
            break;
      }
   };

   const selectOption = (option: T) => {
      const selectedLabel = String(option[labelKey]);
      setTextSearch(selectedLabel);

      if (Array.isArray(idKey) && Array.isArray(name)) {
         name.forEach((n, i) => {
            const path = n.split(".");
            setNestedValue(formik.values, path, option[idKey[i]]);
            formik.setFieldValue(n, option[idKey[i]]);
            handleModified?.(n, option[idKey[i]]);
         });
      } else if (Array.isArray(idKey)) {
         const obj: Record<string, any> = {};
         idKey.forEach((k) => (obj[k as string] = option[k]));
         if (typeof name === "string") {
            const path = name.split(".");
            setNestedValue(formik.values, path, obj);
            formik.setFieldValue(name, obj);
            handleModified?.(name, obj);
         }
      } else {
         const fieldName = Array.isArray(name) ? name[0] : name;
         const path = Array.isArray(name) ? name : [name];
         setNestedValue(formik.values, path, option[idKey]);
         formik.setFieldValue(fieldName, option[idKey]);
         handleModified?.(fieldName, option[idKey]);
      }

      // Marcar el campo como touched
      const fieldToTouch = Array.isArray(name) ? name[0] : name;
      formik.setFieldTouched(fieldToTouch, true, false);

      setShowOptions(false);
      setIsFocused(false);
   };

   const handleOptionClick = (option: T) => selectOption(option);

   const displayValue = () => {
      return textSearch;
   };

   const handleFocus = () => {
      setIsFocused(true);
      if (!disabled) {
         setFilteredOptions(options);
         setShowOptions(true);
      }
   };

   const handleBlur = () => {
      setIsFocused(false);
      const fieldToTouch = Array.isArray(name) ? name[0] : name;
      formik.setFieldTouched(fieldToTouch, true, false);
   };

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <div className={`relative w-full mb-1 group ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}>
            {disabled ? (
               <div
                  className={`relative pt-3 pb-2 px-3 border-2 rounded-lg transition-colors duration-200 ${
                     error ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-100"
                  }`}
               >
                  <span className="text-gray-700 block min-h-[24px]">{displayValue() || ""}</span>
                  <label
                     className={`absolute left-3 -top-2.5 text-xs px-1 transition-colors duration-200 ${
                        error ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-100"
                     }`}
                  >
                     {/* {label} */}
                  </label>
               </div>
            ) : (
               <div className="relative mb-3">
                  {/* Fieldset para el borde animado */}
                  <fieldset
                     className={`
                        absolute -inset-[2px] m-0 px-2 pointer-events-none
                        border-2 rounded-lg transition-all duration-300
                        ${error ? "border-red-500" : isFocused ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-400 group-hover:border-gray-600"}
                        ${isActive ? "border-2" : ""}
                     `}
                  >
                     {/* <legend
                        className={`
                           ml-2 px-1 text-xs transition-all duration-300
                           ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-600"}
                           ${isActive ? "max-w-full opacity-100" : "max-w-0 opacity-0"}
                        `}
                     >
                        {label}
                     </legend> */}
                  </fieldset>

                  {/* Input principal */}
                  <input
                     disabled={disabled}
                     ref={inputRef}
                     type="text"
                     value={displayValue()}
                     placeholder=" "
                     autoComplete="off"
                     onFocus={handleFocus}
                     onChange={(e) => !disabled && handleFilter(e.target.value)}
                     onKeyDown={handleKeyDown}
                     onBlur={handleBlur}
                     className={`
                        block w-full px-3 pt-4 pb-2 bg-transparent rounded-lg
                        transition-all duration-200 focus:outline-none
                        text-gray-900 placeholder-transparent pr-10
                        ${error ? "caret-red-500" : "caret-blue-500"}
                        ${disabled ? "cursor-not-allowed" : ""}
                     `}
                  />

                  {/* Label flotante */}
                  <label
                     htmlFor={Array.isArray(name) ? name[0] : name}
                     className={`
                        absolute left-3 transition-all duration-300 pointer-events-none
                        transform origin-left
                        ${
                           isActive
                              ? `-top-2.5 text-xs px-1 bg-white ${error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-700"} font-medium`
                              : "top-4 text-base text-gray-500"
                        }
                        ${disabled ? "text-gray-400" : ""}
                     `}
                  >
                     {label}
                  </label>

                  {/* Icono de flecha */}
                  <div
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                     onClick={() => !disabled && setShowOptions(!showOptions)}
                  >
                     {!disabled && (
                        <svg
                           className={`w-5 h-5 transition-transform duration-200 ${showOptions ? "rotate-180" : ""}`}
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                     )}
                  </div>
               </div>
            )}

            {/* Lista de opciones */}
            {showOptions && !disabled && (
               <ul ref={menuRef} className="absolute z-20 w-full mt-1 overflow-auto bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60">
                  {filteredOptions.length > 0 ? (
                     filteredOptions.map((option, index) => (
                        <li
                           key={Array.isArray(idKey) ? idKey.map((k) => option[k]).join("-") : String(option[idKey])}
                           ref={(el) => {
                              optionRefs.current[index] = el;
                           }}
                           className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                              activeIndex === index ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"
                           } border-l-2 ${activeIndex === index ? "border-blue-500" : "border-transparent"}`}
                           onClick={() => handleOptionClick(option)}
                        >
                           <span className="text-gray-900">{String(option[labelKey])}</span>
                        </li>
                     ))
                  ) : (
                     <li className="px-4 py-3 text-gray-500 text-center">No se encontraron opciones</li>
                  )}
               </ul>
            )}

            {/* Mensaje de error mejorado */}
            {error ? (
               <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 mt-2 px-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium text-red-600 leading-tight">{error}</span>
               </motion.div>
            ) : null}

            {/* Indicador de carga */}
            {loading && (
               <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-500 rounded-full animate-spin border-t-transparent"></div>
               </div>
            )}
         </div>
      </ColComponent>
   );
};
type SwitchProps = {
   label: string;
   name: string;
   responsive?: {
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
      "2xl"?: number;
   };
};
interface FormikRadioProps<T> {
   label: string;
   name: string;
   options: T[];
   idKey: keyof T;
   labelKey: keyof T;
   responsive?: { [key: string]: number };
   disabled?: boolean;
   padding?: boolean;
}

interface FormikRadioProps<T> {
   label: string;
   name: string;
   options: T[];
   idKey: keyof T;
   labelKey: keyof T;
   responsive?: { [key: string]: number };
   disabled?: boolean;
   padding?: boolean;
}

export const FormikRadio = <T extends Record<string, any>>({
   label,
   name,
   options,
   idKey,
   labelKey,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   disabled = false,
   padding = true
}: FormikRadioProps<T>) => {
   const formik = useFormikContext();
   if (!formik) throw new Error("Formik context not found");

   const [field, meta] = useField(name);
   const error = meta.touched && meta.error ? String(meta.error) : null;

   // DEBUG: Para ver qué valor tiene Formik
   console.log("FormikRadio - field.value:", field.value, "type:", typeof field.value);
   console.log(
      "FormikRadio - options:",
      options.map((o) => ({ id: o[idKey], label: o[labelKey] }))
   );

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <div className={`relative w-full mb-1 group ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}>
            <div
               className={`
               relative px-3 pt-4 pb-3 border-2 rounded-lg transition-all duration-300
               ${error ? "border-red-500" : "border-gray-300 group-hover:border-gray-400"}
               ${disabled ? "bg-gray-100 border-gray-300" : "bg-transparent"}
            `}
            >
               <label
                  className={`
                  absolute left-3 -top-2.5 text-xs px-1 transition-all duration-300 font-medium
                  ${error ? "text-red-500 bg-white" : "text-gray-700 bg-white"}
                  ${disabled ? "text-gray-600 bg-gray-100" : ""}
               `}
               >
                  {label}
               </label>

               <div className="flex flex-wrap gap-3 mt-1">
                  {options.map((option) => {
                     // SOLUCIÓN: Comparación más robusta
                     const optionValue = option[idKey];
                     const fieldValue = field.value;

                     // Compara convirtiendo ambos a string o manteniendo su tipo original
                     // Opción 1: Comparación estricta con conversión a string
                     const isSelected = String(fieldValue) === String(optionValue);

                     // Opción 2: O comparación laxa (recomendada para diferentes tipos)
                     // const isSelected = fieldValue == optionValue;

                     const optionId = `${name}-${String(optionValue)}`;

                     return (
                        <label
                           key={String(optionValue)}
                           htmlFor={optionId}
                           className={`
                              relative flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                              ${
                                 isSelected
                                    ? error
                                       ? "bg-red-50 border-red-500 text-red-700"
                                       : "bg-blue-50 border-blue-500 text-blue-700"
                                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                              }
                              ${disabled ? "cursor-not-allowed opacity-70" : ""}
                           `}
                        >
                           <div
                              className={`
                              flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200
                              ${isSelected ? (error ? "border-red-500 bg-red-500" : "border-blue-500 bg-blue-500") : "border-gray-400 bg-white"}
                              ${disabled ? "border-gray-400 bg-gray-200" : ""}
                           `}
                           >
                              {isSelected && (
                                 <div
                                    className={`
                                    w-2 h-2 rounded-full transition-all duration-200
                                    ${error ? "bg-red-100" : "bg-white"}
                                 `}
                                 />
                              )}
                           </div>

                           <input
                              type="radio"
                              id={optionId}
                              name={name}
                              value={String(optionValue)} // Asegúrate de que esto coincida
                              checked={isSelected} // Esto es crucial
                              disabled={disabled}
                              onChange={() => {
                                 if (!disabled) {
                                    // IMPORTANTE: Guarda el valor en el tipo original de option[idKey]
                                    // Si optionValue es número, guarda número; si es string, guarda string
                                    formik.setFieldValue(name, optionValue);
                                 }
                              }}
                              className="absolute opacity-0 w-0 h-0"
                           />

                           <span
                              className={`
                              text-sm font-medium transition-colors duration-200
                              ${disabled ? "text-gray-500" : ""}
                           `}
                           >
                              {String(option[labelKey])}
                           </span>
                        </label>
                     );
                  })}
               </div>
            </div>

            {error ? (
               <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 mt-2 px-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium text-red-600 leading-tight">{error}</span>
               </motion.div>
            ) : null}
         </div>
      </ColComponent>
   );
};
export const FormikSwitch: React.FC<SwitchProps> = ({ label, name, responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 } }) => {
   return (
      <ColComponent responsive={responsive}>
         <Field name={name}>
            {({ field, form: { errors, touched } }: any) => {
               const error = touched?.[name] && typeof errors?.[name] === "string" ? (errors?.[name] as string) : null;

               return (
                  <div className="relative z-0 flex items-center w-full mb-5">
                     <div className="flex items-center">
                        <label htmlFor={name} className="relative inline-flex items-center cursor-pointer">
                           <input
                              {...field}
                              type="checkbox"
                              id={name}
                              className="sr-only" // Hide the native checkbox
                              onChange={(e) => {
                                 // Convert the value to a boolean or number before updating Formik's field value
                                 const value = e.target.checked ? 1 : 0;
                                 field.onChange({ target: { name, value } }); // Update Formik with the correct value
                              }}
                           />
                           <div className={`w-10 h-6 bg-gray-200 rounded-full transition-all duration-300 ${field.value === 1 ? "bg-green-700" : "bg-gray-300"}`}>
                              <div
                                 className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                                    field.value === 1 ? "translate-x-4" : ""
                                 }`}
                              />
                           </div>
                        </label>
                        <span className="ml-3 text-sm text-gray-500">{label}</span>
                     </div>

                     {error && (
                        <span className="text-sm font-semibold text-red-600" id={`${name}-error`}>
                           {error}
                        </span>
                     )}
                  </div>
               );
            }}
         </Field>
      </ColComponent>
   );
};
