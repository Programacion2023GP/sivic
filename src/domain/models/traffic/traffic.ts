export interface Traffic {
    id:number
  citizen_name: string;      // Nombre del ciudadano
  age: number;      // Edad (puede ser número o string, dependiendo de cómo se maneje en el formulario)
  rank: string;              // Grado
  plate_number: string;      // N° de placa
  vehicle_brand: string;     // Marca vehículo
  time: string;              // Hora (puede ser string porque es una hora)
  location: string;          // Lugar donde se encuentran
  person_oficial: string;    // Oficial (value del autocomplete)
  active:boolean
}
 
