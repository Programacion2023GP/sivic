import { AxiosRequest, GetAxios } from "../../axios/Axios";
import type { Procedure } from "../../domain/models/procedure/procedure.model";
import type { Result } from "../../domain/models/users/users.domain";
import type { ProcedureRepository } from "../../domain/repositories/procedure/procedure.repositories";

export class ProcedureApi implements ProcedureRepository {
    async create(procedure: Procedure): Promise<Result<Procedure>> {
        try {
            const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/procedure/createorUpdate`, "POST", procedure);

            return { ok: true, data: response?.data,message:response.message }

        } catch (error: any) { return { ok: false, error: new Error(String(error)),message:String(error) } }
    }
  
    async getAll(): Promise<Result<Procedure[]>> {
        try {
            const response = await GetAxios(`${import.meta.env.VITE_API_URL}/procedure/index`);
            return { ok: true, data: response?.data,message:response.message }
        } catch (error: any) {
            return { ok: false, error: new Error(String(error)),message:String(error) }
        }
    }

   async delete(procedure: Procedure): Promise<Result<void>> {
        try {
            const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/procedure/delete`, "DELETE", procedure);

            return { ok: true, data: response?.data,message:response.message }

        } catch (error: any) { return { ok: false, error: new Error(String(error)),message:String(error) } }
    }


}