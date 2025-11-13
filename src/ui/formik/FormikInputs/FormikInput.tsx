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

   handleModified?: (values: Record<string, any>, setFieldValue: (name: string, value: any, shouldValidate?: boolean) => void) => void;
};
export const FormikTextArea: React.FC<InputWithLabelProps> = ({
   label,
   name,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   handleModified,
   disabled = false,
   id
}) => {
   return (
      <ColComponent responsive={responsive} autoPadding>
         <FastField name={name}>
            {({ field, form: { errors, touched, values, setFieldValue } }: any) => {
               const error = touched?.[name] && typeof errors?.[name] === "string" ? (errors?.[name] as string) : null;
               if (handleModified) {
                  handleModified(values, setFieldValue);
               }
               return (
                  <div id={id} className={`relative z-0 w-full mb-5 ${disabled && "cursor-not-allowed opacity-40"}`}>
                     <textarea
                        disabled={disabled}
                        {...field}
                        value={values?.[name] || ""}
                        id={name}
                        placeholder=" "
                        autoComplete="off"
                        rows={4} // Número de filas que el textarea mostrará por defecto
                        cols={12}
                        className={`peer block w-full px-4 py-3 mt-2 bg-transparent border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black ${
                           error ? "border-red-500" : "border-gray-300"
                        } transition-all duration-300`}
                     />
                     <label
                        htmlFor={name}
                        className={`absolute left-4 -top-6 text-gray-500 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-black`}
                     >
                        {label}
                     </label>
                     {error && (
                        <span className="text-sm font-semibold text-red-600" id={`${name}-error`}>
                           {error}
                        </span>
                     )}
                  </div>
               );
            }}
         </FastField>
      </ColComponent>
   );
};


export const FormikInput: React.FC<InputWithLabelProps> = ({
   label,
   value,
   name,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   type = "text",
   disabled = false,
   handleModified,
   padding = true,
}) => {
   const formik = useFormikContext();

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

               const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  let newValue = e.target.value;

                  // 🔥 TRANSFORMAR A MAYÚSCULAS
                     newValue = newValue.toUpperCase();
                  

                  setFieldValue(name, newValue);

                  if (newValue !== field.value && handleModified) {
                     handleModified({ ...values, [name]: newValue }, setFieldValue);
                  }
               };

               const handleBlur = () => {
                  setFieldTouched(name, true, true);
               };

               // Clase base del borde dependiendo del error
               const borderClass = error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-black";

               return (
                  <div className="relative z-0 w-full mb-5">
                     {disabled ? (
                        <div className={`pt-4 pb-2 border-b-2 ${borderClass} cursor-not-allowed`}>{values?.[name] || ""}</div>
                     ) : (
                        <input
                           {...field}
                           id={name}
                           type={type}
                           placeholder=" "
                           autoComplete="off"
                           value={values?.[name] ?? ""}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           className={`peer pt-4 pb-2 block w-full bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 `}
                        />
                     )}

                     <label
                        htmlFor={name}
                        className={`absolute left-0 -top-3.5 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm ${
                           error
                              ? "text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600"
                              : "text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-black"
                        }`}
                     >
                        {label}
                     </label>

                     {error && (
                        <div className="mt-1 flex items-center gap-1">
                           <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                 clipRule="evenodd"
                              />
                           </svg>
                           <span className="text-sm font-semibold text-red-600" id={`${name}-error`}>
                              {error}
                           </span>
                        </div>
                     )}
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
   padding = true
}) => {
   const formik = useFormikContext();

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <FastField name={name}>
            {({ field, form: { values, setFieldValue, setFieldTouched, touched, errors } }: any) => {
               const error = touched?.[name] && errors?.[name] ? String(errors[name]) : null;
               const borderClass = error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-black";

               const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const newValue = e.target.value;
                  setFieldValue(name, newValue);

                  if (newValue !== field.value && handleModified) {
                     handleModified({ ...values, [name]: newValue }, setFieldValue);
                  }
               };

               return (
                  <div className="relative z-0 w-full mb-5">
                     {disabled ? (
                        <div className={`pt-4 pb-2 border-b-2 ${borderClass} cursor-not-allowed`}>{values?.[name] || ""}</div>
                     ) : (
                        <input
                           {...field}
                           id={name}
                           type="time"
                           placeholder=" "
                           autoComplete="off"
                           value={values?.[name] ?? ""}
                           onChange={handleChange}
                           onBlur={() => setFieldTouched(name, true, true)}
                           className={`peer pt-4 pb-2 block w-full bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 ${borderClass}`}
                        />
                     )}

                     <label
                        htmlFor={name}
                        className={`absolute left-0 -top-3.5 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm ${
                           error
                              ? "text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600"
                              : "text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-black"
                        }`}
                     >
                        {label}
                     </label>

                     {error && (
                        <div className="mt-1 flex items-center gap-1">
                           <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                 clipRule="evenodd"
                              />
                           </svg>
                           <span className="text-sm font-semibold text-red-600" id={`${name}-error`}>
                              {error}
                           </span>
                        </div>
                     )}
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
   colorPalette: Array<string>,
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
   const [currentColor, setCurrentColor] = useState<string>(value );
   const pickerRef = useRef<HTMLDivElement>(null);



   // 🔁 Mantener sincronizado con Formik y valor inicial
   useEffect(() => {
      const val = formik.values[name] || value ;
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
         <div className="w-full relative mb-5" ref={pickerRef}>
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
                        className="w-12 h-12 rounded-xl border-3 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl"
                        style={{
                           backgroundColor: currentColor,
                           borderColor: isOpen ? "#8B5CF6" : "#E5E7EB"
                        }}
                     />
                     {/* Efecto de brillo */}
                     <div
                        className="absolute inset-0 rounded-xl opacity-20 transition-opacity duration-300 group-hover:opacity-30"
                        style={{
                           backgroundColor: "white",
                           background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)"
                        }}
                     />
                  </div>

                  {/* Texto con mejor tipografía */}
                  <div className="flex flex-col items-start text-left">
                     <span className="text-base font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{label}</span>
                     <span className="text-sm font-mono text-gray-500 group-hover:text-gray-600 transition-colors mt-1">{currentColor}</span>
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
               <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-200">
                  {/* Header del dropdown */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                     <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Seleccionar color</h3>
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border">{colorPalette.length} colores</span>
                     </div>

                     {/* Color actual destacado */}
                     <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm" style={{ backgroundColor: currentColor }} />
                        <div className="flex-1">
                           <span className="text-sm font-medium text-gray-700">Color actual</span>
                           <span className="block text-xs font-mono text-gray-500">{currentColor}</span>
                        </div>
                     </div>
                  </div>

                  {/* Grid de colores con scroll suave */}
                  <div className="p-4 max-h-64 overflow-y-auto custom-scrollbar">
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
                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                     <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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
                     <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
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

interface UploadingFile {
   file: File;
   preview: string;
   progress: number;
}

export const FormikImageInput: React.FC<FormikImageInputProps> = ({
   label,
   name,
   disabled = false,
   acceptedFileTypes = "image/*",
   multiple = false,
   maxFiles = 5
}) => {
   const { setFieldValue, errors, touched } = useFormikContext<any>();
   const [uploads, setUploads] = useState<UploadingFile[]>([]);
   const [previewModal, setPreviewModal] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement | null>(null);
   const [isMobile, setIsMobile] = useState(false);
   const [useCamera, setUseCamera] = useState(true);

   useEffect(() => {
      if (typeof window !== "undefined") {
         const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
         setIsMobile(mobileCheck);
      }
   }, []);

   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
      if (!selectedFiles.length) return;

      let newFiles = multiple ? selectedFiles : [selectedFiles[0]];
      if (multiple && uploads.length + newFiles.length > maxFiles) {
         newFiles = newFiles.slice(0, maxFiles - uploads.length);
      }

      const newUploads = newFiles.map((file) => ({
         file: new File([file], file.name),
         preview: URL.createObjectURL(file),
         progress: 0
      }));

      setUploads((prev) => [...prev, ...newUploads]);
      setFieldValue(name, multiple ? [...uploads.map((u) => u.file), ...newUploads.map((u) => u.file)] : newUploads[0].file);

      // Simular progreso de carga
      newUploads.forEach((u) => {
         const interval = setInterval(() => {
            setUploads((prev) => prev.map((p) => (p.preview === u.preview ? { ...p, progress: Math.min(p.progress + 10, 100) } : p)));
         }, 100);

         setTimeout(() => clearInterval(interval), 1100);
      });

      // Limpiar input
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
   };

   const handleImageClick = () => {
      if (!disabled && fileInputRef.current) {
         fileInputRef.current.click();
      }
   };

   const handleRemove = (index: number) => {
      const updatedUploads = uploads.filter((_, i) => i !== index);
      setUploads(updatedUploads);
      setFieldValue(name, multiple ? updatedUploads.map((u) => u.file) : updatedUploads[0]?.file || null);
   };

   // CORRECCIÓN: Tipo correcto para capture
   const getCaptureAttribute = (): boolean | "user" | "environment" | undefined => {
      if (!isMobile || !useCamera) return undefined;
      return "environment"; // Cámara trasera por defecto
   };

   const getInputAccept = () => {
      if (isMobile && useCamera) {
         return "image/*;capture=camera";
      }
      return acceptedFileTypes;
   };

   return (
      <div className="relative w-full mb-5">
         <label className="block mb-2 text-sm font-medium text-gray-600">{label}</label>

         {/* Switch para móviles */}
         {isMobile && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Modo de entrada:</span>
                  <div className="flex items-center space-x-3">
                     <button
                        type="button"
                        onClick={() => setUseCamera(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           useCamera 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                     >
                        📷 Tomar Foto
                     </button>
                     <button
                        type="button"
                        onClick={() => setUseCamera(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           !useCamera 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                     >
                        📁 Subir Imagen
                     </button>
                  </div>
               </div>
               <p className="text-xs text-blue-600 mt-2">
                  {useCamera 
                     ? "Se abrirá la cámara para tomar una foto directamente" 
                     : "Se abrirá la galería para seleccionar una imagen existente"
                  }
               </p>
            </div>
         )}

         <div className="flex flex-wrap gap-4">
            <AnimatePresence>
               {uploads.map((upload, index) => (
                  <motion.div
                     key={upload.preview + index}
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ duration: 0.2 }}
                     className="relative w-32 h-32 rounded-lg overflow-hidden shadow-lg border border-gray-200"
                  >
                     <img
                        src={upload.preview}
                        alt={`Preview ${index}`}
                        className="object-cover w-full h-full cursor-pointer transition-transform duration-300 hover:scale-105"
                        onClick={() => setPreviewModal(upload.preview)}
                     />

                     {upload.progress < 100 && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-semibold">
                           {upload.progress}%
                        </div>
                     )}

                     {/* Botones de acciones */}
                     <div className="absolute top-1 right-1 flex space-x-1">
                        <button 
                           type="button" 
                           onClick={() => handleRemove(index)} 
                           className="bg-red-500 rounded-full p-1 text-white hover:bg-red-600 shadow-md"
                        >
                           <AiOutlineClose size={16} />
                        </button>
                        <button
                           type="button"
                           onClick={() => setPreviewModal(upload.preview)}
                           className="bg-blue-500 rounded-full p-1 text-white hover:bg-blue-600 shadow-md"
                        >
                           <AiOutlineEye size={16} />
                        </button>
                     </div>
                  </motion.div>
               ))}
            </AnimatePresence>

            {!disabled && uploads.length < maxFiles && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
               >
                  <div
                     className="w-32 h-32 flex flex-col items-center justify-center border-4 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors duration-300 hover:bg-gray-100"
                     onClick={handleImageClick}
                  >
                     {isMobile ? (
                        <>
                           <div className="text-2xl mb-2">
                              {useCamera ? "📷" : "📁"}
                           </div>
                           <span className="text-xs text-gray-600 text-center px-2">
                              {useCamera ? "Tomar Foto" : "Subir Imagen"}
                           </span>
                        </>
                     ) : (
                        <>
                           <AiOutlineCamera className="text-3xl text-gray-500 mb-2" />
                           <span className="text-xs text-gray-600">Subir Imagen</span>
                        </>
                     )}
                  </div>
                  
                  {/* Indicador del modo actual para móviles */}
                  {isMobile && (
                     <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {useCamera ? "📷" : "📁"}
                     </div>
                  )}
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

         {touched && errors && (touched as Record<string, any>)[name] && (errors as Record<string, any>)[name] && (
            <div className="mt-2 text-sm font-semibold text-red-600">{(errors as Record<string, any>)[name]}</div>
         )}

         <div className="mt-2 space-y-1">
            <span className="text-xs text-gray-500 block">
               {`Formatos aceptados: ${acceptedFileTypes.replace("image/", "").split(',').join(', ')}`}
            </span>
            {multiple && maxFiles && (
               <span className="text-xs text-gray-500 block">
                  {`Máximo de imágenes: ${maxFiles} (${uploads.length}/${maxFiles} utilizadas)`}
               </span>
            )}
            {isMobile && (
               <span className="text-xs text-blue-600 block">
                 {useCamera 
                    ? "✅ Modo cámara: Toma fotos directamente" 
                    : "✅ Modo galería: Selecciona imágenes existentes"
                 }
               </span>
            )}
         </div>

         {/* Modal de previsualización */}
         {previewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setPreviewModal(null)}>
               <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative max-w-4xl max-h-full p-4"
                  onClick={(e) => e.stopPropagation()}
               >
                  <img 
                     src={previewModal} 
                     alt="Preview large" 
                     className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" 
                  />
                  <button
                     onClick={() => setPreviewModal(null)}
                     className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 transition"
                  >
                     ✕
                  </button>
               </motion.div>
            </div>
         )}
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
      if (Array.isArray(name)) {
         return getNestedValue(formik.values, name);
      }
      return formik.values[name];
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
   };

   const handleOptionClick = (option: T) => selectOption(option);

   const displayValue = () => {
      return textSearch;
   };

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <div className={`relative w-full mb-5 ${disabled ? "cursor-not-allowed" : ""}`}>
            <input
               disabled={disabled}
               ref={inputRef}
               type="text"
               value={displayValue()}
               placeholder=" "
               autoComplete="off"
               onFocus={() => {
                  if (!disabled) {
                     setFilteredOptions(options);
                     setShowOptions(true);
                  }
               }}
               onChange={(e) => !disabled && handleFilter(e.target.value)}
               onKeyDown={handleKeyDown}
               className={`block w-full px-0 pt-4 pb-2 mt-0 bg-transparent border-0 border-b-2 appearance-none peer focus:outline-none focus:ring-0 ${
                  error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-black"
               } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            />

            <label
               className={`absolute left-0 -top-3.5 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm ${
                  error
                     ? "text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600"
                     : "text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-black"
               }`}
            >
               {label}
               {loading && <span className="inline-block w-4 h-4 ml-2 border-2 border-gray-500 rounded-full animate-spin border-t-transparent"></span>}
            </label>

            <div onClick={() => !disabled && setShowOptions(true)} className="absolute right-0 cursor-pointer top-6">
               {!disabled && <IoMdArrowDropdown />}
            </div>

            {showOptions && (
               <ul ref={menuRef} className="absolute z-10 w-full mt-1 overflow-auto bg-white border border-gray-300 rounded shadow-md max-h-40">
                  {filteredOptions.map((option, index) => (
                     <li
                        key={Array.isArray(idKey) ? idKey.map((k) => option[k]).join("-") : String(option[idKey])}
                        ref={(el) => {
                           optionRefs.current[index] = el;
                        }}
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${activeIndex === index ? "bg-blue-200" : ""}`}
                        onClick={() => handleOptionClick(option)}
                     >
                        {String(option[labelKey])}
                     </li>
                  ))}
               </ul>
            )}

            {/* Mostrar error de Formik */}
            {error && (
               <div className="mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                     <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                     />
                  </svg>
                  <span className="text-sm font-medium text-red-600">{error}</span>
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

   const error = meta.touched && meta.error && typeof meta.error === "string" ? meta.error : null;

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <label className="block text-gray-700 font-semibold mb-2">{label}</label>
         <div className="w-full  mb-4 pb-2 flex flex-wrap gap-3">
            {options.map((option) => (
               <label
                  key={String(option[idKey])}
                  className={`cursor-pointer flex items-center px-4 py-2 border rounded-md transition-colors duration-200 ${
                     field.value === option[idKey]
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
               >
                  <input
                     type="radio"
                     name={name}
                     value={String(option[idKey])}
                     checked={field.value === option[idKey]}
                     disabled={disabled}
                     onChange={() => formik.setFieldValue(name, option[idKey])}
                     className="hidden"
                  />
                  <span className="ml-2">{String(option[labelKey])}</span>
               </label>
            ))}
         </div>
         {error && <span className="text-sm font-semibold text-red-600">{error}</span>}
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
