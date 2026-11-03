/**
 * @module @sard-cms/client-handoff/context
 * Client Handoff Layer 1 (Design Constraints) + state primitives.
 * Logic layer per ADR-015; UI views live in ./components/HandoffUi.tsx.
 * See ADR-014 (Killer Use Case: Agency Client Handoff) and HC-11.
 */

import React from "react";

export interface DesignConstraints {
  colors: { allowed: string[]; preventCustom: boolean };
  typography: { allowedFonts: string[]; lockSizes: boolean; lockWeights: boolean };
  spacing: { scaleOnly: boolean };
  layout: { maxWidth: string; preventFullWidth: boolean };
  components: { locked: string[]; allowedVariants: Record<string, string[]> };
  media: { maxUploadSize: number; allowedTypes: string[]; enforceAltText: boolean };
}

export interface DesignViolation {
  type: "color" | "typography" | "spacing" | "layout" | "component" | "media";
  message: string;
  element?: string;
  value?: string;
  allowedValues?: string[];
}

export type HandoffLayer = "constraints" | "dashboard" | "guide";

export interface ClientHandoffContextValue {
  constraints: DesignConstraints;
  layer: HandoffLayer;
  setLayer: (layer: HandoffLayer) => void;
  violations: DesignViolation[];
  reportViolation: (violation: DesignViolation) => void;
  clearViolations: () => void;
  isClientMode: boolean;
  setClientMode: (enabled: boolean) => void;
}

export const defaultDesignConstraints: DesignConstraints = {
  colors: {
    allowed: ["#0ea5e9", "#0284c7", "#d946ef", "#059669", "#d97706", "#dc2626"],
    preventCustom: true,
  },
  typography: {
    allowedFonts: ["Inter", "system-ui", "Cairo", "Noto Sans Arabic"],
    lockSizes: true,
    lockWeights: true,
  },
  spacing: { scaleOnly: true },
  layout: { maxWidth: "1280px", preventFullWidth: true },
  components: {
    locked: ["header", "footer", "navigation", "hero"],
    allowedVariants: {
      button: ["primary", "secondary", "outline", "ghost"],
      card: ["default", "outlined", "elevated"],
      badge: ["primary", "success", "warning", "error", "neutral"],
    },
  },
  media: {
    maxUploadSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "application/pdf"],
    enforceAltText: true,
  },
};

export function mergeConstraints(overrides?: Partial<DesignConstraints>): DesignConstraints {
  if (!overrides) return defaultDesignConstraints;
  return {
    colors: { ...defaultDesignConstraints.colors, ...overrides.colors },
    typography: { ...defaultDesignConstraints.typography, ...overrides.typography },
    spacing: { ...defaultDesignConstraints.spacing, ...overrides.spacing },
    layout: { ...defaultDesignConstraints.layout, ...overrides.layout },
    components: { ...defaultDesignConstraints.components, ...overrides.components },
    media: { ...defaultDesignConstraints.media, ...overrides.media },
  };
}

/** Layer 1 enforcement: is a colour inside the allowed token surface? */
export function validateColor(constraints: DesignConstraints, value: string): DesignViolation | null {
  if (!constraints.colors.preventCustom) return null;
  const normalized = value.trim().toLowerCase();
  if (constraints.colors.allowed.some((c) => c.toLowerCase() === normalized)) return null;
  return {
    type: "color",
    message: `Only palette colours are allowed: ${constraints.colors.allowed.join(", ")}`,
    value,
    allowedValues: constraints.colors.allowed,
  };
}

/** Layer 1 enforcement: is an upload within size/type limits? */
export function validateMedia(
  constraints: DesignConstraints,
  file: { size: number; type: string; altText?: string }
): DesignViolation | null {
  if (file.size > constraints.media.maxUploadSize) {
    return {
      type: "media",
      message: `File exceeds the ${Math.round(constraints.media.maxUploadSize / 1024 / 1024)}MB limit`,
      value: String(file.size),
    };
  }
  if (!constraints.media.allowedTypes.includes(file.type)) {
    return {
      type: "media",
      message: "Unsupported file type",
      value: file.type,
      allowedValues: constraints.media.allowedTypes,
    };
  }
  if (constraints.media.enforceAltText && file.type.startsWith("image/") && !file.altText) {
    return { type: "media", message: "Alt text is required for accessibility (WCAG 2.2 AA)" };
  }
  return null;
}

/** Layer 1 enforcement: is a component locked, or a variant allowed? */
export function validateComponent(
  constraints: DesignConstraints,
  name: string,
  variant?: string
): DesignViolation | null {
  if (constraints.components.locked.includes(name)) {
    return { type: "component", message: `The ${name} area is managed by your agency`, element: name };
  }
  const allowed = constraints.components.allowedVariants[name];
  if (variant && allowed && !allowed.includes(variant)) {
    return { type: "component", message: `${variant} is not an available ${name} style`, value: variant, allowedValues: allowed };
  }
  return null;
}

export const ClientHandoffContext = React.createContext<ClientHandoffContextValue | null>(null);

export function useClientHandoff(): ClientHandoffContextValue {
  const context = React.useContext(ClientHandoffContext);
  if (!context) {
    throw new Error("useClientHandoff must be used within DesignConstraintsProvider");
  }
  return context;
}

