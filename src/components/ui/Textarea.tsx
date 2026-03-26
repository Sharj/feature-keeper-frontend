"use client";

import { forwardRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3.5 py-2.5 text-sm text-ink
            bg-surface border rounded-lg resize-y
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
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
