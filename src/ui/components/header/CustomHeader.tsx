// components/header/Header.tsx
import { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { useUsersState } from "../../../store/storeusers/users.store";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";

interface HeaderProps {
   userName?: string;
   id?: string;
   setOpenSidebar: () => void;
   isSidebarOpen?: boolean;
}

export const Header = ({ userName = "Usuario", setOpenSidebar, id, isSidebarOpen = false }: HeaderProps) => {
   const [open, setOpen] = useState(false);
   const { logout } = useUsersState();
   const api = new ApiUsers();
   const dropdownRef = useRef<HTMLDivElement>(null);
   const profileButtonRef = useRef<HTMLButtonElement>(null);

   // Función para cerrar sesión
   const handleLogout = () => {
      console.log("Cerrando sesión...");
      setOpen(false);
      logout(api);
   };

   // Cierra el dropdown si se hace clic fuera
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         // Si el clic NO está dentro del dropdown NI en el botón del perfil
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            profileButtonRef.current &&
            !profileButtonRef.current.contains(event.target as Node)
         ) {
            setOpen(false);
         }
      };

      // Agregar event listener
      document.addEventListener("mousedown", handleClickOutside);

      // Limpiar event listener
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   // Evitar scroll cuando el dropdown está abierto en móvil
   useEffect(() => {
      if (open && window.innerWidth < 1024) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "auto";
      }

      return () => {
         document.body.style.overflow = "auto";
      };
   }, [open]);

   const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

   return (
      <>
         {/* Backdrop solo para móvil cuando el dropdown está abierto */}
         {/* {open && isMobile && <div className="fixed inset-0  bg-opacity-40 z-40" onClick={() => setOpen(false)} />} */}

         <header className="h-16 presidencia flex items-center justify-between px-4 lg:px-6 w-full fixed top-0 left-0 right-0 z-30 presidencia shadow-md">
            {/* Logo y botón menú */}
            <div className="flex items-center gap-4">
               {/* Botón menú hamburguesa */}
               <button
                  id={id}
                  onClick={setOpenSidebar}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#651D32] transition-colors cursor-pointer lg:hover:bg-opacity-80"
                  aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
               >
                  {isSidebarOpen ? <FaTimes size={20} className="text-white" /> : <FaBars size={20} className="text-white" />}
               </button>

               {/* Logo o título en móvil */}
               <div className="lg:hidden">
                  <h1 className="text-white font-bold text-lg">{}</h1>
               </div>
            </div>

            {/* Perfil */}
            <div className="relative">
               <button
                  ref={profileButtonRef}
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#651D32] transition-colors cursor-pointer border border-transparent hover:border-white/20"
               >
                  <FaUserCircle size={28} className="text-white" />
                  <span className="hidden lg:inline text-white font-medium max-w-32 truncate">{userName}</span>
               </button>

               {/* Dropdown */}
               {open && (
                  <div
                     ref={dropdownRef}
                     className={`
                        presidencia rounded-xl shadow-xl overflow-hidden
                        border border-white/10 bg-[#8B2332] backdrop-blur-sm
                        ${isMobile ? "fixed top-16 left-4 right-4 z-50 w-auto max-h-[80vh] overflow-y-auto" : "absolute right-0 mt-2 w-56 z-50"}
                     `}
                  >
                     {/* Header móvil */}
                     {isMobile && (
                        <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-[#8B2332] z-10">
                           <div className="flex items-center gap-3">
                              <FaUserCircle size={32} className="text-white" />
                              <div>
                                 <p className="text-white font-semibold truncate max-w-[150px]">{userName}</p>
                                 <p className="text-white/70 text-sm">Mi cuenta</p>
                              </div>
                           </div>
                           <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                              <FaTimes size={16} className="text-white" />
                           </button>
                        </div>
                     )}

                     {/* Contenido dropdown */}
                     <div className="p-2">
                        {!isMobile && (
                           <div className="px-3 py-2 border-b border-white/10 mb-2">
                              <p className="text-white font-semibold truncate">{userName}</p>
                              <p className="text-white/70 text-sm">Bienvenido</p>
                           </div>
                        )}

                        {/* Botón cerrar sesión */}
                        <button
                           className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-[#651D32] transition-colors text-left"
                           onClick={(e) => {
                              e.stopPropagation();
                              // console.log("Botón cerrar sesión clickeado");
                              handleLogout();
                           }}
                        >
                           <FaSignOutAlt size={18} className="text-white/80" />
                           <span>Cerrar sesión</span>
                        </button>
                     </div>

                     {/* Footer móvil */}
                     {isMobile && (
                        <div className="p-4 border-t border-white/10">
                           <p className="text-white/50 text-xs text-center">{import.meta.env.VITE_APP_VERSION}</p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </header>

         {/* Espacio debajo del header fijo */}
         <div className="h-16" />
      </>
   );
};
