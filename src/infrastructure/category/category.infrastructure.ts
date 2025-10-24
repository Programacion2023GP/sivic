import type { Category } from "../../domain/models/category/category.model";
import type { Result } from "../../domain/models/users/users.domain";
import type { CategoryRepository } from "../../domain/repositories/category/category.repositories";
import type { SuccessData } from "../../models/responseapi";

export class CategoryApi implements CategoryRepository {
   async getAll(): Promise<Result<Category[]>> {
       try {
        const response = await fetch('http://localhost:3000/categorys');
        
        const data:SuccessData<Category[]> = await response.json()
       if (response.ok) {
                return { ok: true, data:data.data  }
            }
            else {
                return { ok: false, error: new Error(`HTTP error: ${response.status}`) };

            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                return { ok: false, error: err }
            } else {
                return { ok: false, error: new Error(String(err)) }
            }
        }
    }
    getAddCategory(): Promise<Result<void>> {
        throw new Error("Method not implemented.");
    }
    
}