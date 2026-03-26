"use client";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex gap-1 border-b border-edge ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative px-4 py-2.5 text-sm font-medium
              transition-colors duration-150 cursor-pointer
              -mb-px rounded-t-lg
              ${
                isActive
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted hover:text-subtle"
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "bg-cream text-muted"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
