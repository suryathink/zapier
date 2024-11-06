"use client";

import { ReactNode } from "react";

export const PrimaryButton = ({
  children,
  onClick,
  size = "small",
}: {
  children: ReactNode;
  onClick: () => void;
  size?: "big" | "small";
}) => {
  return (
    <div
      onClick={onClick}
      className={`${size === "small" ? "text-sm" : "text-xl"} ${
        size === "small" ? "px-4 pt-2" : "px-8 py-10"
      } bg-amber-700`}
    >
      {children}
    </div>
  );
};
