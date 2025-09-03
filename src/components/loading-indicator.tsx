"use client";

export function LoadingIndicator({ mode }: {mode: "dark" | "light"}) {

  const textColorClass = mode === "dark"? "text-white" : "text-black";  

  return (
    <h2 className="text-lg font-bold text-center {textColorClass}">Loading...</h2>
  )
}