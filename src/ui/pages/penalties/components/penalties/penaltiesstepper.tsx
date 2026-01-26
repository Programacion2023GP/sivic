import { memo, useMemo } from "react";
import { useFormikContext } from "formik";
type section = "penaltie" | "traffic" | "securrity" | "courts" | "general";
import { getIn } from "formik";

interface StepperProps {
   section: section;
   steps: string[];
   activeStep: number;
   setActiveStep: (i: number) => void;
}

const PenaltiesStepper = ({ section,steps, activeStep, setActiveStep }: StepperProps) => {
   const { errors, touched } = useFormikContext<any>();
const stepFields: Record<string, Record<number, string[]>> = {
   penaltie: {
      0: ["init_date", "final_date", "doctor_id", "group", "filter_supervisor"],
      1: [
         "time",
         "date",
         "person_oficial",
         "alcohol_concentration",
         "person_contraloria",
         "civil_protection",
         "command_vehicle",
         "command_troops",
         "command_details",
         "plate_number"
      ],
      2: ["name", "cp", "city"]
   },
   traffic: {
      0: [],
      1: ["age", "vehicle_brand", "name", "plate_number", "time", "alcohol_concentration"],
      2: ["image_penaltie", "images_evidences", "images_evidences_car"]
   },
   securrity: {
      0: [],
      1: ["detention_reason", "municipal_police", "patrol_unit_number"],
      2: []
   },
   courts: {
      0: [],
      1: ["exit_reason"],
      2: []
   }
};

const hasStepError = useMemo(() => {
   return (stepIndex: number) => {
      const fields = stepFields[section]?.[stepIndex] ?? [];

      return fields.some((field) => {
         const fieldTouched = getIn(touched, field);
         const fieldError = getIn(errors, field);
         return Boolean(fieldError && fieldTouched);
      });
   };
}, [section, errors, touched, stepFields]);



   return (
      <div className="w-full p-4 mb-6 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
         <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
            {steps.map((step, i) => {
               const isActive = activeStep === i;
               const isCompleted = activeStep > i;
               const hasError = hasStepError(i);
               const isLast = i === steps.length - 1;

               return (
                  <div key={i} className="relative flex flex-col items-center flex-1 text-center">
                     {!isLast && (
                        <div
                           className={`absolute top-[18px] left-[50%] w-full h-[3px] transition-all duration-500 ease-out z-0
                              ${isCompleted && !hasError ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gray-300"}`}
                        />
                     )}

                     <div
                        className={`z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold text-base 
                           shadow-lg transition-all duration-300 ease-out transform
                           ${
                              isActive
                                 ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white scale-125 shadow-blue-400/50 ring-4 ring-blue-200"
                                 : isCompleted && !hasError
                                 ? "bg-gradient-to-br from-green-400 to-green-600 text-white scale-110 shadow-green-400/50"
                                 : hasError
                                 ? "bg-gradient-to-br from-red-400 to-red-600 text-white scale-105 shadow-red-400/50 ring-2 ring-red-300"
                                 : "bg-white text-gray-500 border-2 border-gray-300 hover:border-gray-400"
                           }`}
                     >
                        {isCompleted && !hasError ? (
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                 clipRule="evenodd"
                              />
                           </svg>
                        ) : hasError ? (
                           <span className="text-xl">!</span>
                        ) : (
                           <span>{i + 1}</span>
                        )}
                     </div>

                     <p
                        className={`mt-3 text-xs sm:text-sm font-semibold leading-tight max-w-[100px] transition-colors duration-300
                           ${isActive ? "text-blue-700" : isCompleted && !hasError ? "text-green-700" : hasError ? "text-red-600" : "text-gray-500"}`}
                     >
                        {step}
                     </p>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

PenaltiesStepper.displayName = "PenaltiesStepper";

export default PenaltiesStepper;
