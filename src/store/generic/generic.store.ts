import { create } from "zustand";


import { showToast } from "../../sweetalert/Sweetalert";
import { Doctor } from "../../domain/models/doctor/dependence";
import { DoctorRepository } from "../../domain/repositories/doctor/doctor.repositories";
import { GenericRepository } from "../../domain/repositories/generic/generic.repositories";

interface GenericStore<T extends object> {
   initialValues: T;
   items: T[];
   loading: boolean;
   error: string | null;
    prefix :string,
    setPrefix:(prefix:string)=>void,
   open: boolean;
   setOpen: () => void;

   fetchData: (repo: GenericRepository<T>) => Promise<void>;
   postItem: (item: T, repo: GenericRepository<T>) => Promise<void>;
   handleChangeItem: (item: T) => void;
   removeItemData: (item: T, repo: GenericRepository<T>) => Promise<void>;
}


// store/generic/generic.store.ts
export const useGenericStore = <T extends { id?: number }>(initialValues: T) => {
  return create<GenericStore<T>>((set, get) => ({
     open: false,
     setOpen: () => set({ open: !get().open,initialValues }),
     prefix: "",

     initialValues,
     items: [],
     loading: false,
     error: null,
     setPrefix: async (prefix) => {
        set({ prefix: prefix });
     },
     fetchData: async (repo: GenericRepository<T>) => {
        set({ loading: true });
        try {
           const data = await repo.getAll(get().prefix);
           if (data.ok) {
              set({ items: data.data });
           }
        } catch (error) {
           const msg = error instanceof Error ? error.message : "Error desconocido";
           set({ error: msg });
           showToast(msg, "error");
        } finally {
           set({ loading: false });
        }
     },

     postItem: async (item: T, repo: GenericRepository<T>) => {
        set({ loading: true });
        try {
           console.log("prefijo", get().prefix);
           const data = await repo.create(item, get().prefix);
           if (data.ok) {
              showToast(data.message, "success");
              get().setOpen();
              await get().fetchData(repo);
           } else {
              showToast(data.message, "error");
           }
        } catch (error) {
           const msg = error instanceof Error ? error.message : "Error desconocido";
           showToast(msg, "error");
           set({ error: msg });
        } finally {
           set({
              loading: false,
              initialValues: { ...get().initialValues, id: 0 }
           });
        }
     },

     handleChangeItem: (item: T) => {
        set({ initialValues: item });
     },

     removeItemData: async (item: T, repo: GenericRepository<T>) => {
        set({ loading: true });
        try {
           const data = await repo.delete(item, get().prefix);
           if (data.ok) {
              showToast(data.message, "success");
              await get().fetchData(repo);
           } else {
              showToast(data.message, "error");
           }
        } catch (error) {
           const msg = error instanceof Error ? error.message : "Error desconocido";
           showToast(msg, "error");
           set({ error: msg });
        } finally {
           set({
              loading: false,
              initialValues: { ...get().initialValues, id: 0 }
           });
        }
     }
  }));
};