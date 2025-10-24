// components/header/Header.tsx
import { useState, type Dispatch, type SetStateAction } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FaBars } from "react-icons/fa";
import { useUsersState } from "../../../store/storeusers/users.store";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";

interface HeaderProps {
  userName?: string;
  id?:string,
  setOpenSidebar:()=>void
}

export const Header = ({ userName = "Usuario",setOpenSidebar,id }: HeaderProps) => {
  const [open, setOpen] = useState(false);
    const {logout } = useUsersState()
    const api = new ApiUsers();

  return (
    <header className="h-16 bg-white border-b shadow-md border-gray-300 flex items-center justify-between px-6">
      {/* Título */}
          <button
          id={id}
          onClick={ setOpenSidebar}
          className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <FaBars size={24} className="text-black" />
        </button>


      {/* Perfil */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <FaUserCircle size={24} className="text-cyan-600" />
          <span className="text-gray-700 font-medium">{userName}</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
            {/* <button
              className="w-full hover:cursor-pointer text-left px-4 py-2 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
              onClick={() => console.log("Perfil")}
            >
              Perfil
            </button>
            <button
              className="w-full hover:cursor-pointer text-left px-4 py-2 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
              onClick={() => console.log("Ajustes")}
            >
              Ajustes
            </button> */}
            <div className="border-t border-gray-200" />
            <button
              className="w-full text-left px-4 py-2 hover:cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              onClick={() => {logout(api)}}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
