import { AxiosRequest, GetAxios } from "../../axios/Axios";
import { Doctor } from "../../domain/models/doctor/dependence";
import type { Result } from "../../domain/models/users/users.domain";

import { DoctorRepository } from "../../domain/repositories/doctor/doctor.repositories";

export class DoctorApi implements DoctorRepository {
   async create(doctor: Doctor): Promise<Result<Doctor>> {
      try {
         const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/doctor/createorUpdate`, "POST", doctor);

        if (response.status == "error") {
           return { ok: false, error: new Error(String(response.message)), message: String(response.message) };
        }
        return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }

   async getAll(): Promise<Result<Doctor[]>> {
      try {
         const response = await GetAxios(`${import.meta.env.VITE_API_URL}/doctor/index`);
         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }

   async delete(doctor: Doctor): Promise<Result<void>> {
      try {
         const response = await AxiosRequest(`${import.meta.env.VITE_API_URL}/doctor/delete`, "DELETE", doctor);

         if (response.status == "error") {
            return { ok: false, error: new Error(String(response.message)), message: String(response.message) };
         }
         return { ok: true, data: response?.data, message: response.message };
      } catch (error: any) {
         return { ok: false, error: new Error(String(error)), message: String(error) };
      }
   }
}