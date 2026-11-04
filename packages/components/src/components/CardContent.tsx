import React from "react";
import { cn } from "../index";

interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
  testId?: string;
}

/**
 * CardContent - Content container for Card components
 */
export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  sx = {},
  testId,
}) => {
  const classes = cn("sard-card-content", className);

  return (
    <div
      className={classes}
      style={sx}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

CardContent.displayName = "CardContent";