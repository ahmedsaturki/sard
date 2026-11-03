/**
 * @module @sard-cms/components
 *
 * Core Component Library for Sard CMS.
 * Built on Design Tokens with RTL support.
 * See ADR-007 (UI/UX Architecture).
 */

import React, { createContext, useState, useEffect, useMemo } from "react";
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
} from "@sard-cms/design-tokens";

// ============================================================================
// CONTEXTS
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);
const RtlContext = createContext<RtlContextValue | null>(null);

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
} from "@sard-cms/design-tokens";

export { tokens } from "@sard-cms/design-tokens";

export { Box, Button, Card, Tooltip, Paper, Typography, IconButton, Divider, Grid, Menu, MenuItem, Avatar, CardContent } from "./components";

// ============================================================================
// ICONS (inline SVG icons)
// ============================================================================

export interface IconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  isRtl?: boolean;
}

const SvgIcon: React.FC<IconProps & { children: React.ReactNode }> = ({ 
  width = 24, height = 24, className, style, isRtl, children 
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
       className={className} style={isRtl ? { ...style, transform: "scaleX(-1)" } : style}>
    {children}
  </svg>
);

export const ImageIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </SvgIcon>
);

export const VideoIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </SvgIcon>
);

export const CodeIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </SvgIcon>
);

export const QuoteIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V21c0 1.25.75 2 2 2h13" />
  </SvgIcon>
);

export const ListIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </SvgIcon>
);

export const TableIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <line x1="3" y1="3" x2="21" y2="3" />
    <line x1="3" y1="11" x2="21" y2="11" />
    <line x1="3" y1="19" x2="21" y2="19" />
    <line x1="3" y1="3" x2="3" y2="21" />
    <line x1="11" y1="3" x2="11" y2="21" />
    <line x1="19" y1="3" x2="19" y2="21" />
  </SvgIcon>
);

export const DividerIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
  </SvgIcon>
);

export const MoreVertIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </SvgIcon>
);

export const DragIndicatorIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="19" r="1" />
  </SvgIcon>
);

export const DeleteIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </SvgIcon>
);

export const CopyIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </SvgIcon>
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5" />
  </SvgIcon>
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <polyline points="15 18 9 12 15 6" />
  </SvgIcon>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <polyline points="9 18 15 12 9 6" />
  </SvgIcon>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </SvgIcon>
);

export const HelpOutlineIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </SvgIcon>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </SvgIcon>
);

export const PeopleIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </SvgIcon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </SvgIcon>
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </SvgIcon>
);

export const HomeIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </SvgIcon>
);

export const ArticleIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </SvgIcon>
);

export const ExpandMoreIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <polyline points="6 9 12 15 18 9" />
  </SvgIcon>
);

export const VisibilityIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </SvgIcon>
);

export const AddIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </SvgIcon>
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </SvgIcon>
);

export const UnlockIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </SvgIcon>
);

export const AlertTriangleIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </SvgIcon>
);

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
// THEME PROVIDER
// ============================================================================

export function ThemeProvider({
  children,
  defaultMode = "system",
  storageKey = "theme",
  attribute = "class",
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  // Resolve system mode
  const resolvedMode = useMemo(() => {
    if (mode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return mode;
  }, [mode]);

  // Persist to localStorage
  useEffect(() => {
    if (mode !== "system") {
      localStorage.setItem(storageKey, mode);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [mode, storageKey]);

  // Apply to document
  useEffect(() => {
    if (attribute === "class") {
      document.documentElement.classList.toggle("dark", resolvedMode === "dark");
    } else {
      document.documentElement.setAttribute("data-theme", resolvedMode);
    }
  }, [resolvedMode, attribute]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode, toggleMode: () => setMode(m => m === "light" ? "dark" : "light") }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// RTL PROVIDER
// ============================================================================

export function RtlProvider({
  children,
  defaultLocale = "en",
}: RtlProviderProps) {
  const [locale, setLocale] = useState<string>(defaultLocale);

  // Detect system RTL
  const isRtl = useMemo(() => {
    return locale.startsWith("ar") ||
           locale.startsWith("he") ||
           locale.startsWith("fa") ||
           locale.startsWith("ur") ||
           locale === "he-il";
  }, [locale]);

  // Apply direction to document
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale, isRtl]);

  return (
    <RtlContext.Provider value={{ dir: isRtl ? "rtl" : "ltr", locale, setLocale, isRtl }}>
      {children}
    </RtlContext.Provider>
  );
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
  ThemeProvider,
  RtlProvider,
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
  // Icons
  ImageIcon,
  VideoIcon,
  CodeIcon,
  QuoteIcon,
  ListIcon,
  TableIcon,
  DividerIcon,
  MoreVertIcon,
  DragIndicatorIcon,
  DeleteIcon,
  CopyIcon,
  EditIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  HelpOutlineIcon,
  CloseIcon,
  PeopleIcon,
  SettingsIcon,
  LogoutIcon,
  HomeIcon,
  ArticleIcon,
  ExpandMoreIcon,
  VisibilityIcon,
  AddIcon,
  ShieldIcon,
  UnlockIcon,
  AlertTriangleIcon,
};
