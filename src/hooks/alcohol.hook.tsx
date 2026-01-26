// hooks/useAlcoholCaseFlow.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGenericStore } from "../store/generic/generic.store";
import { AlcoholCase } from "../domain/models/casesalcohol/casealcohol.model";
import { GenericApi } from "../infrastructure/generic/infra.generic";
import { Penalties } from "../domain/models/penalties/penalties.model";
import { Traffic } from "../domain/models/traffic/traffic";
import { Public_Securrity } from "../domain/models/security/security";
import dayjs from "dayjs";
import { Await } from "react-router-dom";
import { Seguimiento } from "../domain/models/seguimiento/seguimineto";
import { Court } from "../domain/models/courts/courts.model";
type section = "penaltie" | "traffic" | "securrity" | "courts" | "general";
export const useAlcohol = () => {
   useEffect(() => {}, []);
   const auth_id = Number(localStorage.getItem("auth_id") || 0);
   const now = new Date();

   // Mover las APIs fuera de useMemo - son constantes
   const AlcoholApi = new GenericApi<AlcoholCase>();
   const PenaltieApi = new GenericApi<Penalties>();
   const SeguimientoApi = new GenericApi<Seguimiento>();

   // Consolidar estados relacionados
   const [state, setState] = useState({
      data: [] as Penalties[] | Court[] | Traffic[] | Public_Securrity[],
      dataSearch: null as "penaltie" | null,
      allData: [],
      loading: false, // ← Añadir loading aquí
      submitting: false // ← Para operaciones de submit
   });
   const [items, setItems] = useState<Penalties[]>([]);
   const [initialValues, setInitialValues] = useState<Penalties | Court | Traffic | Public_Securrity>();
   // Stores optimizadas - evitar recreación en cada render
   const [open,setOpen] = useState<boolean>(false)
   const useAlcoholCase = useMemo(
      () =>
         useGenericStore<AlcoholCase>({
            alcohol_level: "",
            requires_confirmation: false
         }),
      []
   );
  const useSeguimientoAlcohol = useMemo(
     () =>
        useGenericStore<Seguimiento>({
           id: 0,
           nombre: "",
           proceso: "",
           estatus: ""
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
         hour12: false
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
      image_penaltie_money:null,
      images_evidences: [],
      images_evidences_car:null,
      lat: 0,
      lon: 0,
      init_date: undefined,
      final_date: undefined,
      auth_id: 0,
      penalty_preload_data_id: 0,
      residence_folio: null,
      vehicle_brand:null,
      detention_reason:null,
      patrol_unit_number:null
   };
   useEffect(()=>{
      setInitialValues(penaltieCaseStore.initialValues)
   },[])
   const usePenaltiesCase = useMemo(() => {
      // Crear valores iniciales una sola vez

      return useGenericStore<Penalties>(initialValuesPenalties);
   }, []);

   const alcoholCaseStore = useAlcoholCase();
   const penaltieCaseStore = usePenaltiesCase();
   const segumientoCaseStore = useSeguimientoAlcohol();

   // Usar useCallback con dependencias apropiadas
   const prefix = useCallback(() => {
      alcoholCaseStore.setPrefix("alcohol_cases");
      penaltieCaseStore.setPrefix("penalties");
      segumientoCaseStore.setPrefix("seguimiento");

   }, [alcoholCaseStore, penaltieCaseStore]);

   const create = useCallback(
     async (data: Penalties,section:section) => {
      setState((prev)=>({
         ...prev,
         loading:true,
         submitting:true,
      }));
      prefix();

         // Evitar crear objetos innecesarios
         const caseData = {
            ...data,
            requires_confirmation: false,
            alcohol_level: String(data.alcohol_concentration || "")
         };
        await alcoholCaseStore.postItem(caseData, AlcoholApi, true, false);
        await loadData(section);
         setState((prev) => ({
            ...prev,
            loading: false,
            submitting: false
         }));
      },
      [prefix, alcoholCaseStore]
   );

   const deleteRow = useCallback(
      (data: Penalties,section:section) => {
         prefix();

         // Evitar crear objetos innecesarios
         const caseData = {
            ...data,
            requires_confirmation: false,
            alcohol_level: String(data.alcohol_concentration || "")
         };

         penaltieCaseStore.removeItemData(caseData, PenaltieApi);
         loadData(section);
      },
      [prefix, penaltieCaseStore]
   );
  const loadData = useCallback(
   async (page: section) => {
          setState((prev) => ({
             ...prev,
             loading: true,
             submitting: true
          }));
      prefix();
      setState((prev: any) => ({ ...prev, dataSearch: page }));

      try {
         const fetchedData = await penaltieCaseStore.fetchData(PenaltieApi);
         console.log(fetchedData)
         // DEPURACIÓN
         
         setItems(fetchedData);
         if (page === "penaltie") {
            let items: Penalties[] = fetchedData.filter((it) => it.current_process_id == 1);
            setState((prev) => ({ ...prev, data: items, allData: fetchedData }));
         } else if (page == "traffic") {
            let items = fetchedData.filter((it) => it.current_process_id == 2);
            setState((prev) => ({ ...prev, data: items, allData: fetchedData }));
         } else if (page == "securrity") {
            let items = fetchedData.filter((it) => it.current_process_id == 3);
            setState((prev) => ({ ...prev, data: items, allData: fetchedData }));
         } else if (page == "courts") {
            let items = fetchedData.filter((it) => it.current_process_id == 4);
            setState((prev) => ({ ...prev, data: items, allData: fetchedData }));
         } else if (page == "general") {
            let items = fetchedData;
            setState((prev) => ({ ...prev, data: items, allData: fetchedData }));
         }
      } catch (error) {
         console.error("Error loading data:", error);
      }
        setState((prev) => ({
           ...prev,
           loading: false,
           submitting: false
        }));
   },
   [prefix]

   );
   const resetInitialValues = (page: "penaltie") => {
      switch (page) {
         case "penaltie":
            const today = dayjs();
            // const array = state.data as Penalties[];
            console.log("activado")
            const array = items as Penalties[];
            console.log(array)
            const configTurn = array.find((p) => {
               if (!p.init_date || !p.final_date) return false;
               return p.auth_id == auth_id && today.isBetween(dayjs(p.init_date), dayjs(p.final_date), null, "[]");
            });
            if (configTurn) {
               setInitialValues(
                  (prev:Penalties) =>
                     ({
                        city: prev?.city,
                        cp: prev?.cp,

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
                     }) as Penalties
               );

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
            console.log("aqio e",specificFields)
            if (specificFields && specificFields.length > 0) {
               // Editar solo campos específicos
               console.log("si especifico")
               const partialUpdate: Partial<Penalties> = {};
               specificFields.forEach((field) => {
                  if (field in row) {
                     partialUpdate[field] = row[field as keyof typeof row];
                  }
               });
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
   const nextProccess = async(row: {},section:section) => {
      try {
           setState((prev) => ({
              ...prev,
              loading: true,
              submitting: true
           }));
        await alcoholCaseStore.request(
            {
               data: row,
               method: "POST",
               url: "alcohol_cases/advance",
               formData: true
            },
            AlcoholApi
         );
        await loadData(section);
      } catch (error) {}
        setState((prev) => ({
           ...prev,
           loading: false,
           submitting: false
        }));
   };
   const seguimiento = async(case_id:number)=>{

      try {
        setState((prev) => ({
           ...prev,
           loading: true,
        }));
         const report =  await segumientoCaseStore.request(
            {
               data: {
                  case_id:case_id
               },
               method: "POST",
               url: "seguimiento/seguimiento",
               formData: false
            },
            SeguimientoApi
         );
         setOpen(true)
         return report;
      } catch (error) {}
         setState((prev) => ({
            ...prev,
            loading: false
         }));
   }
   return {
      create,
      loadData,
      data: state.data,
      dataItems: items,
      loading: state.loading,
      submitting: state.submitting,
      initialValues: initialValues,
      editInitialValues,
      resetInitialValues,
      deleteRow,
      nextProccess,
      setInitialValues,
      allData: state.allData,
      seguimiento,
      open,
      setClose: () => setOpen(false)
   };
};
