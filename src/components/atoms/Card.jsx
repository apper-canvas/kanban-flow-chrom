import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  children, 
  className,
  padding = "md",
  shadow = "md",
  hover = false,
  ...props 
}, ref) => {
  const baseStyles = "bg-white rounded-xl border border-gray-200 transition-all duration-200";
  
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  const shadows = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const hoverStyles = hover ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer" : "";

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        paddings[padding],
        shadows[shadow],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;