/**
 * @module @sard/client-handoff/handoff-package
 * Generates the downloadable handoff package an agency gives its client.
 */

import { type DesignConstraints } from "./context.js";
import type { GuideStep } from "./components/HandoffUi.js";

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
  credentials: { adminUrl: string; username: string };
  guide: { steps: GuideStep[] };
  support: { email: string; docsUrl: string; videoUrl?: string };
}

export function generateHandoffPackage(pkg: HandoffPackage): string {
  return JSON.stringify(pkg, null, 2);
}

export function handoffFilename(pkg: HandoffPackage, filename?: string): string {
  const slug = pkg.siteName.toLowerCase().replace(/\s+/g, "-");
  return filename || `sard-handoff-${slug}-${new Date().toISOString().split("T")[0] ?? ""}.json`;
}

export function downloadHandoffPackage(pkg: HandoffPackage, filename?: string): void {
  const json = generateHandoffPackage(pkg);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = handoffFilename(pkg, filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
