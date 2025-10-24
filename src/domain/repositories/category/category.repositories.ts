import type { Category } from "../../models/category/category.model";
import type { Result } from "../../models/users/users.domain";

export interface CategoryRepository {
    getAll():Promise<Result<Category[]>>,
    getAddCategory():Promise<Result<void>>
}