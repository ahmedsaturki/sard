/**
 * @module @sard/client-handoff/components/HandoffUi
 * Client Handoff layers 2 + 3 UI (plain React + design-token CSS classes).
 * RTL-first: direction comes from the Rtl context of @sard/components.
 * See ADR-014 (Killer Use Case) and HC-11.
 */

import React from "react";
import { cn, useRtl } from "@sard-cms/components";
import {
  ClientHandoffContext,
  mergeConstraints,
  useClientHandoff,
  type DesignConstraints,
  type DesignViolation,
  type HandoffLayer,
} from "../context.js";

export interface DesignConstraintsProviderProps {
  children: React.ReactNode;
  constraints?: Partial<DesignConstraints>;
  onViolation?: (violation: DesignViolation) => void;
}

export function DesignConstraintsProvider({ children, constraints, onViolation }: DesignConstraintsProviderProps) {
  const [layer, setLayer] = React.useState<HandoffLayer>("dashboard");
  const [violations, setViolations] = React.useState<DesignViolation[]>([]);
  const [isClientMode, setClientMode] = React.useState(false);

  const reportViolation = React.useCallback(
    (violation: DesignViolation) => {
      setViolations((prev) => [...prev, violation]);
      onViolation?.(violation);
    },
    [onViolation]
  );

  const clearViolations = React.useCallback(() => setViolations([]), []);

  const value = {
    constraints: mergeConstraints(constraints),
    layer,
    setLayer,
    violations,
    reportViolation,
    clearViolations,
    isClientMode,
    setClientMode,
  };

  return <ClientHandoffContext.Provider value={value}>{children}</ClientHandoffContext.Provider>;
}

export interface SimplifiedDashboardProps {
  collections: Array<{ slug: string; name: string; icon: string; count: number; description?: string }>;
  onNavigate: (path: string) => void;
  userName: string;
  userRole: "owner" | "editor" | "viewer";
}

function RedirectToFullDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Advanced Dashboard</h2>
        <p className="text-neutral-500 mb-6">You are being redirected to the full dashboard...</p>
        <button className="btn btn-primary" onClick={() => { window.location.href = "/dashboard"; }}>
          Go to Full Dashboard
        </button>
      </div>
    </div>
  );
}

export function SimplifiedDashboard({ collections, onNavigate, userName, userRole }: SimplifiedDashboardProps) {
  const { isClientMode, setClientMode } = useClientHandoff();
  const { dir } = useRtl();

  if (!isClientMode && userRole !== "owner") return <RedirectToFullDashboard />;

  return (
    <div className="min-h-screen bg-neutral-50" dir={dir}>
      <header className="header flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-brand-primary-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <div>
          <h1 className="font-semibold text-neutral-900">{"Welcome back, " + userName}</h1>
          <p className="text-sm text-neutral-500">Manage your content with confidence</p>
        </div>
        <button
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100"
          onClick={() => setClientMode(false)}
          aria-label="Switch to advanced mode"
        >
          Advanced
        </button>
      </header>

      <main className="p-6">
        <section aria-labelledby="collections-heading">
          <h2 id="collections-heading" className="text-lg font-semibold text-neutral-900 mb-4">
            Your Content
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collections.map((collection) => (
              <a
                key={collection.slug}
                href="#"
                className={cn("card p-5 hover:border-brand-primary-200 transition-colors")}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("/collections/" + collection.slug);
                }}
              >
                <span className="text-brand-primary-700 font-bold text-2xl">{collection.icon}</span>
                <span className="badge badge-neutral">{collection.count + " items"}</span>
                <h3 className="font-semibold text-neutral-900 mb-1">{collection.name}</h3>
                {collection.description ? (
                  <p className="text-sm text-neutral-500 line-clamp-2">{collection.description}</p>
                ) : null}
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  action?: "click" | "hover" | "input" | "scroll";
  nextStep?: string;
}

export interface InteractiveGuideProps {
  steps: GuideStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

function positionClass(position?: GuideStep["position"]): string {
  if (position === "top") return "bottom-4 left-1/2 -translate-x-1/2";
  if (position === "bottom") return "top-4 left-1/2 -translate-x-1/2";
  if (position === "left") return "top-1/2 right-4 -translate-y-1/2";
  if (position === "right") return "top-1/2 left-4 -translate-y-1/2";
  return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
}

export function InteractiveGuide({ steps, onComplete, onSkip }: InteractiveGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(true);

  const currentStep = steps[currentStepIndex];
  if (!isOpen || !currentStep) return null;

  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
      setIsOpen(false);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    setIsOpen(false);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1);
  };

  return (
    <div
      className={cn("fixed z-50 max-w-md p-6 rounded-xl bg-white shadow-2xl", positionClass(currentStep.position))}
      role="dialog"
      aria-labelledby="guide-title"
      aria-describedby="guide-description"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 id="guide-title" className="font-semibold text-neutral-900">{currentStep.title}</h3>
          <p id="guide-description" className="text-sm text-neutral-500">{currentStep.description}</p>
        </div>
        <button onClick={handleSkip} className="p-1 rounded-lg text-neutral-400" aria-label="Skip guide">
          {"×"}
        </button>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
        <span className="text-sm text-neutral-500">{(currentStepIndex + 1) + " of " + steps.length}</span>
        <div className="flex gap-2">
          {currentStepIndex > 0 ? (
            <button onClick={handlePrev} className="btn btn-outline btn-sm">Previous</button>
          ) : null}
          <button onClick={handleNext} className={cn("btn btn-sm", isLastStep ? "btn-primary" : "btn-outline")}>
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
