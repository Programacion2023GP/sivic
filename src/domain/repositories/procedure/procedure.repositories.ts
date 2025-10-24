import type { Procedure } from "../../models/procedure/procedure.model";
import type { Result } from "../../models/users/users.domain";

export interface ProcedureRepository{
    getAll():Promise<Result<Procedure[]>>;
    create(procedure:Procedure):Promise<Result<Procedure>>;
    delete( procedure: Procedure):Promise<Result<void>>;

}