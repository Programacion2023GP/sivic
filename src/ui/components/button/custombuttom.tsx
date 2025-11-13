import React from "react";

type ButtonProps = {
   onClick?: () => void;
   children?: React.ReactNode;
   variant?: "primary" | "secondary" | "gradient" | "outline" | "icon";
   color?: "cyan" | "purple" | "pink" | "green" | "red" | "blue" | "yellow";
   size?: "sm" | "md" | "lg";
   type?: "button" | "submit";

   icon?: React.ReactNode;
   iconPosition?: "left" | "right";
   className?: string;
};

export const CustomButton: React.FC<ButtonProps> = ({
  onClick,
  children,
  type ="submit",
  variant = "primary",
  color = "cyan",
  size = "md",
  icon,
  iconPosition = "left",
  className = "",
}) => {
  // Tamaños
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }[size];

  // Colores fijos (sin interpolación dinámica)
  const colorVariants: Record<
    string,
    {
      primary: string;
      hover: string;
      gradientFrom: string;
      gradientTo: string;
      border: string;
      text: string;
    }
  > = {
    cyan: {
      primary: "bg-cyan-500",
      hover: "hover:bg-cyan-600",
      gradientFrom: "from-cyan-500",
      gradientTo: "to-cyan-600",
      border: "border-cyan-500",
      text: "text-cyan-500",
    },
    purple: {
      primary: "bg-purple-500",
      hover: "hover:bg-purple-600",
      gradientFrom: "from-purple-500",
      gradientTo: "to-purple-600",
      border: "border-purple-500",
      text: "text-purple-500",
    },
    pink: {
      primary: "bg-pink-500",
      hover: "hover:bg-pink-600",
      gradientFrom: "from-pink-500",
      gradientTo: "to-pink-600",
      border: "border-pink-500",
      text: "text-pink-500",
    },
    green: {
      primary: "bg-green-500",
      hover: "hover:bg-green-600",
      gradientFrom: "from-green-500",
      gradientTo: "to-green-600",
      border: "border-green-500",
      text: "text-green-500",
    },
    red: {
      primary: "bg-red-500",
      hover: "hover:bg-red-600",
      gradientFrom: "from-red-500",
      gradientTo: "to-red-600",
      border: "border-red-500",
      text: "text-red-500",
    },
    blue: {
      primary: "bg-blue-500",
      hover: "hover:bg-blue-600",
      gradientFrom: "from-blue-500",
      gradientTo: "to-blue-600",
      border: "border-blue-500",
      text: "text-blue-500",
    },
    yellow: {
      primary: "bg-yellow-400",
      hover: "hover:bg-yellow-500",
      gradientFrom: "from-yellow-400",
      gradientTo: "to-yellow-500",
      border: "border-yellow-400",
      text: "text-yellow-500",
    },
  };

  const c = colorVariants[color];

  // Estilos base
  const baseClasses =
    "font-semibold rounded-lg shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Variantes de estilo
  const variantClasses = {
    primary: `${c.primary} text-white ${c.hover}`,
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100",
    gradient: `bg-gradient-to-r ${c.gradientFrom} ${c.gradientTo} text-white hover:${c.gradientFrom}`,
    outline: `border-2 ${c.border} ${c.text} relative overflow-hidden
      before:absolute before:top-0 before:left-0 before:w-0 before:h-full before:${c.primary.replace(
        "bg-",
        "bg-"
      )} before:transition-all before:duration-300 hover:before:w-full hover:text-white`,
    icon: `w-12 h-12 rounded-full ${c.primary} text-white ${c.hover}`,
  }[variant];

  return (
    <button
    type={type}
      onClick={onClick}
      className={`mx-1 hover:cursor-pointer ${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {children && <span className={icon ? "relative z-10" : ""}>{children}</span>}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </button>
  );
};
