import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
};

export function CustomTab({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0].id);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="inline-flex w-full rounded-xl border border-gray-200 bg-gray-50 p-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-300
                ${
                  isActive
                    ? "bg-white shadow-md text-cyan-600 scale-105"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
            >
              {tab.icon && (
                <span className="inline-block mr-2 text-lg">{tab.icon}</span>
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content con animación */}
      <div className="mt-4 p-6 bg-white border border-gray-200 rounded-xl shadow-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {tabs.find((tab) => tab.id === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
