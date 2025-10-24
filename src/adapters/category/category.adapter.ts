import type { Category } from "../../domain/models/category/category.model";

interface RowCategory {
    id:number,
    name:string,
    description:string,
}

export const AdapCategory =(categorys:RowCategory[]):Category[]=>{
    return categorys.map((it)=>({
        id:it.id,
        name:it.name,
        description:it.description
    }))
}