import { FormikProps, FormikValues } from "formik";
import { useAlcohol } from "../../../hooks/alcohol.hook";
import { useCallback, useEffect, useRef } from "react";
import CompositePage from "../../components/compositecustoms/compositePage";
import { showConfirmationAlert, showToast } from "../../../sweetalert/Sweetalert";
import { Traffic } from "../../../domain/models/traffic/traffic";
import TableAlcoholCases from "../components/alcoholcases";
import { Penalties } from "../../../domain/models/penalties/penalties.model";
import { usePenaltiesForm } from "../penalties/hook/penalties.hook";
import { PermissionRoute } from "../../../App";
import Tooltip from "../../components/toltip/Toltip";
import { CustomButton } from "../../components/button/custombuttom";
import { CiEdit } from "react-icons/ci";
import { useLocation } from "react-router-dom";
import { Public_Securrity } from "../../../domain/models/security/security";

type section = "multa" | "traffic";
const PagTraffic = (section: section) => {
   const { data, loading, loadData, create, initialValues, editInitialValues, resetInitialValues, deleteRow, nextProccess } = useAlcohol();
   const formikRef = useRef<FormikProps<FormikValues>>(null);
      const { uiState, setUiState, duplicate, setDuplicate, history, setHistory,  } = usePenaltiesForm();
   
      const initializeData = async () => {
         try {
            await loadData("traffic");
         } catch (err) {
            console.error("Error inicializando:", err);
         }
      };
  
  

    useEffect(() => {
      initializeData();
      dataFormatSection(data);
    }, [section]);
       const dataFormatSection = (data: Penalties[] | Court[] | Traffic[] | Public_Securrity[]): Penalties[] | Court[] | Traffic[] | Public_Securrity[] => {
          let items = data;
          console.log("seccion",section)
          if (section == "multa") {
             items = items.filter((it: any) => it.current_process_id == 1 ) as Penalties[];
             console.log("multa", items);
         
            }
          if (section == "traffic") {
             items = items.filter((it: any) => it.current_process_id == 2 ) as Penalties[];
             console.log("TRAF",items)
          }
          return items;
       };
   const handleNext = useCallback((row: any) => {
        setUiState((prev) => ({
           ...prev,
           open: true,
           activeStep: 0
        }));

      showConfirmationAlert(`Continuar`, {
         text: "Al aceptar, se dará continuidad a su proceso."
      }).then((isConfirmed) => {
         if (isConfirmed) {
            // nextProccess(row.id);
         } else {
            showToast("La acción fue cancelada.", "error");
         }
      });
   }, []);
   const handleEdit = useCallback(async (row: any) => {
      editInitialValues("penaltie", row as Traffic);
   }, []);

   return (
      <CompositePage
         formDirection="modal"
         modalTitle="Nueva Multa"
         table={() => (
            <TableAlcoholCases
               section={section}
               handleEdit={handleEdit}
               data={ dataFormatSection(data as Penalties[])}
               loading={loading}
           
            />
         )}
      />
   );
};
export default PagTraffic;
