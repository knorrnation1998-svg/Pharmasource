import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  solid: "bg-manifest-800 text-sterile hover:bg-manifest-900",
  outline:
    "border border-manifest-200 bg-white text-manifest-800 hover:border-manifest-400",
  ghost: "text-manifest-600 hover:bg-manifest-50 hover:text-manifest-800",
  danger: "border border-excursion-500/30 text-excursion-500 hover:bg-excursion-100",
};

const SIZES: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "solid", size = "md", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-sheet font-medium",
          "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      />
    );
  }
);
