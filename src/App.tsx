import { Sidebar } from "./ui/components/sidebar/CustomSidebar";
import { SidebarItem } from "./ui/components/sidebar/CustomSidebarItem";
import { Header } from "./ui/components/header/CustomHeader";
import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from "react";
import { FaUserTie } from "react-icons/fa6";
import PageLogin from "./ui/pages/login/PageLogin";
import "./App.css";
import { FaChartLine, FaCode, FaFileInvoiceDollar, FaUserAlt } from "react-icons/fa";
import { SidebarDrop } from "./ui/components/sidebar/CustomSidebarDrop";
import { FaBuildingColumns } from "react-icons/fa6";
import { Routes, Navigate, Outlet, Route, useLocation } from "react-router-dom";
import { usePermissionsStore } from "./store/menu/menu.store";
import { FaUserDoctor } from "react-icons/fa6";
import { FaStopCircle } from "react-icons/fa";
import Spinner from "./ui/components/loading/loading";
import { redirectRoute } from "./utils/redirect";

// Lazy imports para todas las páginas
const PageDependence = lazy(() => import("./ui/pages/catalogues/dependece/pagedependece"));
const PageUsersPanel = lazy(() => import("./ui/pages/pageusers/pageuserspanel"));
const PagePenalities = lazy(() => import("./ui/pages/penalties/pagepenalities"));
const PageLogs = lazy(() => import("./ui/pages/pagelogs/PageLogs"));
const PageReports = lazy(() => import("./ui/pages/reports/dashboard/reports"));
const PageDoctor = lazy(() => import("./ui/pages/catalogues/doctor/pagedoctor"));
const PageCauseOfDetention = lazy(() => import("./ui/pages/catalogues/causeofdetention/pagecauseofdetention"));
const PageReicendences = lazy(() => import("./ui/pages/reicendences/reicedences"));
const PageSender = lazy(() => import("./ui/pages/catalogues/sender/senderpage"));

const PageReportMap = lazy(() => import("./ui/pages/reports/map/map"));
const PageCalendary = lazy(() => import("./ui/pages/reports/calendary/calendary"));
const PoliceSearch404 = lazy(() => import("./ui/pages/nofound/PageNoFound"));
// Componente Layout para las rutas autenticadas
const MainLayout = () => {
   const [open, setOpen] = useState(false);
   const [showInstallPrompt, setShowInstallPrompt] = useState(false);
   const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
   const location = useLocation();

   const loadPermissions = usePermissionsStore((state) => state.loadPermissions);

   // 🔥 Cargar permisos al montar
   useEffect(() => {
      loadPermissions();
   }, [useLocation]);

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
         { prefix: "multas_", route: "/multa", icon: <FaFileInvoiceDollar />, label: "Controlaroria" },
         { prefix: "juzgados_", route: "/juzgados", icon: <FaFileInvoiceDollar />, label: "Juzgados" },
         { prefix: "transito_vialidad_", route: "/transito-vialidad", icon: <FaFileInvoiceDollar />, label: "Transito y vialidad" },
         { prefix: "seguridad_publica_", route: "/seguridad-publica", icon: <FaFileInvoiceDollar />, label: "Seguridad pública" },

         { prefix: "vista_", route: "/logs", icon: <FaCode />, label: "Logs" },
         {
            prefix: "catalogo_",
            label: "Catálogos",
            children: [
               {
                  prefix: "catalogo_doctor_",
                  route: "/catalogos/doctor",
                  icon: <FaUserDoctor />,
                  label: "Doctores"
               },
               {
                  prefix: "catalogo_motivo_detencion_",
                  route: "/catalogos/motivodet",
                  icon: <FaStopCircle />,
                  label: "Motivo detención"
               },
               {
                  prefix: "catalogo_remitente_",
                  route: "/catalogos/remitente",
                  icon: <FaUserAlt />,
                  label: "Remitente"
               }
            ]
         },
         {
            prefix: "reports_",
            label: "Reportes",
            children: [
               { route: "/reportes/general", prefix: "reports_", icon: <FaChartLine />, label: "General" },
               { route: "/reportes/reicidencias", prefix: "reports_", icon: <FaChartLine />, label: "Recidencias" },
               { route: "/reportes/mapa", prefix: "reports_", icon: <FaChartLine />, label: "Mapa" },
               { route: "/reportes/calendario", prefix: "reports_", icon: <FaChartLine />, label: "Calendario" },

               { route: "/reportes/dashboard", prefix: "reports_", icon: <FaChartLine />, label: "Reporte Dinámico" }
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
               <Suspense fallback={<Spinner />}>
                  <Outlet />
               </Suspense>
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
                  <Suspense fallback={<Spinner />}>
                     <PageLogin />
                  </Suspense>
               </PublicRoute>
            }
         />

         <Route
            path="/"
            element={
               <ProtectedRoute>
                  <MainLayout />
               </ProtectedRoute>
            }
         >
            <Route
               path="usuarios"
               element={
                  <Suspense fallback={<Spinner />}>
                     <PageUsersPanel />
                  </Suspense>
               }
            />
            <Route
               path="multa"
               element={
                  <Suspense fallback={<Spinner />}>
                     <PagePenalities section="penaltie" />
                  </Suspense>
               }
            />
            <Route
               path="transito-vialidad"
               element={
                  <Suspense fallback={<Spinner />}>
                     <PagePenalities section="traffic" />
                  </Suspense>
               }
            />
            <Route
               path="juzgados"
               element={
                  <Suspense fallback={<Spinner />}>
                     <PagePenalities section="courts" />
                  </Suspense>
               }
            />
            <Route
               path="seguridad-publica"
               element={
                  <Suspense fallback={<Spinner />}>
                     <PagePenalities section="securrity" />
                  </Suspense>
               }
            />
            <Route
               path="logs"
               element={
                  <Suspense fallback={<Spinner />}>
                     <PageLogs />
                  </Suspense>
               }
            />
            <Route path="catalogos">
               <Route
                  path="dependencias"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PageDependence />
                     </Suspense>
                  }
               />
               <Route
                  path="doctor"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PageDoctor />
                     </Suspense>
                  }
               />
               <Route
                  path="motivodet"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PageCauseOfDetention />
                     </Suspense>
                  }
               />
               <Route
                  path="remitente"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PageSender />
                     </Suspense>
                  }
               />
            </Route>
            <Route path="reportes">
               <Route
                  path="dashboard"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PageReports />
                     </Suspense>
                  }
               />
               <Route
                  path="mapa"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PageReportMap />
                     </Suspense>
                  }
               />
               <Route
                  path="calendario"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PageCalendary />
                     </Suspense>
                  }
               />
               <Route
                  path="general"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PagePenalities section="general" />
                     </Suspense>
                  }
               />
               <Route
                  path="reicidencias"
                  element={
                     <Suspense fallback={<Spinner />}>
                        <PageReicendences />
                     </Suspense>
                  }
               />
            </Route>
            {/* Ruta para la raíz dentro del layout */}
            <Route
               index
               element={
                  <Suspense fallback={<Spinner />}>
                     <Navigate to={redirectRoute(JSON.parse(localStorage.getItem("permisos") ?? "[]"))} replace />
                  </Suspense>
               }
            />
         </Route>

         {/* Ruta 404 debe estar AL MISMO NIVEL que las otras rutas principales */}
         <Route
            path="*"
            element={
               <Suspense fallback={<Spinner />}>
                  <PoliceSearch404 />
               </Suspense>
            }
         />
      </Routes>
   );
}

export default App;
