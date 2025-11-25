import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useField, useFormikContext } from "formik";
import { HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineBookmark, HiChevronDown, HiChevronRight } from "react-icons/hi2";
import { RiArrowRightWideLine, RiArrowLeftWideFill } from "react-icons/ri";
import Tooltip from "../toltip/Toltip";

type TransferListProps<T> = {
   name: string;
   label?: string;
   error?: string | null;
   departamentos: T[];
   idKey: keyof T;
   labelKey: keyof T;
   disabled?: boolean;
   maxHeight?: number;
   groupByPrefix?: boolean;
};

interface GroupedItem<T> {
   id: string;
   name: string;
   prefix: string;
   items: T[];
   allSelected: boolean;
   partialSelected: boolean;
}

const FTransferList = <T extends Record<string, any>>({
   name,
   label,
   error,
   departamentos,
   idKey,
   labelKey,
   disabled = false,
   maxHeight = 320,
   groupByPrefix = true
}: TransferListProps<T>) => {
   const formik = useFormikContext<any>();
   const [field, meta] = useField<number[]>({ name });

   const [selected, setSelected] = useState<number[]>(field.value || []);
   const [leftChecked, setLeftChecked] = useState<number[]>([]);
   const [rightChecked, setRightChecked] = useState<number[]>([]);
   const [searchLeft, setSearchLeft] = useState("");
   const [searchRight, setSearchRight] = useState("");
   const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

   // Sincronizar con Formik
   useEffect(() => {
      if (Array.isArray(field.value) && JSON.stringify(field.value) !== JSON.stringify(selected)) {
         setSelected(field.value);
      }
   }, [field.value, selected]);

   const updateSelected = useCallback(
      (newSelected: number[]) => {
         setSelected(newSelected);
         formik.setFieldValue(name, newSelected);
         formik.setFieldTouched(name, true);
      },
      [formik, name]
   );

   // Función para extraer prefijos
   const extractPrefix = useCallback(
      (label: string): { prefix: string; suffix: string } => {
         if (!groupByPrefix) return { prefix: "", suffix: label };

         const parts = label.split("_");
         if (parts.length <= 1) return { prefix: "", suffix: label };

         return {
            prefix: parts[0],
            suffix: parts.slice(1).join("_")
         };
      },
      [groupByPrefix]
   );

   // Agrupar items por prefijo
   const groupItems = useCallback(
      (items: T[]): GroupedItem<T>[] => {
         if (!groupByPrefix) {
            return [
               {
                  id: "ungrouped",
                  name: "Todos",
                  prefix: "",
                  items,
                  allSelected: false,
                  partialSelected: false
               }
            ];
         }

         const groupsMap = new Map<string, T[]>();

         items.forEach((item) => {
            const labelText = String(item[labelKey]);
            const { prefix } = extractPrefix(labelText);
            const groupKey = prefix || "otros";

            if (!groupsMap.has(groupKey)) {
               groupsMap.set(groupKey, []);
            }
            groupsMap.get(groupKey)!.push(item);
         });

         return Array.from(groupsMap.entries()).map(([prefix, groupItems]) => ({
            id: prefix,
            name: prefix.charAt(0).toUpperCase() + prefix.slice(1),
            prefix,
            items: groupItems,
            allSelected: false,
            partialSelected: false
         }));
      },
      [groupByPrefix, labelKey, extractPrefix]
   );

   // Memoizar las listas filtradas y agrupadas
   // Reemplazamos el useMemo que calcula groupedDisponibles y groupedElegidos para que incluya allSelected y partialSelected
   const { disponibles, elegidos, groupedDisponibles, groupedElegidos } = useMemo(() => {
      const allDisponibles = departamentos.filter((d) => !selected.includes(d[idKey]));
      const allElegidos = departamentos.filter((d) => selected.includes(d[idKey]));

      const filterItems = (items: T[], search: string) => items.filter((item) => String(item[labelKey]).toLowerCase().includes(search.toLowerCase()));

      const filteredDisponibles = filterItems(allDisponibles, searchLeft);
      const filteredElegidos = filterItems(allElegidos, searchRight);

      // Función para agrupar y calcular selección
      const groupAndCalculateSelection = (items: T[], checkedItems: number[]): GroupedItem<T>[] => {
         const groups = groupItems(items);
         return groups.map((group) => {
            const groupItemIds = group.items.map((item) => Number(item[idKey]));
            const selectedInGroup = groupItemIds.filter((id) => checkedItems.includes(id));
            const allSelected = selectedInGroup.length === groupItemIds.length && groupItemIds.length > 0;
            const partialSelected = selectedInGroup.length > 0 && !allSelected;

            return { ...group, allSelected, partialSelected };
         });
      };

      return {
         disponibles: filteredDisponibles,
         elegidos: filteredElegidos,
         groupedDisponibles: groupAndCalculateSelection(filteredDisponibles, leftChecked),
         groupedElegidos: groupAndCalculateSelection(filteredElegidos, rightChecked)
      };
   }, [departamentos, selected, idKey, labelKey, searchLeft, searchRight, leftChecked, rightChecked, groupItems]);
   // Actualizar estados de selección de grupos
   // useEffect(() => {
   //    const updateGroupSelection = (groups: GroupedItem<T>[], checkedItems: number[]) => {
   //       return groups.map((group) => {
   //          const groupItemIds = group.items.map((item) => Number(item[idKey]));
   //          const selectedInGroup = groupItemIds.filter((id) => checkedItems.includes(id));
   //          const allSelected = selectedInGroup.length === groupItemIds.length && groupItemIds.length > 0;
   //          const partialSelected = selectedInGroup.length > 0 && !allSelected;

   //          return { ...group, allSelected, partialSelected };
   //       });
   //    };

   //    setGroupedDisponibles((prev) => updateGroupSelection(prev, leftChecked));
   //    setGroupedElegidos((prev) => updateGroupSelection(prev, rightChecked));
   // }, [leftChecked, rightChecked, idKey]);

   // Funciones de movimiento memoizadas
   const moveRight = useCallback(() => {
      if (leftChecked.length === 0) return;
      const newSelected = [...selected, ...leftChecked];
      updateSelected(newSelected);
      setLeftChecked([]);
   }, [leftChecked, selected, updateSelected]);

   const moveAllRight = useCallback(() => {
      if (disponibles.length === 0) return;
      const newSelected = [...selected, ...disponibles.map((d) => Number(d[idKey]))];
      updateSelected(newSelected);
      setLeftChecked([]);
   }, [disponibles, selected, idKey, updateSelected]);

   const moveLeft = useCallback(() => {
      if (rightChecked.length === 0) return;
      const newSelected = selected.filter((id) => !rightChecked.includes(id));
      updateSelected(newSelected);
      setRightChecked([]);
   }, [rightChecked, selected, updateSelected]);

   const moveAllLeft = useCallback(() => {
      if (elegidos.length === 0) return;
      const newSelected = selected.filter((id) => !elegidos.map((d) => Number(d[idKey])).includes(id));
      updateSelected(newSelected);
      setRightChecked([]);
   }, [elegidos, selected, idKey, updateSelected]);

   // Manejo de selecciones individuales
   const handleToggleLeft = useCallback(
      (id: number) => {
         if (disabled) return;
         setLeftChecked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
      },
      [disabled]
   );

   const handleToggleRight = useCallback(
      (id: number) => {
         if (disabled) return;
         setRightChecked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
      },
      [disabled]
   );

   // Manejo de selecciones de grupos
   const handleToggleLeftGroup = useCallback(
      (group: GroupedItem<T>) => {
         if (disabled) return;

         const groupItemIds = group.items.map((item) => Number(item[idKey]));
         const allCurrentlySelected = groupItemIds.every((id) => leftChecked.includes(id));

         if (allCurrentlySelected) {
            // Deseleccionar todo el grupo
            setLeftChecked((prev) => prev.filter((id) => !groupItemIds.includes(id)));
         } else {
            // Seleccionar todo el grupo
            const newSelected = [...new Set([...leftChecked, ...groupItemIds])];
            setLeftChecked(newSelected);
         }
      },
      [disabled, leftChecked, idKey]
   );

   const handleToggleRightGroup = useCallback(
      (group: GroupedItem<T>) => {
         if (disabled) return;

         const groupItemIds = group.items.map((item) => Number(item[idKey]));
         const allCurrentlySelected = groupItemIds.every((id) => rightChecked.includes(id));

         if (allCurrentlySelected) {
            // Deseleccionar todo el grupo
            setRightChecked((prev) => prev.filter((id) => !groupItemIds.includes(id)));
         } else {
            // Seleccionar todo el grupo
            const newSelected = [...new Set([...rightChecked, ...groupItemIds])];
            setRightChecked(newSelected);
         }
      },
      [disabled, rightChecked, idKey]
   );

   // Toggle expandir/colapsar grupo
   const toggleGroupExpansion = useCallback((groupId: string) => {
      setExpandedGroups((prev) => {
         const newSet = new Set(prev);
         if (newSet.has(groupId)) {
            newSet.delete(groupId);
         } else {
            newSet.add(groupId);
         }
         return newSet;
      });
   }, []);

   // Componente de lista memoizado con soporte para grupos
   const TransferList = useCallback(
      ({
         title,
         items,
         groupedItems,
         checkedItems,
         onItemToggle,
         onGroupToggle,
         searchValue,
         onSearchChange,
         emptyMessage = "Sin resultados",
         isLeft = true
      }: {
         title: string;
         items: T[];
         groupedItems: GroupedItem<T>[];
         checkedItems: number[];
         onItemToggle: (id: number) => void;
         onGroupToggle: (group: GroupedItem<T>) => void;
         searchValue: string;
         onSearchChange: (value: string) => void;
         emptyMessage?: string;
         isLeft?: boolean;
      }) => {
         const renderGroup = (group: GroupedItem<T>) => {
            const isExpanded = expandedGroups.has(group.id);
            const hasItems = group.items.length > 0;

            return (
               <div key={group.id} className="mb-2 border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header del grupo */}
                  <div
                     className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                        hasItems ? "bg-gray-50 hover:bg-gray-100" : "bg-gray-100 opacity-50"
                     }`}
                     onClick={hasItems ? () => toggleGroupExpansion(group.id) : undefined}
                  >
                     <div className="flex items-center space-x-2 flex-1">
                        {hasItems && (
                           <button
                              type="button"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 onGroupToggle(group);
                              }}
                              className={`p-1 rounded border ${
                                 group.allSelected
                                    ? "bg-blue-500 border-blue-500 text-white"
                                    : group.partialSelected
                                    ? "bg-blue-200 border-blue-300 text-blue-700"
                                    : "bg-white border-gray-300 text-gray-400 hover:border-gray-400"
                              } transition-colors`}
                              disabled={!hasItems || disabled}
                           >
                              <HiOutlineCheckCircle size={16} />
                           </button>
                        )}
                        <span className="text-sm font-medium text-gray-700">
                           {group.name} ({group.items.length})
                        </span>
                     </div>
                     {hasItems && (
                        <div className="flex items-center space-x-1">
                           {isExpanded ? <HiChevronDown className="text-gray-500" size={16} /> : <HiChevronRight className="text-gray-500" size={16} />}
                        </div>
                     )}
                  </div>

                  {/* Items del grupo */}
                  {isExpanded && hasItems && (
                     <div className="bg-white border-t border-gray-100">
                        {group.items.map((item) => {
                           const id = Number(item[idKey]);
                           const labelText = String(item[labelKey]);
                           const { suffix } = extractPrefix(labelText);
                           const isChecked = checkedItems.includes(id);

                           return (
                              <div
                                 key={id}
                                 onClick={() => onItemToggle(id)}
                                 className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
                                    isChecked ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-gray-50"
                                 } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                 <div className="flex items-center space-x-2 flex-1">
                                    <span className="text-sm text-gray-600 ml-6">•</span>
                                    <span className="text-sm text-gray-700 truncate flex-1">{suffix || labelText}</span>
                                 </div>
                                 {isChecked ? (
                                    <HiOutlineCheckCircle className="text-blue-600 flex-shrink-0 ml-2" size={18} />
                                 ) : (
                                    <HiOutlineBookmark className="text-gray-400 flex-shrink-0 ml-2" size={16} />
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            );
         };

         return (
            <div className="flex flex-col w-full sm:w-1/2 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
               <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                     {title} <span className="text-gray-500">({items.length})</span>
                  </h3>
               </div>

               <input
                  type="search"
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 mb-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  disabled={disabled}
               />

               <div
                  className="overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                  style={{ maxHeight: `${maxHeight}px` }}
               >
                  {searchValue ? (
                     // Vista plana cuando hay búsqueda
                     items.length > 0 ? (
                        items.map((item) => {
                           const id = Number(item[idKey]);
                           const labelText = String(item[labelKey]);
                           const isChecked = checkedItems.includes(id);

                           return (
                              <div
                                 key={id}
                                 onClick={() => onItemToggle(id)}
                                 className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                                    isChecked ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                                 } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                 <span className="text-sm text-gray-700 truncate flex-1">{labelText}</span>
                                 {isChecked ? (
                                    <HiOutlineCheckCircle className="text-blue-600 flex-shrink-0 ml-2" size={18} />
                                 ) : (
                                    <HiOutlineBookmark className="text-gray-400 flex-shrink-0 ml-2" size={16} />
                                 )}
                              </div>
                           );
                        })
                     ) : (
                        <div className="py-4 text-center text-gray-400 text-sm">{emptyMessage}</div>
                     )
                  ) : // Vista agrupada cuando no hay búsqueda
                  groupedItems.length > 0 ? (
                     groupedItems.map(renderGroup)
                  ) : (
                     <div className="py-4 text-center text-gray-400 text-sm">{emptyMessage}</div>
                  )}
               </div>
            </div>
         );
      },
      [idKey, labelKey, disabled, maxHeight, expandedGroups, toggleGroupExpansion, extractPrefix]
   );

   const hasError = meta.error && (meta.touched || formik.submitCount > 0);

   return (
      <div className="flex flex-col w-full space-y-3">
         {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

         <div className="flex flex-col sm:flex-row w-full gap-4 items-stretch">
            {/* Lista izquierda - Disponibles */}
            <TransferList
               title="Disponibles"
               items={disponibles}
               groupedItems={groupedDisponibles}
               checkedItems={leftChecked}
               onItemToggle={handleToggleLeft}
               onGroupToggle={handleToggleLeftGroup}
               searchValue={searchLeft}
               onSearchChange={setSearchLeft}
               emptyMessage="No hay elementos disponibles"
               isLeft={true}
            />

            {/* Controles de transferencia con Tooltips */}
            <div className="flex flex-row sm:flex-col items-center justify-center gap-2 px-2">
               <Tooltip content="Mover seleccionados">
                  <button
                     type="button"
                     onClick={moveRight}
                     disabled={leftChecked.length === 0 || disabled}
                     className="p-2 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none cursor-pointer"
                  >
                     <HiOutlineArrowRight size={20} />
                  </button>
               </Tooltip>

               <Tooltip content="Mover todos">
                  <button
                     type="button"
                     onClick={moveAllRight}
                     disabled={disponibles.length === 0 || disabled}
                     className="p-2 rounded-full bg-blue-400 text-white shadow-md hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none cursor-pointer"
                  >
                     <RiArrowRightWideLine size={20} />
                  </button>
               </Tooltip>

               <div className="w-8 h-px bg-gray-300 sm:w-px sm:h-4" />

               <Tooltip content="Remover seleccionados">
                  <button
                     type="button"
                     onClick={moveLeft}
                     disabled={rightChecked.length === 0 || disabled}
                     className="p-2 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none cursor-pointer"
                  >
                     <HiOutlineArrowLeft size={20} />
                  </button>
               </Tooltip>

               <Tooltip content="Remover todos">
                  <button
                     type="button"
                     onClick={moveAllLeft}
                     disabled={elegidos.length === 0 || disabled}
                     className="p-2 rounded-full bg-blue-400 text-white shadow-md hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none cursor-pointer"
                  >
                     <RiArrowLeftWideFill size={20} />
                  </button>
               </Tooltip>
            </div>

            {/* Lista derecha - Seleccionados */}
            <TransferList
               title="Seleccionados"
               items={elegidos}
               groupedItems={groupedElegidos}
               checkedItems={rightChecked}
               onItemToggle={handleToggleRight}
               onGroupToggle={handleToggleRightGroup}
               searchValue={searchRight}
               onSearchChange={setSearchRight}
               emptyMessage="No hay elementos seleccionados"
               isLeft={false}
            />
         </div>

         {/* Información de selección */}
         <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{leftChecked.length > 0 && `${leftChecked.length} seleccionados en disponibles`}</span>
            <span>{rightChecked.length > 0 && `${rightChecked.length} seleccionados en asignados`}</span>
         </div>

         {/* Mensaje de error */}
         {hasError && <span className="text-sm font-medium text-red-600 mt-1">{meta.error as string}</span>}
      </div>
   );
};

export default FTransferList;
