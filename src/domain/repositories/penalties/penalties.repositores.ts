import type { Penalties } from "../../models/penalties/penalties.model";
import type { Result } from "../../models/users/users.domain";

export interface PenaltiesRepository {
   getAll(): Promise<Result<Penalties[]>>;
   courts(): Promise<Result<Penalties[]>>;

   create(penaltie: Penalties): Promise<Result<Penalties>>;
   delete(penaltie: Penalties): Promise<Result<void>>;
}