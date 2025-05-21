
import * as React from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

export interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function CustomBadge({ 
  className, 
  variant = "default", 
  ...props 
}: CustomBadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-input",
    success: "bg-green-500 text-white hover:bg-green-600",
    warning: "bg-amber-500 text-black hover:bg-amber-600",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantClasses[variant],
        className
      )} 
      {...props} 
    />
  )
}

export { CustomBadge }
