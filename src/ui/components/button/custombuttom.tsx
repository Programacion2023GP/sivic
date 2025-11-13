import React from "react";


type ButtonProps = {
   onClick?: () => void;
   children?: React.ReactNode;
   variant?: "primary" | "secondary" | "gradient" | "outline" | "icon" | "glass" | "neon";
   color?: "cyan" | "purple" | "pink" | "green" | "red" | "blue" | "yellow" | "slate";
   size?: "sm" | "md" | "lg" | "xl";
   type?: "button" | "submit" | "reset";
   icon?: React.ReactNode;
   iconPosition?: "left" | "right";
   className?: string;
   disabled?: boolean;
   loading?: boolean;
};

export const CustomButton: React.FC<ButtonProps> = ({
   onClick,
   children,
   type = "button",
   variant = "primary",
   color = "cyan",
   size = "md",
   icon,
   iconPosition = "left",
   className = "",
   disabled = false,
   loading = false
}) => {
   // Tamaños mejorados
   const sizeClasses = {
      sm: "px-4 py-2 text-sm min-h-9",
      md: "px-6 py-3 text-base min-h-11",
      lg: "px-8 py-4 text-lg min-h-12",
      xl: "px-10 py-5 text-xl min-h-14"
   }[size];

   // Sistema de colores modernizado
   const colorVariants: Record<
      string,
      {
         primary: string;
         hover: string;
         active: string;
         gradientFrom: string;
         gradientTo: string;
         border: string;
         text: string;
         glow: string;
         glass: string;
      }
   > = {
      cyan: {
         primary: "bg-cyan-500",
         hover: "hover:bg-cyan-600 hover:shadow-lg hover:-translate-y-0.5",
         active: "active:bg-cyan-700 active:translate-y-0",
         gradientFrom: "from-cyan-500",
         gradientTo: "to-blue-500",
         border: "border-cyan-400",
         text: "text-cyan-600",
         glow: "shadow-cyan-500/25",
         glass: "bg-cyan-500/10 backdrop-blur-sm border-cyan-400/20"
      },
      purple: {
         primary: "bg-purple-500",
         hover: "hover:bg-purple-600 hover:shadow-lg hover:-translate-y-0.5",
         active: "active:bg-purple-700 active:translate-y-0",
         gradientFrom: "from-purple-500",
         gradientTo: "to-indigo-500",
         border: "border-purple-400",
         text: "text-purple-600",
         glow: "shadow-purple-500/25",
         glass: "bg-purple-500/10 backdrop-blur-sm border-purple-400/20"
      },
      pink: {
         primary: "bg-pink-500",
         hover: "hover:bg-pink-600 hover:shadow-lg hover:-translate-y-0.5",
         active: "active:bg-pink-700 active:translate-y-0",
         gradientFrom: "from-pink-500",
         gradientTo: "to-rose-500",
         border: "border-pink-400",
         text: "text-pink-600",
         glow: "shadow-pink-500/25",
         glass: "bg-pink-500/10 backdrop-blur-sm border-pink-400/20"
      },
      green: {
         primary: "bg-emerald-500",
         hover: "hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5",
         active: "active:bg-emerald-700 active:translate-y-0",
         gradientFrom: "from-emerald-500",
         gradientTo: "to-green-500",
         border: "border-emerald-400",
         text: "text-emerald-600",
         glow: "shadow-emerald-500/25",
         glass: "bg-emerald-500/10 backdrop-blur-sm border-emerald-400/20"
      },
      red: {
         primary: "bg-red-500",
         hover: "hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5",
         active: "active:bg-red-700 active:translate-y-0",
         gradientFrom: "from-red-500",
         gradientTo: "to-orange-500",
         border: "border-red-400",
         text: "text-red-600",
         glow: "shadow-red-500/25",
         glass: "bg-red-500/10 backdrop-blur-sm border-red-400/20"
      },
      blue: {
         primary: "bg-blue-500",
         hover: "hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5",
         active: "active:bg-blue-700 active:translate-y-0",
         gradientFrom: "from-blue-500",
         gradientTo: "to-sky-500",
         border: "border-blue-400",
         text: "text-blue-600",
         glow: "shadow-blue-500/25",
         glass: "bg-blue-500/10 backdrop-blur-sm border-blue-400/20"
      },
      yellow: {
         primary: "bg-amber-400",
         hover: "hover:bg-amber-500 hover:shadow-lg hover:-translate-y-0.5",
         active: "active:bg-amber-600 active:translate-y-0",
         gradientFrom: "from-amber-400",
         gradientTo: "to-yellow-400",
         border: "border-amber-400",
         text: "text-amber-600",
         glow: "shadow-amber-500/25",
         glass: "bg-amber-500/10 backdrop-blur-sm border-amber-400/20"
      },
      slate: {
         primary: "bg-slate-600",
         hover: "hover:bg-slate-700 hover:shadow-lg hover:-translate-y-0.5",
         active: "active:bg-slate-800 active:translate-y-0",
         gradientFrom: "from-slate-600",
         gradientTo: "to-slate-500",
         border: "border-slate-400",
         text: "text-slate-600",
         glow: "shadow-slate-500/25",
         glass: "bg-slate-500/10 backdrop-blur-sm border-slate-400/20"
      }
   };

   const c = colorVariants[color];

   // Estilos base modernizados
   const baseClasses = `
    font-semibold rounded-xl shadow-md
    flex items-center justify-center
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-3 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    relative overflow-hidden group
  `;

   // Variantes de estilo modernizadas
   const variantClasses = {
      primary: `
      ${c.primary} text-white ${c.hover} ${c.active}
      shadow-lg ${c.glow} focus:ring-${color}-300
    `,
      secondary: `
      bg-white text-slate-700 border border-slate-200
      hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg
      active:bg-slate-100 focus:ring-slate-300
      shadow-sm
    `,
      gradient: `
      bg-gradient-to-r ${c.gradientFrom} ${c.gradientTo} text-white
      hover:shadow-xl hover:-translate-y-0.5 ${c.glow}
      active:translate-y-0 focus:ring-${color}-300
      relative after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/10 after:to-transparent after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100
    `,
      outline: `
      border-2 ${c.border} ${c.text} bg-transparent
      hover:bg-${color}-50 hover:${c.text} hover:border-${color}-500
      active:bg-${color}-100 focus:ring-${color}-300
      transition-colors duration-200
    `,
      icon: `
      w-12 h-12 rounded-full ${c.primary} text-white
      hover:shadow-lg hover:-translate-y-0.5 ${c.hover}
      active:translate-y-0 focus:ring-${color}-300
      shadow-md ${c.glow}
    `,
      glass: `
      ${c.glass} ${c.text} border
      backdrop-filter backdrop-blur-sm
      hover:shadow-lg hover:-translate-y-0.5 hover:bg-${color}-500/20
      active:translate-y-0 focus:ring-${color}-300
      shadow-sm
    `,
      neon: `
      bg-${color}-500/10 border border-${color}-400/50 ${c.text}
      shadow-lg ${c.glow}
      hover:shadow-xl hover:-translate-y-0.5 hover:bg-${color}-500/20
      active:translate-y-0 focus:ring-${color}-300
      relative after:absolute after:inset-0 after:bg-${color}-400/10 after:opacity-0 after:transition-opacity hover:after:opacity-100
    `
   }[variant];

   // Spinner de carga
   const LoadingSpinner = () => (
      <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
         <div className={`w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin`} />
      </div>
   );

   return (
      <button
         type={type}
         onClick={onClick}
         disabled={disabled || loading}
         className={`
        ${baseClasses}
        ${sizeClasses}
        ${variantClasses}
        ${className}
        transform transition-all duration-300
      `}
      >
         {/* Efecto de ripple */}
         <span className="absolute inset-0 overflow-hidden rounded-xl">
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 transform scale-0 group-hover:scale-100" />
         </span>

         {/* Contenido */}
         {loading && <LoadingSpinner />}

         <span className={`flex items-center justify-center gap-2 ${loading ? "opacity-0" : "opacity-100"} transition-opacity`}>
            {icon && iconPosition === "left" && <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>}

            {children && <span className="relative z-10 whitespace-nowrap">{children}</span>}

            {icon && iconPosition === "right" && <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>}
         </span>
      </button>
   );
};

import { motion, AnimatePresence } from "framer-motion";
type ButtonPropsMovil = {
   onClick?: () => void;
   children?: React.ReactNode;
   variant?: "filled" | "outlined" | "text" | "elevated" | "tonal" | "icon";
   color?: "primary" | "secondary" | "success" | "warning" | "error" | "surface";
   size?: "sm" | "md" | "lg";
   type?: "button" | "submit" | "reset";
   disabled?: boolean;
   loading?: boolean;
   fullWidth?: boolean;
   icon?: React.ReactNode;
   iconPosition?: "left" | "right" | "only";
   className?: string;
   elevation?: 0 | 1 | 2 | 3 | 4 | 5|6|7|8;
};

export const CustomButtonMovil: React.FC<ButtonPropsMovil> = ({
   onClick,
   children,
   type = "button",
   variant = "filled",
   color = "primary",
   size = "md",
   disabled = false,
   loading = false,
   fullWidth = false,
   icon,
   iconPosition = "left",
   elevation = 1,
   className = ""
}) => {
   // Sistema de tamaños Flutter auténtico
   const sizeClasses = {
      sm: "h-9 px-4 text-sm rounded-[20px] min-w-[64px]",
      md: "h-12 px-6 text-base rounded-[28px] min-w-[88px]", // Flutter default
      lg: "h-14 px-8 text-lg rounded-[32px] min-w-[96px]"
   }[size];

   // Sistema de elevación Flutter (shadows)
   const elevationShadows = {
      0: "shadow-none",
      1: "shadow-sm", // elevation: 1 in Flutter
      2: "shadow", // elevation: 2 in Flutter
      3: "shadow-md", // elevation: 3 in Flutter
      4: "shadow-lg", // elevation: 4 in Flutter
      5: "shadow-xl" // elevation: 5 in Flutter
   }[elevation];

   // Colores Material Design 3 (Flutter Colors)
   const colorSchemes = {
      primary: {
         filled: `bg-blue-500 text-white shadow-sm hover:bg-blue-600 active:bg-blue-700`,
         outlined: `border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-50 active:bg-blue-100`,
         text: `text-blue-500 bg-transparent hover:bg-blue-50 active:bg-blue-100`,
         elevated: `bg-white text-blue-500 shadow-sm hover:bg-blue-50 active:bg-blue-100`,
         tonal: `bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-blue-300`,
         icon: `text-blue-500 bg-transparent hover:bg-blue-50 active:bg-blue-100`
      },
      secondary: {
         filled: `bg-purple-500 text-white shadow-sm hover:bg-purple-600 active:bg-purple-700`,
         outlined: `border border-purple-500 text-purple-500 bg-transparent hover:bg-purple-50 active:bg-purple-100`,
         text: `text-purple-500 bg-transparent hover:bg-purple-50 active:bg-purple-100`,
         elevated: `bg-white text-purple-500 shadow-sm hover:bg-purple-50 active:bg-purple-100`,
         tonal: `bg-purple-100 text-purple-800 hover:bg-purple-200 active:bg-purple-300`,
         icon: `text-purple-500 bg-transparent hover:bg-purple-50 active:bg-purple-100`
      },
      success: {
         filled: `bg-green-500 text-white shadow-sm hover:bg-green-600 active:bg-green-700`,
         outlined: `border border-green-500 text-green-500 bg-transparent hover:bg-green-50 active:bg-green-100`,
         text: `text-green-500 bg-transparent hover:bg-green-50 active:bg-green-100`,
         elevated: `bg-white text-green-500 shadow-sm hover:bg-green-50 active:bg-green-100`,
         tonal: `bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300`,
         icon: `text-green-500 bg-transparent hover:bg-green-50 active:bg-green-100`
      },
      warning: {
         filled: `bg-orange-500 text-white shadow-sm hover:bg-orange-600 active:bg-orange-700`,
         outlined: `border border-orange-500 text-orange-500 bg-transparent hover:bg-orange-50 active:bg-orange-100`,
         text: `text-orange-500 bg-transparent hover:bg-orange-50 active:bg-orange-100`,
         elevated: `bg-white text-orange-500 shadow-sm hover:bg-orange-50 active:bg-orange-100`,
         tonal: `bg-orange-100 text-orange-800 hover:bg-orange-200 active:bg-orange-300`,
         icon: `text-orange-500 bg-transparent hover:bg-orange-50 active:bg-orange-100`
      },
      error: {
         filled: `bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700`,
         outlined: `border border-red-500 text-red-500 bg-transparent hover:bg-red-50 active:bg-red-100`,
         text: `text-red-500 bg-transparent hover:bg-red-50 active:bg-red-100`,
         elevated: `bg-white text-red-500 shadow-sm hover:bg-red-50 active:bg-red-100`,
         tonal: `bg-red-100 text-red-800 hover:bg-red-200 active:bg-red-300`,
         icon: `text-red-500 bg-transparent hover:bg-red-50 active:bg-red-100`
      },
      surface: {
         filled: `bg-gray-100 text-gray-800 shadow-sm hover:bg-gray-200 active:bg-gray-300`,
         outlined: `border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-50 active:bg-gray-100`,
         text: `text-gray-700 bg-transparent hover:bg-gray-50 active:bg-gray-100`,
         elevated: `bg-white text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100`,
         tonal: `bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300`,
         icon: `text-gray-600 bg-transparent hover:bg-gray-50 active:bg-gray-100`
      }
   };

   const isIconOnly = iconPosition === "only" || (!children && icon);

   const iconSizeClasses = {
      sm: "w-9 h-9 rounded-full min-w-9",
      md: "w-12 h-12 rounded-full min-w-12",
      lg: "w-14 h-14 rounded-full min-w-14"
   }[size];

   // Ripple effect como Flutter
   const [ripple, setRipple] = React.useState<{ x: number; y: number; size: number } | null>(null);

   const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      setRipple({ x, y, size });

      // Limpiar ripple después de la animación
      setTimeout(() => setRipple(null), 600);

      onClick?.();
   };

   // Spinner de carga Flutter-style
   const LoadingSpinner = () => (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="flex items-center justify-center">
         <div className={`rounded-full border-2 border-current border-t-transparent ${size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6"}`} />
      </motion.div>
   );

   const currentScheme = colorSchemes[color];
   const variantClass = currentScheme[variant];
   const hasElevation = ["filled", "elevated"].includes(variant);

   return (
      <motion.button
         type={type}
         onClick={handleClick}
         disabled={disabled || loading}
         whileTap={{
            scale: disabled || loading ? 1 : 0.98,
            transition: { duration: 0.1 }
         }}
         whileHover={
            !disabled && !loading
               ? {
                    y: -1,
                    transition: { duration: 0.2 }
                 }
               : {}
         }
         className={`
        relative
        inline-flex items-center justify-center
        font-medium transition-all duration-200
        overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-40 disabled:cursor-not-allowed
        active:brightness-95
        ${fullWidth ? "w-full" : ""}
        ${isIconOnly ? iconSizeClasses : sizeClasses}
        ${variantClass}
        ${hasElevation ? elevationShadows : ""}
        ${variant === "outlined" || variant === "text" || variant === "icon" ? "border" : ""}
        /* Ocultar en tablets y desktop (≥1024px) */
        lg:hidden
        ${className}
      `}
         style={{
            // Flutter-like styling
            fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif",
            letterSpacing: "0.25px"
         }}
      >
         {/* Ripple Effect como Flutter */}
         <AnimatePresence>
            {ripple && (
               <motion.span
                  initial={{ scale: 0, opacity: 0.3 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute rounded-full bg-white"
                  style={{
                     left: ripple.x,
                     top: ripple.y,
                     width: ripple.size,
                     height: ripple.size
                  }}
               />
            )}
         </AnimatePresence>

         {/* Estado de carga */}
         {loading ? (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
               <LoadingSpinner />
               {children && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     Cargando...
                  </motion.span>
               )}
            </motion.div>
         ) : (
            <motion.div className="flex items-center justify-center gap-2" layout>
               {/* Icono izquierdo */}
               {icon && iconPosition !== "right" && !isIconOnly && (
                  <motion.span
                     whileHover={{ scale: 1.1 }}
                     transition={{ type: "spring", stiffness: 400, damping: 10 }}
                     className={`
                flex-shrink-0
                ${children ? (iconPosition === "left" ? "mr-2" : "ml-2") : ""}
              `}
                  >
                     {icon}
                  </motion.span>
               )}

               {/* Contenido del botón */}
               {children && (
                  <motion.span layout className="relative whitespace-nowrap">
                     {children}
                  </motion.span>
               )}

               {/* Icono derecho */}
               {icon && iconPosition === "right" && !isIconOnly && (
                  <motion.span whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }} className="flex-shrink-0 ml-2">
                     {icon}
                  </motion.span>
               )}

               {/* Solo icono */}
               {isIconOnly && (
                  <motion.span whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                     {icon}
                  </motion.span>
               )}
            </motion.div>
         )}

         {/* Overlay de hover como Flutter */}
         {!disabled && !loading && <motion.div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 active:opacity-10" transition={{ duration: 0.15 }} />}
      </motion.button>
   );
};

// Floating Action Button (FAB) como Flutter - Solo móvil
export const FloatingActionButton: React.FC<{
   onClick?: () => void;
   icon: React.ReactNode;
   color?: "primary" | "secondary" | "surface" | "tertiary";
   size?: "small" | "normal" | "large";
   extended?: boolean;
   label?: string;
   className?: string;
}> = ({ onClick, icon, color = "primary", size = "normal", extended = false, label, className = "" }) => {
   // Para círculo perfecto, usar mismo width y height + rounded-full
   const sizeClasses = {
      small: "w-12 h-12",
      normal: "w-16 h-16",
      large: "w-24 h-24"
   }[size];

   const colorClasses = {
      primary: "bg-blue-500 text-white shadow-lg hover:bg-blue-600",
      secondary: "bg-purple-500 text-white shadow-lg hover:bg-purple-600",
      surface: "bg-white text-gray-700 shadow-lg hover:bg-gray-50",
      tertiary: "bg-gray-100 text-gray-800 shadow-lg hover:bg-gray-200"
   }[color];

   // Para extended, mantener el rounded pero más grande
   const extendedClasses = extended ? "px-6 h-14 rounded-[28px]" : "";

   return (
      <motion.button
         onClick={onClick}
         whileTap={{ scale: 0.9 }}
         whileHover={{ scale: 1.05, y: -2 }}
         className={`
        ${extended ? extendedClasses : `${sizeClasses} rounded-full`}
        ${colorClasses}
        flex items-center justify-center
        font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:brightness-95
        /* Ocultar en tablets y desktop (≥1024px) */
        lg:hidden
        ${className}
      `}
      >
         {extended && label ? (
            <div className="flex items-center gap-2">
               {icon}
               <span className="text-sm font-medium">{label}</span>
            </div>
         ) : (
            icon
         )}
      </motion.button>
   );
};

// Componente adicional para grupos de botones - Solo móvil
export const ButtonGroup: React.FC<{
   children: React.ReactNode;
   orientation?: "horizontal" | "vertical";
   className?: string;
}> = ({ children, orientation = "horizontal", className = "" }) => {
   return (
      <div
         className={`
      flex ${orientation === "horizontal" ? "flex-row space-x-2" : "flex-col space-y-2"}
      /* Ocultar en tablets y desktop (≥1024px) */
      lg:hidden
      ${className}
    `}
      >
         {children}
      </div>
   );
};
