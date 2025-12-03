import { useEffect, useMemo, useState } from "react";
import { CustomCalendar, EventItem, ModuleConfig } from "../../../components/calendary/calendary";
import { useGenericStore } from "../../../../store/generic/generic.store";
import { GenericApi } from "../../../../infrastructure/generic/infra.generic";
import CustomModal from "../../../components/modal/modal";
import PdfPreview from "../../../components/pdfview/pdfview";
import MultaPDF from "../../pdf/pdfpenalties";
import CustomAlert from "../../../components/alert/alert";
import SecurityPDF from "../../pdf/pdfsecurity";
import PublicSecurrityPDF from "../../pdf/pdfsecurity";
import { Public_Securrity } from "../../../../domain/models/security/security";
import TrafficPDF from "../../pdf/pdftraffic";
import CourtPDF from "../../pdf/pdfcourts";
interface Item {
   id: number;
   module: string;
   dateTime: string;
   time: string;
}

const PageCalendary = () => {
   const [row, setRow] = useState<{
      open: boolean;
      row: {};
      type: "Juzgados" | "Transito Vialidad" | "Alcolimetro" | "Seguridad publica";
   }>({
      open: false,
      row: {},
      type: null
   });
   const modules: ModuleConfig[] = [
      { name: "Juzgados", color: "#6A5ACD" },
      { name: "Transito Vialidad", color: "#FFD700" },
      { name: "Alcolimetro", color: "#2E8B57" },
      { name: "Seguridad publica", color: "#B22222" }
   ];
   const useCalendaryStore = useMemo(
      () =>
         useGenericStore<EventItem>({
            id: 0,
            module: "",

            datetime: undefined
         }),
      []
   );
   const DataApi = new GenericApi<EventItem>();
   const { initialValues, fetchData, handleChangeItem, items, loading, open, postItem, error, removeItemData, setOpen, setPrefix } = useCalendaryStore();

   const [events, setEvents] = useState<EventItem[]>([]);
   const init = async () => {
      const res: EventItem[] = await fetchData(DataApi);

      const parsed = res.map((e: any) => {
         const raw = e.dateTime ?? e.created_at ?? null;
         return {
            ...e,
            datetime: raw ? new Date(raw.replace(" ", "T")) : null,
            title: e.module
         };
      });

      setEvents(parsed);

      //   setEvents(data);
   };
   useEffect(() => {
      setPrefix("calendary");
      init();
   }, []);

   const handleEventClick = (event: EventItem) => {
      console.log("Evento seleccionado:", event);
      setRow({
         open: true,
         row: event!.data,
         type: event.module as "Juzgados" | "Transito Vialidad" | "Alcolimetro" | "Seguridad publica"
      });
   };
   const handlePdf = (row: any = {}, type: "Juzgados" | "Transito Vialidad" | "Alcolimetro" | "Seguridad publica") => {
      switch (type) {
         case "Alcolimetro":
            return <MultaPDF data={row} />;

         case "Juzgados":
            return <CourtPDF data={row}/>;

         case "Seguridad publica":
            return <PublicSecurrityPDF data={row} />;

         case "Transito Vialidad":
            return <TrafficPDF data={row} />;

         default:
            return null;
      }
   };

   return (
      <div className="min-h-screen">
         <CustomCalendar events={events} modules={modules} showTime={true} initialView="week" onEventClick={handleEventClick} />
         <CustomModal
            title="Vista de PDF"
            isOpen={row.open}
            onClose={() => {
               setRow({
                  open: false,
                  row: {},
                  type: null
               });
            }}
         >
            {row.open && (
               <PdfPreview name="">
                  <>
                  {handlePdf(row.row,row.type)}
                  </>
               </PdfPreview>
            )}
         </CustomModal>
      </div>
   );
};
export default PageCalendary;
