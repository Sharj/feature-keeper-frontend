"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  color?: string;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-cream text-subtle",
  success: "bg-positive-soft text-positive",
  warning: "bg-caution-soft text-caution",
  danger: "bg-critical-soft text-critical",
  info: "bg-inform-soft text-inform",
};

const sizeStyles: Record<string, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-[13px]",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  color,
  dot,
  className = "",
}: BadgeProps) {
  const dynamicStyle = color
    ? {
        backgroundColor: `${color}18`,
        color: color,
      }
    : undefined;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap
        ${!color ? variantStyles[variant] : ""}
        ${sizeStyles[size]}
        ${className}
      `}
      style={dynamicStyle}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={color ? { backgroundColor: color } : undefined}
        />
      )}
      {children}
    </span>
  );
}
