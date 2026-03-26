"use client";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-surface border border-edge",
  elevated: "bg-surface border border-edge shadow-md",
  interactive:
    "bg-surface border border-edge hover:border-edge-strong hover:shadow-sm transition-all duration-150 cursor-pointer",
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
