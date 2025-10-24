import type { Report, Techinical } from "../../models/techinical/techinical.domain";
import type { Result } from "../../models/users/users.domain";

export interface TechinicalRepository{
    getAll():Promise<Result<Techinical[]>>;
    create(techinical:Techinical):Promise<Result<Techinical>>;
    delete(techinical: Techinical):Promise<Result<void>>;
    getReport():Promise<Result<Report[]>>;

}