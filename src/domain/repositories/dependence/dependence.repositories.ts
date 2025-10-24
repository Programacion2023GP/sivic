import type { Dependence } from "../../models/dependence/dependence";
import type { Result } from "../../models/users/users.domain";

export interface DependenceRepository{
    getAll():Promise<Result<Dependence[]>>;
    create(dependence:Dependence):Promise<Result<Dependence>>;
    delete( dependence: Dependence):Promise<Result<void>>;

}