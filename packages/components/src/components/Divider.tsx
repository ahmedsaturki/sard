import React from "react";
import { cn } from "../index";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  variant?: "fullWidth" | "inset" | "middle";
  light?: boolean;
  className?: string;
  sx?: Record<string, any>;
  testId?: string;
}

/**
 * Divider - A horizontal or vertical divider component
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  variant = "fullWidth",
  light = false,
  className,
  sx = {},
  testId,
}) => {
  const classes = cn(
    "sard-divider",
    orientation && `sard-divider--${orientation}`,
    variant && `sard-divider--${variant}`,
    light && "sard-divider--light",
    className
  );

  return React.createElement("div", {
    className: classes,
    style: sx,
    "data-testid": testId,
  });
};

Divider.displayName = "Divider";