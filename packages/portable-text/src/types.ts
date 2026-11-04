/**
 * @module @sard-cms/portable-text
 *
 * Sard CMS's canonical content format — structured, validated, portable.
 * See docs/adr/003-content-format.md for the decision rationale.
 */

/** Inline text mark. */
export type TextMark = "strong" | "em" | "underline" | "code" | (string & {});

/** A span of text with marks applied. */
export interface TextSpan {
  readonly _type: "span";
  readonly text: string;
  readonly marks: readonly TextMark[];
}

/** A content block with style (normal, h1..h6, blockquote, code). */
export type BlockStyle =
  | "normal"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "blockquote"
  | "code";

export interface ContentBlock {
  readonly _type: "block";
  readonly style: BlockStyle;
  readonly level?: number;
  readonly listItem?: "bullet" | "number" | "none";
  readonly children: readonly TextSpan[];
}

/** Image block. */
export interface ImageBlock {
  readonly _type: "image";
  readonly url: string;
  readonly alt?: string;
  readonly caption?: string;
  readonly width?: number;
  readonly height?: number;
}

/** Custom component block (extensible by themes and plugins). */
export interface CustomBlock {
  readonly _type: "custom";
  readonly name: string;
  readonly value: Readonly<Record<string, unknown>>;
}

/** Any block in a document. */
export type Block = ContentBlock | ImageBlock | CustomBlock;

/** A complete document of blocks. */
export interface Document {
  readonly _type: "content";
  readonly blocks: readonly Block[];
}