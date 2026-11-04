import React from "react";
import { cn } from "../index";

interface TypographyProps {
  children?: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2" | "caption" | "overline";
  component?: React.ElementType;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success" | "textPrimary" | "textSecondary" | "inherit";
  gutterBottom?: boolean;
  noWrap?: boolean;
  paragraph?: boolean;
  fontWeight?: number;
  className?: string;
  sx?: Record<string, any>;
  testId?: string;
}

const variantMap: Record<string, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle1: "h6",
  subtitle2: "h6",
  body1: "p",
  body2: "p",
  caption: "span",
  overline: "span",
};

/**
 * Typography - A styled text component using design tokens
 */
export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = "body1",
  component,
  color = "textPrimary",
  gutterBottom = false,
  noWrap = false,
  paragraph = false,
  fontWeight,
  className,
  sx = {},
  testId,
}: TypographyProps) => {
  const Component = component || variantMap[variant] || "p";

  const classes = cn(
    "sard-typography",
    `sard-typography--${variant}`,
    color && `sard-typography--color-${color}`,
    gutterBottom && "sard-typography--gutterBottom",
    noWrap && "sard-typography--noWrap",
    paragraph && "sard-typography--paragraph",
    className
  );

  return React.createElement(Component, {
    className: classes,
    style: {
      ...sx,
      ...(fontWeight && { fontWeight }),
    },
    "data-testid": testId,
  }, children);
};

Typography.displayName = "Typography";