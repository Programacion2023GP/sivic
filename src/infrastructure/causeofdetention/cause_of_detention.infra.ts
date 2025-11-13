import { AxiosRequest, GetAxios } from "../../axios/Axios";
import { causeOfDetention } from "../../domain/models/causeofdetention/cause_of_detention";
import type { Result } from "../../domain/models/users/users.domain";
import { CauseOfDetentionRepository } from "../../domain/repositories/causeofdetention/cause_of_detention.repositories";




export class CauseOfDetentionApi implements CauseOfDetentionRepository {
   async create(causeOfDetention: causeOfDetention): Promise<Result<causeOfDetention>> {
      try {
         const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/causeOfDetention/createorUpdate`, "POST", causeOfDetention);

         if (response.status == "error") {
            return { ok: false, error: new Error(String(response.message)), message: String(response.message) };
         }
         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }

   async getAll(): Promise<Result<causeOfDetention[]>> {
      try {
         const response = await GetAxios(`${import.meta.env.VITE_API_URL}/causeOfDetention/index`);
         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }

   async delete(causeOfDetention: causeOfDetention): Promise<Result<void>> {
      try {
         const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/causeOfDetention/delete`, "DELETE", causeOfDetention);

         if (response.status == "error") {
            return { ok: false, error: new Error(String(response.message)), message: String(response.message) };
         }
         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }
}