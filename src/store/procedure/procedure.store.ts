import { create } from "zustand";
import type { Task } from "../../domain/models/task/task.domain";
import type { TaskRepository } from "../../domain/repositories/task/task.repositories";
// import type { ProcedureRepository } from "../../domain/repositories/dependence/dependence.repositories";
import { showToast } from "../../sweetalert/Sweetalert";
import type { Procedure } from "../../domain/models/procedure/procedure.model";
import type { ProcedureRepository } from "../../domain/repositories/procedure/procedure.repositories";


interface ProcedureStore {
    initialValues: Procedure,
    procedure: Procedure[],
    loading: boolean,
    error: string | null,
    fetchProcedure: (repo: ProcedureRepository) => Promise<void>,
    postProcedure: (procedure: Procedure, repo: ProcedureRepository) => Promise<void>,
    handleChangeProcedure: (procedure: Procedure) => void,
    removeProcedure: (procedure: Procedure, repo: ProcedureRepository) => void,

    open: boolean,
    setOpen: () => void;

}

export const useProcedureStore = create<ProcedureStore>((set, get) => ({
    open: false,
    setOpen: () => {
        set({ open: !get().open })
    },
    initialValues: {
        id: 0,
        name: "",
        active: true,
    
    },
    procedure: [],
    loading: false,
    error: null,
    fetchProcedure: async (repo: ProcedureRepository) => {
        set({ loading: true })
        try {
            const data = await repo.getAll()
            if (data.ok == true) {
                set({ procedure: data.data, loading: false })


            }
            set({ loading: false })
        } catch (error: unknown) {
            let message = "";
            if (error instanceof Error) {
                message = error.message
            }
            set({ error: message, loading: false })
        }
    },
    postProcedure: async (procedure: Procedure, repo: ProcedureRepository) => {
        set({ loading: true })
        try {
            const data = await repo.create(procedure)
            if (data.ok == true) {
                showToast(data.message, "success")
                set({ loading: false })
                get().setOpen()
                get().fetchProcedure(repo);
            }
            set({ loading: false, initialValues: { ...get().initialValues, id: 0 } })
        } catch (error: unknown) {
            let message = "";
            if (error instanceof Error) {
                message = error.message
                showToast(message, "error")

            }
            set({ error: message, loading: false })
            get().setOpen()
            set({ loading: false, initialValues: { ...get().initialValues, id: 0 } })

        }
    },

    handleChangeProcedure: async (procedure: Procedure) => {
        set({ initialValues: procedure })
    },
    removeProcedure: async (procedure: Procedure, repo: ProcedureRepository) => {
        set({ loading: true });

        try {
            const data = await repo.delete(procedure);

            if (data.ok) {
                showToast(data.message, "success");
                await get().fetchProcedure(repo);
            } else {
                showToast(data.message || "Error al eliminar dependencia.", "error");
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Error desconocido al eliminar la dependencia.";
            showToast(message, "error");
            set({ error: message });
        } finally {
            set({
                loading: false,
                initialValues: { ...get().initialValues, id: 0 },
            });
        
        }
    },

}))