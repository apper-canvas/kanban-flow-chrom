import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = React.forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg focus:ring-primary/50",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50",
    ghost: "text-gray-600 hover:text-primary hover:bg-primary/10 focus:ring-primary/50",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:shadow-lg focus:ring-error/50",
    success: "bg-gradient-to-r from-success to-green-600 text-white hover:shadow-lg focus:ring-success/50",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const IconComponent = icon && (
    <ApperIcon 
      name={icon} 
      size={size === "sm" ? 14 : size === "lg" || size === "xl" ? 18 : 16}
      className={cn(
        iconPosition === "left" && children && "mr-2",
        iconPosition === "right" && children && "ml-2"
      )}
    />
  );

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        loading && "cursor-wait",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && IconComponent}
          {children}
          {icon && iconPosition === "right" && IconComponent}
        </>
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;