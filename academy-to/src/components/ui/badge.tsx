import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#7c3aed] text-white",
        secondary:
          "border-transparent bg-[#2a2a2a] text-[#ededed]",
        destructive:
          "border-transparent bg-[#ef4444] text-white",
        success:
          "border-transparent bg-[#22c55e] text-white",
        warning:
          "border-transparent bg-[#f59e0b] text-white",
        outline: "text-[#ededed] border-[#3a3a3a]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
