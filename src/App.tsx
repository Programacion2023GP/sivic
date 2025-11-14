import { Sidebar } from "./ui/components/sidebar/CustomSidebar";
import { SidebarItem } from "./ui/components/sidebar/CustomSidebarItem";
import { Header } from "./ui/components/header/CustomHeader";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import PageReports from "./ui/pages/reports/dashboard/reports";
import { usePermissionsStore } from "./store/menu/menu.store";
import PageDoctor from "./ui/pages/catalogues/doctor/pagedoctor";
import { FaUserDoctor } from "react-icons/fa6";
import { FaStopCircle } from "react-icons/fa"; // Ícono de 'detención'
import PageCauseOfDetention from "./ui/pages/catalogues/causeofdetention/pagecauseofdetention";
import PageCourts from "./ui/pages/courts/pagecourts";
import PageReportMap from "./ui/pages/reports/map/map";

// Componente Layout para las rutas autenticadas
const MainLayout = () => {
   const [open, setOpen] = useState(false);
   const [showInstallPrompt, setShowInstallPrompt] = useState(false);
   const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

   const loadPermissions = usePermissionsStore((state) => state.loadPermissions);

   // 🔥 Cargar permisos al montar
   useEffect(() => {
      loadPermissions();
   }, [loadPermissions]);

   // Escuchar evento de instalación PWA
   useEffect(() => {
      const handler = (e: any) => {
         e.preventDefault();
         setDeferredPrompt(e);
         setShowInstallPrompt(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
   }, []);

   const toggleSidebar = useCallback(() => setOpen((prev) => !prev), []);

   const handleInstallClick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
   };

   // 🧠 Sidebar config (mejor que hardcodear JSX)
   const sidebarItems = useMemo(
      () => [
         { prefix: "usuarios_", route: "/usuarios", icon: <FaUserTie />, label: "Usuarios" },
         { prefix: "multas_", route: "/multa", icon: <FaFileInvoiceDollar />, label: "Multas" },
         { prefix: "multas_", route: "/juzgados", icon: <FaFileInvoiceDollar />, label: "Juzgados" },
         { prefix: "vista_", route: "/logs", icon: <FaCode />, label: "Logs" },
         {
            prefix: "catalogo_",
            label: "Catálogos",
            children: [
               {
                  prefix: ["catalogo_dependencia_", "catalogo_doctor_"],
                  label: "Alcolímetros",
                  children: [
                     {
                        prefix: "catalogo_dependencia_",
                        route: "/catalogos/dependencias",
                        icon: <FaBuildingColumns />,
                        label: "Dependencias"
                     },
                     {
                        prefix: "catalogo_doctor_",
                        route: "/catalogos/doctor",
                        icon: <FaUserDoctor />,
                        label: "Doctores"
                     }
                  ]
               },
               {
                  prefix: ["catalogo_motivo_detencion_"],
                  label: "Vialidad",
                  children: [
                     {
                        prefix: "catalogo_motivo_detencion_",
                        route: "/catalogos/motivodet",
                        icon: <FaStopCircle />,
                        label: "Motivo detención"
                     }
                  ]
               }
            ]
         },
         {
            prefix: "reports_",
            label: "Reportes",
            children: [
               { route: "/reportes/dashboard", prefix: "reports_", icon: <FaChartLine />, label: "Reporte Dinámico" },
               { route: "/reportes/mapa", prefix: "reports_", icon: <FaChartLine />, label: "Mapa" }
            ]
         }
      ],
      []
   );

   const renderSidebarItems = (items: any[]) =>
      items.map((item, i) => (
         <PermissionPrefixRoute requiredPrefix={item.prefix} key={i}>
            {item.children ? (
               <SidebarDrop label={item.label}>{renderSidebarItems(item.children)}</SidebarDrop>
            ) : (
               <SidebarItem route={item.route} icon={item.icon} label={item.label} />
            )}
         </PermissionPrefixRoute>
      ));

   return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fa]">
         {open && (
            <div className="flex-shrink-0 w-64 shadow-md">
               <Sidebar name="Sistema" borderR>
                  {renderSidebarItems(sidebarItems)}
               </Sidebar>
            </div>
         )}

         <div className="flex flex-col flex-1 min-w-0">
            <Header id="btn-menu" setOpenSidebar={toggleSidebar} userName={localStorage.getItem("name") || ""} />

            <main className="flex-1 p-6 overflow-auto bg-white">
               <Outlet />
            </main>

            {showInstallPrompt && <InstallPrompt onInstall={handleInstallClick} onClose={() => setShowInstallPrompt(false)} />}
         </div>
      </div>
   );
};

// 💡 Componente separado para el prompt de instalación
const InstallPrompt = ({ onInstall, onClose }: { onInstall: () => void; onClose: () => void }) => (
   <div className="fixed z-50 p-4 text-white bg-blue-600 rounded-lg shadow-lg bottom-4 right-4">
      <div className="flex items-center gap-3">
         <span>📱 Instalar App</span>
         <button onClick={onInstall} className="px-3 py-1 font-semibold text-blue-600 transition-colors bg-white rounded-md hover:bg-blue-100">
            Instalar
         </button>
         <button onClick={onClose} className="text-white hover:text-gray-200">
            ×
         </button>
      </div>
   </div>
);

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
               <Route path="mapa" element={<PageReportMap />} />
            </Route>
            <Route path="*" element={<PageUsersPanel />} />
         </Route>
      </Routes>
   );
}

export default App;
