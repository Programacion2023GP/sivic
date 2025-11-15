import { PenaltyPreloadData } from "../../models/penaltypreloaddata/penaltypreloaddata.model";
import type { Result } from "../../models/users/users.domain";

export interface PenaltyPreloadDataRepository {
   // getAll(): Promise<Result<PenaltyPreloadData[]>>;

   create(penaltie: PenaltyPreloadData): Promise<Result<PenaltyPreloadData>>;
}
