import { useEffect } from "react";
import { TechinicalApi } from "../../../infrastructure/techinical/techinical.infra";
import { useTechinicalStore } from "../../../store/storetechinaldataset/technical.store";
import Dashboard from "../../components/dashboard/dashboard"
import { PermissionRoute } from "../../../App";

const PageReports = () => {
    const { reports, fetchReports } = useTechinicalStore()
    const api = new TechinicalApi()
    useEffect(() => {
        fetchReports(api)
    }, [])

    return (
        <PermissionRoute requiredPermission="Reportes">

            <Dashboard data={reports} />
        </PermissionRoute>
    )
}
export default PageReports