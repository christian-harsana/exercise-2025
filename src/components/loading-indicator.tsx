"use client";

export function LoadingIndicator({ mode }: {mode: "dark" | "light"}) {

  const textColorClassName = mode === "dark"? "text-white" : "text-black";
  const loadingIndocatorClassName = `text-lg font-bold text-center ${textColorClassName}`;

  return (
    <h2 className={ loadingIndocatorClassName }>Loading...</h2>
  )
}