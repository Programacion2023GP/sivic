export interface Public_Securrity {
   id: number;
   detainee_name: string; // Nombre del detenido
   officer_name: string; // Nombre del agente
   patrol_unit_number: string; // Número de patrulla
   detention_reason: string; // Motivo de la detención
   date: string;
   time: string;
   image_security: string;
   age: number; // Edad (puede ser número o string, dependiendo de cómo se maneje en el formulario)
   location: string; // Lugar donde se encuentran
   // person_oficial: string; // Oficial (value del autocomplete)
   active: boolean;
}
