import { z } from "zod";
import type { Document } from "./types.js";

const markSchema = z.string();

const spanSchema = z
  .object({
    _type: z.literal("span"),
    text: z.string(),
    marks: z.array(markSchema).default([])
  })
  .strict();

const blockSchema = z
  .object({
    _type: z.literal("block"),
    style: z.enum(["normal", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code"]),
    level: z.number().int().min(1).max(6).optional(),
    listItem: z.enum(["bullet", "number", "none"]).optional(),
    children: z.array(spanSchema).min(1),
    markDefs: z.record(z.string(), z.string()).optional()
  })
  .strict();

const imageSchema = z
  .object({
    _type: z.literal("image"),
    url: z.string().min(1),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional()
  })
  .strict();

const customSchema = z
  .object({
    _type: z.literal("custom"),
    name: z.string().min(1),
    value: z.record(z.unknown())
  })
  .strict();

export const blockSchemaUnion = z.discriminatedUnion("_type", [
  blockSchema,
  imageSchema,
  customSchema
]);

export const documentSchema = z
  .object({
    _type: z.literal("content"),
    blocks: z.array(blockSchemaUnion).min(1)
  })
  .strict();

/** Result of validating an unknown value against the document schema. */
export type ValidationResult =
  | { success: true; data: Document }
  | { success: false; errors: string[] };

/**
 * Validate a value against the Portable Text document schema.
 * Returns a discriminated result; never throws.
 */
export function validateDocument(value: unknown): ValidationResult {
  const result = documentSchema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data as Document };
  }
  return {
    success: false,
    errors: result.error.issues.map((i) => i.path.join(".") || "(root)" + ": " + i.message)
  };
}
