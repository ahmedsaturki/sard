/**
 * @module @sard-cms/core/fields
 *
 * Field definition model. A collection is an ordered list of FieldDefinition.
 * Portable Text fields store structured content (ADR-003).
 */
import { z } from "zod";

export const FieldType = [
  "text",
  "textarea",
  "number",
  "boolean",
  "select",
  "multiselect",
  "date",
  "portableText",
  "media",
  "relation",
  "array",
  "json"
] as const;

export type FieldTypeValue = (typeof FieldType)[number];

const baseField = {
  name: z.string().min(1).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  type: z.enum(FieldType),
  label: z.union([z.string(), z.record(z.string())]),
  description: z.string().optional(),
  required: z.boolean().optional()
};

export const FieldDefinitionSchema = z
  .object(baseField)
  .strict()
  .superRefine((f, ctx) => {
    if (f.type === "select" || f.type === "multiselect") {
      if (!("options" in f) || !Array.isArray(f.options) || f.options.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "select requires non-empty options" });
      }
    }
    if (f.type === "relation") {
      if (!("to" in f) || typeof f.to !== "string") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "relation requires a target collection slug" });
      }
    }
  });

export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;

export const CollectionSchema = z
  .object({
    slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    isSingleton: z.boolean().optional(),
    createRoles: z.array(z.string()).optional(),
    description: z.string().optional(),
    fields: z.array(FieldDefinitionSchema).min(1)
  })
  .strict();

export type Collection = z.infer<typeof CollectionSchema>;

/**
 * Validate a collection definition. Returns a discriminated result.
 */
export function validateCollection(
  value: unknown
): { success: true; data: Collection } | { success: false; errors: string[] } {
  const r = CollectionSchema.safeParse(value);
  if (r.success) return { success: true, data: r.data };
  return {
    success: false,
    errors: r.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
  };
}

