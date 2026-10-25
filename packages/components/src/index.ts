/**
 * @module @sard/components
 *
 * Core Component Library for Sard CMS.
 * Built on Design Tokens with RTL support.
 * See ADR-007 (UI/UX Architecture).
 */

import React from "react";
import type {
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderRadiusTokens,
  ShadowTokens,
  TransitionTokens,
  ZIndexTokens,
  BreakpointTokens,
  RtlTokens,
  ComponentTokens,
  AnimationTokens,
} from "@sard/design-tokens";

// Re-export design tokens
export type {
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderRadiusTokens,
  ShadowTokens,
  TransitionTokens,
  ZIndexTokens,
  BreakpointTokens,
  RtlTokens,
  ComponentTokens,
  AnimationTokens,
} from "@sard/design-tokens";

export { tokens } from "@sard/design-tokens";

// ============================================================================
// CSS VARIABLES GENERATION
// ============================================================================

/**
 * Generate CSS custom properties from design tokens
 */
export function generateCssVariables(tokens: any): string {
  const lines: string[] = [":root {"];

  // Color tokens
  if (tokens.color) {
    lines.push("  /* Colors */");
    flattenTokens(tokens.color, "color").forEach(([key, value]) => {
      lines.push(`  --sard-${key}: ${value};`);
    });
  }

  // Typography tokens
  if (tokens.typography) {
    lines.push("  /* Typography */");
    flattenTokens(tokens.typography, "typography").forEach(([key, value]) => {
      lines.push(`  --sard-${key}: ${value};`);
    });
  }

  // Spacing tokens
  if (tokens.spacing) {
    lines.push("  /* Spacing */");
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      lines.push(`  --sard-spacing-${key}: ${value};`);
    });
  }

  // Border radius tokens
  if (tokens.borderRadius) {
    lines.push("  /* Border Radius */");
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      lines.push(`  --sard-radius-${key}: ${value};`);
    });
  }

  // Shadow tokens
  if (tokens.shadow) {
    lines.push("  /* Shadows */");
    Object.entries(tokens.shadow).forEach(([key, value]) => {
      lines.push(`  --sard-shadow-${key}: ${value};`);
    });
  }

  // Transition tokens
  if (tokens.transition) {
    lines.push("  /* Transitions */");
    if (tokens.transition.durations) {
      Object.entries(tokens.transition.durations).forEach(([key, value]) => {
        lines.push(`  --sard-transition-${key}: ${value};`);
      });
    }
    if (tokens.transition.easings) {
      Object.entries(tokens.transition.easings).forEach(([key, value]) => {
        lines.push(`  --sard-easing-${key}: ${value};`);
      });
    }
  }

  // Z-index tokens
  if (tokens.zIndex) {
    lines.push("  /* Z-Index */");
    Object.entries(tokens.zIndex).forEach(([key, value]) => {
      lines.push(`  --sard-z-${key}: ${value};`);
    });
  }

  // Breakpoint tokens
  if (tokens.breakpoint) {
    lines.push("  /* Breakpoints */");
    Object.entries(tokens.breakpoint).forEach(([key, value]) => {
      lines.push(`  --sard-breakpoint-${key}: ${value};`);
    });
  }

  // Component tokens
  if (tokens.component) {
    lines.push("  /* Component Tokens */");
    flattenTokens(tokens.component, "component").forEach(([key, value]) => {
      lines.push(`  --sard-${key}: ${value};`);
    });
  }

  lines.push("}");

  return lines.join("\n");
}

/**
 * Flatten nested token objects into key-value pairs
 */
function flattenTokens(obj: any, prefix: string): [string, string][] {
  const result: [string, string][] = [];

  function recurse(current: any, path: string[]) {
    for (const [key, value] of Object.entries(current)) {
      const newPath = [...path, key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        recurse(value, newPath);
      } else {
        result.push([newPath.join("-"), String(value)]);
      }
    }
  }

  recurse(obj, [prefix]);
  return result;
}

/**
 * Generate RTL-specific CSS variables
 */
export function generateRtlCssVariables(tokens: any): string {
  const lines: string[] = [":root {", "  /* RTL Logical Properties */"];

  if (tokens.rtl?.logical) {
    Object.entries(tokens.rtl.logical).forEach(([key, value]) => {
      lines.push(`  --sard-rtl-${key}: ${value};`);
    });
  }

  lines.push("}");
  return lines.join("\n");
}

// ============================================================================
// THEME PROVIDER
// ============================================================================

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
  attribute?: "class" | "data-theme";
}

// ============================================================================
// RTL PROVIDER
// ============================================================================

export interface RtlContextValue {
  dir: "ltr" | "rtl";
  locale: string;
  setLocale: (locale: string) => void;
  isRtl: boolean;
}

export interface RtlProviderProps {
  children: React.ReactNode;
  defaultLocale?: string;
}

// ============================================================================
// COMPONENT PRIMITIVES
// ============================================================================

/**
 * Base component props with common styling
 */
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

/**
 * Polymorphic component prop
 */
export type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = Props & {
  as?: C;
};

/**
 * Responsive value type
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "base";

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for accessing design tokens
 */
export function useDesignTokens() {
  // In a real implementation, this would use context
  return {
    color: {} as ColorTokens,
    typography: {} as TypographyTokens,
    spacing: {} as SpacingTokens,
    borderRadius: {} as BorderRadiusTokens,
    shadow: {} as ShadowTokens,
    transition: {} as TransitionTokens,
    zIndex: {} as ZIndexTokens,
    breakpoint: {} as BreakpointTokens,
    rtl: {} as RtlTokens,
    component: {} as ComponentTokens,
    animation: {} as AnimationTokens,
  };
}

/**
 * Hook for theme management
 */
export function useTheme(): ThemeContextValue {
  return {
    mode: "system",
    resolvedMode: "light",
    setMode: () => {},
    toggleMode: () => {},
  };
}

/**
 * Hook for RTL management
 */
export function useRtl(): RtlContextValue {
  return {
    dir: "ltr",
    locale: "en",
    setLocale: () => {},
    isRtl: false,
  };
}

/**
 * Hook for responsive values
 */
export function useResponsiveValue<T>(value: ResponsiveValue<T>): T {
  // In a real implementation, this would use matchMedia
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const obj = value as Partial<Record<Breakpoint, T>>;
    return (obj.md ?? obj.base ?? Object.values(obj)[0]) as T;
  }
  return value;
}

/**
 * Hook for media queries
 */
export function useMediaQuery(_query: string): boolean {
  // In a real implementation, this would use window.matchMedia
  return false;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Merge class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Generate responsive styles
 */
export function responsiveStyle<T>(
  value: ResponsiveValue<T>,
  property: string,
  breakpointMap: Record<string, string>
): React.CSSProperties {
  const styles: Record<string, React.CSSProperties> = {};

  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const obj = value as Partial<Record<Breakpoint, T>>;
    Object.entries(obj).forEach(([breakpoint, val]) => {
      if (val !== undefined) {
        const bp = breakpointMap[breakpoint];
        if (bp) {
          styles[`@media (min-width: ${bp})`] = {
            [property]: val,
          } as React.CSSProperties;
        }
      }
    });
  }

  return styles;
}

/**
 * Get RTL-aware styles
 */
export function rtlAwareStyle(
  ltrStyles: React.CSSProperties,
  rtlStyles: React.CSSProperties,
  isRtl: boolean
): React.CSSProperties {
  return isRtl ? rtlStyles : ltrStyles;
}

/**
 * Convert token value to CSS value
 */
export function tokenToCssValue(token: string | number): string {
  if (typeof token === "number") {
    return `${token}px`;
  }
  return token;
}

// ============================================================================
// COMPONENT FACTORY
// ============================================================================

/**
 * Create a styled component with design token integration
 */
export function createStyledComponent<
  T extends React.ElementType,
  P extends BaseComponentProps
>(
  element: T,
  baseStyles: React.CSSProperties,
  classNamePrefix: string
) {
  return function StyledComponent(props: P & { as?: T }) {
    const { className, style, ...rest } = props;
    const Component = props.as || element;

    return React.createElement(Component, {
      ...rest,
      className: cn(classNamePrefix, className),
      style: { ...baseStyles, ...style },
    });
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateCssVariables,
  generateRtlCssVariables,
  useDesignTokens,
  useTheme,
  useRtl,
  useResponsiveValue,
  useMediaQuery,
  cn,
  responsiveStyle,
  rtlAwareStyle,
  tokenToCssValue,
  createStyledComponent,
};
