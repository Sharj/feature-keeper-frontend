"use client";

interface ColorDotProps {
  color: string;
  size?: "sm" | "md";
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
};

export function ColorDot({ color, size = "sm", className = "" }: ColorDotProps) {
  return (
    <span
      className={`${sizeStyles[size]} rounded-full inline-block shrink-0 ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
