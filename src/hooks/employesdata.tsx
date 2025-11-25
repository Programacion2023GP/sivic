import { useState, useCallback } from "react";

interface Employe {
   id: number;
   nombre: string;
   puesto: string;
   [key: string]: any; 

   // ... otras propiedades según tu API
}

interface DepartmentState {
   loading: boolean;
   employes: Employe[];
   error: string | null;
}

interface UseEmployesDataReturn {
   contraloria: DepartmentState & { refetch: () => Promise<void> };
   oficiales: DepartmentState & { refetch: () => Promise<void> };
   proteccionCivil: DepartmentState & { refetch: () => Promise<void> };
   refetchAll: () => Promise<void>;
}

const useEmployesData = (): UseEmployesDataReturn => {
   const [contraloria, setContraloria] = useState<DepartmentState>({
      loading: false,
      employes: [],
      error: null
   });

   const [oficiales, setOficiales] = useState<DepartmentState>({
      loading: false,
      employes: [],
      error: null
   });

   const [proteccionCivil, setProteccionCivil] = useState<DepartmentState>({
      loading: false,
      employes: [],
      error: null
   });

   const fetchData = useCallback(async (url: string) => {
      try {
         const res = await window.fetch(`${import.meta.env.VITE_API_EMPLOYES}/${url}`);
         if (!res.ok) throw new Error("Error al obtener datos");
         const data = await res.json();
         return data;
      } catch (error: any) {
         throw new Error(error.message || "Error desconocido");
      }
   }, []);

   const initContraloria = useCallback(async () => {
      setContraloria((prev) => ({ ...prev, loading: true, error: null }));
      try {
         const data = await fetchData("controlaloria");
         setContraloria({
            loading: false,
            employes: data?.data?.result || [],
            error: null
         });
      } catch (error: any) {
         setContraloria({
            loading: false,
            employes: [],
            error: error.message
         });
      }
   }, [fetchData]);

   const initOficiales = useCallback(async () => {
      setOficiales((prev) => ({ ...prev, loading: true, error: null }));
      try {
         const data = await fetchData("transitovialidad");
         setOficiales({
            loading: false,
            employes: data?.data?.result || [],
            error: null
         });
      } catch (error: any) {
         setOficiales({
            loading: false,
            employes: [],
            error: error.message
         });
      }
   }, [fetchData]);

   const initProteccionCivil = useCallback(async () => {
      setProteccionCivil((prev) => ({ ...prev, loading: true, error: null }));
      try {
         const data = await fetchData("proteccioncivil");
         setProteccionCivil({
            loading: false,
            employes: data?.data?.result || [],
            error: null
         });
      } catch (error: any) {
         setProteccionCivil({
            loading: false,
            employes: [],
            error: error.message
         });
      }
   }, [fetchData]);

   const refetchAll = useCallback(async () => {
      await Promise.all([initContraloria(), initOficiales(), initProteccionCivil()]);
   }, [initContraloria, initOficiales, initProteccionCivil]);

   return {
      contraloria: {
         ...contraloria,
         refetch: initContraloria
      },
      oficiales: {
         ...oficiales,
         refetch: initOficiales
      },
      proteccionCivil: {
         ...proteccionCivil,
         refetch: initProteccionCivil
      },
      refetchAll
   };
};

export default useEmployesData;
