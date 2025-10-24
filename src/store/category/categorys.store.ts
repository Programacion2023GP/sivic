import { create } from "zustand";
import type { Category } from "../../domain/models/category/category.model";
import type { CategoryRepository } from "../../domain/repositories/category/category.repositories";

interface CategorysState {
    categorys: Category[]
    loading: boolean,
    error: string | null,
    fetchCategorys: (repo: CategoryRepository) => Promise<void>
}
const useCategoryStore = create<CategorysState>((set, get) => ({
    categorys: [],
    loading: false,
    error: null,
    fetchCategorys: async (repo) => {
        try {
            set({ loading: true, error: null })
            const data = await repo.getAll()
            if (data.ok ==true) {
                set({categorys:data.data,loading:false})
                
            }
            else{

                set({loading:false})
            }
        } catch (error: unknown) {
            let message = "Error fetching categorys";

            // Narrowing: si es un Error real
            if (error instanceof Error) {
                message = error.message;
            }

            set({ error: message, loading: false });

        }
    },
}))
export default useCategoryStore