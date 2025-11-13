import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = {
   id: string;
   label: string;
   icon?: ReactNode;
   content: ReactNode;
   disabled?: boolean;
   badge?: number | string;
};

type TabsProps = {
   tabs: Tab[];
   defaultTab?: string;
   onTabChange?: (tabId: string) => void;
   variant?: "default" | "pills" | "underline";
   size?: "sm" | "md" | "lg";
   className?: string;
};

export function CustomTab({ tabs, defaultTab, onTabChange, variant = "default", size = "md", className = "" }: TabsProps) {
   const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id);

   // SOLUCIÓN: Usar un estado separado para el tab controlado externamente
   useEffect(() => {
      console.log("🚀 ~ CustomTab ~ defaultTab cambiado externamente:", defaultTab);
      if (defaultTab) {
         setActiveTab(defaultTab);
      }
   }, [defaultTab]); // Solo dependemos de defaultTab

   const handleTabChange = (tabId: string) => {
      setActiveTab(tabId);
      onTabChange?.(tabId);
   };

   // Configuración de tamaños
   const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
   };

   // Configuración de variantes con tu colorimetría
   const variantClasses = {
      default: {
         container: "rounded-xl border border-[#B8B6AF] bg-[#F8F8F8] p-1 shadow-sm",
         active: "bg-white shadow-md text-[#9B2242] scale-105 border border-[#651D32]",
         inactive: "text-[#474C55] hover:text-[#130D0E] hover:bg-[#E8E8E8]"
      },
      pills: {
         container: "rounded-full border border-[#B8B6AF] bg-[#F8F8F8] p-1 shadow-sm",
         active: "bg-[#9B2242] text-white shadow-md scale-105 border border-[#651D32]",
         inactive: "text-[#474C55] hover:text-[#130D0E] hover:bg-[#E8E8E8]"
      },
      underline: {
         container: "border-b border-[#B8B6AF] bg-transparent p-0 gap-0",
         active: "text-[#9B2242] border-b-2 border-[#9B2242] font-semibold",
         inactive: "text-[#474C55] hover:text-[#130D0E] border-b-2 border-transparent"
      }
   };

   const currentVariant = variantClasses[variant];

   return (
      <div className={`w-full font-avenir ${className}`}>
         {/* Header */}
         <div className={`inline-flex w-full ${currentVariant.container}`}>
            {tabs.map((tab) => {
               const isActive = activeTab === tab.id;
               return (
                  <button
                     key={tab.id}
                     onClick={() => !tab.disabled && handleTabChange(tab.id)}
                     disabled={tab.disabled}
                     className={`flex-1 flex items-center justify-center relative transition-all duration-300 font-medium rounded-lg cursor-pointer
                        ${sizeClasses[size]}
                        ${isActive ? currentVariant.active : currentVariant.inactive}
                        ${tab.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
                        ${variant === "underline" ? "rounded-none" : ""}
                     `}
                  >
                     {tab.icon && <span className="inline-block mr-2">{tab.icon}</span>}
                     <span className="font-avenir">{tab.label}</span>

                     {/* Badge */}
                     {tab.badge && (
                        <span
                           className={`ml-2 px-1.5 py-0.5 text-xs rounded-full font-avenir ${
                              isActive && variant !== "underline" ? "bg-[#651D32] text-white" : "bg-[#727372] text-white"
                           }`}
                        >
                           {tab.badge}
                        </span>
                     )}
                  </button>
               );
            })}
         </div>

         {/* Content con animación */}
         <div className="mt-4 p-6 bg-white border border-[#B8B6AF] rounded-xl shadow-md">
            <AnimatePresence mode="wait">
               <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="font-avenir"
               >
                  {tabs.find((tab) => tab.id === activeTab)?.content}
               </motion.div>
            </AnimatePresence>
         </div>
      </div>
   );
}
