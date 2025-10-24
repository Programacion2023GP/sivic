import {
   FastField,
   Field,
   FormikContext,
   useField,
   useFormikContext,
} from "formik";
import { useEffect, useRef, useState } from "react";
import { ColComponent } from "../../components/responsive/Responsive";
import { IoIosEyeOff, IoMdEye } from "react-icons/io";
import { FaMinus, FaPlus } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

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
   type?: "number" | "text" | "date" | "checkbox";
   disabled?: boolean;
   padding?: boolean;
   value?: any;

   handleModified?: (
      values: Record<string, any>,
      setFieldValue: (
         name: string,
         value: any,
         shouldValidate?: boolean,
      ) => void,
   ) => void;
};
export const FormikTextArea: React.FC<InputWithLabelProps> = ({
   label,
   name,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   handleModified,
   disabled = false,
   id,
}) => {
   return (
      <ColComponent responsive={responsive} autoPadding>
         <FastField name={name}>
            {({
               field,
               form: { errors, touched, values, setFieldValue },
            }: any) => {
               const error =
                  touched?.[name] && typeof errors?.[name] === "string"
                     ? (errors?.[name] as string)
                     : null;
               if (handleModified) {
                  handleModified(values, setFieldValue);
               }
               return (
                  <div
                     id={id}
                     className={`relative z-0 w-full mb-5 ${disabled && "cursor-not-allowed opacity-40"}`}>
                     <textarea
                        disabled={disabled}
                        {...field}
                        value={values?.[name] || ""}
                        id={name}
                        placeholder=" "
                        autoComplete="off"
                        rows={4} // Número de filas que el textarea mostrará por defecto
                        cols={12}
                        className={`peer block w-full px-4 py-3 mt-2 bg-transparent border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black ${error ? "border-red-500" : "border-gray-300"} transition-all duration-300`}
                     />
                     <label
                        htmlFor={name}
                        className={`absolute left-4 -top-6 text-gray-500 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-black`}>
                        {label}
                     </label>
                     {error && (
                        <span
                           className="text-sm font-semibold text-red-600"
                           id={`${name}-error`}>
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
   id,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
   type = "text",
   disabled = false,
   handleModified,
   padding = true,
}) => {
   const [field, meta] = useField(name);
   const formik = useFormikContext();
   useEffect(() => {
      if (value !== undefined && value !== null) {
         formik.setFieldValue(name, value, false);
      }
   }, [value]);

   // console.log("rendering input")

   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <FastField name={name}>
            {({
               field,
               form: { errors, touched, values, setFieldValue },
            }: any) => {
               const error =
                  touched?.[name] && typeof errors?.[name] === "string"
                     ? (errors?.[name] as string)
                     : null;
               if (handleModified) {
                  handleModified(values, setFieldValue);
               }
               return (
                  <>
                     {disabled ? (
                        <div
                           className={`relative z-0 w-full mb-5 ${disabled ? "cursor-not-allowed " : ""}`}>
                           <label
                              htmlFor={name}
                              className="absolute left-0 -top-3.5  text-sm transition-all duration-300
               peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
               peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black">
                              {label}
                           </label>

                           <div
                              className={`pt-4 pb-2 block w-full border-b-2 
                ${disabled ? "cursor-not-allowed" : ""}`}>
                              {values?.[name] || ""}
                           </div>
                        </div>
                     ) : (
                        <div
                           id={id}
                           className={`relative z-0 w-full mb-5 ${disabled && "cursor-not-allowed opacity-40"}`}>
                           <input
                              {...field}
                              disabled={disabled} // Si el input está desabilitado, no se puede editar
                              type={type}
                              value={
                                 values?.[name] !== undefined &&
                                    values?.[name] !== null
                                    ? values?.[name]
                                    : ""
                              }
                              id={name}
                              placeholder=" "
                              autoComplete="off"
                              className={`peer pt-4 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200 `}
                           />
                           <label
                              htmlFor={name}
                              className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black`}>
                              {label}
                           </label>
                           {meta.error && (meta.touched || formik.status) && (
                              <span
                                 className="text-sm font-semibold text-red-600"
                                 id={`${name}-meta.error`}>
                                 {meta.error}
                              </span>
                           )}
                        </div>
                     )}
                  </>
               );
            }}
         </FastField>
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
   padding = true,
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
            {({
               field,
               form: { errors, touched, values, setFieldValue },
            }: any) => {
               const error =
                  touched?.[name] && typeof errors?.[name] === "string"
                     ? (errors?.[name] as string)
                     : null;

               if (handleModified) {
                  handleModified(values, setFieldValue);
               }

               return (
                  <div
                     id={id}
                     className={`relative z-0 w-full mb-5 flex items-center gap-2 ${disabled ? "cursor-not-allowed opacity-40" : ""
                        }`}>
                     <input
                        {...field}
                        id={name}
                        type="checkbox"
                        disabled={disabled}
                        // checked={values?.[name] || false}
                        onChange={(e) =>
                           setFieldValue(name, e.target.checked, true)
                        }
                        className={`peer w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-black ${disabled ? "cursor-not-allowed" : ""
                           }`}
                     />
                     <label
                        htmlFor={name}
                        className={`text-gray-700 peer-checked:text-black ${disabled ? "cursor-not-allowed" : ""
                           }`}>
                        {label}
                     </label>

                     {meta.error && (meta.touched || formik.status) && (
                        <span
                           className="absolute left-0 text-sm font-semibold text-red-600 top-6"
                           id={`${name}-meta.error`}>
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

import { AiOutlineCamera } from "react-icons/ai"; // Icono de cámara para el botón

interface FormikImageInputProps {
   label: string;
   name: string;
   disabled?: boolean;
   acceptedFileTypes?: string; // Opcional: acepta tipos de archivo para validación
}

export const FormikImageInput: React.FC<FormikImageInputProps> = ({
   label,
   name,
   disabled = false,
   acceptedFileTypes = "image/*", // Definir los tipos de archivo aceptados (por defecto imágenes)
}) => {
   const { setFieldValue, errors, touched } = useFormikContext(); // Obtenemos el contexto de Formik
   const [preview, setPreview] = useState<string | null>(null); // Para vista previa de la imagen
   const [fileName, setFileName] = useState<string | null>(null); // Nombre del archivo seleccionado

   const fileInputRef = useRef<HTMLInputElement | null>(null); // Referencia al input de archivo

   // Función para manejar el cambio de archivo
   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]; // Obtener el primer archivo
      if (file) {
         setFieldValue(name, file); // Establecer el archivo en Formik

         // Vista previa de la imagen
         const reader = new FileReader();
         reader.onloadend = () => {
            setPreview(reader.result as string);
         };
         reader.readAsDataURL(file);

         // Mostrar nombre del archivo
         setFileName(file.name);
      }
   };

   // Función para abrir el campo de archivo al hacer clic en la imagen de vista previa
   const handleImageClick = () => {
      if (fileInputRef.current) {
         fileInputRef.current.click(); // Disparar el click en el input
      }
   };

   return (
      <div className="relative z-0 w-full mb-5">
         <label
            htmlFor={name}
            className="block mb-2 text-sm font-medium text-gray-500">
            {label}
         </label>

         <div className="flex flex-col items-center justify-center space-y-4">
            {/* Área para la vista previa de la imagen o el botón de carga */}
            <div className="relative w-full h-60">
               {preview && (
                  <img
                     src={preview}
                     alt="Preview"
                     className="object-cover w-full h-full transition-transform duration-300 border-4 shadow-lg cursor-pointer border-cyan-500 hover:scale-105"
                     onClick={handleImageClick} // Hacer clic en la imagen para cambiarla
                  />
               )}
               <div
                  className={`${preview ? "invisible hidden w-0 h-0" : "w-full h-full"} flex items-center justify-center  bg-gray-100 border-4 border-dashed border-gray-300 rounded-full cursor-pointer`}
                  style={{ minHeight: "8rem" }}>
                  <input
                     ref={fileInputRef} // Asignamos la referencia al input
                     id={name}
                     name={name}
                     type="file"
                     accept={acceptedFileTypes}
                     onChange={handleChange}
                     disabled={disabled}
                     className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <AiOutlineCamera className="text-3xl text-gray-600" />
               </div>
            </div>

            {/* Mostrar nombre del archivo seleccionado */}
            {fileName && (
               <span className="mt-2 text-sm text-gray-500">{fileName}</span>
            )}

            {/* Texto de ayuda o mensaje de validación */}
            <span className="text-xs text-gray-500">
               {`Solo archivos de tipo: ${acceptedFileTypes.replace("image/", "")}`}
            </span>

            {/* Mensaje de error de Formik */}
            {touched[name as keyof typeof touched] && errors[name as keyof typeof errors] && (
               <div className="mt-2 text-sm font-semibold text-red-600">
                  {errors[name as keyof typeof errors]}
               </div>
            )}

         </div>
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
   id,
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
         ["I", 1],
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

   const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      setFieldValue: any,
   ) => {
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
               const error =
                  touched?.[name] && typeof errors?.[name] === "string"
                     ? (errors?.[name] as string)
                     : null;

               return (
                  <div className="relative z-0 w-full mb-5">
                     <div className="flex items-center border-b-2 border-gray-200 focus-within:border-black">
                        {/* Botón de decremento */}
                        <button
                           type="button"
                           onClick={() =>
                              setFieldValue(
                                 name,
                                 Math.max(
                                    (field.value || 0) - (decimals ? 0.1 : 1),
                                    min || 0,
                                 ),
                              )
                           }
                           className="px-3 py-2 text-gray-500 hover:text-black focus:outline-none">
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
                           onClick={() =>
                              setFieldValue(
                                 name,
                                 Math.min(
                                    (field.value || 0) + (decimals ? 0.1 : 1),
                                    max || Infinity,
                                 ),
                              )
                           }
                           className="px-3 py-2 text-gray-500 hover:text-black focus:outline-none">
                           <FaPlus />
                        </button>
                     </div>
                     <label
                        htmlFor={name}
                        className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black">
                        {label}
                     </label>
                     {meta.error && (meta.touched || formik.status) && (
                        <span
                           className="text-sm font-semibold text-red-600"
                           id={`${name}-meta.error`}>
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
export const FormikPasswordInput: React.FC<InputWithLabelProps> = ({
   label,
   name,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
}) => {
   const [showPassword, setShowPassword] = useState(false);

   return (
      <ColComponent responsive={responsive}>
         <Field name={name}>
            {({ field, form: { errors, touched, values } }: any) => {
               const error =
                  touched?.[name] && typeof errors?.[name] === "string"
                     ? (errors?.[name] as string)
                     : null;

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
                        className={`absolute left-0 -top-3.5 text-gray-500 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black`}>
                        {label}
                     </label>
                     <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)} // Cambia el estado
                        className="absolute right-0 text-gray-500 top-4 focus:outline-none">
                        {showPassword ? (
                           <IoMdEye className="w-5 h-5" />
                        ) : (
                           <IoIosEyeOff className="w-5 h-5" />
                        )}
                     </button>
                     {error && (
                        <span
                           className="text-sm font-semibold text-red-600"
                           id={`${name}-error`}>
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
   name: string;
   loading?: boolean;
   options: Array<T>;
   id?: string;
   idKey: keyof T;
   labelKey: keyof T;
   responsive?: {
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
      "2xl"?: number;
   };
   disabled?: boolean;
   padding?: boolean; // Agregar espacio entre cada opción
   handleModifiedOptions?: {
      name: string;
   };
   handleModified?: (name: string, values: string | number) => any;
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
   id,
   handleModified,
   handleModifiedOptions,
}: AutocompleteProps<T>) => {
   const formik = useFormikContext(); // Obtenemos el contexto de Formik
   if (!formik) {
      throw new Error("Formik context not found");
   }
   const { values } = formik;
   const [form, meta] = useField(name);
   const [filteredOptions, setFilteredOptions] = useState(options);
   const [activeIndex, setActiveIndex] = useState(-1);
   const [showOptions, setShowOptions] = useState(false);
   const [textSearch, setTextSearch] = useState(""); //
   const inputRef = useRef<HTMLInputElement>(null);
   const optionRefs = useRef<(HTMLLIElement | null)[]>([]); // Array de referencias
   const menuRef = useRef<HTMLUListElement>(null); // Referencia para el contenedor de las opciones (ul)
   const handleFilter = (query: string) => {
      setTextSearch(query);
      const lowerQuery = query.toLowerCase();

      const filtered = options.filter((item) =>
         String(item[labelKey]).toLowerCase().includes(lowerQuery),
      );
      setFilteredOptions(filtered);
      setActiveIndex(-1); // Reiniciar la selección
   };
   const handleClickOutside = (e: MouseEvent) => {
      if (
         inputRef.current &&
         !inputRef.current.contains(e.target as Node) && // Si el clic no es en el input
         menuRef.current &&
         !menuRef.current.contains(e.target as Node) // Si el clic no es en el menú de opciones
      ) {
         setShowOptions(false); // Cerrar las opciones
      }
   };
   const scrollToOption = (index: number) => {
      const optionElement = optionRefs.current[index];
      if (optionElement) {
         optionElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
         });
      }
   };
   const handleKeyDown = (
      e: React.KeyboardEvent,
      setFieldValue: (name: string, value: any) => void,
   ) => {
      if (!showOptions) return;

      switch (e.key) {
         case "ArrowDown":
            setActiveIndex((prev) => {
               const nextIndex = (prev + 1) % filteredOptions.length;
               scrollToOption(nextIndex);
               return nextIndex;
            });
            break;
         case "ArrowUp":
            setActiveIndex((prev) => {
               const nextIndex =
                  prev <= 0 ? filteredOptions.length - 1 : prev - 1;
               scrollToOption(nextIndex);
               return nextIndex;
            });
            break;
         case "Enter":
            if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
               selectOption(filteredOptions[activeIndex], setFieldValue);
               e.preventDefault(); // Evitar el submit
            }
            break;
         case "Escape":
            setShowOptions(false);
            break;
      }
   };

   const selectOption = (
      option: T,
      setFieldValue: (name: string, value: any) => void,
   ) => {
      setTextSearch(option[labelKey]); //
      setFilteredOptions(options);
      setFieldValue(name, option[idKey]); // Establecer el valor en Formik
      handleModified && handleModified(name, option[idKey]);
      // handleModified(name,value);

      setShowOptions(false);
   };

   const handleOptionClick = (
      option: T,
      setFieldValue: (name: string, value: any) => void,
   ) => {
      setTextSearch(option[labelKey]); //
      selectOption(option, setFieldValue);

      // setShowOptions(false);
   };

   const handleInputFocus = () => {
      setShowOptions(true);
      setFilteredOptions(options);
   };
   useEffect(() => {
      // Agregar un evento de escucha para el clic fuera
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
         // Limpiar el evento al desmontar el componente
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);
   const handleInputBlur = () => {
      setShowOptions(false);
   };

   useEffect(() => {

   }, [filteredOptions]);
   return (
      <ColComponent responsive={responsive} autoPadding={padding}>
         <Field name={name}>
            {({
               field,
               form: { setFieldValue, errors, touched, values, setTouched },
            }: any) => {
               const error =
                  touched?.[name] && typeof errors?.[name] === "string"
                     ? // && (values?.[name]==0 || values?.[name]==""||values?.[name]==undefined)
                     (errors?.[name] as string)
                     : null;
               // console.log(meta)
               // if ( values[name] == 0) {
               //   setTextSearch("")
               // }
               return (
                  <div
                     id={id}
                     className={`relative  w-full mb-5 ${disabled && " cursor-not-allowed"}`}>
                     <input
                        // {...field}

                        disabled={disabled}
                        ref={inputRef}
                        type="text"
                        onFocus={() => {
                           if (disabled) {
                              return;
                           }
                           // formik.setTouched((prev:any)=>({
                           //   ...prev,[name]: true
                           // }))
                           handleInputFocus();
                        }}
                        onBlur={(e) => {
                           setTimeout(() => {
                              setShowOptions(false);
                           }, 300);
                           formik.handleBlur(e);
                        }}
                        autoComplete="off"
                        id={name}
                        placeholder=" "
                        value={
                           (Array.isArray(options) &&
                              options.find((item) => item[idKey] === values?.[name])?.[labelKey]) ||
                           (values?.[name] === 0 ? "" : textSearch) // Si el valor es 0, mostrar vacío
                        }
                        // onClick={() => {
                        //   if (disabled) {
                        //     return;
                        //   }
                        //   setFieldValue(name, ""); // Establecer el valor vacío al hacer clic
                        //   handleInputFocus();
                        // }}
                        // onBlur={handleInputFocus}
                        onChange={(e) => {
                           if (disabled) {
                              return;
                           }
                           handleFilter(e.target.value);
                           setFieldValue(name, e.target.value); // Actualizar el valor en Formik
                        }}
                        onKeyDown={(e) => {
                           handleKeyDown(e, setFieldValue);
                        }}
                        className="block w-full px-0 pt-4 pb-2 mt-0 bg-transparent border-0 border-b-2 border-gray-200 appearance-none peer focus:outline-none focus:ring-0 focus:border-black"
                     />

                     <label
                        htmlFor={name}
                        className="absolute  left-0 -top-3.5 text-gray-500 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black">
                        {label}
                        {loading && (
                           <span
                              className="inline-block w-4 h-4 ml-2 border-2 border-gray-500 rounded-full animate-spin border-t-transparent"
                              role="status"
                              aria-live="polite" // Anuncia el estado de carga para lectores de pantalla
                           >
                              <span className="sr-only">Cargando...</span>{" "}
                              {/* Texto para lectores de pantalla */}
                           </span>
                        )}
                     </label>
                     <div
                        onClick={handleInputFocus}
                        className="absolute right-0 cursor-pointer top-6">
                        {!disabled && <IoMdArrowDropdown />}
                     </div>

                     {showOptions && (
                        <ul
                           ref={menuRef} // Añadimos la referencia para la lista
                           className="absolute z-10 w-full mt-1 overflow-auto bg-white border border-gray-300 rounded shadow-md max-h-40">
                           {Array.isArray(filteredOptions) &&
                              filteredOptions.length > 0 &&
                              filteredOptions.map((option, index) => (
                                 <li
                                    ref={(el) => {
                                       optionRefs.current[index] = el;
                                    }}

                                    key={
                                       option[idKey]
                                          ? String(option[idKey])
                                          : String(index)
                                    } // Fallback to index if idKey is undefined
                                    onClick={() =>
                                       handleOptionClick(option, setFieldValue)
                                    }
                                    className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${activeIndex === index
                                       ? "bg-blue-200"
                                       : ""
                                       }`}>
                                    {String(option[labelKey])}
                                 </li>
                              ))}
                        </ul>
                     )}

                     {error && (
                        <span
                           className="text-sm font-semibold text-red-600"
                           id={`${name}-error`}>
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

export const FormikSwitch: React.FC<SwitchProps> = ({
   label,
   name,
   responsive = { sm: 12, md: 12, lg: 12, xl: 12, "2xl": 12 },
}) => {
   return (
      <ColComponent responsive={responsive}>
         <Field name={name}>
            {({ field, form: { errors, touched } }: any) => {
               const error =
                  touched?.[name] && typeof errors?.[name] === "string"
                     ? (errors?.[name] as string)
                     : null;

               return (
                  <div className="relative z-0 flex items-center w-full mb-5">
                     <div className="flex items-center">
                        <label
                           htmlFor={name}
                           className="relative inline-flex items-center cursor-pointer">
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
                           <div
                              className={`w-10 h-6 bg-gray-200 rounded-full transition-all duration-300 ${field.value === 1 ? "bg-green-700" : "bg-gray-300"}`}>
                              <div
                                 className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${field.value === 1 ? "translate-x-4" : ""}`}
                              />
                           </div>
                        </label>
                        <span className="ml-3 text-sm text-gray-500">
                           {label}
                        </span>
                     </div>

                     {error && (
                        <span
                           className="text-sm font-semibold text-red-600"
                           id={`${name}-error`}>
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
