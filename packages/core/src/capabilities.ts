/**
 * @module @sard-cms/core/capabilities
 *
 * Capability Manifest model — the security boundary for plugins (ADR-005).
 * A plugin declares what it needs; the host grants a subset. Every granted
 * capability is enforced by the sandbox gatekeeper and recorded in the audit log.
 */
import { z } from "zod";

export const Capability = [
  "content:read",
  "content:write",
  "content:delete",
  "media:read",
  "media:write",
  "users:read",
  "http:external",
  "email:send",
  "settings:read",
  "settings:write",
  "plugin:register"
] as const;

export type CapabilityValue = (typeof Capability)[number];

export const PluginManifestSchema = z
  .object({
    name: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    version: z.string().regex(/^\\d+\\.\\d+\\.\\d+/),
    description: z.string().optional(),
    capabilities: z.array(z.enum(Capability)).min(1),
    permissions: z
      .object({
        http: z.object({ domains: z.array(z.string()) }).optional(),
        database: z.object({ tables: z.array(z.string()) }).optional()
      })
      .optional()
  })
  .strict();

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Compute the intersection of a plugin's requested capabilities and the
 * capabilities the admin is willing to grant. Returns only capabilities that
 * are BOTH requested AND granted. This is what the sandbox enforces.
 */
export function resolveGrantedCapabilities(
  manifest: PluginManifest,
  adminGranted: readonly CapabilityValue[]
): readonly CapabilityValue[] {
  const granted = new Set(adminGranted);
  return manifest.capabilities.filter((c) => granted.has(c));
}

/** Validate a plugin manifest. */
export function validatePluginManifest(
  value: unknown
): { success: true; data: PluginManifest } | { success: false; errors: string[] } {
  const r = PluginManifestSchema.safeParse(value);
  if (r.success) return { success: true, data: r.data };
  return {
    success: false,
    errors: r.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
  };
}

