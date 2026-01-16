import { useEffect, useMemo } from "react";
import { useGenericStore } from "../../../store/generic/generic.store";
import { Court } from "../../../domain/models/courts/courts.model";
import { GenericApi } from "../../../infrastructure/generic/infra.generic";

const PageCourt = ()=>{
      const useCourts = useMemo(
         () =>
            useGenericStore<Court>({
               id: 0,
               date: "",
               referring_agency: "",
               detainee_name: "",
               detention_reason: "",
               entry_time: "",
               exit_datetime: "",
               exit_reason: "",
               fine_amount: 0,
               image_court: "",
               created_at: "",
               updated_at: ""
            }),
         []
      );
       const { fetchData, items, loading, setPrefix, request,open,setOpen,initialValues,postItem,removeItemData,handleChangeItem } = useCourts();
          const CourtApi = new GenericApi<Court>();
          useEffect(() => {
             setPrefix("court");
             fetchData(CourtApi);
          }, []);
    return (
        <>
        court
        </>
    )
}