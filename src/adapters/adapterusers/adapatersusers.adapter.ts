import type { Users } from "../../domain/models/users/users.domain";

export interface RawUsers {
    id?: number,
    email:string,
    name:string,
}

export const adaptUsers =(users:RawUsers[]):Users[]=>{
    return users.map(it=>({
         id: it.id,
        email:it.email,
        name:it.name,
    }))
}
