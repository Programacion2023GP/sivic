import { Sidebar } from "./ui/components/sidebar/CustomSidebar";
import { SidebarItem } from "./ui/components/sidebar/CustomSidebarItem";
import { BiBox } from "react-icons/bi";
import { SidebarDrop } from "./ui/components/sidebar/CustomSidebarDrop";
import { Header } from "./ui/components/header/CustomHeader";
import { useCallback, useState } from "react";
import PageTechnicalDataset from "./ui/pages/techinicaldataset/PageTechinicalDataset";
import PageDependence from "./ui/pages/catalogues/dependece/pagedependece";
import PageProcedure from "./ui/pages/catalogues/procedure/pageprocedure";
import { FaUserTie } from "react-icons/fa6";
import PageUsersPanel from "./ui/pages/pageusers/pageuserspanel";
import PageLogin from "./ui/pages/login/PageLogin";
import "./App.css";
import PageReports from "./ui/pages/reports/reports";
import { TbReportSearch } from "react-icons/tb";
import { BiTask } from "react-icons/bi";
import { Routes, Navigate, Outlet, Route, useLocation } from 'react-router-dom';

// Componente Layout para las rutas autenticadas
const MainLayout = () => {
  const [open, setOpen] = useState<boolean>(false);

  const toogleOpen = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {open && (
        <div className="w-64">
          <Sidebar >
            <PermissionRoute requiredPermission="Usuarios">
              <SidebarItem route="/usuarios" icon={<FaUserTie />} label="Usuarios" />
            </PermissionRoute>
            <PermissionRoute requiredPermission="Reportes">
              <SidebarItem route="/reportes" icon={<TbReportSearch />} label="reportes" />
            </PermissionRoute>
            <PermissionRoute requiredPermission={["CapturistaFichas", "AdministrarFichas"]}>
              <SidebarItem route="/fichastecnicas" icon={<BiTask />} label="Fichas Tecnicas" />
            </PermissionRoute>
            <PermissionRoute requiredPermission="Catalogos">
              <SidebarDrop id="dropdown-catalogos" icon={<BiBox />} label="Catálogos">
                <SidebarItem label="Tramite" route="/catalogos/tramites" />
                <SidebarItem label="Dependencias" route="/catalogos/dependencias" />
              </SidebarDrop>
            </PermissionRoute>
          </Sidebar>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header id="btn-menu" setOpenSidebar={toogleOpen} userName={localStorage.getItem("name") || ""} />

        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* Aquí se renderizan las rutas hijas */}
        </main>
      </div>
    </div>
  );
};

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredPermission: string | string[];
}

export const PermissionRoute = ({ children, requiredPermission }: PermissionRouteProps) => {
  const userPermissions: string[] = JSON.parse(localStorage.getItem("permisos") || "[]");

  const hasPermission = Array.isArray(requiredPermission)
    ? requiredPermission.some(p => userPermissions.includes(p))
    : userPermissions.includes(requiredPermission);

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/usuarios" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Ruta de login - solo accesible si NO está autenticado */}
      <Route path="/login" element={
        <PublicRoute>
          <PageLogin />
        </PublicRoute>
      } />

      {/* Todas las rutas protegidas */}
      <Route path="/*" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="usuarios" element={<PageUsersPanel />} />
        <Route path="fichastecnicas" element={<PageTechnicalDataset />} />
        <Route path="reportes" element={<PageReports />} />
        <Route path="catalogos">
          <Route path="dependencias" element={<PageDependence />} />
          <Route path="tramites" element={<PageProcedure />} />
        </Route>
        {/* Ruta por defecto */}
        <Route path="*" element={<PageUsersPanel />} />
      </Route>
    </Routes>
  );
}

export default App;