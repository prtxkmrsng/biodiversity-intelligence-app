import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20",
      outline: "border border-white/10 bg-white/5 hover:bg-white/10 text-white",
      ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
      secondary: "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
    }
    
    const sizes = {
      default: "h-12 px-4 py-2 text-base",
      sm: "h-9 rounded-xl px-3 text-sm",
      lg: "h-14 rounded-xl px-8 text-lg font-medium",
      icon: "h-12 w-12 rounded-xl",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-bold ring-offset-[#0f172a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
