import React from "react";
import { responsiveStyle, rtlAwareStyle, useRtl } from "../index";

interface BoxProps {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
  style?: React.CSSProperties;
  testId?: string;
}

/**
 * Box - The most basic UI component, equivalent to a div but with design token support
 * and responsive props via sx.
 */
export const Box: React.FC<BoxProps> = ({
  as = "div",
  children,
  className,
  sx = {},
  style,
  testId,
}) => {
  const { isRtl } = useRtl();

  // Build inline styles from sx props
  const inlineStyles: React.CSSProperties = {
    ...style,
    ...sx,
  };

  // Handle responsive values
  Object.entries(sx).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Responsive value
      const responsive = responsiveStyle(value, key, {
        xs: "0px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        base: "0px",
      });
      if (Object.keys(responsive).length > 0) {
        (inlineStyles as any)[key] = responsive;
      }
    }
  });

  // Handle RTL-aware styles
  const rtlStyles = rtlAwareStyle(
    inlineStyles as React.CSSProperties,
    sx as React.CSSProperties,
    isRtl
  );

  return React.createElement(as, {
    className,
    style: rtlStyles,
    "data-testid": testId,
  }, children);
};

Box.displayName = "Box";