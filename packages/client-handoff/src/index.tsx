/**
 * @module @sard/client-handoff
 *
 * Client Handoff System — 3-Layer Agency Handoff Experience.
 * Turns "here's your site" into "here's your content operating system."
 * See ADR-008 (Client Handoff Architecture).
 */

// Re-export types from context
export type {
  DesignConstraints,
  DesignViolation,
  HandoffLayer,
  ClientHandoffContextValue,
} from "./context.js";

// Re-export SimplifiedPanel component
export { SimplifiedPanel } from "./components/SimplifiedPanel.js";
export type { SimplifiedPanelProps } from "./components/SimplifiedPanel.js";

// Re-export handoff package utilities
export type { HandoffPackage, GuideStep } from "./handoff-package.js";
export { generateHandoffPackage, downloadHandoffPackage } from "./handoff-package.js";