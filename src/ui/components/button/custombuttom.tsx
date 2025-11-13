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
        transform transition-all duration-300 hover:cursor-pointer
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

