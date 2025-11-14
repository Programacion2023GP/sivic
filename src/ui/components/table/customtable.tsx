import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiChevronUp, FiChevronDown, FiX, FiAlertCircle, FiInbox, FiMoreVertical, FiTrash2, FiEdit } from "react-icons/fi";
import { RiFileExcelFill } from "react-icons/ri";
import { MdOutlineKeyboardArrowRight, MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { PermissionRoute } from "../../../App";

interface Column<T extends object> {
   field: keyof T;
   headerName: string;
   renderField?: <K extends keyof T>(value: T[K]) => React.ReactNode;
   getFilterValue?: <K extends keyof T>(value: T[K]) => string;
   priority?: number;
}

// Configuración estilo Flutter mejorada
interface MobileConfig<T extends object> {
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
      }[];
      right?: {
         icon: React.ReactNode;
         color: string;
         action: (row: T) => void;
         label?: string;
      }[];
   };
   bottomSheet?: {
      builder: (row: T, onClose: () => void) => React.ReactNode;
      height?: number;
      showCloseButton?: boolean;
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
}

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
   mobileConfig
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
   const [swipeOffset, setSwipeOffset] = useState<number>(0);
   const [swipingIndex, setSwipingIndex] = useState<number | null>(null);

   // Detectar viewport
   useEffect(() => {
      const checkViewport = () => {
         const width = window.innerWidth;
         setIsMobile(width < 1024);
      };

      checkViewport();
      window.addEventListener("resize", checkViewport);
      return () => window.removeEventListener("resize", checkViewport);
   }, []);

   useEffect(() => {
      setCurrentPage(1);
      setSelectedRows(new Set());
   }, [data]);

   // Filtrado y ordenamiento
   const safeData = Array.isArray(data) ? data : [];

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

   // Handlers para móvil mejorados
   const handleTileTap = (row: T) => {
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

   const handleSwipeAction = (action: (row: T) => void, row: T) => {
      action(row);
      setSwipeOffset(0);
      setSwipingIndex(null);
   };

   const handleSwipeStart = (idx: number) => {
      setSwipingIndex(idx);
   };

   const handleSwipeMove = (deltaX: number) => {
      if (swipingIndex !== null) {
         setSwipeOffset(deltaX);
      }
   };

   const handleSwipeEnd = (row: T, idx: number) => {
      if (swipingIndex === idx) {
         const threshold = 80;
         const hasLeftActions = mobileConfig?.swipeActions?.left && mobileConfig.swipeActions.left.length > 0;
         const hasRightActions = mobileConfig?.swipeActions?.right && mobileConfig.swipeActions.right.length > 0;

         if (swipeOffset > threshold && hasLeftActions) {
            // Swipe right to left - trigger first left action
            handleSwipeAction(mobileConfig.swipeActions.left[0].action, row);
         } else if (swipeOffset < -threshold && hasRightActions) {
            // Swipe left to right - trigger first right action
            handleSwipeAction(mobileConfig.swipeActions.right[0].action, row);
         } else {
            // Reset if not enough swipe
            setSwipeOffset(0);
         }
         setSwipingIndex(null);
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
                  obj[String(col.headerName)] = typeof renderedValue === "string" ? renderedValue : String(renderedValue ?? "");
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

   // VISTA DE TABLA (Desktop)
   const renderTableView = () => (
      <div className="overflow-x-auto">
         <table className="w-full min-w-max divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
               <tr>
                  {columns.map((col) => (
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
               {currentRows.map((row, idx) => (
                  <tr
                     key={idx}
                     className={`
                       transition-colors duration-150
                       ${selectedRows.has(idx) ? "bg-cyan-50 border-l-4 border-l-cyan-500" : ""}
                       ${hoverable ? "hover:bg-gray-50" : ""}
                    `}
                  >
                     {columns.map((col) => (
                        <td key={String(col.field)} className="px-3 py-3 text-sm text-gray-800 whitespace-nowrap">
                           {col.renderField ? col.renderField(row[col.field]) : highlight(String(row[col.field] ?? ""))}
                        </td>
                     ))}
                     {actions && (
                        <td className="px-3 py-3 text-sm whitespace-nowrap">
                           <div className="flex flex-wrap gap-1">{actions(row)}</div>
                        </td>
                     )}
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );

   // VISTA MÓVIL - Mejorada sin acciones visibles y swipe animado
   const renderMobileListView = () => (
      <motion.div className="space-y-2 p-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
         {currentRows.map((row, idx) => {
            const isSwiping = swipingIndex === idx;
            const hasSwipeActions = mobileConfig?.swipeActions && (mobileConfig.swipeActions.left?.length || mobileConfig.swipeActions.right?.length);

            // Calcular opacidad y escala basado en el swipe
            const swipeProgress = Math.min(Math.abs(swipeOffset) / 100, 1);
            const itemScale = 1 - swipeProgress * 0.1;
            const actionOpacity = swipeProgress;

            return (
               <motion.div
                  key={idx}
                  className="relative overflow-hidden rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
               >
                  {/* Swipe Actions - Solo visibles durante swipe */}
                  {hasSwipeActions && (
                     <>
                        {/* Left Actions */}
                        {mobileConfig!.swipeActions.left && swipeOffset > 0 && (
                           <motion.div
                              className="absolute left-0 top-0 h-full flex items-center justify-end pr-4"
                              style={{
                                 opacity: actionOpacity,
                                 width: `${Math.min(swipeOffset, 120)}px`
                              }}
                           >
                              {mobileConfig!.swipeActions.left.map((action, actionIdx) => (
                                 <motion.button
                                    key={actionIdx}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color} text-white shadow-lg`}
                                    style={{ scale: actionOpacity }}
                                    onClick={() => handleSwipeAction(action.action, row)}
                                 >
                                    {action.icon}
                                 </motion.button>
                              ))}
                           </motion.div>
                        )}

                        {/* Right Actions */}
                        {mobileConfig!.swipeActions.right && swipeOffset < 0 && (
                           <motion.div
                              className="absolute right-0 top-0 h-full flex items-center justify-start pl-4"
                              style={{
                                 opacity: actionOpacity,
                                 width: `${Math.min(Math.abs(swipeOffset), 120)}px`
                              }}
                           >
                              {mobileConfig!.swipeActions.right.map((action, actionIdx) => (
                                 <motion.button
                                    key={actionIdx}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color} text-white shadow-lg`}
                                    style={{ scale: actionOpacity }}
                                    onClick={() => handleSwipeAction(action.action, row)}
                                 >
                                    {action.icon}
                                 </motion.button>
                              ))}
                           </motion.div>
                        )}
                     </>
                  )}

                  {/* ListTile Principal */}
                  <motion.div
                     className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                     style={{
                        x: isSwiping ? swipeOffset : 0,
                        scale: isSwiping ? itemScale : 1
                     }}
                     whileTap={{ scale: 0.98 }}
                     drag="x"
                     dragConstraints={{ left: 0, right: 0 }}
                     dragElastic={0.2}
                     onDragStart={() => handleSwipeStart(idx)}
                     onDrag={(_, info) => handleSwipeMove(info.offset.x)}
                     onDragEnd={() => handleSwipeEnd(row, idx)}
                  >
                     <div
                        className={`p-4 ${mobileConfig?.onTileTap || mobileConfig?.bottomSheet ? "cursor-pointer active:bg-gray-50" : ""}`}
                        onClick={() => handleTileTap(row)}
                     >
                        <div className="flex items-center space-x-3">
                           {/* Leading */}
                           {mobileConfig?.listTile?.leading && <div className="flex-shrink-0">{mobileConfig.listTile.leading(row)}</div>}

                           {/* Content - SOLO título y subtítulo */}
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                 <div className="text-base font-semibold text-gray-900 truncate">
                                    {mobileConfig?.listTile?.title ? mobileConfig.listTile.title(row) : getDefaultTitle(row)}
                                 </div>
                                 {mobileConfig?.listTile?.trailing && <div className="flex-shrink-0 ml-2">{mobileConfig.listTile.trailing(row)}</div>}
                              </div>

                              {/* Subtitle */}
                              {mobileConfig?.listTile?.subtitle && <div className="text-sm text-gray-600 mt-1 truncate">{mobileConfig.listTile.subtitle(row)}</div>}
                           </div>
                        </div>
                     </div>

                     {/* NO mostrar acciones normales en móvil */}
                  </motion.div>
               </motion.div>
            );
         })}
      </motion.div>
   );

   const getDefaultTitle = (row: T): React.ReactNode => {
      if (cardTitleField && row[cardTitleField]) {
         return String(row[cardTitleField]);
      }

      const titleField = columns.find(
         (col) => col.priority === 1 || col.headerName.toLowerCase().includes("nombre") || col.headerName.toLowerCase().includes("titulo")
      );

      return titleField ? String(row[titleField.field] || "Sin título") : "Item";
   };

   // Bottom Sheet mejorado
const renderBottomSheet = () => {
   if (!showBottomSheet || !selectedRowForSheet || !mobileConfig?.bottomSheet) return null;

   return (
      <AnimatePresence>
         <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Backdrop */}
            <motion.div
               className="absolute inset-0 bg-black bg-opacity-40"
               onClick={closeBottomSheet}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            />

            {/* BottomSheet 100vh */}
            <motion.div
               className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl overflow-hidden border border-gray-100"
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8
               }}
               style={{
                  height: "100vh",
                  maxHeight: "100vh" // ← full fullscreen
               }}
            >
               {/* Handle */}
               <div className="flex justify-center pt-3 pb-2">
                  <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
               </div>

               {/* Close button Flutter-like */}
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

               {/* Contenido scrollable */}
               <div
                  className="overflow-y-auto smooth-scroll px-3 pb-6"
                  style={{
                     height: "calc(100vh - 70px)" // header + handle + padding
                  }}
               >
                  {mobileConfig.bottomSheet.builder(selectedRowForSheet, closeBottomSheet)}
               </div>
            </motion.div>
         </motion.div>
      </AnimatePresence>
   );
};


   // Resto del código igual...
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
         {/* Header MÓVIL - Diseño realista */}
         {isMobile ? (
            // HEADER MÓVIL
            <div className="flex flex-col gap-3 mb-4 p-3 bg-white border-b border-gray-200">
               {/* Solo búsqueda en móvil - diseño nativo */}
               <div className="flex bg-gray-100 items-center rounded-2xl px-4 py-3">
                  <FiSearch className="text-gray-500 mr-3 flex-shrink-0" />
                  <input
                     type="text"
                     placeholder="Buscar..."
                     value={globalFilter}
                     onChange={(e) => setGlobalFilter(e.target.value)}
                     className="w-full min-w-0 outline-none text-base bg-transparent placeholder-gray-500"
                  />
                  {globalFilter && <FiX className="text-gray-500 cursor-pointer hover:text-gray-700 flex-shrink-0 ml-2" onClick={() => setGlobalFilter("")} />}
               </div>

               {/* Filtros rápidos móvil */}
               <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                     onClick={clearAllFilters}
                     className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        globalFilter || Object.values(columnFilters).some(Boolean) ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
                     }`}
                  >
                     Limpiar
                  </button>

                  {/* Filtros por columnas móvil */}
                  <select
                     onChange={(e) => {
                        if (e.target.value) {
                           const [field, value] = e.target.value.split("|");
                           handleColumnFilterChange(field, value);
                        }
                     }}
                     className="px-3 py-2 bg-gray-200 rounded-full text-sm text-gray-700"
                  >
                     <option value="">Filtrar por...</option>
                     {columns.slice(0, 3).map((col) => (
                        <option key={String(col.field)} value={`${String(col.field)}|${col.headerName}`}>
                           {col.headerName}
                        </option>
                     ))}
                  </select>
               </div>
            </div>
         ) : (
            // HEADER DESKTOP (el original)
            <div className="flex flex-col gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
               {headerActions && <div className="flex flex-wrap gap-2 w-full">{headerActions()}</div>}

               <div className="flex flex-col sm:flex-row gap-2 w-full">
                  {/* Búsqueda Desktop */}
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

                  {/* Botones de acción Desktop */}
                  <div className="flex gap-2 flex-shrink-0">
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

         {/* Vista principal (igual que antes) */}
         <div className="border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
               renderLoading()
            ) : error ? (
               renderError()
            ) : currentRows.length === 0 ? (
               renderEmpty()
            ) : isMobile ? (
               <div className="overflow-y-auto max-h-[75vh]">
                  {renderMobileListView()}
                  {renderBottomSheet()}
               </div>
            ) : (
               <div className="overflow-auto max-h-[75vh]">{renderTableView()}</div>
            )}
         </div>

         {/* PAGINACIÓN MÓVIL - Diseño realista */}
         {currentRows.length > 0 && (
            <div className={`${isMobile ? "px-3 py-4 bg-white border-t border-gray-200" : "px-4 py-3 bg-gray-50 border-t border-gray-200 mt-2 rounded-b-lg"}`}>
               {isMobile ? (
                  // PAGINACIÓN MÓVIL
                  <div className="flex flex-col gap-4">
                     {/* Info simple */}
                     <div className="text-center text-gray-600 text-sm">
                        {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedData.length)} de {sortedData.length}
                     </div>

                     {/* Controles móvil - tipo app nativa */}
                     <div className="flex items-center justify-between">
                        {/* Botón anterior */}
                        <button
                           onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                           disabled={currentPage === 1}
                           className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                              currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-blue-500 text-white shadow-sm"
                           }`}
                        >
                           <MdOutlineKeyboardArrowLeft className="text-lg" />
                           Anterior
                        </button>

                        {/* Indicador de página */}
                        <div className="flex items-center gap-1">
                           <span className="text-sm text-gray-700">Página</span>
                           <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">{currentPage}</span>
                           <span className="text-sm text-gray-700">de {totalPages}</span>
                        </div>

                        {/* Botón siguiente */}
                        <button
                           onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                           disabled={currentPage === totalPages}
                           className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                              currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-blue-500 text-white shadow-sm"
                           }`}
                        >
                           Siguiente
                           <MdOutlineKeyboardArrowRight className="text-lg" />
                        </button>
                     </div>

                     {/* Selector de filas móvil */}
                     <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600">Mostrar:</span>
                        <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="bg-gray-100 border-0 rounded-2xl px-3 py-2 text-sm cursor-pointer">
                           {paginate.slice(0, 4).map(
                              (
                                 num // Solo primeros 4 en móvil
                              ) => (
                                 <option key={num} value={num}>
                                    {num} filas
                                 </option>
                              )
                           )}
                        </select>
                     </div>
                  </div>
               ) : (
                  // PAGINACIÓN DESKTOP (original)
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
