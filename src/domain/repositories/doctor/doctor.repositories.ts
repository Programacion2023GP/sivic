import { Doctor } from "../../models/doctor/dependence";
import type { Result } from "../../models/users/users.domain";

export interface DoctorRepository{
    getAll():Promise<Result<Doctor[]>>;
    create(doctor:Doctor):Promise<Result<Doctor>>;
    delete( doctor: Doctor):Promise<Result<void>>;

}