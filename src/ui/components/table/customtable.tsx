import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import {
   FiSearch,
   FiChevronUp,
   FiChevronDown,
   FiX,
   FiAlertCircle,
   FiInbox,
   FiMoreVertical,
   FiTrash2,
   FiEdit,
   FiGrid,
   FiList,
   FiEye,
   FiFilter,
   FiSettings
} from "react-icons/fi";
import { RiFileExcelFill } from "react-icons/ri";
import { MdOutlineKeyboardArrowRight, MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { PermissionRoute } from "../../../App";
import { usePermissionsStore } from "../../../store/menu/menu.store";

interface Column<T extends object> {
   field: keyof T;
   headerName: string;
   renderField?: <K extends keyof T>(value: T[K]) => React.ReactNode;
   getFilterValue?: <K extends keyof T>(value: T[K]) => string;
   visibility?: "always" | "desktop" | "expanded" | "mobile";
   priority?: number;
}

interface MobileConfig<T extends object> {
   activeViews?:boolean,
   listTile?: {
      leading?: (row: T) => React.ReactNode;
      title: (row: T) => React.ReactNode;
      subtitle?: (row: T) => React.ReactNode;
      trailing?: (row: T) => React.ReactNode;
   };
   onTileTap?: (row: T) => void;
   dismissible?: boolean;
   swipeActions?: {
      left?: {
         icon: React.ReactNode;
         color: string;
         action: (row: T) => void;
         label?: string;
         hasPermission?: string | string[];
      }[];
      right?: {
         icon: React.ReactNode;
         color: string;
         action: (row: T) => void;
         label?: string;
         hasPermission?: string | string[];
      }[];
   };
   bottomSheet?: {
      builder: (row: T, onClose: () => void) => React.ReactNode;
      height?: number;
      showCloseButton?: boolean;
   };
   quickFilters?: {
      enabled?: boolean;
      filters?: {
         field: keyof T;
         type?: "text" | "date" | "time" | "datetime" | "date-range" | "select" | "number" | "range" | "checkbox";
         label?: string;
         placeholder?: string;
         options?: { label: string; value: any }[];
         defaultValue?: any; // Valor por defecto
         defaultRange?: {
            // Para date-range
            start?: string | Date;
            end?: string | Date;
         };
         minDate?: string | Date; // Para fechas
         maxDate?: string | Date;
         timeFormat?: "12h" | "24h";
         showTodayButton?: boolean; // Mostrar botón "Hoy"
         showClearButton?: boolean; // Mostrar botón "Limpiar"
         // Para date-range
         presets?: {
            label: string;
            start: string | Date;
            end: string | Date;
         }[];
      }[];
      onApply?: (filters: Record<string, any>) => void;
   };
}

interface PropsTable<T extends object> {
   data: T[];
   paginate: number[];
   columns: Column<T>[];
   headerActions?: () => React.ReactNode;
   actions?: (row: T) => React.ReactNode;
   loading?: boolean;
   error?: string;
   striped?: boolean;
   hoverable?: boolean;
   cardTitleField?: keyof T;
   conditionExcel?: string | Array<string>;
   mobileConfig?: MobileConfig<T>;
   defaultView?: "table" | "cards";
   enableViewToggle?: boolean;
}

type MobileViewMode = "list" | "compact-list" | "cards" | "mini-cards" | "timeline" | "detailed-list";
type MobileDensity = "compact" | "comfortable" | "spacious";

const CustomTable = <T extends object>({
   data,
   columns,
   paginate,
   actions,
   loading,
   error,
   headerActions,
   striped = true,
   hoverable = true,
   cardTitleField,
   conditionExcel,
   mobileConfig,
   defaultView = "table",
   enableViewToggle = true
}: PropsTable<T>) => {
   const [currentPage, setCurrentPage] = useState(1);
   const [rowsPerPage, setRowsPerPage] = useState(paginate[0]);
   const [globalFilter, setGlobalFilter] = useState("");
   const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
   const [sortConfig, setSortConfig] = useState<{ field: keyof T | null; direction: "asc" | "desc" | null }>({ field: null, direction: null });
   const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
   const [isMobile, setIsMobile] = useState(false);
   const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
   const [selectedRowForSheet, setSelectedRowForSheet] = useState<T | null>(null);
   const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
   const [viewMode, setViewMode] = useState<"table" | "cards">(defaultView);
   const hasPermission = usePermissionsStore((state) => state.hasPermission);
   const [mobileViewMode, setMobileViewMode] = useState<MobileViewMode>("list");
   const [mobileDensity, setMobileDensity] = useState<MobileDensity>("comfortable");
   const [showMobileFilters, setShowMobileFilters] = useState(false);
   const [showMobileSettings, setShowMobileSettings] = useState(false);
   const [screenSize, setScreenSize] = useState<"xs" | "sm" | "md">("md");
   const [swipeData, setSwipeData] = useState<{
      index: number | null;
      offset: number;
      isSwiping: boolean;
      actionBackground: string | null;
   }>({
      index: null,
      offset: 0,
      isSwiping: false,
      actionBackground: null
   });
   const [expandedItem, setExpandedItem] = useState<number | null>(null);
   const [activeDetails, setActiveDetails] = useState<number | null>(null);
   const [showFilterModal, setShowFilterModal] = useState(false);
   const [tempFilters, setTempFilters] = useState<Record<string, any>>({});
   const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
   useEffect(() => {
      if (mobileConfig?.quickFilters?.filters) {
         const initialFilters: Record<string, any> = {};
         const initialActiveFilters: Record<string, any> = {};

         mobileConfig.quickFilters.filters.forEach((filter) => {
            const field = String(filter.field);
            let defaultValue = filter.defaultValue;

            // Procesar valores por defecto especiales
            if (filter.type === "date") {
               if (filter.defaultValue === "today") {
                  const today = new Date();
                  defaultValue = formatDateForInput(today);
               } else if (filter.defaultValue) {
                  defaultValue = formatDateForInput(filter.defaultValue);
               }
            } else if (filter.type === "date-range" && filter.defaultRange) {
               const start = formatDateForInput(filter.defaultRange.start);
               const end = formatDateForInput(filter.defaultRange.end);
               defaultValue = { start, end };
            }

            initialFilters[field] = defaultValue || "";

            // Si hay valor por defecto, activar el filtro
            if (defaultValue !== undefined && defaultValue !== "" && !(typeof defaultValue === "object" && Object.keys(defaultValue).length === 0)) {
               initialActiveFilters[field] = defaultValue;
            }
         });

         setTempFilters(initialFilters);
         setActiveFilters(initialActiveFilters);

         // Ejecutar callback si hay filtros activos por defecto
         if (Object.keys(initialActiveFilters).length > 0 && mobileConfig.quickFilters.onApply) {
            setTimeout(() => {
               mobileConfig.quickFilters!.onApply!(initialActiveFilters);
            }, 100);
         }
      }
   }, [mobileConfig?.quickFilters?.filters]);
   // Función helper para formatear fechas sin problemas de zona horaria
   // Agrega estas funciones al inicio del componente (después de los estados)
   const formatDateForInput = (value: any): string => {
      if (!value) return "";

      // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
         return value;
      }

      let year: number, month: number, day: number;

      if (value instanceof Date) {
         year = value.getFullYear();
         month = value.getMonth() + 1;
         day = value.getDate();
      } else if (typeof value === "string") {
         // Formato ISO datetime
         if (value.includes("T")) {
            const date = new Date(value);
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
         } else {
            // Intentar parsear manualmente
            const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (match) {
               year = parseInt(match[1], 10);
               month = parseInt(match[2], 10);
               day = parseInt(match[3], 10);
            } else {
               return "";
            }
         }
      } else {
         return "";
      }

      const monthStr = String(month).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");

      return `${year}-${monthStr}-${dayStr}`;
   };

   const formatDateForDisplay = (date: Date | string): string => {
      let dateObj: Date;

      if (date instanceof Date) {
         dateObj = date;
      } else if (typeof date === "string") {
         dateObj = new Date(date);
      } else {
         return "";
      }

      return dateObj.toLocaleDateString("es-ES", {
         year: "numeric",
         month: "2-digit",
         day: "2-digit"
      });
   };
   // Handler para aplicar filtros
   const handleApplyFilters = () => {
      const cleanedFilters: Record<string, any> = {};
      Object.entries(tempFilters).forEach(([key, value]) => {
         if (value !== "" && value != null) {
            cleanedFilters[key] = value;
         }
      });

      setActiveFilters(cleanedFilters);
      setShowFilterModal(false);

      if (mobileConfig?.quickFilters?.onApply) {
         mobileConfig.quickFilters.onApply(cleanedFilters);
      }
   };

   // Handler para limpiar filtros
   const handleClearFilters = () => {
      const emptyFilters: Record<string, any> = {};
      if (mobileConfig?.quickFilters?.filters) {
         mobileConfig.quickFilters.filters.forEach((filter) => {
            emptyFilters[String(filter.field)] = "";
         });
      }
      setTempFilters(emptyFilters);
      setActiveFilters({});
      setShowFilterModal(false);

      if (mobileConfig?.quickFilters?.onApply) {
         mobileConfig.quickFilters.onApply({});
      }
   };

   // Detectar viewport con más precisión
   useEffect(() => {
      const checkViewport = () => {
         const width = window.innerWidth;
         setIsMobile(width < 1024);

         // Definir tamaños de pantalla móvil
         if (width < 375) {
            setScreenSize("xs"); // iPhone SE, pequeños
         } else if (width < 430) {
            setScreenSize("sm"); // iPhone regular, Android mediano
         } else {
            setScreenSize("md"); // iPhone Plus/Pro Max, tablets pequeñas
         }
      };

      checkViewport();
      window.addEventListener("resize", checkViewport);
      return () => window.removeEventListener("resize", checkViewport);
   }, []);

   useEffect(() => {
      setCurrentPage(1);
      setSelectedRows(new Set());
   }, [data]);
   // Componente del modal de filtros (versión mejorada)
   const renderFilterModal = () => {
      if (!showFilterModal || !mobileConfig?.quickFilters?.filters) return null;

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      // Presets comunes para date-range
      const commonPresets = [
      
         { label: "Esta semana", start: thisWeekStart, end: today },
         { label: "Este mes", start: thisMonthStart, end: today },
         { label: "Mes pasado", start: lastMonthStart, end: lastMonthEnd }
      ];

      return (
         <AnimatePresence>
            <motion.div className="fixed inset-0 z-50 flex items-start justify-center pt-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               {/* Overlay */}
               <motion.div
                  className="absolute inset-0 bg-black bg-opacity-50"
                  onClick={() => setShowFilterModal(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
               />

               {/* Modal */}
               <motion.div
                  className="relative bg-white rounded-2xl shadow-2xl w-full mx-4 max-w-md max-h-[85vh] overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
               >
                  {/* Header del modal */}
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                     <div>
                        <h3 className="text-lg font-bold text-gray-900">Filtros avanzados</h3>
                        <p className="text-sm text-gray-600">Filtra por criterios específicos</p>
                     </div>
                     <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600">
                        <FiX size={24} />
                     </button>
                  </div>

                  {/* Contenido del modal */}
                  <div className="px-6 py-4 overflow-y-auto max-h-[55vh]">
                     <div className="space-y-4">
                        {mobileConfig.quickFilters.filters.map((filterConfig) => {
                           const field = String(filterConfig.field);
                           const col = columns.find((c) => String(c.field) === field);

                           // Determinar valor por defecto
                           let defaultValue = filterConfig.defaultValue;
                           if (filterConfig.type === "date" && filterConfig.defaultValue === "today") {
                              defaultValue = today.toISOString().split("T")[0];
                           }

                           // Valor actual o por defecto
                           const currentValue = tempFilters[field] !== undefined ? tempFilters[field] : defaultValue;

                           return (
                              <div key={field} className="space-y-2">
                                 <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">{filterConfig.label || col?.headerName || field}</label>

                                    {/* Botones de acción rápidos */}
                                    <div className="flex gap-1">
                                       {filterConfig.showTodayButton && filterConfig.type === "date" && (
                                          // En el botón "Hoy", cambia:
                                          <button
                                             type="button"
                                             onClick={() =>
                                                setTempFilters((prev) => ({
                                                   ...prev,
                                                   [field]: formatDateForInput(new Date())
                                                }))
                                             }
                                             className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                          >
                                             Hoy
                                          </button>
                                       )}
                                       {filterConfig.showClearButton && currentValue && (
                                          <button
                                             type="button"
                                             onClick={() =>
                                                setTempFilters((prev) => ({
                                                   ...prev,
                                                   [field]: ""
                                                }))
                                             }
                                             className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                          >
                                             <FiX size={12} />
                                          </button>
                                       )}
                                    </div>
                                 </div>

                                 {/* Render según tipo */}
                                 {renderFilterInput(filterConfig, field, currentValue)}
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* Footer del modal */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                     <button onClick={handleClearFilters} className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition">
                        Limpiar todo
                     </button>
                     <button onClick={handleApplyFilters} className="flex-1 py-3 bg-[#9B2242] text-white font-medium rounded-xl hover:bg-[#7A1B35] transition">
                        Aplicar filtros
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         </AnimatePresence>
      );
   };

   // Componente helper para renderizar inputs según tipo
   const renderFilterInput = (filterConfig: any, field: string, currentValue: any) => {
      if (!showFilterModal || !mobileConfig?.quickFilters?.filters) return null;
      const today = new Date();

      // Ayer
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Semana actual (domingo → hoy)
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());

      // Semana anterior
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

      // Semana próxima
      const nextWeekStart = new Date(thisWeekStart);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);

      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);

      // Mes actual
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Mes pasado
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      // Mes siguiente
      const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);

      // Año pasado
      const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

      const commonPresets = [
         { label: "Semana anterior", start: lastWeekStart, end: lastWeekEnd },
         { label: "Esta semana", start: thisWeekStart, end: today },
         { label: "Semana próxima", start: nextWeekStart, end: nextWeekEnd },

         { label: "Mes pasado", start: lastMonthStart, end: lastMonthEnd },
         { label: "Este mes", start: thisMonthStart, end: today },
         { label: "Mes siguiente", start: nextMonthStart, end: nextMonthEnd },

         { label: "Año pasado", start: lastYearStart, end: lastYearEnd }
      ];

      switch (filterConfig.type) {
         case "date":
            return (
               <input
                  type="date"
                  value={currentValue || ""}
                  onChange={(e) =>
                     setTempFilters((prev) => ({
                        ...prev,
                        [field]: e.target.value
                     }))
                  }
                  min={filterConfig.minDate}
                  max={filterConfig.maxDate}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B2242]"
               />
            );

         case "time":
            return (
               <input
                  type="time"
                  value={currentValue || ""}
                  onChange={(e) =>
                     setTempFilters((prev) => ({
                        ...prev,
                        [field]: e.target.value
                     }))
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B2242]"
               />
            );

         case "datetime":
            return (
               <input
                  type="datetime-local"
                  value={currentValue || ""}
                  onChange={(e) =>
                     setTempFilters((prev) => ({
                        ...prev,
                        [field]: e.target.value
                     }))
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B2242]"
               />
            );

         // En el caso "date-range", cambia completamente:
         case "date-range":
            const rangeValue = currentValue || { start: "", end: "" };
            const presets = filterConfig.presets || [
             
               { label: "Esta semana", start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), end: new Date() },
               { label: "Este mes", start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: new Date() },
               {
                  label: "Mes pasado",
                  start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                  end: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
               }
            ];

            return (
               <div className="space-y-3">
                  {/* Presets rápidos */}
                  <div className="flex flex-wrap gap-2">
                     {presets.map((preset, idx) => {
                        const startStr = formatDateForInput(preset.start);
                        const endStr = formatDateForInput(preset.end);

                        return (
                           <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                 setTempFilters((prev) => ({
                                    ...prev,
                                    [field]: { start: startStr, end: endStr }
                                 }))
                              }
                              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                           >
                              {preset.label}
                           </button>
                        );
                     })}
                  </div>

                  {/* Inputs de fecha */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-xs text-gray-600">Desde</label>
                        <input
                           type="date"
                           value={rangeValue.start || ""}
                           onChange={(e) =>
                              setTempFilters((prev) => ({
                                 ...prev,
                                 [field]: { ...rangeValue, start: e.target.value }
                              }))
                           }
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs text-gray-600">Hasta</label>
                        <input
                           type="date"
                           value={rangeValue.end || ""}
                           onChange={(e) =>
                              setTempFilters((prev) => ({
                                 ...prev,
                                 [field]: { ...rangeValue, end: e.target.value }
                              }))
                           }
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                     </div>
                  </div>

                  {/* Mostrar rango seleccionado */}
                  {rangeValue.start && rangeValue.end && (
                     <div className="text-xs text-center text-gray-600 bg-gray-50 py-2 rounded-lg">
                        {formatDateForDisplay(rangeValue.start)} - {formatDateForDisplay(rangeValue.end)}
                     </div>
                  )}
               </div>
            );
         case "select":
            return (
               <select
                  value={currentValue || ""}
                  onChange={(e) =>
                     setTempFilters((prev) => ({
                        ...prev,
                        [field]: e.target.value
                     }))
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B2242] bg-white"
               >
                  <option value="">Seleccionar...</option>
                  {filterConfig.options?.map((option: any, idx: number) => (
                     <option key={idx} value={option.value}>
                        {option.label}
                     </option>
                  ))}
               </select>
            );

         case "checkbox":
            return (
               <div className="flex items-center">
                  <input
                     type="checkbox"
                     checked={!!currentValue}
                     onChange={(e) =>
                        setTempFilters((prev) => ({
                           ...prev,
                           [field]: e.target.checked
                        }))
                     }
                     className="h-4 w-4 text-[#9B2242] focus:ring-[#9B2242] border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">{filterConfig.placeholder || "Activar filtro"}</label>
               </div>
            );

         case "number":
            return (
               <input
                  type="number"
                  value={currentValue || ""}
                  onChange={(e) =>
                     setTempFilters((prev) => ({
                        ...prev,
                        [field]: e.target.value
                     }))
                  }
                  min={filterConfig.min}
                  max={filterConfig.max}
                  step={filterConfig.step || 1}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B2242]"
                  placeholder={filterConfig.placeholder}
               />
            );

         case "range":
            return (
               <div className="space-y-2">
                  <input
                     type="range"
                     value={currentValue || filterConfig.min || 0}
                     onChange={(e) =>
                        setTempFilters((prev) => ({
                           ...prev,
                           [field]: e.target.value
                        }))
                     }
                     min={filterConfig.min}
                     max={filterConfig.max}
                     step={filterConfig.step || 1}
                     className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                     <span>{filterConfig.min || 0}</span>
                     <span>Valor: {currentValue || filterConfig.min || 0}</span>
                     <span>{filterConfig.max || 100}</span>
                  </div>
               </div>
            );

         default: // text
            return (
               <input
                  type="text"
                  value={currentValue || ""}
                  onChange={(e) =>
                     setTempFilters((prev) => ({
                        ...prev,
                        [field]: e.target.value
                     }))
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B2242]"
                  placeholder={filterConfig.placeholder || `Filtrar por ${filterConfig.label || field}...`}
               />
            );
      }
   };

   // Componente para mostrar filtros activos como chips
   // Componente para mostrar filtros activos como chips (CORREGIDO)
   const renderActiveFiltersChips = () => {
      if (!mobileConfig?.quickFilters?.filters || Object.keys(activeFilters).length === 0) return null;

      return (
         <div className="flex flex-wrap gap-2 mt-2">
            {mobileConfig.quickFilters.filters.map((filterConfig) => {
               const field = String(filterConfig.field);
               const value = activeFilters[field];
               if (!value || (typeof value === "object" && Object.keys(value).length === 0)) return null;

               const col = columns.find((c) => String(c.field) === field);

               let displayValue = value;
               let chipLabel = filterConfig.label || col?.headerName || field;

               if (filterConfig.type === "date-range") {
                  // Si los valores ya están en UTC, simplemente crear la fecha desde UTC
                  const startDate = new Date(value.start);
                  const endDate = new Date(value.end);

                  // Formatear usando UTC para evitar problemas de zona horaria
                  const formatUTCDate = (date) => {
                     const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

                     return utcDate.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC"
                     });
                  };
                  if (value && value.start && value.end) {
                     displayValue = `${formatUTCDate(startDate)} - ${formatUTCDate(endDate)}`;
                     chipLabel = "Rango de fechas";
                  } else {
                     return;
                     displayValue = ``;
                     chipLabel = "";
                  }
               } else if (filterConfig.type === "date") {
                  const date = new Date(value);
                  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

                  displayValue = utcDate.toLocaleDateString("es-ES", {
                     year: "numeric",
                     month: "short",
                     day: "numeric",
                     timeZone: "UTC"
                  });
               } else if (filterConfig.type === "select") {
                  const option = filterConfig.options?.find((opt) => {
                     // Comparación flexible para números/strings
                     return String(opt.value) === String(value);
                  });

                  if (option) {
                     displayValue = option.label;
                  } else {
                     displayValue = value;
                  }
               } else if (filterConfig.type === "time") {
                  displayValue = value;
               }

               return (
                  <div key={field} className="flex items-center gap-2 bg-[#9B2242] text-white px-3 py-2 rounded-full text-sm">
                     <span className="font-medium truncate max-w-[80px]">{chipLabel}:</span>
                     <span className="truncate max-w-[100px]">{displayValue}</span>
                     <button
                        onClick={() => {
                           const newFilters = { ...tempFilters, [field]: "" };
                           setTempFilters(newFilters);
                           const newActiveFilters = { ...activeFilters };
                           delete newActiveFilters[field];
                           setActiveFilters(newActiveFilters);

                           if (mobileConfig?.quickFilters?.onApply) {
                              mobileConfig.quickFilters.onApply(newActiveFilters);
                           }
                        }}
                        className="ml-1 hover:text-gray-200"
                     >
                        <FiX size={14} />
                     </button>
                  </div>
               );
            })}
         </div>
      );
   };
   // Filtrado y ordenamiento
   const safeData = Array.isArray(data) ? data : [];

   const formatDateForComparison = (value: any): Date | null => {
      if (!value) {
         return null;
      }

      let year: number, month: number, day: number;

      // Si ya es una fecha
      if (value instanceof Date) {
         console.log("📅 Ya es Date:", value.toISOString());
         // Crear nueva fecha en UTC para evitar problemas de zona horaria
         return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 0, 0, 0, 0));
      }

      // Si es string, intentar parsear
      if (typeof value === "string") {
         // Formato YYYY-MM-DD (ISO)
         const match1 = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
         if (match1) {
            year = parseInt(match1[1], 10);
            month = parseInt(match1[2], 10) - 1; // Los meses empiezan en 0
            day = parseInt(match1[3], 10);
            const result = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
            return result;
         }

         // Formato DD/MM/YYYY
         const match2 = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
         if (match2) {
            day = parseInt(match2[1], 10);
            month = parseInt(match2[2], 10) - 1;
            year = parseInt(match2[3], 10);
            const result = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
            return result;
         }

         // Si contiene "T" (ISO datetime), extraer solo la fecha
         if (value.includes("T")) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
               const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
               return result;
            }
         }

         // Intentar parsear como fecha general
         const date = new Date(value);
         if (!isNaN(date.getTime())) {
            const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
            return result;
         }
      }

      // Si es número (timestamp)
      if (typeof value === "number") {
         const date = new Date(value);
         if (!isNaN(date.getTime())) {
            const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
            return result;
         }
      }

      return null;
   };
   const filteredData = safeData
      .filter((row) =>
         globalFilter
            ? columns.some((col) => {
                 const rawValue = row?.[col.field];
                 const value = col.getFilterValue ? col.getFilterValue(rawValue) : String(rawValue ?? "");
                 return value.toLowerCase().includes(globalFilter.toLowerCase());
              })
            : true
      )
      .filter((row) =>
         columns.every((col) => {
            const filterValue = columnFilters?.[String(col.field)];
            if (!filterValue) return true;

            const rawValue = row?.[col.field];
            const value = col.getFilterValue ? col.getFilterValue(rawValue) : String(rawValue ?? "");
            return value.toLowerCase().includes(filterValue.toLowerCase());
         })
      )
      .filter((row) =>
         Object.entries(activeFilters).every(([field, filterValue]) => {
            // Verificar si el filtro está vacío
            if (!isMobile) {
               return true;
            }
            if (
               !filterValue ||
               (typeof filterValue === "string" && filterValue.trim() === "") ||
               (typeof filterValue === "object" && Object.keys(filterValue).length === 0)
            ) {
               return true;
            }

            const filterConfig = mobileConfig?.quickFilters?.filters?.find((f) => f.field === field);

            const col = columns.find((c) => String(c.field) == field);

            if (!col) return true;

            const rawValue = row?.[col.field as keyof T];

            // Si no hay valor en la fila, no pasa el filtro
            if (rawValue === null || rawValue === undefined || rawValue === "") return false;

            const rawValueStr = String(rawValue);

            // Manejo especial por tipo de filtro
            if (filterConfig?.type === "date-range") {
               const cellDate = formatDateForComparison(rawValue);
               const startDate = formatDateForComparison(filterValue.start);
               const endDate = formatDateForComparison(filterValue.end);
               if (!cellDate || !startDate || !endDate) return false;
               const cellTime = cellDate.getTime();
               return cellTime >= startDate.getTime() && cellTime <= endDate.getTime();
            } else if (filterConfig?.type === "date") {
               const cellDate = formatDateForComparison(rawValue);
               const filterDate = formatDateForComparison(filterValue);
               if (!cellDate || !filterDate) return false;
               return cellDate.getTime() === filterDate.getTime();
            } else if (filterConfig?.type === "time") {
               const cellTime = rawValueStr;
               let timePart = cellTime;
               if (cellTime.includes("T")) {
                  timePart = cellTime.split("T")[1]?.split(".")[0] || cellTime;
               }
               return timePart.includes(String(filterValue));
            } else if (filterConfig?.type === "select") {
               const cellValue = rawValueStr;
               const filterValueStr = String(filterValue);
               return cellValue === filterValueStr;
            } else if (filterConfig?.type === "checkbox") {
               return !!rawValue === !!filterValue;
            } else if (filterConfig?.type === "number") {
               const cellNumber = Number(rawValue);
               return cellNumber === Number(filterValue);
            } else if (filterConfig?.type === "text") {
               const cellValue = col.getFilterValue ? col.getFilterValue(rawValue) : rawValueStr;
               return cellValue.toLowerCase().includes(String(filterValue).toLowerCase());
            } else {
               // Por defecto, búsqueda de texto (solo si NO es un tipo específico ya manejado)
               const cellValue = col.getFilterValue ? col.getFilterValue(rawValue) : rawValueStr;
               return cellValue.toLowerCase().includes(String(filterValue).toLowerCase());
            }
         })
      );

   const sortedData = [...filteredData].sort((a, b) => {
      if (!sortConfig.field || !sortConfig.direction) return 0;
      const valA = a[sortConfig.field];
      const valB = b[sortConfig.field];
      if (valA == null) return -1;
      if (valB == null) return 1;
      const comparison = String(valA).localeCompare(String(valB));
      return sortConfig.direction === "asc" ? comparison : -comparison;
   });

   // Paginación
   const totalPages = Math.ceil(sortedData.length / rowsPerPage);
   const startIndex = (currentPage - 1) * rowsPerPage;
   const currentRows = sortedData.slice(startIndex, startIndex + rowsPerPage);

   // Handlers
   const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setCurrentPage(1);
   };

   const handleColumnFilterChange = (field: string, value: string) => {
      setColumnFilters((prev) => ({ ...prev, [field]: value }));
      setCurrentPage(1);
   };

   const clearColumnFilter = (field: string) => {
      setColumnFilters((prev) => ({ ...prev, [field]: "" }));
      setCurrentPage(1);
   };

   const clearAllFilters = () => {
      setGlobalFilter("");
      setColumnFilters({});
      setCurrentPage(1);
   };

   const handleSort = (field: keyof T) => {
      setSortConfig((prev) => {
         if (prev.field === field) {
            if (prev.direction === "asc") return { field, direction: "desc" };
            if (prev.direction === "desc") return { field: null, direction: null };
         }
         return { field, direction: "asc" };
      });
   };

   const toggleRowExpansion = (index: number) => {
      setExpandedRows((prev) => {
         const newSet = new Set(prev);
         if (newSet.has(index)) {
            newSet.delete(index);
         } else {
            newSet.add(index);
         }
         return newSet;
      });
   };

   // Handlers para móvil
   const handleTileTap = (row: T, event?: React.MouseEvent) => {
      if (swipeData.isSwiping) {
         event?.stopPropagation();
         event?.preventDefault();
         return;
      }

      if (mobileConfig?.onTileTap) {
         mobileConfig.onTileTap(row);
      } else if (mobileConfig?.bottomSheet) {
         setSelectedRowForSheet(row);
         setShowBottomSheet(true);
      }
   };

   const closeBottomSheet = () => {
      setShowBottomSheet(false);
      setSelectedRowForSheet(null);
   };

   // Handlers para swipe
   const handleSwipeStart = (idx: number) => {
      setSwipeData({
         index: idx,
         offset: 0,
         isSwiping: true,
         actionBackground: null
      });
   };

   const handleSwipeMove = (deltaX: number, idx: number) => {
      if (swipeData.index === idx) {
         const maxOffset = 120;
         const smoothOffset = deltaX * 0.7;
         const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, smoothOffset));

         setSwipeData((prev) => ({
            ...prev,
            offset: clampedOffset
         }));
      }
   };

   const handleSwipeEnd = (row: T, idx: number, hasPermission: any) => {
      if (swipeData.index === idx) {
         const threshold = 60;
         const leftAction = mobileConfig?.swipeActions?.left?.[0];
         const rightAction = mobileConfig?.swipeActions?.right?.[0];

         if (swipeData.offset > threshold && leftAction) {
            setSwipeData((prev) => ({ ...prev, offset: 120 }));
            setTimeout(() => {
               if (leftAction.hasPermission) {
                  const allowed = Array.isArray(leftAction.hasPermission)
                     ? leftAction.hasPermission.some((p) => hasPermission(p))
                     : hasPermission(leftAction?.hasPermission);

                  if (!allowed) {
                     return;
                  }
               }
               leftAction.action(row);
               setSwipeData({
                  index: null,
                  offset: 0,
                  isSwiping: false,
                  actionBackground: null
               });
            }, 300);
         } else if (swipeData.offset < -threshold && rightAction) {
            if (rightAction.hasPermission) {
               const allowed = Array.isArray(rightAction.hasPermission)
                  ? rightAction.hasPermission.some((p) => hasPermission(p))
                  : hasPermission(rightAction?.hasPermission);

               if (!allowed) {
                  return;
               }
            }
            setSwipeData((prev) => ({ ...prev, offset: -120 }));
            setTimeout(() => {
               rightAction.action(row);
               setSwipeData({
                  index: null,
                  offset: 0,
                  isSwiping: false,
                  actionBackground: null
               });
            }, 300);
         } else {
            setSwipeData((prev) => ({ ...prev, offset: 0 }));
            setTimeout(() => {
               setSwipeData({
                  index: null,
                  offset: 0,
                  isSwiping: false,
                  actionBackground: null
               });
            }, 200);
         }
      }
   };

   const getVisiblePages = () => {
      if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
      if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
      if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
      return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
   };

   const exportToExcel = () => {
      const exportData = sortedData.map((row) => {
         const obj: Record<string, any> = {};
         columns.forEach((col) => {
            try {
               if (col.renderField) {
                  const renderedValue = col.renderField(row[col.field]);

                  let stringValue = "";

                  if (typeof renderedValue === "string") {
                     stringValue = renderedValue;
                  } else if (typeof renderedValue === "number" || typeof renderedValue === "boolean") {
                     stringValue = String(renderedValue);
                  } else if (React.isValidElement(renderedValue)) {
                     const tempDiv = document.createElement("div");
                     setTimeout(() => {
                        stringValue = tempDiv.textContent || tempDiv.innerText || "";
                     }, 100);

                     stringValue = String(row[col.field] ?? "");
                  } else {
                     stringValue = String(renderedValue ?? row[col.field] ?? "");
                  }

                  obj[String(col.headerName)] = stringValue;
               } else {
                  obj[String(col.headerName)] = col.getFilterValue ? col.getFilterValue(row[col.field]) : row[col.field];
               }
            } catch (error) {
               console.warn(`Error al procesar columna ${String(col.field)}:`, error);
               obj[String(col.headerName)] = row[col.field];
            }
         });
         return obj;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, "export.xlsx");
   };

   const highlight = (text: string) => {
      if (!globalFilter) return text;
      const regex = new RegExp(`(${globalFilter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      const parts = text.split(regex);
      return (
         <>
            {parts.map((part, idx) =>
               regex.test(part) ? (
                  <span key={idx} className="bg-yellow-200 font-medium">
                     {part}
                  </span>
               ) : (
                  part
               )
            )}
         </>
      );
   };

   const getVisibleColumns = (mode: "compact" | "expanded" = "expanded") => {
      if (mode === "expanded") {
         return columns;
      }

      const alwaysColumns = columns.filter((col) => col.visibility === "always");
      const otherColumns = columns.filter(
         (col) => col.visibility !== "always" && (col.visibility === "desktop" || col.visibility === undefined || (col.priority && col.priority <= 3))
      );

      return [...alwaysColumns, ...otherColumns];
   };

   const getHiddenColumns = () => {
      const visibleColumns = getVisibleColumns("compact");
      return columns.filter((col) => !visibleColumns.includes(col));
   };

   const shouldShowExpansion = () => {
      return getHiddenColumns().length > 0;
   };

   const getDefaultTitle = (row: T): React.ReactNode => {
      if (cardTitleField && row[cardTitleField]) {
         return String(row[cardTitleField]);
      }

      const titleField = columns.find(
         (col) => col.priority === 1 || col.headerName.toLowerCase().includes("nombre") || col.headerName.toLowerCase().includes("titulo")
      );
      return titleField ? String(row[titleField.field] || "Sin título") : "Item";
   };

   const getDefaultSubtitle = (row: T): React.ReactNode => {
      const subtitleField = columns.find(
         (col) => col.priority === 2 || col.headerName.toLowerCase().includes("descripcion") || col.headerName.toLowerCase().includes("subtitulo")
      );

      return subtitleField ? String(row[subtitleField.field] || "") : "";
   };

   // Obtener padding según densidad y tamaño de pantalla
   const getDensityPadding = () => {
      const densityMap = {
         xs: {
            compact: "p-2",
            comfortable: "p-3",
            spacious: "p-4"
         },
         sm: {
            compact: "p-2.5",
            comfortable: "p-3.5",
            spacious: "p-5"
         },
         md: {
            compact: "p-3",
            comfortable: "p-4",
            spacious: "p-6"
         }
      };

      return densityMap[screenSize][mobileDensity];
   };

   // Obtener tamaño de texto según densidad y pantalla
   const getDensityTextSize = () => {
      const sizeMap = {
         xs: {
            compact: { title: "text-sm", subtitle: "text-xs" },
            comfortable: { title: "text-base", subtitle: "text-sm" },
            spacious: { title: "text-lg", subtitle: "text-base" }
         },
         sm: {
            compact: { title: "text-sm", subtitle: "text-xs" },
            comfortable: { title: "text-base", subtitle: "text-sm" },
            spacious: { title: "text-lg", subtitle: "text-base" }
         },
         md: {
            compact: { title: "text-base", subtitle: "text-sm" },
            comfortable: { title: "text-lg", subtitle: "text-base" },
            spacious: { title: "text-xl", subtitle: "text-lg" }
         }
      };

      return sizeMap[screenSize][mobileDensity];
   };

   // VISTA DE TABLA EXPANDIBLE (Desktop)
   const renderTableView = () => {
      const visibleColumns = getVisibleColumns("compact");
      const hiddenColumns = getHiddenColumns();
      const showExpansion = shouldShowExpansion();

      return (
         <div className="overflow-x-auto">
            <table className="w-full min-w-max divide-y divide-gray-200 bg-white">
               <thead className="bg-gray-50">
                  <tr>
                     {showExpansion && <th className="w-12 px-2 py-3"></th>}

                     {visibleColumns.map((col) => (
                        <th
                           key={String(col.field)}
                           className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide select-none whitespace-nowrap"
                        >
                           <div className="flex flex-col space-y-1">
                              <span
                                 className="flex items-center gap-1 cursor-pointer hover:text-gray-800 transition-colors whitespace-nowrap"
                                 onClick={() => handleSort(col.field)}
                              >
                                 {col.headerName}
                                 {sortConfig.field === col.field &&
                                    (sortConfig.direction === "asc" ? <FiChevronUp className="flex-shrink-0" /> : <FiChevronDown className="flex-shrink-0" />)}
                              </span>

                              <div className="flex items-center gap-1">
                                 <FiSearch className="text-gray-400 text-xs flex-shrink-0" />
                                 <input
                                    type="text"
                                    placeholder="Filtrar..."
                                    value={columnFilters[String(col.field)] || ""}
                                    onChange={(e) => handleColumnFilterChange(String(col.field), e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-300 w-full min-w-[100px] max-w-[140px]"
                                 />
                                 {columnFilters[String(col.field)] && (
                                    <FiX
                                       className="text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0"
                                       onClick={() => clearColumnFilter(String(col.field))}
                                    />
                                 )}
                              </div>
                           </div>
                        </th>
                     ))}
                     {actions && <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Acciones</th>}
                  </tr>
               </thead>

               <tbody className={`divide-y divide-gray-100 ${striped ? "[&>tr:nth-child(even)]:bg-gray-50" : ""}`}>
                  {currentRows.map((row, idx) => {
                     const isExpanded = expandedRows.has(idx);
                     return (
                        <React.Fragment key={idx}>
                           <tr
                              className={`
                                transition-all duration-200
                                ${selectedRows.has(idx) ? "bg-cyan-50 border-l-4 border-l-cyan-500" : ""}
                                ${hoverable ? "hover:bg-gray-50" : ""}
                                ${isExpanded ? "bg-blue-50" : ""}
                                ${showExpansion ? "cursor-pointer" : ""}
                             `}
                              onClick={() => showExpansion && toggleRowExpansion(idx)}
                           >
                              {showExpansion && (
                                 <td className="px-2 py-3">
                                    <motion.div
                                       animate={{ rotate: isExpanded ? 180 : 0 }}
                                       transition={{ duration: 0.2 }}
                                       className="text-gray-400 hover:text-gray-600"
                                    >
                                       <FiChevronDown />
                                    </motion.div>
                                 </td>
                              )}

                              {visibleColumns.map((col) => (
                                 <td key={String(col.field)} className="px-3 py-3 text-sm text-gray-800 whitespace-nowrap" title={String(row[col.field] ?? "")}>
                                    <div className="max-w-[200px]">{col.renderField ? col.renderField(row[col.field]) : highlight(String(row[col.field] ?? ""))}</div>
                                 </td>
                              ))}

                              {actions && (
                                 <td className="px-3 py-3 text-sm whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex flex-wrap gap-1">{actions(row)}</div>
                                 </td>
                              )}
                           </tr>

                           {isExpanded && showExpansion && (
                              <motion.tr
                                 initial={{ opacity: 0, height: 0 }}
                                 animate={{ opacity: 1, height: "auto" }}
                                 exit={{ opacity: 0, height: 0 }}
                                 className="bg-blue-50 border-b border-blue-100"
                              >
                                 <td colSpan={visibleColumns.length + (showExpansion ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-4">
                                    <div className="mb-2 text-sm font-semibold text-gray-700">Información adicional:</div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                       {hiddenColumns.map((col) => (
                                          <div key={String(col.field)} className="space-y-1">
                                             <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{col.headerName}</div>
                                             <div className="text-sm text-gray-900 break-words">
                                                {col.renderField ? col.renderField(row[col.field]) : String(row[col.field] ?? "-")}
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </td>
                              </motion.tr>
                           )}
                        </React.Fragment>
                     );
                  })}
               </tbody>
            </table>
         </div>
      );
   };

   // VISTA DE TARJETAS (Desktop)
   const renderCardsView = () => {
      const visibleColumns = getVisibleColumns("compact");
      const hiddenColumns = getHiddenColumns();
      const showExpansion = shouldShowExpansion();

      return (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {currentRows.map((row, idx) => (
               <motion.div
                  key={idx}
                  className="bg-white rounded-lg border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
               >
                  <div className="p-4">
                     <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                           <h3 className="text-lg font-semibold text-gray-900 truncate">{getDefaultTitle(row)}</h3>
                           {getDefaultSubtitle(row) && <p className="text-sm text-gray-600 mt-1">{getDefaultSubtitle(row)}</p>}
                        </div>

                        {actions && (
                           <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                              {actions(row)}
                           </div>
                        )}
                     </div>

                     <div className="space-y-2 mb-3">
                        {visibleColumns
                           .filter((col) => col.visibility === "always" || !col.visibility)
                           .slice(0, 4)
                           .map((col) => (
                              <div key={String(col.field)} className="flex justify-between">
                                 <span className="text-sm text-gray-500">{col.headerName}:</span>
                                 <span className="text-sm text-gray-900 font-medium text-right max-w-[150px] truncate">
                                    {col.renderField ? col.renderField(row[col.field]) : String(row[col.field] ?? "-")}
                                 </span>
                              </div>
                           ))}
                     </div>

                     {showExpansion && (
                        <button
                           onClick={() => toggleRowExpansion(idx)}
                           className="w-full py-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                           <FiEye size={14} />
                           {expandedRows.has(idx) ? "Ver menos" : `Ver ${hiddenColumns.length} campos más`}
                        </button>
                     )}

                     {expandedRows.has(idx) && showExpansion && (
                        <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: "auto" }}
                           exit={{ opacity: 0, height: 0 }}
                           className="mt-3 pt-3 border-t border-gray-200"
                        >
                           <div className="mb-2 text-sm font-semibold text-gray-700">Información adicional:</div>
                           <div className="grid grid-cols-2 gap-2 text-sm">
                              {hiddenColumns.map((col) => (
                                 <div key={String(col.field)} className="space-y-1">
                                    <div className="text-xs font-semibold text-gray-500 uppercase">{col.headerName}</div>
                                    <div className="text-gray-900 break-words">
                                       {col.renderField ? col.renderField(row[col.field]) : String(row[col.field] ?? "-")}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </motion.div>
                     )}
                  </div>
               </motion.div>
            ))}
         </div>
      );
   };

   // VISTA MÓVIL - Lista Normal (PROFESIONAL CON LÍNEA DE ACENTO)
   const renderMobileListView = (hasPermission: any) => {
      const padding = getDensityPadding();
      const textSize = getDensityTextSize();

      return (
         <motion.div
            className={`space-y-3 ${screenSize === "xs" ? "p-2" : "p-3"} bg-gray-50 min-h-fit`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
         >
            <AnimatePresence mode="popLayout">
               {currentRows.map((row, idx) => {
                  const isBeingSwiped = swipeData.index === idx;
                  const swipeProgress = Math.min(Math.abs(swipeData.offset) / 80, 1);

                  const leftAction = mobileConfig?.swipeActions?.left?.[0];
                  const rightAction = mobileConfig?.swipeActions?.right?.[0];

                  let actionColor = null;
                  let actionIcon = null;

                  const isSwipingRight = swipeData.offset > 0;
                  const isSwipingLeft = swipeData.offset < 0;

                  const currentAction = isSwipingRight ? leftAction : isSwipingLeft ? rightAction : null;

                  if (currentAction) {
                     const passed = currentAction.hasPermission;

                     if (passed !== undefined) {
                        actionColor = currentAction.color;
                        actionIcon = currentAction.icon;
                        const allowed = Array.isArray(passed) ? passed.some((p) => hasPermission(p)) : hasPermission(passed);

                        if (!allowed) {
                           return null;
                        }
                     } else {
                        if (swipeData.offset > 40 && leftAction) {
                           actionColor = leftAction.color;
                           actionIcon = leftAction.icon;
                        } else if (swipeData.offset < -40 && rightAction) {
                           actionColor = rightAction.color;
                           actionIcon = rightAction.icon;
                        }
                     }
                  }

                  return (
                     <motion.div
                        key={idx}
                        className="relative"
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, x: -100 }}
                        transition={{
                           type: "spring",
                           damping: 25,
                           stiffness: 300,
                           delay: idx * 0.05
                        }}
                     >
                        {actionColor && (
                           <motion.div
                              className={`absolute inset-0 rounded-xl ${actionColor} flex items-center ${
                                 swipeData.offset > 0 ? "justify-start pl-6" : "justify-end pr-6"
                              }`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: swipeProgress * 0.9, scale: 1 }}
                              transition={{ type: "spring", damping: 35, stiffness: 500 }}
                           >
                              <motion.div
                                 initial={{ scale: 0 }}
                                 animate={{ scale: swipeProgress * 1.2 }}
                                 transition={{ type: "spring", damping: 20, stiffness: 400 }}
                                 className="text-white text-2xl"
                              >
                                 {actionIcon}
                              </motion.div>
                           </motion.div>
                        )}

                        <motion.div
                           className="relative bg-white rounded-xl overflow-hidden border border-gray-200"
                           drag="x"
                           dragConstraints={{ left: 0, right: 0 }}
                           dragElastic={0.15}
                           onDragStart={() => handleSwipeStart(idx)}
                           onDrag={(_, info) => handleSwipeMove(info.offset.x, idx)}
                           onDragEnd={() => handleSwipeEnd(row, idx, hasPermission)}
                           style={{
                              x: isBeingSwiped ? swipeData.offset : 0,
                              boxShadow: isBeingSwiped ? `0 10px 15px -3px rgba(0, 0, 0, 0.1)` : `0 1px 3px 0 rgba(0, 0, 0, 0.1)`
                           }}
                           whileHover={{
                              y: -2,
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              transition: { duration: 0.2 }
                           }}
                           whileTap={{ scale: 0.98 }}
                        >
                           {/* Línea de acento sutil */}
                           <div className="h-0.5 bg-[#9B2242]" />

                           <div className={`${padding} active:bg-gray-50 transition-colors duration-150`} onClick={(e) => handleTileTap(row, e)}>
                              <div className="flex items-center space-x-4">
                                 {mobileConfig?.listTile?.leading && <div className="flex-shrink-0">{mobileConfig.listTile.leading(row)}</div>}

                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                       <div className={`${textSize.title} font-semibold text-gray-900 truncate`}>
                                          {mobileConfig?.listTile?.title ? mobileConfig.listTile.title(row) : getDefaultTitle(row)}
                                       </div>
                                       {mobileConfig?.listTile?.trailing && <div className="flex-shrink-0 ml-3">{mobileConfig.listTile.trailing(row)}</div>}
                                    </div>

                                    {mobileConfig?.listTile?.subtitle && (
                                       <div className={`${textSize.subtitle} text-gray-600 truncate`}>{mobileConfig.listTile.subtitle(row)}</div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </motion.div>
      );
   };

   // VISTA MÓVIL - Lista Compacta (MINIMALISTA)
   const renderMobileCompactListView = (hasPermission: any) => {
      return (
         <motion.div className={`${screenSize === "xs" ? "p-2" : "p-3"} bg-gray-50`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-0.5 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
               <AnimatePresence>
                  {currentRows.map((row, idx) => (
                     <motion.div
                        key={idx}
                        className="border-b border-gray-100 last:border-b-0"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, type: "spring", stiffness: 400 }}
                        whileTap={{ backgroundColor: "#f3f4f6", scale: 0.99 }}
                     >
                        <div className="px-4 py-2.5 hover:bg-gray-50 transition-colors" onClick={(e) => handleTileTap(row, e)}>
                           <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 {mobileConfig?.listTile?.leading && <div className="flex-shrink-0 opacity-80">{mobileConfig.listTile.leading(row)}</div>}
                                 <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                       {mobileConfig?.listTile?.title ? mobileConfig.listTile.title(row) : getDefaultTitle(row)}
                                    </div>
                                 </div>
                              </div>
                              {mobileConfig?.listTile?.trailing && <div className="flex-shrink-0 opacity-80">{mobileConfig.listTile.trailing(row)}</div>}
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </motion.div>
      );
   };

   // VISTA MÓVIL - Tarjetas Elevadas (PROFESIONAL)
   const renderMobileCardsView = () => {
      const padding = getDensityPadding();
      const textSize = getDensityTextSize();
      const gridCols = screenSize === "xs" ? "grid-cols-1" : "grid-cols-2";

      return (
         <motion.div className={`grid ${gridCols} gap-4 ${screenSize === "xs" ? "p-2" : "p-4"} bg-gray-50`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {currentRows.map((row, idx) => (
               <motion.div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200"
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                     delay: idx * 0.06,
                     type: "spring",
                     damping: 25,
                     stiffness: 300
                  }}
                  whileHover={{
                     y: -6,
                     scale: 1.02,
                     boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                     transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleTileTap(row, e)}
               >
                  <div className="h-1 bg-[#9B2242]" />

                  <div className={padding}>
                     {mobileConfig?.listTile?.leading && (
                        <div className="flex justify-center mb-4 pt-2">
                           <div className="bg-gray-100 rounded-xl p-3">{mobileConfig.listTile.leading(row)}</div>
                        </div>
                     )}

                     <div className={`${textSize.title} font-semibold text-gray-900 text-center mb-2 line-clamp-2`}>
                        {mobileConfig?.listTile?.title ? mobileConfig.listTile.title(row) : getDefaultTitle(row)}
                     </div>

                     {mobileConfig?.listTile?.subtitle && (
                        <div className={`${textSize.subtitle} text-gray-600 text-center line-clamp-2 mb-3`}>{mobileConfig.listTile.subtitle(row)}</div>
                     )}

                     {mobileConfig?.listTile?.trailing && (
                        <div className="flex justify-center pt-3 border-t border-gray-100">{mobileConfig.listTile.trailing(row)}</div>
                     )}
                  </div>
               </motion.div>
            ))}
         </motion.div>
      );
   };

   // VISTA MÓVIL - Cuadrícula Compacta
   const renderMobileMiniCardsView = () => {
      const gridCols = screenSize === "xs" ? "grid-cols-2" : "grid-cols-3";

      return (
         <motion.div className={`grid ${gridCols} gap-3 ${screenSize === "xs" ? "p-2" : "p-3"} bg-gray-50`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {currentRows.map((row, idx) => (
               <motion.div
                  key={idx}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                     delay: idx * 0.04,
                     type: "spring",
                     damping: 20,
                     stiffness: 400
                  }}
                  whileHover={{
                     scale: 1.05,
                     boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                     transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleTileTap(row, e)}
               >
                  <div className="h-0.5 bg-[#9B2242]" />
                  <div className="p-3">
                     {mobileConfig?.listTile?.leading && (
                        <div className="flex justify-center mb-2 bg-gray-50 rounded-lg p-2">{mobileConfig.listTile.leading(row)}</div>
                     )}

                     <div className="text-xs font-semibold text-gray-900 text-center line-clamp-2 min-h-[2rem]">
                        {mobileConfig?.listTile?.title ? mobileConfig.listTile.title(row) : getDefaultTitle(row)}
                     </div>

                     {mobileConfig?.listTile?.trailing && (
                        <div className="flex justify-center mt-2 pt-2 border-t border-gray-100">{mobileConfig.listTile.trailing(row)}</div>
                     )}
                  </div>
               </motion.div>
            ))}
         </motion.div>
      );
   };

   // VISTA MÓVIL - Timeline Vertical
   const renderMobileTimelineView = () => {
      const textSize = getDensityTextSize();

      return (
         <motion.div className={`${screenSize === "xs" ? "p-2" : "p-4"} bg-gray-50`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative">
               {/* Línea vertical */}
               <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />

               <div className="space-y-6">
                  {currentRows.map((row, idx) => (
                     <motion.div
                        key={idx}
                        className="relative pl-12"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08, type: "spring", stiffness: 300 }}
                        onClick={(e) => handleTileTap(row, e)}
                     >
                        {/* Punto en timeline */}
                        <div className="absolute left-4 top-2 w-5 h-5 bg-[#9B2242] rounded-full border-4 border-gray-50 shadow-sm z-10" />

                        <motion.div
                           className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                           whileHover={{
                              x: 5,
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              transition: { duration: 0.2 }
                           }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <div className="flex items-start gap-3">
                              {mobileConfig?.listTile?.leading && <div className="flex-shrink-0 mt-1">{mobileConfig.listTile.leading(row)}</div>}

                              <div className="flex-1 min-w-0">
                                 <div className={`${textSize.title} font-semibold text-gray-900 mb-1`}>
                                    {mobileConfig?.listTile?.title ? mobileConfig.listTile.title(row) : getDefaultTitle(row)}
                                 </div>

                                 {mobileConfig?.listTile?.subtitle && (
                                    <div className={`${textSize.subtitle} text-gray-600 line-clamp-2`}>{mobileConfig.listTile.subtitle(row)}</div>
                                 )}

                                 {mobileConfig?.listTile?.trailing && <div className="mt-2 pt-2 border-t border-gray-100">{mobileConfig.listTile.trailing(row)}</div>}
                              </div>
                           </div>
                        </motion.div>
                     </motion.div>
                  ))}
               </div>
            </div>
         </motion.div>
      );
   };

   // VISTA MÓVIL - Lista con Detalles Expandibles
   // VISTA MÓVIL - Lista con Detalles Expandibles (MEJORADA)
   const renderMobileDetailedListView = () => {
      const textSize = getDensityTextSize();

      return (
         <motion.div
            className={`space-y-4 ${screenSize === "xs" ? "p-3" : "p-4"} bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
         >
            <div className="mb-6">
               <h2 className="text-2xl font-bold text-gray-800 mb-1">Detalles</h2>
               <p className="text-gray-600 text-sm">Toque cualquier elemento para ver información completa</p>
            </div>

            <AnimatePresence mode="wait">
               {currentRows.map((row, idx) => {
                  const isExpanded = activeDetails === idx;

                  return (
                     <motion.div
                        key={idx}
                        className="relative"
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{
                           delay: idx * 0.05,
                           type: "spring",
                           stiffness: 300,
                           damping: 25
                        }}
                     >
                        {/* Tarjeta principal */}
                        <motion.div
                           className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200"
                           layout
                           whileHover={{
                              scale: 1.02,
                              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                           }}
                           whileTap={{ scale: 0.98 }}
                        >
                           {/* Header de la tarjeta con gradiente */}
                           <div
                              className="px-4 py-3 bg-[#9B2242] border border-[#651D32] text-white"
                              onClick={() => {
                                 if (isExpanded) {
                                    setActiveDetails(null);
                                 } else {
                                    setActiveDetails(idx);
                                 }
                              }}
                           >
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    {/* Ícono circular */}
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                       {mobileConfig?.listTile?.leading ? (
                                          <div className="text-white">{mobileConfig.listTile.leading(row)}</div>
                                       ) : (
                                          <span className="text-white font-bold text-lg">
                                             {String(mobileConfig?.listTile?.title ? mobileConfig.listTile.title(row) : getDefaultTitle(row)).charAt(0)}
                                          </span>
                                       )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                       <h3 className="text-lg font-bold text-white truncate">
                                          {mobileConfig?.listTile?.title ? mobileConfig.listTile.title(row) : getDefaultTitle(row)}
                                       </h3>
                                       {mobileConfig?.listTile?.subtitle && <p className="text-blue-100 text-sm truncate">{mobileConfig.listTile.subtitle(row)}</p>}
                                    </div>
                                 </div>

                                 <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-white">
                                    <FiChevronDown size={24} />
                                 </motion.div>
                              </div>
                           </div>

                           {/* Contenido expandible */}
                           <AnimatePresence>
                              {isExpanded && (
                                 <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                 >
                                    {/* Sección de información principal */}
                                    <div className="px-4 py-6 border-b border-gray-100">
                                       <div className="grid grid-cols-2 gap-4 mb-4">
                                          {/* Información destacada */}
                                          {columns.slice(0, 2).map((col) => (
                                             <div key={String(col.field)} className="bg-gray-50 rounded-xl p-3">
                                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">{col.headerName}</div>
                                                <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                   {col.renderField ? col.renderField(row[col.field]) : String(row[col.field] ?? "-")}
                                                </div>
                                             </div>
                                          ))}
                                       </div>

                                       {/* Subtítulo completo si existe */}
                                       {mobileConfig?.listTile?.subtitle && (
                                          <div className="bg-blue-50 rounded-xl p-4 mb-4">
                                             <div className="text-sm text-gray-700 leading-relaxed">{mobileConfig.listTile.subtitle(row)}</div>
                                          </div>
                                       )}
                                    </div>

                                    {/* Sección de detalles extendidos */}
                                    <div className="px-4 py-6">
                                       <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                          <FiGrid className="text-blue-500" />
                                          Información adicional
                                       </h4>

                                       <div className="grid grid-cols-1 gap-3">
                                          {columns.slice(2, 6).map((col) => (
                                             <div key={String(col.field)} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
                                                <span className="text-sm text-gray-600 font-medium flex-1">{col.headerName}</span>
                                                <span className="text-sm text-gray-900 font-medium text-right flex-1">
                                                   {col.renderField ? col.renderField(row[col.field]) : String(row[col.field] ?? "-")}
                                                </span>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* Acciones rápidas */}
                                    <div className="px-4 pb-6">
                                       <div className="flex gap-2">
                                          <button
                                             onClick={() => handleTileTap(row)}
                                             className="flex-1 bg-[#9B2242] border border-[#651D32] text-white  font-medium py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                          >
                                             <FiEye size={18} />
                                             Ver completo
                                          </button>

                                          {mobileConfig?.listTile?.trailing && (
                                             <div className="flex items-center justify-center">{mobileConfig.listTile.trailing(row)}</div>
                                          )}
                                       </div>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>

                           {/* Footer compacto cuando está contraído */}
                           {!isExpanded && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-3 border-t border-gray-100">
                                 <div className="flex items-center justify-between text-sm">
                                    {/* Preview de información */}
                                    <div className="flex items-center gap-4">
                                       {columns
                                          .slice(0, 2)
                                          .filter((col) => col?.field && col?.headerName && row[col.field] != null)
                                          .map((col, i) => {
                                             const cellValue = row[col.field];

                                             return (
                                                <div key={i} className="flex items-center gap-1">
                                                   <span className="text-gray-500">{col.headerName}:</span>
                                                   <span className="text-gray-900 font-medium truncate max-w-[80px]">
                                                      {col.renderField
                                                         ? col.renderField(cellValue)
                                                         : String(cellValue).substring(0, 15) + (String(cellValue).length > 15 ? "..." : "")}
                                                   </span>
                                                </div>
                                             );
                                          })}
                                    </div>

                                    <button onClick={() => handleTileTap(row)} className=" font-bold">
                                       Ver →
                                    </button>
                                 </div>
                              </motion.div>
                           )}
                        </motion.div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </motion.div>
      );
   };

   // Panel de configuración móvil
   const renderMobileSettings = () => {
      if (!showMobileSettings) return null;

      return (
         <AnimatePresence>
            <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <motion.div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setShowMobileSettings(false)} />

               <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
               >
                  <div className="p-4">
                     <div className="flex justify-center mb-4">
                        <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
                     </div>

                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Vista</h3>

                     {/* Vista */}
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Vista</label>
                        <div className="grid grid-cols-2 gap-2">
                           {[
                              { value: "list" as MobileViewMode, label: "Lista", icon: <FiList /> },
                              { value: "compact-list" as MobileViewMode, label: "Compacta", icon: <FiList /> },
                              { value: "cards" as MobileViewMode, label: "Tarjetas", icon: <FiGrid /> },
                              { value: "mini-cards" as MobileViewMode, label: "Cuadrícula", icon: <FiGrid /> },
                              { value: "timeline" as MobileViewMode, label: "Timeline", icon: <FiList /> },
                              { value: "detailed-list" as MobileViewMode, label: "Detalles", icon: <FiEye /> }
                           ].map((view) => (
                              <button
                                 key={view.value}
                                 onClick={() => setMobileViewMode(view.value)}
                                 className={`p-3 rounded-lg border-2 transition-all ${
                                    mobileViewMode === view.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"
                                 }`}
                              >
                                 <div className="flex flex-col items-center gap-1">
                                    {view.icon}
                                    <span className="text-xs font-medium">{view.label}</span>
                                 </div>
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Densidad */}
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Densidad</label>
                        <div className="grid grid-cols-3 gap-2">
                           {[
                              { value: "compact" as MobileDensity, label: "Compacta" },
                              { value: "comfortable" as MobileDensity, label: "Cómoda" },
                              { value: "spacious" as MobileDensity, label: "Amplia" }
                           ].map((density) => (
                              <button
                                 key={density.value}
                                 onClick={() => setMobileDensity(density.value)}
                                 className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                                    mobileDensity === density.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"
                                 }`}
                              >
                                 {density.label}
                              </button>
                           ))}
                        </div>
                     </div>

                     <button
                        onClick={() => setShowMobileSettings(false)}
                        className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                     >
                        Aplicar
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         </AnimatePresence>
      );
   };

   // Bottom Sheet
   const renderBottomSheet = () => {
      if (!showBottomSheet || !selectedRowForSheet || !mobileConfig?.bottomSheet) return null;

      return (
         <AnimatePresence>
            <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <motion.div
                  className="absolute inset-0 bg-black bg-opacity-40"
                  onClick={closeBottomSheet}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
               />

               <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl overflow-hidden border border-gray-100"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                  style={{ height: "100vh", maxHeight: "100vh" }}
               >
                  <div className="flex justify-center pt-3 pb-2">
                     <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
                  </div>

                  {(mobileConfig.bottomSheet.showCloseButton ?? true) && (
                     <motion.button
                        className="absolute top-2 right-3 z-10 w-8 h-8 hover:cursor-pointer text-red-400 hover:text-red-600 rounded-full flex items-center justify-center transition-colors shadow-md border bg-white"
                        onClick={closeBottomSheet}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                     >
                        <FiX className="text-red-500 text-lg" />
                     </motion.button>
                  )}

                  <div className="overflow-y-auto smooth-scroll px-3 pb-6" style={{ height: "calc(100vh - 70px)" }}>
                     {mobileConfig.bottomSheet.builder(selectedRowForSheet, closeBottomSheet)}
                  </div>
               </motion.div>
            </motion.div>
         </AnimatePresence>
      );
   };

   const renderLoading = () => (
      <div className="text-center py-12">
         <motion.div className="flex justify-center items-center gap-3 text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
               className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full"
               animate={{ rotate: 360 }}
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Cargando datos...
         </motion.div>
      </div>
   );

   const renderError = () => (
      <motion.div className="text-center py-8 text-red-500" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
         <div className="flex justify-center items-center gap-2">
            <FiAlertCircle className="text-xl" />
            {error}
         </div>
      </motion.div>
   );

   const renderEmpty = () => (
      <motion.div className="text-center py-12 text-gray-500" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
         <div className="flex flex-col justify-center items-center gap-3">
            <FiInbox className="text-4xl text-gray-300" />
            <span className="text-lg">No se encontraron resultados</span>
            {(globalFilter || Object.values(columnFilters).some(Boolean)) && (
               <button
                  onClick={clearAllFilters}
                  className="text-cyan-600 hover:text-cyan-700 font-medium mt-2 px-4 py-2 rounded-lg border border-cyan-200 hover:bg-cyan-50 transition-colors"
               >
                  Limpiar filtros
               </button>
            )}
         </div>
      </motion.div>
   );

   return (
      <div className="w-full bg-white rounded-lg">
         {/* Header MÓVIL */}
         {isMobile ? (
            <motion.div className="flex flex-col gap-3 p-3 bg-white border-b border-gray-200" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
               {/* Primera fila: Buscador + Botón de filtros */}
               <div className="flex gap-2">
                  {/* Buscador (ocupa más espacio) */}
                  <div className="flex-1 flex bg-gray-100 items-center rounded-2xl px-4 py-3 shadow-inner">
                     <FiSearch className="text-gray-500 mr-3 flex-shrink-0 text-lg" />
                     <input
                        type="text"
                        placeholder="Buscar..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full min-w-0 outline-none text-base bg-transparent placeholder-gray-500 font-medium"
                     />
                     {renderFilterModal()}

                     {globalFilter && (
                        <motion.button onClick={() => setGlobalFilter("")} className="text-gray-500 hover:text-gray-700 flex-shrink-0 ml-2" whileTap={{ scale: 0.9 }}>
                           <FiX className="text-lg" />
                        </motion.button>
                     )}
                  </div>

                  {/* Botón de filtros (solo si están habilitados) */}
                  {mobileConfig?.quickFilters?.enabled && (
                     <motion.button
                        onClick={() => setShowFilterModal(true)}
                        className="relative w-12 h-12 bg-[#9B2242] rounded-2xl flex items-center justify-center hover:bg-[#7A1B35] transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                     >
                        <FiFilter className="text-white text-xl" />

                        {/* Indicador de filtros activos */}
                        {Object.keys(activeFilters).length > 0 && (
                           <span className="absolute -top-1 -right-1 bg-white text-[#9B2242] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                              {Object.keys(activeFilters).length}
                           </span>
                        )}
                     </motion.button>
                  )}
               </div>

               {/* Chips de filtros activos */}
               {renderActiveFiltersChips()}

               {/* Segunda fila: Botones de acción */}
               {mobileConfig.activeViews && (
                  <>
                     <div className="flex gap-2">
                        <button
                           onClick={() => setShowMobileSettings(true)}
                           className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex-1"
                        >
                           <FiSettings size={16} />
                           <span className="text-sm font-medium">Vista</span>
                        </button>

                        {conditionExcel ? (
                           <PermissionRoute requiredPermission={conditionExcel}>
                              <button
                                 onClick={exportToExcel}
                                 className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                              >
                                 <RiFileExcelFill size={18} />
                              </button>
                           </PermissionRoute>
                        ) : (
                           <button
                              onClick={exportToExcel}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                           >
                              <RiFileExcelFill size={18} />
                           </button>
                        )}
                     </div>
                  </>
               )}
            </motion.div>
         ) : (
            // HEADER DESKTOP
            <div className="flex flex-col gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
               {headerActions && <div className="flex flex-wrap gap-2 w-full">{headerActions()}</div>}

               <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="flex bg-white items-center flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-cyan-400 transition-all">
                     <FiSearch className="text-gray-400 mr-2 flex-shrink-0" />
                     <input
                        type="text"
                        placeholder="Buscador general..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full min-w-0 outline-none text-sm bg-transparent"
                     />
                     {globalFilter && <FiX className="text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0" onClick={() => setGlobalFilter("")} />}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                     {enableViewToggle && !isMobile && (
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                           <button
                              onClick={() => setViewMode("table")}
                              className={`px-3 py-2 transition-colors ${viewMode === "table" ? "bg-cyan-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                           >
                              <FiList size={16} />
                           </button>
                           <button
                              onClick={() => setViewMode("cards")}
                              className={`px-3 py-2 transition-colors ${viewMode === "cards" ? "bg-cyan-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                           >
                              <FiGrid size={16} />
                           </button>
                        </div>
                     )}

                     {conditionExcel ? (
                        <PermissionRoute requiredPermission={conditionExcel}>
                           <button
                              onClick={exportToExcel}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium whitespace-nowrap"
                           >
                              <RiFileExcelFill className="text-lg" />
                              <span className="hidden sm:inline">Exportar</span>
                           </button>
                        </PermissionRoute>
                     ) : (
                        <button
                           onClick={exportToExcel}
                           className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium whitespace-nowrap"
                        >
                           <RiFileExcelFill className="text-lg" />
                           <span className="hidden sm:inline">Exportar</span>
                        </button>
                     )}

                     {(globalFilter || Object.values(columnFilters).some(Boolean)) && (
                        <button
                           onClick={clearAllFilters}
                           className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium whitespace-nowrap"
                        >
                           <FiX className="text-lg" />
                           <span className="hidden sm:inline">Limpiar</span>
                        </button>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* Vista principal */}
         <div className="border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
               renderLoading()
            ) : error ? (
               renderError()
            ) : currentRows.length === 0 ? (
               renderEmpty()
            ) : isMobile ? (
               <div className="overflow-y-auto">
                  {mobileViewMode === "list" && renderMobileListView(hasPermission)}
                  {mobileViewMode === "compact-list" && renderMobileCompactListView(hasPermission)}
                  {mobileViewMode === "cards" && renderMobileCardsView()}
                  {mobileViewMode === "mini-cards" && renderMobileMiniCardsView()}
                  {mobileViewMode === "timeline" && renderMobileTimelineView()}
                  {mobileViewMode === "detailed-list" && renderMobileDetailedListView()}
                  {renderBottomSheet()}
                  {renderMobileSettings()}
               </div>
            ) : viewMode === "cards" ? (
               <div className="overflow-auto max-h-[75vh]">{renderCardsView()}</div>
            ) : (
               <div className="overflow-auto max-h-[75vh]">{renderTableView()}</div>
            )}
         </div>

         {/* PAGINACIÓN */}
         {currentRows.length > 0 && (
            <div className={`${isMobile ? "px-3 py-4 bg-white border-t border-gray-200 mt-2" : "px-4 py-3 bg-gray-50 border-t border-gray-200 mt-2 rounded-b-lg"}`}>
               {isMobile ? (
                  <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                     <div className="text-center text-gray-600 text-sm font-medium">
                        {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedData.length)} de {sortedData.length}
                     </div>

                     <div className="flex items-center justify-between gap-3">
                        <motion.button
                           onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                           disabled={currentPage === 1}
                           className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                              currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-blue-500 text-white shadow-lg"
                           }`}
                           whileTap={{ scale: 0.95 }}
                        >
                           <MdOutlineKeyboardArrowLeft className="text-lg" />
                           {screenSize !== "xs" && "Anterior"}
                        </motion.button>

                        <div className="flex items-center gap-2">
                           <span className="text-xs text-gray-600">Pág.</span>
                           <motion.span
                              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-bold"
                              key={currentPage}
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                           >
                              {currentPage}
                           </motion.span>
                           <span className="text-xs text-gray-600">de {totalPages}</span>
                        </div>

                        <motion.button
                           onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                           disabled={currentPage === totalPages}
                           className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                              currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-blue-500 text-white shadow-lg"
                           }`}
                           whileTap={{ scale: 0.95 }}
                        >
                           {screenSize !== "xs" && "Siguiente"}
                           <MdOutlineKeyboardArrowRight className="text-lg" />
                        </motion.button>
                     </div>

                     <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-600">Mostrar:</span>
                        <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                           {paginate.map((num) => (
                              <option key={num} value={num}>
                                 {num}
                              </option>
                           ))}
                        </select>
                     </div>
                  </motion.div>
               ) : (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                     <div className="text-gray-600 text-sm text-center sm:text-left order-2 sm:order-1">
                        Mostrando {startIndex + 1} - {Math.min(startIndex + rowsPerPage, sortedData.length)} de {sortedData.length}
                     </div>

                     <div className="flex items-center gap-2 order-1 sm:order-2">
                        <label className="text-gray-600 text-sm whitespace-nowrap">Filas:</label>
                        <select
                           value={rowsPerPage}
                           onChange={handleRowsPerPageChange}
                           className="border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer bg-white min-w-[60px]"
                        >
                           {paginate.map((num) => (
                              <option key={num} value={num}>
                                 {num}
                              </option>
                           ))}
                        </select>
                     </div>

                     <div className="flex items-center gap-1 order-3 flex-wrap justify-center">
                        <button
                           onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                           disabled={currentPage === 1}
                           className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <MdOutlineKeyboardArrowLeft />
                        </button>

                        <div className="flex gap-1 flex-wrap justify-center">
                           {getVisiblePages().map((p, i) =>
                              p === "..." ? (
                                 <span key={i} className="px-2 py-1 text-gray-400 text-sm">
                                    ...
                                 </span>
                              ) : (
                                 <button
                                    key={i}
                                    onClick={() => setCurrentPage(p as number)}
                                    className={`px-3 py-1 rounded border text-sm transition min-w-[36px] ${
                                       currentPage === p ? "bg-cyan-500 text-white border-cyan-500" : "border-gray-300 hover:bg-gray-100"
                                    }`}
                                 >
                                    {p}
                                 </button>
                              )
                           )}
                        </div>

                        <button
                           onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                           disabled={currentPage === totalPages}
                           className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <MdOutlineKeyboardArrowRight />
                        </button>
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default CustomTable;
