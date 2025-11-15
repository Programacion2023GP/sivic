export interface PenaltyPreloadData {
   id: number;
   // Step 1
   person_contraloria: string;
   oficial_payroll?: string; // parece que es parte del autocomplete
   person_oficial: string;
   group: number;
   doctor_id: number;

   // Step 2
   civil_protection: string;

   // Step 3
   command_vehicle: string;
   command_troops: string;
   command_details: string;
   filter_supervisor: string;

   init_date: Date;
   final_date: Date;
   user_id: number;

   [key: string]: any;
}
