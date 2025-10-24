import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FiSearch, FiChevronUp, FiChevronDown, FiX, FiAlertCircle, FiInbox, FiPlus, FiMinus } from "react-icons/fi";
import { RiFileExcelFill } from "react-icons/ri";
import { MdOutlineKeyboardArrowRight, MdOutlineKeyboardArrowLeft } from "react-icons/md";

interface Column<T extends object> {
  field: keyof T;
  headerName: string;
  renderField?: <K extends keyof T>(value: T[K]) => React.ReactNode;
  getFilterValue?: <K extends keyof T>(value: T[K]) => string;
  priority?: number; // 1: alta prioridad (siempre visible), 2: media, 3: baja (ocultos inicialmente)
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
  cardTitleField
}: PropsTable<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(paginate[0]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ field: keyof T | null; direction: "asc" | "desc" | null; }>({ field: null, direction: null });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Detectar viewport
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Filtrado (mantener igual)
  const safeData = Array.isArray(data) ? data : [];

  const filteredData = safeData
    .filter(row =>
      globalFilter
        ? columns.some(col => {
            const rawValue = row?.[col.field];
            const value = col.getFilterValue
              ? col.getFilterValue(rawValue)
              : String(rawValue ?? "");
            return value.toLowerCase().includes(globalFilter.toLowerCase());
          })
        : true
    )
    .filter(row =>
      columns.every(col => {
        const filterValue = columnFilters?.[String(col.field)];
        if (!filterValue) return true;

        const rawValue = row?.[col.field];
        const value = col.getFilterValue
          ? col.getFilterValue(rawValue)
          : String(rawValue ?? "");
        return value.toLowerCase().includes(filterValue.toLowerCase());
      })
    );

  // Ordenamiento (mantener igual)
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.field || !sortConfig.direction) return 0;
    const valA = a[sortConfig.field];
    const valB = b[sortConfig.field];
    if (valA == null) return -1;
    if (valB == null) return 1;
    const comparison = String(valA).localeCompare(String(valB));
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  // Paginación (mantener igual)
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = sortedData.slice(startIndex, startIndex + rowsPerPage);

  // Handlers (mantener igual)
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleColumnFilterChange = (field: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearColumnFilter = (field: string) => {
    setColumnFilters(prev => ({ ...prev, [field]: "" }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setGlobalFilter("");
    setColumnFilters({});
    setCurrentPage(1);
  };

  const handleSort = (field: keyof T) => {
    setSortConfig(prev => {
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
  const exportData = (selectedRows.size > 0 ? Array.from(selectedRows).map(i => currentRows[i]) : sortedData).map(row => {
    const obj: Record<string, any> = {};
    columns.forEach(col => {
      try {
        // Si existe renderField, usarlo para obtener el valor formateado
        if (col.renderField) {
          const renderedValue = col.renderField(row[col.field]);
          // Convertir ReactNode a string si es necesario
          obj[String(col.headerName)] = typeof renderedValue === 'string' 
            ? renderedValue 
            : String(renderedValue ?? '');
        } else {
          // Usar getFilterValue si está disponible, sino el valor directo
          obj[String(col.headerName)] = col.getFilterValue 
            ? col.getFilterValue(row[col.field])
            : row[col.field];
        }
      } catch (error) {
        // En caso de error, usar el valor directo
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
    const regex = new RegExp(`(${globalFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, idx) =>
          regex.test(part) ? <span key={idx} className="bg-yellow-200 font-medium">{part}</span> : part
        )}
      </>
    );
  };

  // Obtener columnas para cards (prioridad 1 siempre visibles)
  const getCardColumns = (isExpanded: boolean = false) => {
    if (isExpanded) {
      return columns; // Todas las columnas cuando está expandido
    }
    return columns.filter(col => col.priority && col.priority <= 2);
  };

  // Obtener columnas ocultas (prioridad 3)
  const getHiddenColumns = (visibleColumns: Column<T>[]) => {
    return columns.filter(col => !visibleColumns.includes(col));
  };

  // Obtener título para la card
  const getCardTitle = (row: T) => {
    if (cardTitleField && row[cardTitleField]) {
      return String(row[cardTitleField]);
    }
    
    const titleField = columns.find(col => 
      col.priority === 1 || 
      col.headerName.toLowerCase().includes('nombre') ||
      col.headerName.toLowerCase().includes('titulo') ||
      col.headerName.toLowerCase().includes('descripcion')
    );
    
    return titleField ? String(row[titleField.field] || 'Sin título') : 'Item';
  };

  // Toggle expandir/contraer card
  const toggleCardExpansion = (idx: number) => {
    const newSet = new Set(expandedCards);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setExpandedCards(newSet);
  };

  // Renderizar vista de tabla (Desktop) - Mantener igual
  const renderTableView = () => (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-max divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
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
                    {sortConfig.field === col.field && (
                      sortConfig.direction === "asc" ? 
                        <FiChevronUp className="flex-shrink-0" /> : 
                        <FiChevronDown className="flex-shrink-0" />
                    )}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <FiSearch className="text-gray-400 text-xs flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={columnFilters[String(col.field)] || ""}
                      onChange={e => handleColumnFilterChange(String(col.field), e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-300 w-full max-w-[120px]"
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
            {actions && (
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        <tbody className={`divide-y divide-gray-100 ${striped ? '[&>tr:nth-child(even)]:bg-gray-50' : ''}`}>
          {currentRows.map((row, idx) => (
            <tr
              key={idx}
              className={`
                transition-colors duration-150 
                ${selectedRows.has(idx) ? "bg-cyan-50 border-l-4 border-l-cyan-500" : ""}
                ${hoverable ? "hover:bg-gray-50" : ""}
              `}
            >
              {columns.map(col => (
                <td 
                  key={String(col.field)} 
                  className="px-3 py-3 text-sm text-gray-800 whitespace-nowrap"
                >
                  <span className="font-medium">
                    {col.renderField ? col.renderField(row[col.field]) : highlight(String(row[col.field] ?? ""))}
                  </span>
                </td>
              ))}
              {actions && (
                <td className="px-3 py-3 text-sm whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Renderizar vista de cards (Móvil/Tablet) - MEJORADA
  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
      {currentRows.map((row, idx) => {
        const isExpanded = expandedCards.has(idx);
        const visibleColumns = getCardColumns(isExpanded);
        const hiddenColumns = getHiddenColumns(visibleColumns);
        const title = getCardTitle(row);
        
        return (
          <div
            key={idx}
            className={`
              bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200
              ${selectedRows.has(idx) ? "border-cyan-500 border-2 bg-cyan-50" : ""}
              ${hoverable ? "hover:border-gray-300" : ""}
              ${isExpanded ? "ring-2 ring-cyan-200" : ""}
            `}
          >
            {/* Header de la card */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 text-sm truncate flex-1">
                {highlight(title)}
              </h3>
              {hiddenColumns.length > 0 && (
                <button
                  onClick={() => toggleCardExpansion(idx)}
                  className="ml-2 p-1 text-gray-500 hover:text-cyan-600 transition-colors rounded"
                  title={isExpanded ? "Ver menos" : "Ver más campos"}
                >
                  {isExpanded ? <FiMinus size={14} /> : <FiPlus size={14} />}
                </button>
              )}
            </div>

            {/* Contenido de la card */}
            <div className="p-4 space-y-3">
              {visibleColumns.map(col => (
                <div key={String(col.field)} className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                    {col.headerName}
                    {col.priority === 3 && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded">extra</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-800 break-words">
                    {col.renderField 
                      ? col.renderField(row[col.field]) 
                      : highlight(String(row[col.field] ?? "N/A"))
                    }
                  </span>
                </div>
              ))}
              
              {/* Información de campos adicionales (solo cuando no está expandido) */}
              {!isExpanded && hiddenColumns.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleCardExpansion(idx)}
                    className="flex items-center gap-2 text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                  >
                    <FiPlus size={12} />
                    Ver {hiddenColumns.length} campo{hiddenColumns.length > 1 ? 's' : ''} más
                  </button>
                </div>
              )}

              {/* Sección de campos adicionales cuando está expandido */}
              {isExpanded && hiddenColumns.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Campos Adicionales
                    </span>
                  </div>
                  <div className="space-y-3">
                    {hiddenColumns.map(col => (
                      <div key={String(col.field)} className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 mb-1">
                          {col.headerName}
                        </span>
                        <span className="text-sm text-gray-800 break-words">
                          {col.renderField 
                            ? col.renderField(row[col.field]) 
                            : highlight(String(row[col.field] ?? "N/A"))
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            {actions && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                <div className="flex flex-wrap gap-2 justify-end">
                  {actions(row)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Estados (mantener igual)
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
          <button
            onClick={clearAllFilters}
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mt-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-full overflow-hidden bg-white rounded-lg">
      {/* Header con controles (mantener igual) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4 p-2 sm:p-4 bg-gray-50 rounded-lg mx-2 sm:mx-0">
        <div className="flex flex-wrap gap-2 w-full lg:w-auto min-w-0">
          {headerActions && headerActions()}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto min-w-0">
          <div className="flex bg-white items-center w-full min-w-0 border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-cyan-400 transition-all">
            <FiSearch className="text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscador general..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full min-w-0 outline-none text-sm bg-transparent"
            />
            {globalFilter && (
              <FiX 
                className="text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0" 
                onClick={() => setGlobalFilter("")} 
              />
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer text-sm font-medium whitespace-nowrap"
            >
              <RiFileExcelFill className="text-lg" /> 
              <span className="hidden sm:inline">Exportar</span>
            </button>
            
            {(globalFilter || Object.values(columnFilters).some(Boolean)) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer text-sm font-medium whitespace-nowrap"
              >
                <FiX className="text-lg" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vista principal */}
      <div className="border border-gray-200 rounded-lg mx-2 sm:mx-0 mb-2 sm:mb-0">
        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : currentRows.length === 0 ? (
          renderEmpty()
        ) : isMobile ? (
          renderCardsView()
        ) : (
          renderTableView()
        )}
      </div>

      {/* Paginación (mantener igual) */}
      {currentRows.length > 0 && (
        <div className="px-3 sm:px-4 py-3 bg-gray-50 border-t border-gray-200 mx-2 sm:mx-0 mt-2 rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 order-2 sm:order-1 min-w-0">
              <span className="text-gray-600 text-sm whitespace-nowrap">
                Mostrando {startIndex + 1} - {Math.min(startIndex + rowsPerPage, sortedData.length)} de {sortedData.length}
              </span>
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2 whitespace-nowrap">
              <label className="text-gray-600 text-sm">Filas:</label>
              <select 
                value={rowsPerPage} 
                onChange={handleRowsPerPageChange} 
                className="border border-gray-300 rounded px-2 py-1 text-sm hover:cursor-pointer bg-white"
              >
                {paginate.map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1 order-3 flex-shrink-0">
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <MdOutlineKeyboardArrowLeft />
              </button>

              <div className="flex overflow-x-auto gap-1 max-w-[120px] sm:max-w-none">
                {getVisiblePages().map((p, i) =>
                  p === "..." ? (
                    <span key={i} className="px-2 py-1 text-gray-400 text-sm">...</span>
                  ) : (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(p as number)} 
                      className={`px-2 py-1 rounded border text-sm transition cursor-pointer min-w-[32px] ${
                        currentPage === p 
                          ? "bg-cyan-500 text-white border-cyan-500" 
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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