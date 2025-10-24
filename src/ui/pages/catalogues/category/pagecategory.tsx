import { memo, useEffect, useState } from "react";
import useCategoryStore from "../../../../store/category/categorys.store";
import { CategoryApi } from "../../../../infrastructure/category/category.infrastructure";
import CompositePage from "../../../components/compositecustoms/compositePage";
import { CustomPaginate } from "../../../components/paginate/CustomPaginate";
import CustomCard from "../../../components/card/customcard";
import CustomTable from "../../../components/table/customtable";
import { FaTable, FaThLarge } from "react-icons/fa";

const PageCategory = () => {
  const { categorys, fetchCategorys, loading } = useCategoryStore()
  const api = new CategoryApi()
  const [direction, setDirection] = useState<"row" | "column">("column")

  const handleToggle = () => {
    setDirection(direction == "column" ? "row" : "column");
  };
  useEffect(() => {
    fetchCategorys(api)
  }, [])
     
  return (<>
    <div className="flex w-full flex-row">
      <button
        onClick={handleToggle}
        className="p-4 mb-2 ml-auto hover:cursor-pointer rounded-lg border border-gray-300 hover:bg-gray-100 transition"
      >
        {direction == "row" ? (
          <FaThLarge className="text-xl" /> // Icono de cards
        ) : (
          <FaTable className="text-xl" /> // Icono de tabla
        )}
      </button>
    </div>
    <CompositePage  tableDirection="der" table={() => (
      <>
        {direction == "row" ? <CustomPaginate
          direction="row"
          data={categorys}

          itemsPerPage={24}
          loading={loading}
          searchFields={["name", "description"]}
          renderItem={(category) => (
            <CustomCard
              key={category.id}
              title={category.name}
              subtitle={category.description}

          
            />
          )}
        /> : <CustomTable data={categorys} paginate={[10, 25, 50]} loading={loading} columns={[{
          field: "name", headerName: "nombre"
        }, { field: "description", headerName: "Descripción" }]}  />}
      </>
    )} />
  </>)
}; export default memo(PageCategory)
