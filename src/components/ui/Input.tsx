"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3.5 py-2.5 text-sm text-ink
            bg-surface border rounded-lg
            placeholder:text-muted
            transition-colors duration-150
            ${
              error
                ? "border-critical focus:border-critical focus:ring-2 focus:ring-critical/20"
                : "border-edge focus:border-accent focus:ring-2 focus:ring-accent/20"
            }
            disabled:opacity-50 disabled:bg-cream
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-[13px] text-critical">{error}</p>}
        {hint && !error && <p className="text-[13px] text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
