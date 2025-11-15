import React from "react";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={
        "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 " +
        className
      }
      {...props}
    />
  );
}
