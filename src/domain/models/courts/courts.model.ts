interface Court {
   id: number; //folio
   date: string;
   referring_agency: string; // remite
   detainee_name: string; // nombre detenido
   detention_reason: string; // motivo de detencion
   entry_time: string; // hora de entrada
   exit_datetime: string | null; // hora y fecha de salida
   exit_reason: string | null; // causa de salida
   fine_amount: number | null; // multa
   image_court:string,
   // Campos adicionales comunes
   created_at: string;
   penalties_id?: number;
   updated_at: string;
   active?: boolean;
}
