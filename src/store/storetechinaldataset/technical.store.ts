import { create } from "zustand";
import type { TaskRepository } from "../../domain/repositories/task/task.repositories";
import type { Report, Techinical } from "../../domain/models/techinical/techinical.domain";
import type { TechinicalRepository } from "../../domain/repositories/techinical/techinical.repositories";
import { showToast } from "../../sweetalert/Sweetalert";


interface TechinicalStore {
    techinical: Techinical[],
    reports:Report[],
    loading: boolean,
    initialValues: Techinical,
    error: string | null,
    open: boolean,
    setOpen: () => void;
    fetchTechinical: (repo: TechinicalRepository) => Promise<void>,
    postTechinical: (techinical: Techinical, repo: TechinicalRepository) => Promise<void>,
    handleChangeTechinical: (techinical: Techinical) => void,
    removeTechinical: (techinical: Techinical, repo: TechinicalRepository) => void,
    resetValues : ()=>void,
    fetchReports:(repo: TechinicalRepository) => Promise<void>,
}

export const useTechinicalStore = create<TechinicalStore>((set, get) => ({
    initialValues: {
        id: 0,
        fullName:"",
        procedureId: 0,
        dependeceAssignedId: 0,
        firstName: "",
        paternalSurname: "",
        street: "",
        number: 0,
        city: 0,
        section: "",
        postalCode: 0,
        municipality: "GÓMEZ PALACIO",
        locality: "",
        cellphone: "",
        requestDescription: "",
        solutionDescription: "",
        reference: "",
        userId: 0
    },
    reports:[],
    open: false,
    techinical: [],
    loading: false,
    error: null,
    resetValues() {
        set({initialValues:{
            id: 0,
            procedureId: 0,
            dependeceAssignedId: 0,
            firstName: "",
            paternalSurname: "",
            fullName: "",
            street: "",
            number: 0,
            city: 0,
            section: "",
            postalCode: 0,
            municipality: "GÓMEZ PALACIO",
            locality: "",
            cellphone: "",
            requestDescription: "",
            solutionDescription: "",
            userId: 0
        }})
    },
    setOpen: async () => {
        set({ open: !get().open })
    },
    fetchTechinical: async (repo: TechinicalRepository) => {
        set({ loading: true })
        try {
            const data = await repo.getAll()
            if (data.ok == true) {
                set({ techinical: data.data, loading: false })


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
    fetchReports:async (repo: TechinicalRepository) => {
        set({ loading: true })
        try {
            const data = await repo.getReport()
            if (data.ok == true) {
                set({ reports: data.data, loading: false })


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
    
    postTechinical: async (techinical: Techinical, repo: TechinicalRepository) => {
        set({ loading: true })
        try {
            const data = await repo.create(techinical)
            if (data.ok == true) {
                showToast(data.message, "success")
                set({ loading: false })
                get().setOpen()
                get().fetchTechinical(repo);
            }
            get().resetValues()
            set({ loading: false })
        } catch (error: unknown) {
            let message = "";
            if (error instanceof Error) {
                message = error.message
                showToast(message, "error")

            }
            set({ error: message, loading: false })
            get().setOpen()
            get().resetValues()
            set({ loading: false, initialValues: { ...get().initialValues, id: 0 } })

        }
    },

    handleChangeTechinical: async (techinical: Techinical) => {
        set({ initialValues: {...techinical,city:Number(techinical.city)} })
    },
    removeTechinical: async (dependence: Techinical, repo: TechinicalRepository) => {
        set({ loading: true });

        try {
            const data = await repo.delete(dependence);

            if (data.ok) {
                showToast(data.message, "success");
                await get().fetchTechinical(repo);
            } else {
                showToast(data.message || "Error al eliminar ficha tecnica.", "error");
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Error desconocido al eliminar la ficha tecnica.";
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