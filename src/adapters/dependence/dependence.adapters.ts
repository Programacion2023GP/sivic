import type { Dependence } from "../../domain/models/dependence/dependence"

interface RowCDependence {
    id:number,
    name:string,
    active:boolean,
}

export const AdapDependence =(dependence:RowCDependence[]):Dependence[]=>{
    return dependence.map((it)=>({
        id:it.id,
        name:it.name,
        active:it.active
    }))
}