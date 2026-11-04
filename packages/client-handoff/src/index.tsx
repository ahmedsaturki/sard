/**
 * @module @sard/client-handoff
 *
 * Client Handoff System — 3-Layer Agency Handoff Experience.
 * Turns "here's your site" into "here's your content operating system."
 * See ADR-008 (Client Handoff Architecture).
 */

import React from "react";
import { cn, useTheme, useRtl } from "@sard/components";
import { tokens } from "@sard/design-tokens";

/**
 * Layer 1: Design Constraints (Design Tokens + Guardrails)
 * Prevents clients from breaking the design system
 */
export interface DesignConstraints {
  colors: {
    allowed: string[];
    preventCustom: boolean;
  };
  typography: {
    allowedFonts: string[];
    lockSizes: boolean;
    lockWeights: boolean;
  };
  spacing: {
    scaleOnly: boolean;
  };
  layout: {
    maxWidth: string;
    preventFullWidth: boolean;
  };
  components: {
    locked: string[];
    allowedVariants: Record<string, string[]>;
  };
  media: {
    maxUploadSize: number;
    allowedTypes: string[];
    enforceAltText: boolean;
  };
}

/**
 * Default design constraints for client handoff
 */
export const defaultDesignConstraints: DesignConstraints = {
  colors: {
    allowed: [
      "#0ea5e9",
      "#0284c7",
      "#d946ef",
      "#059669",
      "#d97706",
      "#dc2626",
    ],
    preventCustom: true,
  },
  typography: {
    allowedFonts: ["Inter", "system-ui", "Cairo", "Noto Sans Arabic"],
    lockSizes: true,
    lockWeights: true,
  },
  spacing: {
    scaleOnly: true,
  },
  layout: {
    maxWidth: "1280px",
    preventFullWidth: true,
  },
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

/**
 * Design Constraints Provider
 * Wraps the editor and enforces constraints
 */
export interface DesignConstraintsProviderProps {
  children: React.ReactNode;
  constraints?: Partial<DesignConstraints>;
  onViolation?: (violation: DesignViolation) => void;
}

export interface DesignViolation {
  type: "color" | "typography" | "spacing" | "layout" | "component" | "media";
  message: string;
  element?: string;
  value?: string;
  allowedValues?: string[];
}

/**
 * Client Handoff Context
 */
export interface ClientHandoffContextValue {
  constraints: DesignConstraints;
  layer: "constraints" | "dashboard" | "guide";
  setLayer: (layer: "constraints" | "dashboard" | "guide") => void;
  violations: DesignViolation[];
  reportViolation: (violation: DesignViolation) => void;
  clearViolations: () => void;
  isClientMode: boolean;
  setClientMode: (enabled: boolean) => void;
}

const ClientHandoffContext = React.createContext<ClientHandoffContextValue | null>(null);

/**
 * Design Constraints Provider Component
 */
export function DesignConstraintsProvider({
  children,
  constraints = defaultDesignConstraints,
  onViolation,
}: DesignConstraintsProviderProps) {
  const [layer, setLayer] = React.useState<"constraints" | "dashboard" | "guide">("dashboard");
  const [violations, setViolations] = React.useState<DesignViolation[]>([]);
  const [isClientMode, setClientMode] = React.useState(false);

  const reportViolation = React.useCallback((violation: DesignViolation) => {
    setViolations(prev => [...prev, violation]);
    onViolation?.(violation);
  }, [onViolation]);

  const clearViolations = React.useCallback(() => {
    setViolations([]);
  }, []);

  const value: ClientHandoffContextValue = {
    constraints: { ...defaultDesignConstraints, ...constraints },
    layer,
    setLayer,
    violations,
    reportViolation,
    clearViolations,
    isClientMode,
    setClientMode,
  };

  return (
    <ClientHandoffContext.Provider value={value}>
      {children}
    </ClientHandoffContext.Provider>
  );
}

export function useClientHandoff(): ClientHandoffContextValue {
  const context = React.useContext(ClientHandoffContext);
  if (!context) {
    throw new Error("useClientHandoff must be used within DesignConstraintsProvider");
  }
  return context;
}

/**
 * Layer 2: Simplified Dashboard (Client Mode)
 * Stripped-down interface for non-technical clients
 */
export interface SimplifiedDashboardProps {
  collections: Array<{
    slug: string;
    name: string;
    icon: string;
    count: number;
    description?: string;
  }>;
  onNavigate: (path: string) => void;
  userName: string;
  userRole: "owner" | "editor" | "viewer";
}

export function SimplifiedDashboard({
  collections,
  onNavigate,
  userName,
  userRole,
}: SimplifiedDashboardProps) {
  const { constraints, isClientMode, setClientMode } = useClientHandoff();
  const { mode, toggleMode, resolvedMode } = useTheme();
  const { dir, isRtl } = useRtl();

  if (!isClientMode && userRole !== "owner") {
    return <RedirectToFullDashboard />;
  }

  return (
    <div className="min-h-screen bg-neutral-50" dir={dir}>
      <header className="header">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-semibold text-neutral-900">Welcome back, {userName}</h1>
            <p className="text-sm text-neutral-500">Manage your content with confidence</p>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={() => setClientMode(false)}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Switch to advanced mode"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="main p-6">
        <section aria-labelledby="collections-heading">
          <h2 id="collections-heading" className="text-lg font-semibold text-neutral-900 mb-4">
            Your Content
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collections.map((collection) => (
              <a
                key={collection.slug}
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate("/collections/" + collection.slug); }}
                className="card p-5 hover:border-brand-primary-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary-100 flex items-center justify-center">
                    <span className="text-brand-primary-700 font-bold text-2xl">
                      {collection.icon}
                    </span>
                  </div>
                  <span className="badge badge-neutral">{collection.count} items</span>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-neutral-500 line-clamp-2">{collection.description}</p>
                )}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="text-lg font-semibold text-neutral-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Content
            </button>
            <button className="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Media
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="text-center text-sm text-neutral-500">
          Powered by Sard CMS · Built for {userName}
        </p>
      </footer>
    </div>
  );
}

function RedirectToFullDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-primary-100 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-primary-600">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Advanced Dashboard</h2>
        <p className="text-neutral-500 mb-6">You're being redirected to the full dashboard...</p>
        <button onClick={() => window.location.href = "/dashboard"} className="btn btn-primary">
          Go to Full Dashboard
        </button>
      </div>
    </div>
  );
}

/**
 * Layer 3: Interactive Guide (Onboarding + Help)
 * Contextual help system for clients
 */
export interface GuideStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  action?: "click" | "hover" | "input" | "scroll";
  nextStep?: string;
}

export interface InteractiveGuideProps {
  steps: GuideStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export function InteractiveGuide({ steps, onComplete, onSkip }: InteractiveGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(true);
  const { isRtl } = useRtl();

  if (!isOpen || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
      setIsOpen(false);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    setIsOpen(false);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const targetCenter = currentStep.target ? "50% 50%" : "50% 50%";

  return (
    <>
      {currentStep.target && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            style={{
              maskImage: `radial-gradient(circle at ${targetCenter}, transparent 80px, black 100px)`,
              WebkitMaskImage: `radial-gradient(circle at ${targetCenter}, transparent 80px, black 100px)`,
            }}
            aria-hidden="true"
          />
        </div>
      )}

      <div
        className={cn(
          "fixed z-50 max-w-md p-6 rounded-xl bg-white shadow-2xl shadow-neutral-900/10",
          currentStep.position === "top" && "bottom-4 left-1/2 -translate-x-1/2",
          currentStep.position === "bottom" && "top-4 left-1/2 -translate-x-1/2",
          currentStep.position === "left" && "top-1/2 right-4 -translate-y-1/2",
          currentStep.position === "right" && "top-1/2 left-4 -translate-y-1/2",
          currentStep.position === "center" && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        role="dialog"
        aria-labelledby="guide-title"
        aria-describedby="guide-description"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 id="guide-title" className="font-semibold text-neutral-900">{currentStep.title}</h3>
            <p id="guide-description" className="text-sm text-neutral-500">{currentStep.description}</p>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            aria-label="Skip guide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>{currentStepIndex + 1} of {steps.length}</span>
            <div className="flex gap-1" role="progressbar" aria-valuenow={currentStepIndex + 1} aria-valuemin={1} aria-valuemax={steps.length}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i <= currentStepIndex ? "bg-brand-primary-600" : "bg-neutral-300"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className={cn("btn btn-sm", isLastStep ? "btn-primary" : "btn-outline")}
            >
              {isLastStep ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function getTargetCenter(selector: string): string {
  return "50% 50%";
}

/**
 * Layer 3: Client Handoff Export Component
 * Generates a handoff package for the client
 */
export interface HandoffPackage {
  siteName: string;
  siteUrl: string;
  clientName: string;
  clientEmail: string;
  handoffDate: string;
  constraints: DesignConstraints;
  collections: Array<{
    slug: string;
    name: string;
    description?: string;
    fields: Array<{ name: string; type: string; required: boolean }>;
  }>;
  credentials: {
    adminUrl: string;
    username: string;
  };
  guide: {
    steps: GuideStep[];
  };
  support: {
    email: string;
    docsUrl: string;
    videoUrl?: string;
  };
}

/**
 * Generate handoff package as downloadable JSON
 */
export function generateHandoffPackage(pkg: HandoffPackage): string {
  return JSON.stringify(pkg, null, 2);
}

/**
 * Download handoff package
 */
export function downloadHandoffPackage(pkg: HandoffPackage, filename?: string): void {
  const json = generateHandoffPackage(pkg);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "sard-handoff-" + pkg.siteName.toLowerCase().replace(/\s+/g, "-") + "-" + new Date().toISOString().split("T")[0] + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Client Handoff Hook
 * Main hook for managing the full handoff experience
 */
export function useClientHandoffSystem() {
  const { constraints, layer, setLayer, violations, reportViolation, clearViolations, isClientMode, setClientMode } = useClientHandoff();

  const enableClientMode = React.useCallback(() => {
    setClientMode(true);
  }, [setClientMode]);

  const disableClientMode = React.useCallback(() => {
    setClientMode(false);
  }, [setClientMode]);

  const switchToGuide = React.useCallback(() => {
    setLayer("guide");
  }, [setLayer]);

  const switchToDashboard = React.useCallback(() => {
    setLayer("dashboard");
  }, [setLayer]);

  const switchToConstraints = React.useCallback(() => {
    setLayer("constraints");
  }, [setLayer]);

  return {
    constraints,
    layer,
    violations,
    isClientMode,
    setLayer,
    reportViolation,
    clearViolations,
    enableClientMode,
    disableClientMode,
    switchToGuide,
    switchToDashboard,
    switchToConstraints,
    isConstraintsLayer: layer === "constraints",
    isDashboardLayer: layer === "dashboard",
    isGuideLayer: layer === "guide",
    hasViolations: violations.length > 0,
  };
}

export default {
  DesignConstraintsProvider,
  useClientHandoff,
  useClientHandoffSystem,
  SimplifiedDashboard,
  InteractiveGuide,
  downloadHandoffPackage,
  generateHandoffPackage,
  defaultDesignConstraints,
};

export type {
  DesignConstraints,
  DesignViolation,
  DesignConstraintsProviderProps,
  ClientHandoffContextValue,
  SimplifiedDashboardProps,
  GuideStep,
  InteractiveGuideProps,
  HandoffPackage,
};

