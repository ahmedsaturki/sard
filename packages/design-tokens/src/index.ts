/**
 * @module @sard/design-tokens
 *
 * Design Token System for Sard CMS.
 * Single source of truth for all design decisions.
 * See ADR-007 (UI/UX Architecture).
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Semantic color tokens with light/dark mode support
 */
export const colorTokens = {
  // Brand colors
  brand: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    secondary: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef",
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
      950: "#4a044e",
    },
  },

  // Neutral colors (gray scale)
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
    1000: "#000000",
  },

  // Semantic colors
  semantic: {
    success: {
      light: "#10b981",
      main: "#059669",
      dark: "#047857",
      contrastText: "#ffffff",
    },
    warning: {
      light: "#f59e0b",
      main: "#d97706",
      dark: "#b45309",
      contrastText: "#000000",
    },
    error: {
      light: "#ef4444",
      main: "#dc2626",
      dark: "#b91c1c",
      contrastText: "#ffffff",
    },
    info: {
      light: "#3b82f6",
      main: "#2563eb",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
  },

  // Surface colors
  surface: {
    primary: "#ffffff",
    secondary: "#fafafa",
    tertiary: "#f5f5f5",
    elevated: "#ffffff",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // Text colors
  text: {
    primary: "#171717",
    secondary: "#525252",
    tertiary: "#737373",
    inverse: "#ffffff",
    link: "#0ea5e9",
    linkHover: "#0284c7",
  },

  // Border colors
  border: {
    light: "#e5e5e5",
    main: "#d4d4d4",
    dark: "#a3a3a3",
    focus: "#0ea5e9",
    error: "#ef4444",
  },

  // Background colors
  background: {
    primary: "#ffffff",
    secondary: "#fafafa",
    tertiary: "#f5f5f5",
    canvas: "#fafafa",
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typographyTokens = {
  fontFamilies: {
    sans: [
      "Inter",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ],
    mono: [
      "JetBrains Mono",
      "Fira Code",
      "Monaco",
      "Consolas",
      "Liberation Mono",
      "Courier New",
      "monospace",
    ],
    arabic: [
      "Noto Sans Arabic",
      "Cairo",
      "Tajawal",
      "system-ui",
      "sans-serif",
    ],
    hebrew: [
      "Noto Sans Hebrew",
      "Assistant",
      "Heebo",
      "system-ui",
      "sans-serif",
    ],
  },

  fontSizes: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem",    // 48px
    "6xl": "3.75rem", // 60px
  },

  fontWeights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacings: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacingTokens = {
  0: "0",
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px
  7: "1.75rem",   // 28px
  8: "2rem",      // 32px
  9: "2.25rem",   // 36px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  14: "3.5rem",   // 56px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
  24: "6rem",     // 96px
  28: "7rem",     // 112px
  32: "8rem",     // 128px
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadiusTokens = {
  none: "0",
  sm: "0.125rem",   // 2px
  base: "0.25rem",  // 4px
  md: "0.375rem",   // 6px
  lg: "0.5rem",     // 8px
  xl: "0.75rem",    // 12px
  "2xl": "1rem",    // 16px
  "3xl": "1.5rem",  // 24px
  full: "9999px",
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadowTokens = {
  none: "none",
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  base: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  md: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  xl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  "2xl": "0 50px 100px -20px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  focus: "0 0 0 3px rgba(14, 165, 233, 0.4)",
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const transitionTokens = {
  durations: {
    fastest: "50ms",
    fast: "100ms",
    normal: "150ms",
    slow: "200ms",
    slower: "300ms",
    slowest: "500ms",
  },
  easings: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndexTokens = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  max: 9999,
} as const;

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const breakpointTokens = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================================================
// RTL SUPPORT
// ============================================================================

/**
 * RTL-aware logical properties mapping
 */
export const rtlTokens = {
  // Logical properties for RTL support
  logical: {
    marginStart: "margin-inline-start",
    marginEnd: "margin-inline-end",
    paddingStart: "padding-inline-start",
    paddingEnd: "padding-inline-end",
    borderStart: "border-inline-start",
    borderEnd: "border-inline-end",
    borderStartRadius: "border-start-start-radius border-end-start-radius",
    borderEndRadius: "border-start-end-radius border-end-end-radius",
    floatStart: "inline-start",
    floatEnd: "inline-end",
    textAlignStart: "start",
    textAlignEnd: "end",
    insetStart: "inset-inline-start",
    insetEnd: "inset-inline-end",
  },

  // Direction tokens
  direction: {
    ltr: "ltr",
    rtl: "rtl",
  },

  // Font families per locale
  fontFamilies: {
    ar: ["Noto Sans Arabic", "Cairo", "Tajawal", "system-ui", "sans-serif"],
    he: ["Noto Sans Hebrew", "Assistant", "Heebo", "system-ui", "sans-serif"],
    fa: ["Vazirmatn", "Noto Sans Arabic", "system-ui", "sans-serif"],
    ur: ["Noto Nastaliq Urdu", "Noto Sans Arabic", "system-ui", "sans-serif"],
    default: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
  },
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const componentTokens = {
  button: {
    heights: {
      sm: "2rem",
      md: "2.5rem",
      lg: "3rem",
      xl: "3.5rem",
    },
    padding: {
      sm: "0.5rem 1rem",
      md: "0.75rem 1.5rem",
      lg: "1rem 2rem",
      xl: "1.25rem 2.5rem",
    },
    fontSizes: {
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
    },
    borderRadius: "0.375rem",
    fontWeight: 500,
  },

  input: {
    heights: {
      sm: "2rem",
      md: "2.5rem",
      lg: "3rem",
    },
    padding: {
      sm: "0.375rem 0.75rem",
      md: "0.5rem 1rem",
      lg: "0.75rem 1.25rem",
    },
    fontSizes: {
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
    },
    borderRadius: "0.375rem",
    borderWidth: "1px",
  },

  card: {
    padding: {
      sm: "1rem",
      md: "1.5rem",
      lg: "2rem",
    },
    borderRadius: "0.5rem",
    borderWidth: "1px",
  },

  modal: {
    padding: "1.5rem",
    borderRadius: "0.75rem",
    maxWidth: {
      sm: "20rem",
      md: "28rem",
      lg: "32rem",
      xl: "48rem",
      full: "calc(100% - 2rem)",
    },
  },

  dropdown: {
    minWidth: "12rem",
    maxHeight: "20rem",
    borderRadius: "0.5rem",
    padding: "0.5rem",
  },

  tooltip: {
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    maxWidth: "16rem",
  },

  badge: {
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },

  avatar: {
    sizes: {
      xs: "1.5rem",
      sm: "2rem",
      md: "2.5rem",
      lg: "3rem",
      xl: "4rem",
      "2xl": "5rem",
    },
  },

  table: {
    cellPadding: "0.75rem 1rem",
    headerFontWeight: 600,
    rowHoverBg: "#f5f5f5",
    borderColor: "#e5e5e5",
  },

  sidebar: {
    width: {
      collapsed: "4rem",
      default: "16rem",
      wide: "20rem",
    },
  },

  header: {
    height: "4rem",
    zIndex: 300,
  },

  footer: {
    padding: "1.5rem 2rem",
  },
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const animationTokens = {
  keyframes: {
    fadeIn: {
      "0%": { opacity: 0 },
      "100%": { opacity: 1 },
    },
    fadeOut: {
      "0%": { opacity: 1 },
      "100%": { opacity: 0 },
    },
    slideInUp: {
      "0%": { opacity: 0, transform: "translateY(10px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },
    slideInDown: {
      "0%": { opacity: 0, transform: "translateY(-10px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },
    slideInLeft: {
      "0%": { opacity: 0, transform: "translateX(-10px)" },
      "100%": { opacity: 1, transform: "translateX(0)" },
    },
    slideInRight: {
      "0%": { opacity: 0, transform: "translateX(10px)" },
      "100%": { opacity: 1, transform: "translateX(0)" },
    },
    scaleIn: {
      "0%": { opacity: 0, transform: "scale(0.95)" },
      "100%": { opacity: 1, transform: "scale(1)" },
    },
    spin: {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
    pulse: {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.5 },
    },
    bounce: {
      "0%, 100%": { transform: "translateY(-25%)", animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)" },
      "50%": { transform: "translateY(0)", animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)" },
    },
  },
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export const tokens = {
  color: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  borderRadius: borderRadiusTokens,
  shadow: shadowTokens,
  transition: transitionTokens,
  zIndex: zIndexTokens,
  breakpoint: breakpointTokens,
  rtl: rtlTokens,
  component: componentTokens,
  animation: animationTokens,
} as const;

// Type exports
export type ColorTokens = typeof colorTokens;
export type TypographyTokens = typeof typographyTokens;
export type SpacingTokens = typeof spacingTokens;
export type BorderRadiusTokens = typeof borderRadiusTokens;
export type ShadowTokens = typeof shadowTokens;
export type TransitionTokens = typeof transitionTokens;
export type ZIndexTokens = typeof zIndexTokens;
export type BreakpointTokens = typeof breakpointTokens;
export type RtlTokens = typeof rtlTokens;
export type ComponentTokens = typeof componentTokens;
export type AnimationTokens = typeof animationTokens;
export type AllTokens = typeof tokens;

export default tokens;
