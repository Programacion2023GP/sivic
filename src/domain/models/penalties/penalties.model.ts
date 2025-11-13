export interface Penalties {
   id: number;
   time: string;
   date: string;
   has_history?: number;
   // Step 1
   person_contraloria: string;
   oficial_payroll?: string; // parece que es parte del autocomplete
   person_oficial: string;
   vehicle_service_type: string;
   alcohol_concentration: number;
   group: number;
   detainee_released_to: string;
   doctor_id: number;
   // Step 2
   municipal_police: string;
   civil_protection: string;

   // Step 3
   command_vehicle: string;
   command_troops: string;
   command_details: string;
   filter_supervisor: string;

   // Step 4
   name: string;
   cp: string;
   city: string | null;
   age: number;
   amountAlcohol: number;
   number_of_passengers?: number;
   plate_number?: string;
   detainee_phone_number?: string;
   curp: string;
   observations?: string;
   active: boolean;
   // Step 5 (opcional)
   image_penaltie?: string;
   images_evidences?: Array<string>;
   images_evidences_car?: Array<string>;
   [key: string]: any;
}
