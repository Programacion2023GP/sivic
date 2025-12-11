import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

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

   // Nuevas props para badges
   badge?: string | number | React.ReactNode | boolean;
   badgeColor?: "cyan" | "purple" | "pink" | "green" | "red" | "blue" | "yellow" | "slate" | "white" | "black" | "gray";
   badgeVariant?: "solid" | "outline" | "dot" | "pulse";
   badgePosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
   badgeClassName?: string;
   showBadge?: boolean;
   badgePortal?: boolean; // Nueva prop para habilitar portal
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
   loading = false,

   // Props de badge
   badge,
   badgeColor = "red",
   badgeVariant = "solid",
   badgePosition = "top-right",
   badgeClassName = "",
   showBadge = true,
   badgePortal = false // Por defecto sin portal
}) => {
   const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(null);
   const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
   const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

   // Refs y efectos para el portal
   useEffect(() => {
      if (!badgePortal || !buttonElement || !badge) return;

      // Obtener posición del botón
      const updateButtonRect = () => {
         if (buttonElement) {
            setButtonRect(buttonElement.getBoundingClientRect());
         }
      };

      // Crear contenedor para el portal
      const container = document.createElement("div");
      container.className = "custom-button-badge-portal";
      container.style.position = "fixed";
      container.style.zIndex = "9999";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);
      setPortalContainer(container);

      // Actualizar posición inicial
      updateButtonRect();

      // Configurar observer para cambios en el botón
      const observer = new ResizeObserver(updateButtonRect);
      observer.observe(buttonElement);

      // Escroll y resize listeners
      window.addEventListener("scroll", updateButtonRect, true);
      window.addEventListener("resize", updateButtonRect);

      return () => {
         observer.disconnect();
         window.removeEventListener("scroll", updateButtonRect, true);
         window.removeEventListener("resize", updateButtonRect);

         if (container && document.body.contains(container)) {
            document.body.removeChild(container);
         }
      };
   }, [badgePortal, buttonElement, badge]);

   // Tamaños mejorados
   const sizeClasses = {
      sm: "px-4 py-2 text-sm min-h-9",
      md: "px-6 py-3 text-base min-h-11",
      lg: "px-8 py-4 text-lg min-h-12",
      xl: "px-10 py-5 text-xl min-h-14"
   }[size];

   // Sistema de colores modernizado
   const colorVariants = {
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

   // Colores para badges - simplificado
   const badgeColorClasses = {
      cyan: "bg-cyan-500 text-white border-cyan-600",
      purple: "bg-purple-500 text-white border-purple-600",
      pink: "bg-pink-500 text-white border-pink-600",
      green: "bg-emerald-500 text-white border-emerald-600",
      red: "bg-red-500 text-white border-red-600",
      blue: "bg-blue-500 text-white border-blue-600",
      yellow: "bg-amber-400 text-gray-800 border-amber-500",
      slate: "bg-slate-600 text-white border-slate-700",
      white: "bg-white text-gray-800 border-gray-200",
      black: "bg-gray-900 text-white border-black",
      gray: "bg-gray-500 text-white border-gray-600"
   };

   // Tamaños de badge según el tamaño del botón
   const badgeSizeClasses = {
      sm: "min-w-[18px] h-[18px] text-[10px] px-1",
      md: "min-w-[20px] h-[20px] text-xs px-1",
      lg: "min-w-[22px] h-[22px] text-sm px-1.5",
      xl: "min-w-[24px] h-[24px] text-base px-1.5"
   }[size];

   // Tamaños de dot según el tamaño del botón
   const dotSizeClasses = {
      sm: "w-2 h-2",
      md: "w-2.5 h-2.5",
      lg: "w-3 h-3",
      xl: "w-3.5 h-3.5"
   }[size];

   const c = colorVariants[color];

   // Estilos base modernizados
   const baseClasses = `
    font-semibold rounded-xl shadow-md
    flex items-center justify-center
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-3 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    relative group
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
         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
   );

   // Renderizar badge normal (sin portal)
   const renderNormalBadge = () => {
      if (!showBadge || badge === undefined || badge === null || badge === false) return null;

      const badgePositionClasses = {
         "top-right": "top-[-4px] right-[-4px]",
         "top-left": "top-[-4px] left-[-4px]",
         "bottom-right": "bottom-[-4px] right-[-4px]",
         "bottom-left": "bottom-[-4px] left-[-4px]"
      }[badgePosition];

      // Para badge tipo "dot" - solo muestra un punto
      if (badgeVariant === "dot") {
         return (
            <span className={`absolute ${badgePositionClasses} ${badgeClassName} z-50`} aria-label="Notification">
               <span className={`block ${dotSizeClasses} rounded-full ${badgeColorClasses[badgeColor].split(" ")[0]}`} />
            </span>
         );
      }

      // Para badge tipo "pulse" - punto con animación de pulso
      if (badgeVariant === "pulse") {
         return (
            <span className={`absolute ${badgePositionClasses} ${badgeClassName} z-50`} aria-label="Notification">
               <span className={`block ${dotSizeClasses} rounded-full ${badgeColorClasses[badgeColor].split(" ")[0]} animate-pulse`} />
            </span>
         );
      }

      // Para badge tipo "solid" u "outline" con contenido
      if (typeof badge === "string" || typeof badge === "number" || badge === true) {
         const isBoolean = badge === true;
         const isNumber = typeof badge === "number";
         let badgeContent = badge;

         if (isBoolean) {
            badgeContent = "";
         } else if (isNumber && Number(badge) > 99) {
            badgeContent = "99+";
         }

         const outlineClass =
            badgeVariant === "outline" ? "bg-transparent border" : `${badgeColorClasses[badgeColor].split(" ")[0]} ${badgeColorClasses[badgeColor].split(" ")[1]}`;

         const borderClass =
            badgeVariant === "outline" ? badgeColorClasses[badgeColor].split(" ")[2] : badgeColorClasses[badgeColor].split(" ")[2] || "border-transparent";

         return (
            <span
               className={`
                  absolute ${badgePositionClasses} ${badgeClassName}
                  z-50 flex items-center justify-center
                  ${badgeSizeClasses}
                  ${outlineClass}
                  ${borderClass}
                  rounded-full font-bold border shadow-lg
                  ${isNumber && Number(badge) > 99 ? "px-1" : ""}
               `}
               title={isBoolean ? "" : badge.toString()}
            >
               {badgeContent}
            </span>
         );
      }

      // Si es un ReactNode personalizado
      return <div className={`absolute ${badgePositionClasses} z-50 ${badgeClassName}`}>{badge}</div>;
   };

   // Renderizar badge con portal
   const renderPortalBadge = () => {
      if (!portalContainer || !buttonRect || !badge) return null;

      // Calcular posición basada en badgePosition
      let top = 0;
      let left = 0;

      switch (badgePosition) {
         case "top-right":
            top = buttonRect.top - 4;
            left = buttonRect.right - 4;
            break;
         case "top-left":
            top = buttonRect.top - 4;
            left = buttonRect.left - 4;
            break;
         case "bottom-right":
            top = buttonRect.bottom - 4;
            left = buttonRect.right - 4;
            break;
         case "bottom-left":
            top = buttonRect.bottom - 4;
            left = buttonRect.left - 4;
            break;
      }

      // Para badge tipo "dot"
      if (badgeVariant === "dot") {
         return ReactDOM.createPortal(
            <div
               style={{
                  position: "fixed",
                  top: `${top}px`,
                  left: `${left}px`,
                  zIndex: 9999,
                  pointerEvents: "none"
               }}
               className={badgeClassName}
            >
               <span className={`block ${dotSizeClasses} rounded-full ${badgeColorClasses[badgeColor].split(" ")[0]}`} />
            </div>,
            portalContainer
         );
      }

      // Para badge tipo "pulse"
      if (badgeVariant === "pulse") {
         return ReactDOM.createPortal(
            <div
               style={{
                  position: "fixed",
                  top: `${top}px`,
                  left: `${left}px`,
                  zIndex: 9999,
                  pointerEvents: "none"
               }}
               className={badgeClassName}
            >
               <span className={`block ${dotSizeClasses} rounded-full ${badgeColorClasses[badgeColor].split(" ")[0]} animate-pulse`} />
            </div>,
            portalContainer
         );
      }

      // Para badge tipo "solid" u "outline" con contenido
      if (typeof badge === "string" || typeof badge === "number" || badge === true) {
         const isBoolean = badge === true;
         const isNumber = typeof badge === "number";
         let badgeContent = badge;

         if (isBoolean) {
            badgeContent = "";
         } else if (isNumber && Number(badge) > 99) {
            badgeContent = "99+";
         }

         const outlineClass =
            badgeVariant === "outline" ? "bg-transparent border" : `${badgeColorClasses[badgeColor].split(" ")[0]} ${badgeColorClasses[badgeColor].split(" ")[1]}`;

         const borderClass =
            badgeVariant === "outline" ? badgeColorClasses[badgeColor].split(" ")[2] : badgeColorClasses[badgeColor].split(" ")[2] || "border-transparent";

         return ReactDOM.createPortal(
            <div
               style={{
                  position: "fixed",
                  top: `${top}px`,
                  left: `${left}px`,
                  zIndex: 9999,
                  pointerEvents: "none"
               }}
               className={badgeClassName}
            >
               <span
                  className={`
                     flex items-center justify-center
                     ${badgeSizeClasses}
                     ${outlineClass}
                     ${borderClass}
                     rounded-full font-bold border shadow-lg
                     ${isNumber && Number(badge) > 99 ? "px-1" : ""}
                  `}
                  title={isBoolean ? "" : badge.toString()}
               >
                  {badgeContent}
               </span>
            </div>,
            portalContainer
         );
      }

      // Si es un ReactNode personalizado
      return ReactDOM.createPortal(
         <div
            style={{
               position: "fixed",
               top: `${top}px`,
               left: `${left}px`,
               zIndex: 9999,
               pointerEvents: "none"
            }}
            className={badgeClassName}
         >
            {badge}
         </div>,
         portalContainer
      );
   };

   return (
      <>
         <button
            ref={setButtonElement}
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

            {/* Badge normal (sin portal) */}
            {!badgePortal && renderNormalBadge()}

            {/* Contenido */}
            {loading && <LoadingSpinner />}

            <span className={`flex items-center justify-center gap-2 ${loading ? "opacity-0" : "opacity-100"} transition-opacity relative z-10`}>
               {icon && iconPosition === "left" && <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>}

               {children && <span className="relative z-10 whitespace-nowrap">{children}</span>}

               {icon && iconPosition === "right" && <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>}
            </span>
         </button>

         {/* Badge con portal */}
         {badgePortal && renderPortalBadge()}
      </>
   );
};
