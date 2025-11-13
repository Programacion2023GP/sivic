import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FiSearch, FiChevronUp, FiChevronDown, FiX, FiAlertCircle, FiInbox, FiPlus, FiMinus } from "react-icons/fi";
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
   conditionExcel
}: PropsTable<T>) => {
   const [currentPage, setCurrentPage] = useState(1);
   const [rowsPerPage, setRowsPerPage] = useState(paginate[0]);
   const [globalFilter, setGlobalFilter] = useState("");
   const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
   const [sortConfig, setSortConfig] = useState<{ field: keyof T | null; direction: "asc" | "desc" | null }>({ field: null, direction: null });
   const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
   const [isMobile, setIsMobile] = useState(false);
   const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

   // Detectar viewport - CORREGIDO: punto de quiebre más bajo
   useEffect(() => {
      const checkViewport = () => {
         const width = window.innerWidth;
         setIsMobile(width < 768); // Cambio de 1024px a 768px
      };

      checkViewport();
      window.addEventListener("resize", checkViewport);
      return () => window.removeEventListener("resize", checkViewport);
   }, []);
  useEffect(() => {
     setCurrentPage(1);
     setExpandedCards(new Set());
     setSelectedRows(new Set());
  }, [data]);
   // Filtrado
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

   // Ordenamiento
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

   const getVisiblePages = () => {
      if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
      if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
      if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
      return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
   };

   const exportToExcel = () => {
      const exportData = (selectedRows.size > 0 ? Array.from(selectedRows).map((i) => currentRows[i]) : sortedData).map((row) => {
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

   // Obtener columnas para cards
   const getCardColumns = (isExpanded: boolean = false) => {
      if (isExpanded) {
         return columns;
      }
      return columns.filter((col) => col.priority && col.priority <= 2);
   };

   const getHiddenColumns = (visibleColumns: Column<T>[]) => {
      return columns.filter((col) => !visibleColumns.includes(col));
   };

   const getCardTitle = (row: T) => {
      if (cardTitleField && row[cardTitleField]) {
         return String(row[cardTitleField]);
      }

      const titleField = columns.find(
         (col) =>
            col.priority === 1 ||
            col.headerName.toLowerCase().includes("nombre") ||
            col.headerName.toLowerCase().includes("titulo") ||
            col.headerName.toLowerCase().includes("descripcion")
      );

      return titleField ? String(row[titleField.field] || "Sin título") : "Item";
   };

   const toggleCardExpansion = (idx: number) => {
      const newSet = new Set(expandedCards);
      if (newSet.has(idx)) {
         newSet.delete(idx);
      } else {
         newSet.add(idx);
      }
      setExpandedCards(newSet);
   };

   // VISTA DE TABLA (Desktop) - CORREGIDA
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

   // VISTA DE CARDS (Móvil) - MEJORADA
   // VISTA DE CARDS (Móvil) - CORREGIDA
   // VISTA DE CARDS (Móvil) - CORREGIDA
   // VISTA DE CARDS (Móvil) - CORREGIDA Y COMPLETA
   const renderCardsView = () => (
      <div className="space-y-3 pb-4">
         {currentRows.map((row, idx) => {
            const isExpanded = expandedCards.has(idx);
            const visibleColumns = getCardColumns(isExpanded);
            const hiddenColumns = getHiddenColumns(visibleColumns);
            const title = getCardTitle(row);

            return (
               <div
                  key={idx}
                  className={`
                  bg-white rounded-lg border shadow-sm transition-all duration-200
                  ${selectedRows.has(idx) ? "border-cyan-500 border-2 bg-cyan-50" : "border-gray-200"}
                  ${hoverable ? "hover:border-gray-300" : ""}
                  ${isExpanded ? "ring-2 ring-cyan-200" : ""}
               `}
               >
                  {/* Botón "Ver menos" ARRIBA del título cuando está expandido */}
                  {isExpanded && (
                     <div className="px-3 py-2 border-b border-gray-200 bg-cyan-50 rounded-t-lg">
                        <button
                           onClick={() => toggleCardExpansion(idx)}
                           className="flex items-center gap-2 text-sm text-cyan-700 hover:text-cyan-800 font-medium transition-colors w-full justify-center py-2 border border-cyan-300 rounded-lg bg-white hover:bg-cyan-100 shadow-sm"
                        >
                           <FiMinus size={14} />
                           Ocultar campos adicionales
                        </button>
                     </div>
                  )}

                  {/* Header de la card - SIEMPRE visible */}
                  <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                     <h3 className="font-semibold text-gray-800 text-sm truncate flex-1 pr-2">{highlight(title)}</h3>
                     {hiddenColumns.length > 0 && !isExpanded && (
                        <button
                           onClick={() => toggleCardExpansion(idx)}
                           className="flex-shrink-0 p-1.5 text-gray-500 hover:text-cyan-600 transition-colors rounded-full hover:bg-gray-100 border border-gray-300 bg-white shadow-sm"
                           title="Ver más campos"
                        >
                           <FiPlus size={14} />
                        </button>
                     )}
                  </div>

                  {/* Contenido de la card - MEJORADO: Sin límite de altura cuando está expandida */}
                  <div className={isExpanded ? "max-h-[70vh] overflow-y-auto" : ""}>
                     <div className="p-4 space-y-3 pb-8">
                        {" "}
                        {/* MÁS padding */}
                        {/* TODAS las columnas visibles cuando está expandida */}
                        {(isExpanded ? columns : visibleColumns).map((col) => (
                           <div key={String(col.field)} className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                 {col.headerName}
                                 {col.priority === 3 && <span className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded">extra</span>}
                              </span>
                              <span className="text-sm text-gray-800 break-words">
                                 {col.renderField ? col.renderField(row[col.field]) : highlight(String(row[col.field] ?? "N/A"))}
                              </span>
                           </div>
                        ))}
                        {/* Botón "Ver más" cuando NO está expandido */}
                        {!isExpanded && hiddenColumns.length > 0 && (
                           <div className="pt-4 border-t border-gray-100">
                              <button
                                 onClick={() => toggleCardExpansion(idx)}
                                 className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors w-full justify-center py-3 border-2 border-cyan-300 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-all"
                              >
                                 <FiPlus size={14} />
                                 Ver {hiddenColumns.length} campo{hiddenColumns.length > 1 ? "s" : ""} adicionales
                              </button>
                           </div>
                        )}
                        {/* Espacio extra al final para mejor scroll */}
                        {isExpanded && <div className="h-6"></div>}
                     </div>
                  </div>

                  {/* Acciones - SOLO cuando NO está expandido */}
                  {actions && !isExpanded && (
                     <div className="px-3 py-2.5 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                        <div className="flex flex-wrap gap-2 justify-end">{actions(row)}</div>
                     </div>
                  )}
               </div>
            );
         })}
      </div>
   );
   // Estados
   const renderLoading = () => (
      <div className="text-center py-8">
         <div className="flex justify-center items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
            Cargando datos...
         </div>
      </div>
   );

   const renderError = () => (
      <div className="text-center py-6 text-red-500">
         <div className="flex justify-center items-center gap-2">
            <FiAlertCircle className="text-lg" />
            {error}
         </div>
      </div>
   );

   const renderEmpty = () => (
      <div className="text-center py-8 text-gray-500">
         <div className="flex flex-col justify-center items-center gap-2">
            <FiInbox className="text-3xl text-gray-300" />
            <span>No se encontraron resultados</span>
            {(globalFilter || Object.values(columnFilters).some(Boolean)) && (
               <button onClick={clearAllFilters} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mt-2">
                  Limpiar filtros
               </button>
            )}
         </div>
      </div>
   );

   return (
      <div className="w-full bg-white rounded-lg">
         {/* Header con controles - MEJORADO */}
         <div className="flex flex-col gap-3 mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            {/* Fila 1: Header Actions */}
            {headerActions && <div className="flex flex-wrap gap-2 w-full">{headerActions()}</div>}

            {/* Fila 2: Búsqueda y controles */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
               {/* Búsqueda */}
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

               {/* Botones de acción */}
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
         {/* Vista principal - CORREGIDA */}
      
<div className="border border-gray-200 rounded-lg overflow-hidden">
   {loading ? (
      renderLoading()
   ) : error ? (
      renderError()
   ) : currentRows.length === 0 ? (
      renderEmpty()
   ) : isMobile ? (
      <div className="overflow-y-auto max-h-[75vh]">{renderCardsView()}</div> 
   ) : (
      <div className="overflow-auto max-h-[75vh]">{renderTableView()}</div> 
   )}
</div>
         {/* Paginación - MEJORADA */}
         {currentRows.length > 0 && (
            <div className="px-3 sm:px-4 py-3 bg-gray-50 border-t border-gray-200 mt-2 rounded-b-lg">
               <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  {/* Info de registros */}
                  <div className="text-gray-600 text-sm text-center sm:text-left order-2 sm:order-1">
                     Mostrando {startIndex + 1} - {Math.min(startIndex + rowsPerPage, sortedData.length)} de {sortedData.length}
                  </div>

                  {/* Selector de filas */}
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

                  {/* Controles de paginación */}
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
            </div>
         )}
      </div>
   );
};

export default CustomTable;
