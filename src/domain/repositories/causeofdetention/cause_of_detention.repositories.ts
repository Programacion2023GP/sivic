import { causeOfDetention } from "../../models/causeofdetention/cause_of_detention";
import type { Result } from "../../models/users/users.domain";

export interface CauseOfDetentionRepository {
   getAll(): Promise<Result<causeOfDetention[]>>;
   create(cause: causeOfDetention): Promise<Result<causeOfDetention>>;
   delete(cause: causeOfDetention): Promise<Result<void>>;
}