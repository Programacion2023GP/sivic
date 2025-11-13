import { AxiosRequest, GetAxios } from "../../axios/Axios";
import type { Result } from "../../domain/models/users/users.domain";
import { CourtsRepository } from "../../domain/repositories/courts/courts.repositories";



export class CourtsApi implements CourtsRepository {
   async create(court: Court): Promise<Result<Court>> {
      try {
         const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/court/createorUpdate`, "POST", court);
        if (response.status == "error") {
           return { ok: false, error: new Error(String(response.message)), message: String(response.message) };
        }
        return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }

   async getAll(): Promise<Result<Court[]>> {
      try {
         const response = await GetAxios(`${import.meta.env.VITE_API_URL}/court/index`);
         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }

   async delete(court: Court): Promise<Result<void>> {
      try {
         const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/court/delete`, "DELETE", court);

         if (response.status == "error") {
            return { ok: false, error: new Error(String(response.message)), message: String(response.message) };
         }
         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }
}