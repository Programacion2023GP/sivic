// components/header/Header.tsx
import { useState, type Dispatch, type SetStateAction } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FaBars } from "react-icons/fa";
import { useUsersState } from "../../../store/storeusers/users.store";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";

interface HeaderProps {
   userName?: string;
   id?: string;
   setOpenSidebar: () => void;
}

export const Header = ({ userName = "Usuario", setOpenSidebar, id }: HeaderProps) => {
   const [open, setOpen] = useState(false);
   const { logout } = useUsersState();
   const api = new ApiUsers();

   return (
      <header className="h-16 presidencia flex items-center justify-between px-6 w-full">
         {/* Botón menú */}
         <button id={id} onClick={setOpenSidebar} className="flex items-center gap-2 px-3 py-1 rounded hover:bg-[#651D32] transition-colors cursor-pointer">
            <FaBars size={24} className="text-white" />
         </button>

         {/* Perfil */}
         <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1 rounded hover:bg-[#651D32] transition-colors cursor-pointer">
               <FaUserCircle size={24} className="text-white" />
               <span className="text-white font-medium">{userName}</span>
            </button>

            {/* Dropdown */}
            {open && (
               <div className="absolute right-0 mt-2 w-48 presidencia rounded-md shadow-lg overflow-hidden z-50">
                  <div className="border-t border-[#651D32]" />
                  <button
                     className="w-full text-left px-4 py-2 hover:cursor-pointer text-white hover:bg-[#651D32] transition-colors"
                     onClick={() => {
                        logout(api);
                     }}
                  >
                     Cerrar sesión
                  </button>
               </div>
            )}
         </div>
      </header>
   );
};
