import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiChevronUp, FiChevronDown, FiX, FiAlertCircle, FiInbox, FiMoreVertical, FiTrash2, FiEdit, FiGrid, FiList, FiEye } from "react-icons/fi";
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
         hasPermission?: string | string[]; // Nueva prop opcional
      }[];
      right?: {
         icon: React.ReactNode;
         color: string;
         action: (row: T) => void;
         label?: string;
         hasPermission?: string | string[]; // Nueva prop opcional
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
   defaultView?: "table" | "cards";
   enableViewToggle?: boolean;
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

   // Handlers para móvil mejorados
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

   // HANDLERS MEJORADOS PARA SWIPE - Más suaves
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
                     return null;
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
                  return null;
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

   // En la función exportToExcel, reemplaza esta parte:
   const exportToExcel = () => {
      const exportData = sortedData.map((row) => {
         const obj: Record<string, any> = {};
         columns.forEach((col) => {
            try {
               if (col.renderField) {
                  // Para campos renderizados, necesitamos obtener el valor textual
                  const renderedValue = col.renderField(row[col.field]);

                  // Convertir el React Node a string
                  let stringValue = "";

                  if (typeof renderedValue === "string") {
                     stringValue = renderedValue;
                  } else if (typeof renderedValue === "number" || typeof renderedValue === "boolean") {
                     stringValue = String(renderedValue);
                  } else if (React.isValidElement(renderedValue)) {
                     // Para elementos React, intentamos extraer el texto
                     const tempDiv = document.createElement("div");
                     // const root = ReactDOM.createRoot(tempDiv);
                     // root.render(renderedValue);

                     // Esperar un momento para que se renderice y luego obtener el texto
                     setTimeout(() => {
                        stringValue = tempDiv.textContent || tempDiv.innerText || "";
                     }, 100);

                     // Fallback: usar el valor original si no podemos extraer el texto
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

   // CORREGIDO: Filtrar columnas por visibilidad - "always" siempre se muestra
   const getVisibleColumns = (mode: "compact" | "expanded" = "expanded") => {
      if (mode === "expanded") {
         return columns;
      }

      // Modo compacto
      const alwaysColumns = columns.filter((col) => col.visibility === "always");

      const otherColumns = columns.filter(
         (col) => col.visibility !== "always" && (col.visibility === "desktop" || col.visibility === undefined || (col.priority && col.priority <= 3))
      );

      return [...alwaysColumns, ...otherColumns];
   };

   // NUEVO: Obtener columnas que NO están visibles en modo compacto
   const getHiddenColumns = () => {
      const visibleColumns = getVisibleColumns("compact");
      return columns.filter((col) => !visibleColumns.includes(col));
   };

   // NUEVO: Verificar si hay columnas ocultas que justifiquen la expansión
   const shouldShowExpansion = () => {
      return getHiddenColumns().length > 0;
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
                     {/* Columna de expansión - SOLO si hay columnas ocultas */}
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
                           {/* Fila principal */}
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
                              {/* Ícono de expansión - SOLO si hay columnas ocultas */}
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

                              {/* Columnas principales */}
                              {visibleColumns.map((col) => (
                                 <td key={String(col.field)} className="px-3 py-3 text-sm text-gray-800 whitespace-nowrap" title={String(row[col.field] ?? "")}>
                                    <div className=" max-w-[200px]">{col.renderField ? col.renderField(row[col.field]) : highlight(String(row[col.field] ?? ""))}</div>
                                 </td>
                              ))}

                              {actions && (
                                 <td className="px-3 py-3 text-sm whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex flex-wrap gap-1">{actions(row)}</div>
                                 </td>
                              )}
                           </tr>

                           {/* Fila expandida - SOLO si hay columnas ocultas y está expandida */}
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
                                       {hiddenColumns.map((col, colIndex) => (
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
                     {/* Header de la tarjeta */}
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

                     {/* Campos principales */}
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

                     {/* Botón para ver más detalles - SOLO si hay columnas ocultas */}
                     {showExpansion && (
                        <button
                           onClick={() => toggleRowExpansion(idx)}
                           className="w-full py-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                           <FiEye size={14} />
                           {expandedRows.has(idx) ? "Ver menos" : `Ver ${hiddenColumns.length} campos más`}
                        </button>
                     )}

                     {/* Detalles expandidos - SOLO columnas ocultas */}
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

   // ... (el resto del código permanece igual: renderMobileListView, getDefaultTitle, getDefaultSubtitle, renderBottomSheet, etc.)

   // VISTA MÓVIL MEJORADA
   const renderMobileListView = (hasPermission: any) => {
      return (
         <motion.div className="space-y-2 p-3 bg-gray-50 min-h-fit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <AnimatePresence>
               {currentRows.map((row, idx) => {
                  const isBeingSwiped = swipeData.index === idx;
                  const swipeProgress = Math.min(Math.abs(swipeData.offset) / 80, 1);

                  const leftAction = mobileConfig?.swipeActions?.left?.[0];
                  const rightAction = mobileConfig?.swipeActions?.right?.[0];

                  let actionColor = null;
                  let actionIcon = null;

                  // =============================
                  //     LÓGICA DE ACCIÓN ACTUAL
                  // =============================
                  const isSwipingRight = swipeData.offset > 0; // dedo hacia la derecha
                  const isSwipingLeft = swipeData.offset < 0; // dedo hacia la izquierda

                  // elegimos cuál acción evaluar
                  const currentAction = isSwipingRight
                     ? leftAction // si swipes hacia la derecha → acción left
                     : isSwipingLeft
                     ? rightAction // si swipes hacia la izquierda → acción right
                     : null;

                  // si existe una acción válida
                  if (currentAction) {
                     // si tiene condición, la evaluamos
                     const passed = currentAction.hasPermission;

                     if (passed !=undefined) {

                        actionColor = currentAction.color;
                        actionIcon = currentAction.icon;
                        const allowed = Array.isArray(passed) ? passed.some((p) => hasPermission(p)) : hasPermission(passed);
   
                        if (!allowed) {
                           return null;
                        }
                     }
                     else{

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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                           opacity: 1,
                           y: 0
                        }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                           type: "spring",
                           damping: 30,
                           stiffness: 400,
                           delay: idx * 0.02
                        }}
                     >
                        {/* FONDO DE ACCIÓN SUAVE */}
                        {actionColor && (
                           <motion.div
                              className={`absolute inset-0 rounded-xl ${actionColor} flex items-center ${
                                 swipeData.offset > 0 ? "justify-start pl-4" : "justify-end pr-4"
                              }`}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{
                                 opacity: swipeProgress * 0.8,
                                 scale: 1
                              }}
                              transition={{
                                 type: "spring",
                                 damping: 35,
                                 stiffness: 500
                              }}
                           >
                              <motion.div
                                 initial={{ scale: 0, opacity: 0 }}
                                 animate={{
                                    scale: swipeProgress,
                                    opacity: swipeProgress
                                 }}
                                 transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 400
                                 }}
                                 className="text-white text-lg"
                              >
                                 {actionIcon}
                              </motion.div>
                           </motion.div>
                        )}

                        {/* ITEM PRINCIPAL CON MOVIMIENTO SUAVE */}
                        <motion.div
                           className="relative bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden"
                           drag="x"
                           dragConstraints={{ left: 0, right: 0 }}
                           dragElastic={0.1}
                           onDragStart={() => handleSwipeStart(idx)}
                           onDrag={(_, info) => handleSwipeMove(info.offset.x, idx)}
                           onDragEnd={() => handleSwipeEnd(row, idx, hasPermission)}
                           style={{
                              x: isBeingSwiped ? swipeData.offset : 0
                           }}
                           whileHover={{
                              y: -1,
                              transition: { duration: 0.15 }
                           }}
                           whileTap={{
                              scale: 0.995,
                              transition: { duration: 0.1 }
                           }}
                        >
                           <div className="p-3 active:bg-gray-50 transition-colors duration-150" onClick={(e) => handleTileTap(row, e)}>
                              <div className="flex items-center space-x-3">
                                 {/* Leading */}
                                 {mobileConfig?.listTile?.leading && <div className="flex-shrink-0">{mobileConfig.listTile.leading(row)}</div>}

                                 {/* Content */}
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                       <div className="text-base font-medium text-gray-900 truncate">
                                          {mobileConfig?.listTile?.title ? mobileConfig.listTile.title(row) : getDefaultTitle(row)}
                                       </div>
                                       {mobileConfig?.listTile?.trailing && <div className="flex-shrink-0 ml-2">{mobileConfig.listTile.trailing(row)}</div>}
                                    </div>

                                    {/* Subtitle */}
                                    {mobileConfig?.listTile?.subtitle && (
                                       <div className="text-sm text-gray-600 mt-0.5 truncate">{mobileConfig.listTile.subtitle(row)}</div>
                                    )}
                                 </div>
                              </div>
                           </div>

                           {/* INDICADOR VISUAL SUTIL */}
                           {isBeingSwiped && Math.abs(swipeData.offset) > 20 && (
                              <motion.div
                                 className={`absolute top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-full ${swipeData.offset > 0 ? " left-2" : " right-2"}`}
                                 initial={{ scale: 0, opacity: 0 }}
                                 animate={{
                                    scale: 1,
                                    opacity: Math.min(Math.abs(swipeData.offset) / 60, 0.7)
                                 }}
                                 transition={{ type: "spring", stiffness: 600 }}
                              />
                           )}
                        </motion.div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </motion.div>
      );
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
                     maxHeight: "100vh"
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
                        height: "calc(100vh - 70px)"
                     }}
                  >
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
            <motion.div className="flex flex-col gap-4 p-4 bg-white border-b border-gray-200" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
               {/* Búsqueda móvil */}
               <div className="flex bg-gray-100 items-center rounded-2xl px-4 py-3 shadow-inner">
                  <FiSearch className="text-gray-500 mr-3 flex-shrink-0 text-lg" />
                  <input
                     type="text"
                     placeholder="Buscar en la lista..."
                     value={globalFilter}
                     onChange={(e) => setGlobalFilter(e.target.value)}
                     className="w-full min-w-0 outline-none text-base bg-transparent placeholder-gray-500 font-medium"
                  />
                  {globalFilter && (
                     <motion.button onClick={() => setGlobalFilter("")} className="text-gray-500 hover:text-gray-700 flex-shrink-0 ml-2" whileTap={{ scale: 0.9 }}>
                        <FiX className="text-lg" />
                     </motion.button>
                  )}
               </div>
            </motion.div>
         ) : (
            // HEADER DESKTOP
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
                     {/* Selector de vista */}
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
                  {renderMobileListView(hasPermission)}
                  {renderBottomSheet()}
               </div>
            ) : viewMode === "cards" ? (
               <div className="overflow-auto max-h-[75vh]">{renderCardsView()}</div>
            ) : (
               <div className="overflow-auto max-h-[75vh]">{renderTableView()}</div>
            )}
         </div>

         {/* PAGINACIÓN */}
         {currentRows.length > 0 && (
            <div className={`${isMobile ? "px-4 py-6 bg-white border-t border-gray-200 mt-4" : "px-4 py-3 bg-gray-50 border-t border-gray-200 mt-2 rounded-b-lg"}`}>
               {isMobile ? (
                  // PAGINACIÓN MÓVIL
                  <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                     {/* Info */}
                     <div className="text-center text-gray-600 text-sm font-medium">
                        {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedData.length)} de {sortedData.length} elementos
                     </div>

                     {/* Controles principales */}
                     <div className="flex items-center justify-between">
                        <motion.button
                           onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                           disabled={currentPage === 1}
                           className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                              currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                           }`}
                           whileTap={{ scale: 0.95 }}
                           whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                        >
                           <MdOutlineKeyboardArrowLeft className="text-lg" />
                           Anterior
                        </motion.button>

                        {/* Indicador de página */}
                        <div className="flex items-center gap-3">
                           <span className="text-sm text-gray-600 font-medium">Página</span>
                           <motion.span
                              className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold shadow-md"
                              key={currentPage}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                           >
                              {currentPage}
                           </motion.span>
                           <span className="text-sm text-gray-600 font-medium">de {totalPages}</span>
                        </div>

                        <motion.button
                           onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                           disabled={currentPage === totalPages}
                           className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                              currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                           }`}
                           whileTap={{ scale: 0.95 }}
                           whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                        >
                           Siguiente
                           <MdOutlineKeyboardArrowRight className="text-lg" />
                        </motion.button>
                     </div>

                     {/* Selector de filas */}
                     <div className="flex items-center justify-center gap-3">
                        <span className="text-sm text-gray-600 font-medium">Mostrar:</span>
                        <motion.select
                           value={rowsPerPage}
                           onChange={handleRowsPerPageChange}
                           className="bg-white border border-gray-300 rounded-2xl px-4 py-2 text-sm cursor-pointer shadow-sm"
                           whileTap={{ scale: 0.95 }}
                        >
                           {paginate.slice(0, 3).map((num) => (
                              <option key={num} value={num}>
                                 {num} filas
                              </option>
                           ))}
                        </motion.select>
                     </div>
                  </motion.div>
               ) : (
                  // PAGINACIÓN DESKTOP
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
