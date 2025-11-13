import type { Result } from "../../models/users/users.domain";

export interface CourtsRepository{
    getAll():Promise<Result<Court[]>>;
    create(court:Court):Promise<Result<Court>>;
    delete( court: Court):Promise<Result<void>>;

}