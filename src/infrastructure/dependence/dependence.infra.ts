import { AdapDependence } from "../../adapters/dependence/dependence.adapters";
import { AxiosRequest, GetAxios } from "../../axios/Axios";
import type { Dependence } from "../../domain/models/dependence/dependence";
import type { Result } from "../../domain/models/users/users.domain";
import type { DependenceRepository } from "../../domain/repositories/dependence/dependence.repositories";

export class DependenceApi implements DependenceRepository {
    async create(dependence: Dependence): Promise<Result<Dependence>> {
        try {
            const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/dependence/createorUpdate`, "POST", dependence);

            return { ok: true, data: response?.data,message:response.message }

        } catch (error: any) { return { ok: false, error: new Error(String(error)),message:String(error) } }
    }
  
    async getAll(): Promise<Result<Dependence[]>> {
        try {
            const response = await GetAxios(`${import.meta.env.VITE_API_URL}/dependence/index`);
            return { ok: true, data: AdapDependence(response?.data),message:response.message }
        } catch (error: any) {
            return { ok: false, error: new Error(String(error)),message:String(error) }
        }
    }

   async delete(dependence: Dependence): Promise<Result<void>> {
        try {
            const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/dependence/delete`, "DELETE", dependence);

            return { ok: true, data: response?.data,message:response.message }

        } catch (error: any) { return { ok: false, error: new Error(String(error)),message:String(error) } }
    }


}