import { create } from "zustand";

import { showToast } from "../../sweetalert/Sweetalert";
import type { Penalties } from "../../domain/models/penalties/penalties.model";
import type { PenaltiesRepository } from "../../domain/repositories/penalties/penalties.repositores";

interface PenaltiesStore {
   initialValues: Penalties;
   penalties: Penalties[];
   history: Penalties[];

   loading: boolean;
   error: string | null;
   fetchPenalties: (repo: PenaltiesRepository) => Promise<void>;
   fetchPenaltiesCourts: (repo: PenaltiesRepository) => Promise<void>;

   postPenaltie: (penaltie: Penalties, repo: PenaltiesRepository) => Promise<void>;
   showHistoryCurp: (penaltie: Penalties, repo: PenaltiesRepository) => Promise<void>;
   handleChangePenaltie: (penaltie: Penalties, setFieldValue?: (field: string, value: any) => void) => void;
   removePenaltie: (penaltie: Penalties, repo: PenaltiesRepository) => void;
   resetInitialValues: () => void;
   open: boolean;
   setOpen: () => void;
   openHistory: boolean;
   setOpenHistory: () => void;
}
const now = new Date();

export const usePenaltiesStore = create<PenaltiesStore>((set, get) => ({
   open: false,
   setOpen: () => {
      set({ open: !get().open });
   },
   openHistory: false,
   setOpenHistory: () => {
      set({ openHistory: !get().openHistory });
   },
   showHistoryCurp: async (penaltie: Penalties, repo: PenaltiesRepository) => {
      set({ loading: true, initialValues: { ...get().initialValues, name: penaltie.name } });
      try {
         const data = await repo.showHistoryCurp(penaltie);
         if (data.ok == true) {
            set({
               history: Array.isArray(data.data) ? data.data : [data.data],
               loading: false
            });
            if (Array.isArray(data.data) && data.data.length > 0) {
               set({ openHistory: true });
            } else {
               showToast("NO TIENE HISTORIAL LA PERSONA", "info");
            }
         }
         set({ loading: false });
      } catch (error: unknown) {
         let message = "";
         if (error instanceof Error) {
            message = error.message;
         }
         set({ error: message, loading: false });
         get().resetInitialValues();
      }
   },
   penalties: [],
   history: [],

   resetInitialValues: () => {
      const now = new Date(); // asegurarte de que `now` exista
      set({
         initialValues: {
            doctor_id: null,
            active: true,
            plate_number: null,
            detainee_phone_number: null,
            number_of_passengers: 0,
            observations: null,
            oficial_payroll: null,
            id: 0,
            time: now.toLocaleTimeString("en-US", {
               hour: "2-digit",
               minute: "2-digit",
               hour12: false // ← Cambiar a false
            }),
            date: new Date().toISOString().split("T")[0], // "2024-01-15"

            person_contraloria: localStorage.getItem("name"),
            person_oficial: null,
            vehicle_service_type: null,
            alcohol_concentration: 0,
            group: 0,
            municipal_police: null,
            civil_protection: null,
            command_vehicle: null,
            command_troops: null,
            command_details: null,
            filter_supervisor: null,
            detainee_released_to: null,
            name: null,
            cp: null,
            city: null,
            age: 0,
            amountAlcohol: 0,
            curp: null,
            image_penaltie: null,
            images_evidences: [],
            lat: 0,
            lng: 0
         }
      });
   },

   initialValues: {
      doctor_id: null,

      active: true,
      plate_number: null,
      detainee_phone_number: null,
      number_of_passengers: 0,
      observations: null,
      oficial_payroll: null,
      detainee_released_to: null,

      id: 0,
      time: now.toLocaleTimeString("en-US", {
         hour: "2-digit",
         minute: "2-digit",
         hour12: true
      }),
      date: now.toLocaleDateString("en-US", {
         year: "numeric",
         month: "2-digit",
         day: "2-digit"
      }),
      person_contraloria: localStorage.getItem("name"),
      person_oficial: null,
      vehicle_service_type: null,
      alcohol_concentration: 0,
      group: 0,
      municipal_police: null,
      civil_protection: null,
      command_vehicle: null,
      command_troops: null,
      command_details: null,
      filter_supervisor: null,
      name: null,
      cp: null,
      city: null,
      age: 0,
      amountAlcohol: 0,
      curp: null,
      image_penaltie: null,
      images_evidences: [],
      lat: 0,
      lng: 0
   },

   loading: false,
   error: null,

   fetchPenalties: async (repo: PenaltiesRepository) => {
      set({ loading: true });
      try {
         const data = await repo.getAll();
         if (data.ok == true) {
            set({ penalties: data.data, loading: false });
         }
         set({ loading: false });
      } catch (error: unknown) {
         let message = "";
         if (error instanceof Error) {
            message = error.message;
         }
         set({ error: message, loading: false });
         get().resetInitialValues();
      }
   },
   fetchPenaltiesCourts: async (repo: PenaltiesRepository) => {
      set({ loading: true });
      try {
         const data = await repo.courts();
         if (data.ok == true) {
            set({ penalties: data.data, loading: false });
         }
         set({ loading: false });
      } catch (error: unknown) {
         let message = "";
         if (error instanceof Error) {
            message = error.message;
         }
         set({ error: message, loading: false });
         get().resetInitialValues();
      }
   },
   postPenaltie: async (penaltie: Penalties, repo: PenaltiesRepository) => {
      set({ loading: true, open: false });

      try {
         const data = await repo.create(penaltie);

         if (!data.ok) {
            throw new Error(data.message || "Error al crear multa");
         }

         showToast(data.message, "success");
         get().setOpen();
         get().fetchPenalties(repo);
      } catch (error: unknown) {
         const message = error instanceof Error ? error.message : "Error desconocido";
         showToast(message, "error");
         set({ error: message });
         get().setOpen();
         set({
            loading: false,
            initialValues: { ...get().initialValues, id: 0 }
         });
      } finally {
      }
   },

   handleChangePenaltie: async (penaltie: Penalties, setFieldValue?: (field: string, value: any) => void) => {
      set({ open: true });
      set({ initialValues: penaltie });
      setFieldValue && setFieldValue("city", penaltie.city);
   },
   removePenaltie: async (penaltie: Penalties, repo: PenaltiesRepository) => {
      set({ loading: true });

      try {
         const data = await repo.delete(penaltie);

         if (data.ok) {
            showToast(data.message, "success");
            await get().fetchPenalties(repo);
         } else {
            showToast(data.message || "Error al eliminar dependencia.", "error");
         }
      } catch (error: unknown) {
         const message = error instanceof Error ? error.message : "Error desconocido al eliminar la dependencia.";
         showToast(message, "error");
         set({ error: message });
      } finally {
         set({
            loading: false,
            initialValues: { ...get().initialValues, id: 0 }
         });
      }
   }
}));
