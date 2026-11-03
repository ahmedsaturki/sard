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
} from "./context";

// Re-export providers and hooks
export { useClientHandoff, useClientHandoffSystem, DesignConstraintsProvider } from "./context";

// Re-export components
export { SimplifiedPanel } from "./components/SimplifiedPanel";
export type { SimplifiedPanelProps } from "./components/SimplifiedPanel";
export { SimplifiedDashboard } from "./components/SimplifiedDashboard";
export type { SimplifiedDashboardProps } from "./components/SimplifiedDashboard";
export { InteractiveGuide } from "./components/InteractiveGuide";
export type { InteractiveGuideProps } from "./components/InteractiveGuide";

// Re-export handoff package utilities
export type { HandoffPackage, GuideStep } from "./handoff-package";
export { generateHandoffPackage, downloadHandoffPackage } from "./handoff-package";