import React, { useState, useEffect } from "react";
import { useField, useFormikContext } from "formik";
import {
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineBookmark,
} from "react-icons/hi2";
import { RiArrowRightWideLine } from "react-icons/ri";
import { RiArrowLeftWideFill } from "react-icons/ri";

type TransferListProps<T> = {
  name: string;
  label?: string;
  error?: string | null;
  departamentos: T[];
  idKey: keyof T;
  labelKey: keyof T;
  disabled?: boolean;
};

const FTransferList = <T extends Record<string, any>>({
  name,
  label,
  error,
  departamentos,
  idKey,
  labelKey,
  disabled = false,
}: TransferListProps<T>) => {
  const formik = useFormikContext<any>();
  const [field, meta] = useField<number[]>({ name });

  const [selected, setSelected] = useState<number[]>(field.value || []);
  const [leftChecked, setLeftChecked] = useState<number[]>([]);
  const [rightChecked, setRightChecked] = useState<number[]>([]);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");

  useEffect(() => {
    if (Array.isArray(field.value)) {
      setSelected(field.value);
    }
  }, [field.value]);

  const updateSelected = (newSelected: number[]) => {
    setSelected(newSelected);
    formik.setFieldValue(name, newSelected);
  };

  const disponibles = departamentos.filter(
    (d) =>
      !selected.includes(d[idKey]) &&
      String(d[labelKey]).toLowerCase().includes(searchLeft.toLowerCase())
  );

  const elegidos = departamentos.filter(
    (d) =>
      selected.includes(d[idKey]) &&
      String(d[labelKey]).toLowerCase().includes(searchRight.toLowerCase())
  );

  const moveRight = () => {
    updateSelected([...selected, ...leftChecked]);
    setLeftChecked([]);
  };

  const moveAllRight = () => {
    updateSelected([...selected, ...disponibles.map((d) => Number(d[idKey]))]);
    setLeftChecked([]);
  };

  const moveLeft = () => {
    updateSelected(selected.filter((id) => !rightChecked.includes(id)));
    setRightChecked([]);
  };

  const moveAllLeft = () => {
    updateSelected(
      selected.filter(
        (id) =>
          !elegidos.map((d) => Number(d[idKey])).includes(id)
      )
    );
    setRightChecked([]);
  };

  const renderList = (
    title: string,
    items: T[],
    checked: number[],
    setChecked: React.Dispatch<React.SetStateAction<number[]>>,
    searchValue: string,
    setSearch: React.Dispatch<React.SetStateAction<string>>
  ) => (
    <div className="flex flex-col w-full sm:w-1/2 p-3 bg-white border rounded-2xl shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-cyan-700">{title}</h2>
      </div>
      <input
        type="search"
        placeholder="Buscar..."
        className="w-full px-3 py-2 mb-3 text-sm border rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none"
        value={searchValue}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
      />
      <ul className="overflow-y-auto text-sm max-h-80 pr-1 space-y-1 scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-gray-100">
        {items.map((d) => {
          const id = Number(d[idKey]);
          const isChecked = checked.includes(id);
          return (
            <li
              key={id}
              onClick={() => {
                if (disabled) return;
                if (isChecked) {
                  setChecked(checked.filter((cid) => cid !== id));
                } else {
                  setChecked([...checked, id]);
                }
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                isChecked
                  ? "bg-cyan-50 border border-cyan-400"
                  : "hover:bg-gray-50 border border-transparent"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span className="truncate">{String(d[labelKey])}</span>
              {isChecked ? (
                <HiOutlineCheckCircle className="text-cyan-600" size={22} />
              ) : (
                <HiOutlineBookmark className="text-gray-400" size={20} />
              )}
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="py-3 text-center text-gray-400">Sin resultados</li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="mb-2 text-sm font-semibold text-gray-600">
          {label}
        </label>
      )}
      <div className="flex flex-col sm:flex-row w-full gap-6">
        {/* Lista izquierda */}
        {renderList(
          "Departamentos disponibles",
          disponibles,
          leftChecked,
          setLeftChecked,
          searchLeft,
          setSearchLeft
        )}

        {/* Botones */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={moveRight}
            disabled={leftChecked.length === 0 || disabled}
            className="p-2 rounded-full bg-cyan-500 text-white shadow-md hover:bg-cyan-600 transition disabled:opacity-40"
          >
            <HiOutlineArrowRight size={22} />
          </button>
          <button
            type="button"
            onClick={moveAllRight}
            disabled={disponibles.length === 0 || disabled}
            className="p-2 rounded-full bg-cyan-500 text-white shadow-md hover:bg-cyan-600 transition disabled:opacity-40"
          >
            <RiArrowRightWideLine size={22} />
          </button>
          <button
            type="button"
            onClick={moveLeft}
            disabled={rightChecked.length === 0 || disabled}
            className="p-2 rounded-full bg-cyan-500 text-white shadow-md hover:bg-cyan-600 transition disabled:opacity-40"
          >
            <HiOutlineArrowLeft size={22} />
          </button>
          <button
            type="button"
            onClick={moveAllLeft}
            disabled={elegidos.length === 0 || disabled}
            className="p-2 rounded-full bg-cyan-500 text-white shadow-md hover:bg-cyan-600 transition disabled:opacity-40"
          >
            <RiArrowLeftWideFill size={22} />
          </button>
        </div>

        {/* Lista derecha */}
        {renderList(
          "Departamentos asignados",
          elegidos,
          rightChecked,
          setRightChecked,
          searchRight,
          setSearchRight
        )}
      </div>

      {meta.error && (meta.touched || formik.status) && (
        <span className="text-sm font-semibold text-red-600 mt-2">
          {meta.error as string}
        </span>
      )}
    </div>
  );
};

export default FTransferList;
