import { AxiosRequest, GetAxios } from "../../axios/Axios";
import type { Penalties } from "../../domain/models/penalties/penalties.model";
import type { Result } from "../../domain/models/users/users.domain";
import type { PenaltiesRepository } from "../../domain/repositories/penalties/penalties.repositores";

export class PenaltiesApi implements PenaltiesRepository {
   async showHistoryCurp(penaltie: Penalties): Promise<Result<Penalties>> {
      try {
         const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/penalties/historial`, "POST", penaltie);
         if (response?.status !== "success") {
            throw new Error(response?.message || "Error en el servidor");
         }
         return { ok: true, data: response?.history, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }
   async create(penalties: Penalties): Promise<Result<Penalties>> {
      try {
         const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/penalties/createorUpdate`, "POST", penalties, true);
         console.log("aqio", response);
         // Si el servidor no devuelve status "success", forzar error
         if (response?.status !== "success") {
            throw new Error(response?.message || "Error en el servidor");
         }

         // Si todo salió bien
         return {
            ok: true,
            data: response?.data,
            message: response?.message || "Multa registrada correctamente"
         };
      } catch (error: any) {
         return {
            ok: false,
            error: new Error(String(error?.message || error)),
            message: String(error?.message || "Error al crear multa")
         };
      }
   }

   async getAll(): Promise<Result<Penalties[]>> {
      try {
         const response = await GetAxios(`${import.meta.env.VITE_API_URL}/penalties/index`);
         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }
   async courts(): Promise<Result<Penalties[]>> {
      try {
         const response = await GetAxios(`${import.meta.env.VITE_API_URL}/penalties/courts`);
         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }

   async delete(penalties: Penalties): Promise<Result<void>> {
      try {
         const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/penalties/delete`, "DELETE", penalties);

         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }
}