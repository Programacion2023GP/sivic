import { AxiosRequest, GetAxios } from "../../axios/Axios";
import type { Procedure } from "../../domain/models/procedure/procedure.model";
import type { Report, Techinical } from "../../domain/models/techinical/techinical.domain";
import type { Result } from "../../domain/models/users/users.domain";
import type { TechinicalRepository } from "../../domain/repositories/techinical/techinical.repositories";

export class TechinicalApi implements TechinicalRepository {
   async getReport(): Promise<Result<Report[]>> {
           try {
            const response = await GetAxios(`${import.meta.env.VITE_API_URL}/techinical/report`);
            return { ok: true, data: response?.data,message:response.message }
        } catch (error: any) {
            return { ok: false, error: new Error(String(error)),message:String(error) }
        }
    }
    async create(techinical: Techinical): Promise<Result<Techinical>> {
        try {
            const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/techinical/createorUpdate`, "POST", techinical);

            return { ok: true, data: response?.data,message:response.message }

        } catch (error: any) { return { ok: false, error: new Error(String(error)),message:String(error) } }
    }
  
    async getAll(): Promise<Result<Techinical[]>> {
        try {
            const response = await GetAxios(`${import.meta.env.VITE_API_URL}/techinical/index`);
            return { ok: true, data: response?.data,message:response.message }
        } catch (error: any) {
            return { ok: false, error: new Error(String(error)),message:String(error) }
        }
    }

   async delete(techinical: Techinical): Promise<Result<void>> {
        try {
            const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/techinical/delete`, "DELETE", techinical);

            return { ok: true, data: response?.data,message:response.message }

        } catch (error: any) { return { ok: false, error: new Error(String(error)),message:String(error) } }
    }


}