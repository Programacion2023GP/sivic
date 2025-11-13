import { Sidebar } from "./ui/components/sidebar/CustomSidebar";
import { SidebarItem } from "./ui/components/sidebar/CustomSidebarItem";
import { Header } from "./ui/components/header/CustomHeader";
import { useCallback, useEffect, useState } from "react";
import PageDependence from "./ui/pages/catalogues/dependece/pagedependece";
import { FaUserTie } from "react-icons/fa6";
import PageUsersPanel from "./ui/pages/pageusers/pageuserspanel";
import PageLogin from "./ui/pages/login/PageLogin";
import "./App.css";
import PagePenalities from "./ui/pages/penalties/pagepenalties";
import { FaChartLine, FaCode, FaFileInvoiceDollar } from "react-icons/fa";
import PageLogs from "./ui/pages/pagelogs/PageLogs";
import { SidebarDrop } from "./ui/components/sidebar/CustomSidebarDrop";
import { FaBuildingColumns } from "react-icons/fa6";
import { Routes, Navigate, Outlet, Route, useLocation } from "react-router-dom";
import PageReports from "./ui/pages/reports/reports";
import { usePermissionsStore } from "./store/menu/menu.store";
import PageDoctor from "./ui/pages/catalogues/doctor/pagedoctor";
import { FaUserDoctor } from "react-icons/fa6";
import { FaStopCircle } from "react-icons/fa"; // Ícono de 'detención'
import PageCauseOfDetention from "./ui/pages/catalogues/causeofdetention/pagecauseofdetention";
import PageCourts from "./ui/pages/courts/pagecourts";

// Componente Layout para las rutas autenticadas
const MainLayout = () => {
   const [open, setOpen] = useState<boolean>(false);
   const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
   const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

   // 🔥 Cargar permisos al montar el layout
   const loadPermissions = usePermissionsStore((state) => state.loadPermissions);

   useEffect(() => {
      loadPermissions();
   }, [loadPermissions]);

   const toogleOpen = useCallback(() => {
      setOpen(!open);
   }, [open]);

   const handleInstallClick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
   };

   return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fa]">
         {/* Sidebar */}
         {open && (
            <div className="w-64 flex-shrink-0">
               <Sidebar name="Sistema" borderR={true}>
                  <PermissionPrefixRoute requiredPrefix="usuarios_">
                     <SidebarItem route="/usuarios" icon={<FaUserTie />} label="Usuarios" />
                  </PermissionPrefixRoute>

                  <PermissionPrefixRoute requiredPrefix="multas_">
                     <SidebarItem route="/multa" icon={<FaFileInvoiceDollar />} label="Multas" />
                  </PermissionPrefixRoute>
                  <PermissionPrefixRoute requiredPrefix="multas_">
                     <SidebarItem route="/juzgados" icon={<FaFileInvoiceDollar />} label="Juzgados" />
                  </PermissionPrefixRoute>
                  <PermissionPrefixRoute requiredPrefix="vista_">
                     <SidebarItem route="/logs" icon={<FaCode />} label="Logs" />
                  </PermissionPrefixRoute>
                  <PermissionPrefixRoute requiredPrefix="catalogo_">
                     <SidebarDrop label="Catalogos">
                        <PermissionPrefixRoute requiredPrefix={["catalogo_dependencia_", "catalogo_doctor_"]}>
                           <SidebarDrop label="Alcolimetros">
                              <PermissionPrefixRoute requiredPrefix="catalogo_dependencia_">
                                 <SidebarItem route="/catalogos/dependencias" icon={<FaBuildingColumns />} label="Dependencias" />
                              </PermissionPrefixRoute>
                              <PermissionPrefixRoute requiredPrefix="catalogo_doctor_">
                                 <SidebarItem route="/catalogos/doctor" icon={<FaUserDoctor />} label="Doctores" />
                              </PermissionPrefixRoute>
                           </SidebarDrop>
                           <PermissionPrefixRoute requiredPrefix={["catalogo_motivo_detencion_"]}>
                              <SidebarDrop label="Vialidad">
                                 <PermissionPrefixRoute requiredPrefix="catalogo_motivo_detencion_">
                                    <SidebarItem route="/catalogos/motivodet" icon={<FaStopCircle />} label="Motivo detención" />
                                 </PermissionPrefixRoute>
                              </SidebarDrop>
                           </PermissionPrefixRoute>
                        </PermissionPrefixRoute>
                     </SidebarDrop>
                  </PermissionPrefixRoute>
                  <PermissionPrefixRoute requiredPrefix="reports">
                     <SidebarDrop label="Reportes">
                        <SidebarItem route="/reportes/dashboard" icon={<FaChartLine />} label="Reporte Dinamico" />
                     </SidebarDrop>
                  </PermissionPrefixRoute>
               </Sidebar>
            </div>
         )}

         {/* Contenido principal */}
         <div className="flex-1 flex flex-col min-w-0">
            <Header id="btn-menu" setOpenSidebar={toogleOpen} userName={localStorage.getItem("name") || ""} />
            <main className="flex-1 p-6 overflow-auto bg-white">
               <Outlet />
            </main>

            {showInstallPrompt && (
               <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
                  <div className="flex items-center gap-3">
                     <span>📱 Instalar App</span>
                     <button onClick={handleInstallClick} className="bg-white text-blue-600 px-3 py-1 rounded-md font-semibold hover:bg-blue-100 transition-colors">
                        Instalar
                     </button>
                     <button onClick={() => setShowInstallPrompt(false)} className="text-white hover:text-gray-200">
                        ×
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

// ====================
// Componentes de permisos ACTUALIZADOS
// ====================

interface PermissionRouteProps {
   children: React.ReactNode;
   requiredPermission: string | string[];
}

export const PermissionRoute = ({ children, requiredPermission }: PermissionRouteProps) => {
   const hasPermission = usePermissionsStore((state) => state.hasPermission);

   const allowed = Array.isArray(requiredPermission) ? requiredPermission.some((p) => hasPermission(p)) : hasPermission(requiredPermission);

   if (!allowed) {
      return null;
   }

   return <>{children}</>;
};

interface PermissionPrefixRouteProps {
   children: React.ReactNode;
   requiredPrefix: string | string[]; // ✅ Ahora acepta string o array
}

export const PermissionPrefixRoute = ({ children, requiredPrefix }: PermissionPrefixRouteProps) => {
   const hasPermissionPrefix = usePermissionsStore((state) => state.hasPermissionPrefix);

   // Verificar si es array o string
   const hasPermission = Array.isArray(requiredPrefix)
      ? requiredPrefix.some((prefix) => hasPermissionPrefix(prefix)) // ✅ Si alguno cumple
      : hasPermissionPrefix(requiredPrefix); // ✅ String simple

   if (!hasPermission) {
      return null;
   }

   return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
   const token = localStorage.getItem("token");
   const location = useLocation();

   if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />;
   }

   return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
   const token = localStorage.getItem("token");
   if (token) {
      return <Navigate to="/usuarios" replace />;
   }

   return <>{children}</>;
};

function App() {
   return (
      <Routes>
         <Route
            path="/login"
            element={
               <PublicRoute>
                  <PageLogin />
               </PublicRoute>
            }
         />

         <Route
            path="/*"
            element={
               <ProtectedRoute>
                  <MainLayout />
               </ProtectedRoute>
            }
         >
            <Route path="usuarios" element={<PageUsersPanel />} />
            <Route path="multa" element={<PagePenalities />} />
            <Route path="juzgados" element={<PageCourts />} />

            <Route path="logs" element={<PageLogs />} />
            <Route path="catalogos">
               <Route path="dependencias" element={<PageDependence />} />
               <Route path="doctor" element={<PageDoctor />} />
               <Route path="motivodet" element={<PageCauseOfDetention />} />
            </Route>
            <Route path="reportes">
               <Route path="dashboard" element={<PageReports />} />
            </Route>
            <Route path="*" element={<PageUsersPanel />} />
         </Route>
      </Routes>
   );
}

export default App;
