export interface Users {
    id: number,
    email:string,
    firstName:string,
    paternalSurname:string,
    maternalSurname:string,
    fullName:string,
    password:string,
    active:boolean,
    permissions:number[]
}     
export type Result<T> =
  | { ok: true; data: T,message:string }
  | { ok: false; error: Error,message:string };

export interface Permissions {
    id: number,
    name:string,
   
    active:boolean,
}    
  // c-36 
  // c-334
