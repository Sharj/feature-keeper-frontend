"use client";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
};

const colors = [
  { bg: "#fef3ee", text: "#c2410c" },
  { bg: "#ecfdf3", text: "#16794a" },
  { bg: "#eff6ff", text: "#1d6cb5" },
  { bg: "#fefce8", text: "#a26207" },
  { bg: "#fff1f3", text: "#be123c" },
  { bg: "#f3f0ff", text: "#6d28d9" },
  { bg: "#ecfeff", text: "#0e7490" },
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const color = getColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeStyles[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeStyles[size]} rounded-full flex items-center justify-center font-semibold shrink-0 ${className}`}
      style={{ backgroundColor: color.bg, color: color.text }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
