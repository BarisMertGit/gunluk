import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const variants = {
  default:
    "bg-slate-700 text-white hover:bg-slate-800",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-900",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
};

const sizes = {
  default: "h-10 px-4 py-2",
  lg: "h-11 px-8",
  icon: "h-10 w-10 p-0",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm",
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    />
  );
}
