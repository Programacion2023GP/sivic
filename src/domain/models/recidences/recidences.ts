export interface Recidences {
   // Campos exactos de tu SQL
   id:number,
   Nombre: string;
   Placa: string;
   "Total Reincidencias": number;
   "Historial por Niveles": string;
   "Cadena Completa": string;


   [key: string]: any;
}
