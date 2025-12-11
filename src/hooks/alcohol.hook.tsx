// hooks/useAlcoholCaseFlow.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGenericStore } from "../store/generic/generic.store";
import { AlcoholCase } from "../domain/models/casesalcohol/casealcohol.model";
import { GenericApi } from "../infrastructure/generic/infra.generic";
import { Penalties } from "../domain/models/penalties/penalties.model";
import { Traffic } from "../domain/models/traffic/traffic";
import { Public_Securrity } from "../domain/models/security/security";
import dayjs from "dayjs";

export const useAlcohol = () => {
   const auth_id = Number(localStorage.getItem("auth_id") || 0);
   const now = new Date();

   // Mover las APIs fuera de useMemo - son constantes
   const AlcoholApi = new GenericApi<AlcoholCase>();
   const PenaltieApi = new GenericApi<Penalties>();

   // Consolidar estados relacionados
   const [state, setState] = useState({
      data: [] as Penalties[] | Court[] | Traffic[] | Public_Securrity[],
      dataSearch: null as "penaltie" | null
   });
   const [initialValues, setInitialValues] = useState<Penalties | Court | Traffic | Public_Securrity>();
   // Stores optimizadas - evitar recreación en cada render
   const useAlcoholCase = useMemo(
      () =>
         useGenericStore<AlcoholCase>({
            alcohol_level: "",
            requires_confirmation: false
         }),
      []
   );
   const initialValuesPenalties = {
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
      date: new Date().toLocaleDateString("en-CA"),
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
      lon: 0,
      init_date: undefined,
      final_date: undefined,
      auth_id: 0,
      penalty_preload_data_id: 0,
      residence_folio:null,
   };
   const usePenaltiesCase = useMemo(() => {
      // Crear valores iniciales una sola vez

      return useGenericStore<Penalties>(initialValuesPenalties);
   }, []);

   const alcoholCaseStore = useAlcoholCase();
   const penaltieCaseStore = usePenaltiesCase();

   // Usar useCallback con dependencias apropiadas
   const prefix = useCallback(() => {
      alcoholCaseStore.setPrefix("alcohol_cases");
      penaltieCaseStore.setPrefix("penalties");
   }, [alcoholCaseStore, penaltieCaseStore]);

   const create = useCallback(
      (data: Penalties) => {
         prefix();

         // Evitar crear objetos innecesarios
         const caseData = {
            ...data,
            requires_confirmation: false,
            alcohol_level: String(data.alcohol_concentration || "")
         };
         alcoholCaseStore.postItem(caseData, AlcoholApi, true, false);
         loadData("penaltie");
      },
      [prefix, alcoholCaseStore]
   );



   const deleteRow = useCallback(
      (data: Penalties) => {
         prefix();

         // Evitar crear objetos innecesarios
         const caseData = {
            ...data,
            requires_confirmation: false,
            alcohol_level: String(data.alcohol_concentration || "")
         };

         penaltieCaseStore.removeItemData(caseData, PenaltieApi);
         loadData("penaltie");
      },
      [prefix, penaltieCaseStore]
   );
   const loadData = useCallback(
      async (page: "penaltie") => {
         prefix();
         setState((prev) => ({ ...prev, dataSearch: page }));

         try {
            if (page === "penaltie") {
               const fetchedData = await penaltieCaseStore.fetchData(PenaltieApi);
               setState((prev) => ({ ...prev, data: fetchedData }));
            }
         } catch (error) {
            console.error("Error loading data:", error);
         }
      },
      [prefix, penaltieCaseStore]
   );
   const resetInitialValues = (page: "penaltie") => {
      console.log("reiniciando los valores")
      switch (page) {
         case "penaltie":
            const today = dayjs();
            const array = state.data as Penalties[];
            const configTurn = array.find((p) => {
               if (!p.init_date || !p.final_date) return false;
               return p.auth_id == auth_id && today.isBetween(dayjs(p.init_date), dayjs(p.final_date), null, "[]");
            });
            if (configTurn) {
               setInitialValues({
                  ...penaltieCaseStore.initialValues,
                  time: now.toLocaleTimeString("en-US", {
                     hour: "2-digit",
                     minute: "2-digit",
                     hour12: false // ← Cambiar a false
                  }),
                  date: new Date().toISOString().split("T")[0],
                  person_contraloria: configTurn.person_contraloria,
                  doctor_id: configTurn.doctor_id,
                  civil_protection: configTurn.civil_protection,
                  command_vehicle: configTurn.command_details,
                  command_troops: configTurn.command_troops,
                  command_details: configTurn.command_details,
                  filter_supervisor: configTurn.filter_supervisor,
                  init_date: configTurn.init_date,
                  final_date: configTurn.final_date,
                  auth_id: configTurn.auth_id,
                  penalty_preload_data_id: configTurn.penalty_preload_data_id
               } as Penalties);
               console.log("ccccc",configTurn)

               return penaltieCaseStore.initialValues;
            } else {
               setInitialValues(initialValuesPenalties);
            }
            break;

         default:
            break;
      }
   };
   // Memoizar cálculos costosos
   
   const editInitialValues = (
      page: "penaltie",
      row: Penalties | Court | Traffic | Public_Securrity,
      specificFields?: (keyof Penalties)[] // Opcional: campos específicos a editar
   ) => {
      switch (page) {
         case "penaltie":
            if (specificFields && specificFields.length > 0) {
               // Editar solo campos específicos
               const partialUpdate: Partial<Penalties> = {};
               specificFields.forEach((field) => {
                  if (field in row) {
                     partialUpdate[field] = row[field as keyof typeof row];
                  }
               });
               console.log("aqui en data",row,specificFields,partialUpdate)
               setInitialValues((prev) => ({
                  ...prev,
                  ...partialUpdate
               }));
            } else {
               // Editar toda la fila
               setInitialValues(row);
            }
            break;
         default:
            break;
      }
   };

   return {
      create,
      loadData,
      data: state.data,
      loading: penaltieCaseStore.loading,
      initialValues,
      editInitialValues,
      resetInitialValues,
      deleteRow
   };
};
