import React from "react";
import { cn } from "../index";

interface GridProps {
  container?: boolean;
  spacing?: number;
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  className?: string;
  children?: React.ReactNode;
  sx?: Record<string, any>;
  testId?: string;
}

interface GridItemProps {
  xs?: string | number;
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
  className?: string;
  children?: React.ReactNode;
  sx?: Record<string, any>;
  testId?: string;
}

/**
 * Grid - A flexbox-based grid system
 */
export const Grid: React.FC<GridProps> & {
  item: React.FC<GridItemProps>;
} = ({
  container = true,
  spacing = 2,
  direction = "row",
  justifyContent = "flex-start",
  alignItems = "stretch",
  className,
  children,
  sx = {},
  testId,
}) => {
  if (!container) {
    // If container is false, treat as regular div
    return (
      <div
        className={cn("sard-grid", className)}
        style={{ ...sx }}
        data-testid={testId}
      >
        {children}
      </div>
    );
  }

  const classes = cn(
    "sard-grid",
    `sard-grid--spacing-${spacing}`,
    `sard-grid--direction-${direction}`,
    `sard-grid--justify-${justifyContent}`,
    `sard-grid--align-${alignItems}`,
    className
  );

  return (
    <div
      className={classes}
      style={{ ...sx }}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

Grid.displayName = "Grid";

/**
 * GridItem - A child component for Grid layout
 */
const GridItem: React.FC<GridItemProps> = ({
  xs,
  sm,
  md,
  lg,
  xl,
  className,
  children,
  sx = {},
  testId,
}) => {
  const classes = cn(
    "sard-grid-item",
    xs !== undefined && typeof xs === "number" ? `sard-grid-item--xs-${xs}` : "",
    sm !== undefined && typeof sm === "number" ? `sard-grid-item--sm-${sm}` : "",
    md !== undefined && typeof md === "number" ? `sard-grid-item--md-${md}` : "",
    lg !== undefined && typeof lg === "number" ? `sard-grid-item--lg-${lg}` : "",
    xl !== undefined && typeof xl === "number" ? `sard-grid-item--xl-${xl}` : "",
    className
  );

  return (
    <div
      className={classes}
      style={{ ...sx }}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

GridItem.displayName = "GridItem";

Grid.item = GridItem;