export interface Techinical {
  // Identifiers
  id: number;
 procedureId: number;           // 'tramite' translated as procedure/request ID
  dependeceAssignedId: number; // 'dependeceasigned' translated as assigned dependency ID

  // Personal Information
  firstName: string;           // 'name'
  paternalSurname: string;
  maternalSurname?: string | null;
fullName:string,
  // Address Information
  street: string;
  number: number;              // street number
  city: number;
  section: string;             // could be neighborhood/area
  postalCode: number;          // 'cp'
  municipality: string;        // 'municipio'
  locality: string;            // 'localidad'
  reference?: string;          // additional reference

  // Contact Information
  cellphone: string;

  // Task Details
  requestDescription: string;  // 'solicitud'
  solutionDescription: string; // 'solucion'
  userId:number,
   active?:boolean

}
// Interfaz para cada comunidad / colonia
export interface Neighborhood {
  id: number;
  Colonia: string;            // Colonia
  CodigoPostal: string;      // CodigoPostal
  Tipo: string;            // Tipo (e.g., colonia)
  Zona: string;            // Zona (e.g., urbana)
  MunicipioId: number;  // MunicipioId
  Municipio: string;    // Municipio
  Estado: string;           // Estado
  PerimetroId: number;     // PerimetroId
  Perimetro: string;       // Perimetro
}

// Interfaz para la respuesta completa de la API
export interface ResponseApi<T extends object> {
  data:{
    statusCode: number;      // status_code
  status: boolean;         // status
  message: string;         // message
  alert_icon: string;       // alert_icon
  alertTitle: string;      // alert_title
  alert_text: string;       // alert_text
  result: T[];  // array de comunidades
  toast: boolean;     
  }     // toast
}

export interface Report {
  Calle: string;
  Cp: string;
  Solicitud: string;
  Solucion: string;
  Localidad: string;
  Dependencia: string;
  Tramite: string;
  Capturado: string;
  FechaCapturada: string; // Puedes usar Date si lo parseas desde la DB
}
