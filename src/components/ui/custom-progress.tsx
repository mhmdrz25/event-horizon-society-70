
import * as React from "react"
import { cn } from "@/lib/utils"

export interface CustomProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  color?: string;
}

const CustomProgress = React.forwardRef<HTMLDivElement, CustomProgressProps>(
  ({ className, value = 0, max = 100, color, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    return (
      <div
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
      >
        <div
          className={cn("h-full transition-all", color || "bg-primary")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

CustomProgress.displayName = "CustomProgress";

export { CustomProgress };
