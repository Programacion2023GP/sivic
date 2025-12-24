import { useEffect } from "react";
import LocationButton from "../../../../components/locationbutton/LocationButton";
import Typography from "../../../../components/typografy/Typografy";
import { FormikAutocomplete, FormikImageInput, FormikInput, FormikNativeTimeInput, FormikRadio, FormikTextArea } from "../../../../formik/FormikInputs/FormikInput";

interface StepProps {
   RESPONSIVE_CONFIG: Record<string, number>;
   contraloria: any;
   doctor: any;
   section?:"penaltie"|"traffic"
   proteccionCivil: any;
   oficiales: any;
   handleOficialChange: (name: string, value: any) => void;
   duplicate: { duplicate: boolean; value: string };
   location: any;
   isMobile: boolean;
   onNameBlur: (e: any, values: any) => void;
}

// ============================================
// STEP 0: Configuración Inicial
// ============================================
export const Step0 = ({
   RESPONSIVE_CONFIG,
   contraloria,
   doctor,
   proteccionCivil,

}: Pick<StepProps, "RESPONSIVE_CONFIG" | "contraloria" | "doctor" | "proteccionCivil">) => (
   <div className="space-y-2">
      <FormikNativeTimeInput icon="date" label="Inicio del turno" name="init_date" type="datetime-local" responsive={RESPONSIVE_CONFIG} />

      <FormikNativeTimeInput icon="date" label="Final del turno" name="final_date" type="datetime-local" responsive={RESPONSIVE_CONFIG} />

      <FormikAutocomplete
         label="Persona de contraloría a cargo"
         name="person_contraloria"
         options={contraloria.employes}
         loading={contraloria.loading}
         responsive={RESPONSIVE_CONFIG}
         idKey="value"
         labelKey="text"
         disabled
      />

      <FormikAutocomplete label="Doctor" name="doctor_id" options={doctor} responsive={RESPONSIVE_CONFIG} idKey="id" labelKey="name" />

      <FormikRadio
         name="group"
         label="Grupo"
         options={[
            { id: 1, name: "1" },
            { id: 2, name: "2" }
         ]}
         responsive={RESPONSIVE_CONFIG}
         idKey="id"
         labelKey="name"
      />

      <FormikAutocomplete
         label="Protección Civil"
         name="civil_protection"
         options={proteccionCivil.employes}
         loading={proteccionCivil.loading}
         responsive={RESPONSIVE_CONFIG}
         idKey="value"
         labelKey="text"
      />

      <FormikInput icon="auto" name="command_vehicle" label="Vehículo" responsive={RESPONSIVE_CONFIG} />

      <FormikInput icon="usuario-corbata" name="command_troops" label="Tropas" responsive={RESPONSIVE_CONFIG} />

      <FormikInput icon="usuario-corbata" name="command_details" label="Datos de Mando Único" responsive={RESPONSIVE_CONFIG} />

      <FormikInput icon="usuario-corbata" name="filter_supervisor" label="Datos del Encargado del Filtro" responsive={RESPONSIVE_CONFIG} />
   </div>
);

// ============================================
// STEP 1: Datos de Detención
// ============================================
export const Step1 = ({
   RESPONSIVE_CONFIG,
   oficiales,
   handleOficialChange,
   duplicate,
   location,
   onNameBlur,
   section,
}: Pick<StepProps, "RESPONSIVE_CONFIG" | "oficiales" | "handleOficialChange" | "duplicate" | "location" | "onNameBlur"|"section">) => {
   useEffect(()=>{
   },[section])
   return (
      <div className="space-y-2">
         {/* Información del Operativo */}
         <FormikNativeTimeInput name="time" label="Hora" responsive={RESPONSIVE_CONFIG} />

         <FormikNativeTimeInput type="date" name="date" label="Fecha de Operativo" responsive={RESPONSIVE_CONFIG} />

         <FormikAutocomplete
            label="Oficial"
            name="person_oficial"
            options={oficiales.employes}
            loading={oficiales.loading}
            responsive={RESPONSIVE_CONFIG}
            idKey="value"
            labelKey="text"
            handleModified={handleOficialChange}
         />

         <FormikInput icon="usuario-corbata" name="municipal_police" label="Policía Municipal" responsive={RESPONSIVE_CONFIG} />

         {/* Sección: Datos del Detenido */}
         <div className="my-6">
            <Typography variant="h2" className="mb-4 text-center">
               DATOS DEL DETENIDO
            </Typography>

            <div className="lg:flex">
               <FormikInput icon="cantidad" responsive={RESPONSIVE_CONFIG} name="alcohol_concentration" label="Grado de alcohol" type="number" />

               <FormikInput icon="cantidad" type="number" name="amountAlcohol" label="Cantidad de alcohol" responsive={RESPONSIVE_CONFIG} />

               <FormikRadio
                  name="vehicle_service_type"
                  label="Tipo de servicio"
                  options={[
                     { id: "Servicio público", name: "Servicio público" },
                     { id: "Carga", name: "Carga" },
                     { id: "Particular", name: "Particular" }
                  ]}
                  responsive={RESPONSIVE_CONFIG}
                  idKey="id"
                  labelKey="name"
               />
            </div>
         </div>

         {/* Nombre con validación de duplicados */}
         <FormikInput
            icon="user"
            name="name"
            label="Nombre"
            responsive={RESPONSIVE_CONFIG}
            render={() => (
               <>
                  {duplicate.duplicate && (
                     <div className="mt-2">
                        <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                           <div className="mr-2 mt-0.5">
                              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                 <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                 />
                              </svg>
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-medium text-yellow-800">Se agregará como residencia a {duplicate.value}</p>
                           </div>
                        </div>
                     </div>
                  )}
               </>
            )}
            onBlur={onNameBlur}
         />

         {/* Información de Ubicación */}
         <FormikInput disabled value={location?.address?.postcode} label="Código postal" name="cp" responsive={RESPONSIVE_CONFIG} />

         <FormikInput disabled value={location?.address?.city} label="Lugar donde se encuentran" name="location" responsive={RESPONSIVE_CONFIG} />

         {/* Datos Personales del Detenido */}
         <FormikInput type="number" icon="cantidad" name="age" label="Edad" responsive={RESPONSIVE_CONFIG} />

         <FormikInput type="number" icon="cantidad" name="number_of_passengers" label="Número de pasajeros" responsive={RESPONSIVE_CONFIG} />

         <FormikInput name="plate_number" icon="cantidad" label="Número de placa" responsive={RESPONSIVE_CONFIG} />
         {section == "traffic" && <FormikInput icon="user" name="vehicle_brand" label="Marca Vehiculo" responsive={RESPONSIVE_CONFIG} />}
         <FormikInput icon="user" name="detainee_released_to" label="Nombre de la persona que acudió" responsive={RESPONSIVE_CONFIG} />

         <FormikInput maskType="phone" name="detainee_phone_number" mask="phone" label="Teléfono del detenido" icon="phone" responsive={RESPONSIVE_CONFIG} />

         <FormikInput name="curp" label="CURP" responsive={RESPONSIVE_CONFIG} />

         <FormikTextArea name="observations" label="Observaciones" />
      </div>
   );
};

// ============================================
// STEP 2: Evidencias
// ============================================
export const Step2 = ({ isMobile }: Pick<StepProps, "isMobile">) => (
   <div className={`flex ${isMobile ? "flex-col" : "space-x-4"}`}>
      <FormikImageInput name="image_penaltie" maxFiles={1} label="Multa" />

      <FormikImageInput name="images_evidences" maxFiles={1} label="Evidencia del ciudadano" />

      <FormikImageInput name="images_evidences_car" maxFiles={1} label="Evidencia del vehículo" />

      <LocationButton idNameLat="lat" idNameLng="lon" idNameUbi="ubication" label="Ubicación" />
   </div>
);
