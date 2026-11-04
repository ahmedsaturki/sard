import React from "react";
import { cn } from "../index";

interface CardProps {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
  style?: React.CSSProperties;
  testId?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;
}

/**
 * Card - A container component with elevation and rounded corners
 */
export const Card: React.FC<CardProps> = ({
  as = "div",
  children,
  className,
  sx = {},
  style,
  testId,
  elevation = 1,
}) => {
  const classes = cn("sard-card", className);

  // Apply elevation-based shadow via design tokens (simplified)
  const shadow = elevation > 0 ? `0px 4px 6px rgba(0,0,0,0.1)` : "none";

  return React.createElement(as, {
    className: cn(classes),
    style: {
      ...style,
      ...sx,
      backgroundColor: "white",
      borderRadius: 12,
      boxShadow: shadow,
    },
    "data-testid": testId,
  }, children);
};

Card.displayName = "Card";