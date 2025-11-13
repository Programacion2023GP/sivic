import type { Dependence } from "../../domain/models/dependence/dependence"

interface RowCDependence {
   id: number;
   name: string;
   color: string;
   active: boolean;
}

export const AdapDependence =(dependence:RowCDependence[]):Dependence[]=>{
    return dependence.map((it)=>({
        id:it.id,
        name:it.name,
        active:it.active,
        color:it.color
    }))
}