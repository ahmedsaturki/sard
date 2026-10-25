/**
 * @module @sard/visual-editor
 *
 * Real-Time Visual Editor for Sard CMS.
 * In-context editing with live preview.
 * See ADR-007 (UI/UX Architecture).
 */

import React from "react";
import type { ContentEntrySerializable, CollectionSerializable } from "@sard/core";

/**
 * Editor modes
 */
export type EditorMode = "preview" | "edit" | "structure" | "settings";

/**
 * Visual Editor context
 */
export interface VisualEditorContextValue {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  hoverElement: string | null;
  setHoverElement: (id: string | null) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  content: ContentEntrySerializable | null;
  setContent: (content: ContentEntrySerializable) => void;
  collection: CollectionSerializable | null;
  save: () => Promise<void>;
  publish: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Editable region props
 */
export interface EditableRegionProps {
  id: string;
  fieldName: string;
  fieldType: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

/**
 * Toolbar props
 */
export interface ToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  isSaving: boolean;
  isDirty: boolean;
}

/**
 * Sidebar props
 */
export interface SidebarProps {
  activeTab: "structure" | "settings" | "seo" | "versions" | "media";
  onTabChange: (tab: string) => void;
  collection: CollectionSerializable | null;
  content: ContentEntrySerializable | null;
}

/**
 * Block/Component types for visual editing
 */
export interface EditorBlock {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: "text" | "media" | "layout" | "interactive" | "advanced";
  fields: EditorBlockField[];
  defaultProps: Record<string, any>;
  render: (props: Record<string, any>) => React.ReactElement;
  isContainer?: boolean;
  allowedChildren?: string[];
}

export interface EditorBlockField {
  name: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "image" | "video" | "select" | "boolean" | "number" | "color" | "link" | "component";
  required?: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

/**
 * Built-in editor blocks
 */
export const builtInBlocks = [
  {
    id: "heading",
    type: "heading",
    name: "Heading",
    icon: "H",
    category: "text",
    fields: [
      { name: "level", label: "Level", type: "select", options: [
        { value: "h1", label: "H1" },
        { value: "h2", label: "H2" },
        { value: "h3", label: "H3" },
        { value: "h4", label: "H4" },
        { value: "h5", label: "H5" },
        { value: "h6", label: "H6" },
      ], defaultValue: "h2" },
      { name: "text", label: "Text", type: "text", required: true },
      { name: "anchor", label: "Anchor ID", type: "text" },
    ],
    defaultProps: { level: "h2", text: "Heading" },
    render: ({ level, text, anchor }: { level: string; text: string; anchor: string }) => React.createElement(level as keyof React.JSX.IntrinsicElements, { id: anchor }, text),
  },
  {
    id: "paragraph",
    type: "paragraph",
    name: "Paragraph",
    icon: "P",
    category: "text",
    fields: [
      { name: "text", label: "Text", type: "richtext", required: true },
      { name: "alignment", label: "Alignment", type: "select", options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
        { value: "justify", label: "Justify" },
      ], defaultValue: "left" },
    ],
    defaultProps: { text: "", alignment: "left" },
    render: ({ text, alignment }: { text: string; alignment: string }) => React.createElement("p", { style: { textAlign: alignment } }, text),
  },
  {
    id: "image",
    type: "image",
    name: "Image",
    icon: "image",
    category: "media",
    fields: [
      { name: "src", label: "Image URL", type: "image", required: true },
      { name: "alt", label: "Alt Text", type: "text", required: true },
      { name: "caption", label: "Caption", type: "text" },
      { name: "width", label: "Width", type: "number" },
      { name: "alignment", label: "Alignment", type: "select", options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
        { value: "full", label: "Full Width" },
      ], defaultValue: "center" },
    ],
    defaultProps: { src: "", alt: "", caption: "", alignment: "center" },
    render: ({ src, alt, caption, width, alignment }: { src: string; alt: string; caption: string; width: number; alignment: string }) => (
      React.createElement("figure", { style: { textAlign: alignment } },
        React.createElement("img", { src, alt, style: { maxWidth: "100%", width: width ? width + "px" : undefined, height: "auto" } }),
        caption && React.createElement("figcaption", {}, caption)
      )
    ),
  },
  {
    id: "video",
    type: "video",
    name: "Video",
    icon: "video",
    category: "media",
    fields: [
      { name: "src", label: "Video URL", type: "video", required: true },
      { name: "poster", label: "Poster Image", type: "image" },
      { name: "controls", label: "Show Controls", type: "boolean", defaultValue: true },
      { name: "autoplay", label: "Autoplay", type: "boolean", defaultValue: false },
      { name: "muted", label: "Muted", type: "boolean", defaultValue: true },
      { name: "loop", label: "Loop", type: "boolean", defaultValue: false },
    ],
    defaultProps: { src: "", controls: true, autoplay: false, muted: true, loop: false },
    render: ({ src, poster, controls, autoplay, muted, loop }: { src: string; poster: string; controls: boolean; autoplay: boolean; muted: boolean; loop: boolean }) => (
      React.createElement("video", { src, poster, controls, autoPlay: autoplay, muted, loop, style: { maxWidth: "100%" } })
    ),
  },
  {
    id: "columns",
    type: "columns",
    name: "Columns",
    icon: "columns",
    category: "layout",
    isContainer: true,
    allowedChildren: ["*"],
    fields: [
      { name: "columns", label: "Number of Columns", type: "number", defaultValue: 2, validation: { minLength: 2, maxLength: 6 } },
      { name: "gap", label: "Gap", type: "select", options: [
        { value: "none", label: "None" },
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ], defaultValue: "md" },
      { name: "alignment", label: "Vertical Alignment", type: "select", options: [
        { value: "start", label: "Top" },
        { value: "center", label: "Center" },
        { value: "end", label: "Bottom" },
        { value: "stretch", label: "Stretch" },
      ], defaultValue: "start" },
    ],
    defaultProps: { columns: 2, gap: "md", alignment: "start" },
    render: ({ columns, gap, alignment, children }: { columns: number; gap: string; alignment: string; children: React.ReactNode }) => (
      React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(" + columns + ", 1fr)",
          gap: gap === "none" ? 0 : gap === "sm" ? "0.5rem" : gap === "md" ? "1rem" : "2rem",
          alignItems: alignment,
        }
      }, children)
    ),
  },
  {
    id: "container",
    type: "container",
    name: "Container",
    icon: "container",
    category: "layout",
    isContainer: true,
    allowedChildren: ["*"],
    fields: [
      { name: "maxWidth", label: "Max Width", type: "select", options: [
        { value: "sm", label: "Small (640px)" },
        { value: "md", label: "Medium (768px)" },
        { value: "lg", label: "Large (1024px)" },
        { value: "xl", label: "Extra Large (1280px)" },
        { value: "2xl", label: "2XL (1536px)" },
        { value: "full", label: "Full Width" },
      ], defaultValue: "lg" },
      { name: "padding", label: "Padding", type: "select", options: [
        { value: "none", label: "None" },
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ], defaultValue: "md" },
      { name: "background", label: "Background", type: "color" },
    ],
    defaultProps: { maxWidth: "lg", padding: "md" },
    render: ({ maxWidth, padding, background, children }: { maxWidth: string; padding: string; background: string; children: React.ReactNode }) => (
      React.createElement("div", {
        style: {
          maxWidth: maxWidth === "full" ? "none" : maxWidth,
          margin: "0 auto",
          padding: padding === "none" ? 0 : padding === "sm" ? "1rem" : padding === "md" ? "1.5rem" : "2rem",
          backgroundColor: background || "transparent",
        }
      }, children)
    ),
  },
  {
    id: "button",
    type: "button",
    name: "Button",
    icon: "button",
    category: "interactive",
    fields: [
      { name: "text", label: "Text", type: "text", required: true },
      { name: "href", label: "Link", type: "link" },
      { name: "variant", label: "Variant", type: "select", options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "outline", label: "Outline" },
        { value: "ghost", label: "Ghost" },
        { value: "destructive", label: "Destructive" },
      ], defaultValue: "primary" },
      { name: "size", label: "Size", type: "select", options: [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ], defaultValue: "md" },
      { name: "icon", label: "Icon", type: "component" },
      { name: "iconPosition", label: "Icon Position", type: "select", options: [
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
      ], defaultValue: "left" },
    ],
    defaultProps: { text: "Button", variant: "primary", size: "md", iconPosition: "left" },
    render: ({ text, href, variant, size, icon, iconPosition }: { text: string; href: string; variant: string; size: string; icon: React.ReactNode; iconPosition: string }) => {
      const Component = href ? "a" : "button";
      return React.createElement(Component, {
        href,
        className: "sard-btn sard-btn-" + variant + " sard-btn-" + size,
        style: { display: "inline-flex", alignItems: "center", gap: "0.5rem" }
      }, iconPosition === "left" && icon, text, iconPosition === "right" && icon);
    },
  },
  {
    id: "divider",
    type: "divider",
    name: "Divider",
    icon: "divider",
    category: "layout",
    fields: [
      { name: "variant", label: "Style", type: "select", options: [
        { value: "solid", label: "Solid" },
        { value: "dashed", label: "Dashed" },
        { value: "dotted", label: "Dotted" },
      ], defaultValue: "solid" },
      { name: "color", label: "Color", type: "color" },
      { name: "thickness", label: "Thickness", type: "select", options: [
        { value: "thin", label: "Thin" },
        { value: "medium", label: "Medium" },
        { value: "thick", label: "Thick" },
      ], defaultValue: "medium" },
    ],
    defaultProps: { variant: "solid", color: "#e5e5e5", thickness: "medium" },
    render: ({ variant, color, thickness }: { variant: string; color: string; thickness: string }) => (
      React.createElement("hr", {
        style: {
          borderStyle: variant,
          borderColor: color || "#e5e5e5",
          borderWidth: thickness === "thin" ? "1px" : thickness === "medium" ? "2px" : "3px",
          borderBottomWidth: 0,
        }
      })
    ),
  },
  {
    id: "quote",
    type: "quote",
    name: "Quote",
    icon: "quote",
    category: "text",
    fields: [
      { name: "text", label: "Quote", type: "richtext", required: true },
      { name: "author", label: "Author", type: "text" },
      { name: "source", label: "Source", type: "text" },
      { name: "alignment", label: "Alignment", type: "select", options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
      ], defaultValue: "left" },
    ],
    defaultProps: { text: "", author: "", alignment: "left" },
    render: ({ text, author, source, alignment }: { text: string; author: string; source: string; alignment: string }) => (
      React.createElement("blockquote", { style: { textAlign: alignment, fontStyle: "italic", borderLeft: "4px solid #0ea5e9", paddingLeft: "1rem", margin: "1.5rem 0" } },
        React.createElement("p", {}, text),
        (author || source) && React.createElement("footer", { style: { marginTop: "0.5rem", fontSize: "0.875rem", color: "#525252" } },
          author && React.createElement("cite", {}, author),
          source && React.createElement("span", {}, " — " + source)
        )
      )
    ),
  },
  {
    id: "code",
    type: "code",
    name: "Code Block",
    icon: "code",
    category: "advanced",
    fields: [
      { name: "code", label: "Code", type: "textarea", required: true },
      { name: "language", label: "Language", type: "select", options: [
        { value: "javascript", label: "JavaScript" },
        { value: "typescript", label: "TypeScript" },
        { value: "python", label: "Python" },
        { value: "go", label: "Go" },
        { value: "rust", label: "Rust" },
        { value: "sql", label: "SQL" },
        { value: "json", label: "JSON" },
        { value: "yaml", label: "YAML" },
        { value: "bash", label: "Bash" },
        { value: "plaintext", label: "Plain Text" },
      ], defaultValue: "typescript" },
      { name: "showLineNumbers", label: "Line Numbers", type: "boolean", defaultValue: true },
      { name: "theme", label: "Theme", type: "select", options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ], defaultValue: "dark" },
    ],
    defaultProps: { code: "", language: "typescript", showLineNumbers: true, theme: "dark" },
    render: ({ code, language, theme }: { code: string; language: string; theme: string }) => (
      React.createElement("pre", { style: { background: theme === "dark" ? "#1e1e1e" : "#f5f5f5", padding: "1rem", borderRadius: "0.5rem", overflow: "auto" } },
        React.createElement("code", { className: "language-" + language }, code)
      )
    ),
  },
];

/**
 * Editor history for undo/redo
 */
export interface EditorHistory {
  past: ContentEntrySerializable[];
  future: ContentEntrySerializable[];
  maxSize: number;
  content: ContentEntrySerializable | null;
  getContent: () => ContentEntrySerializable | null;
}

/**
 * Create editor history manager
 */
export function createEditorHistory(maxSize = 50): EditorHistory {
  return {
    past: [],
    future: [],
    maxSize,
    content: null,
    getContent: () => null,
  };
}

export function pushHistory(history: EditorHistory, content: ContentEntrySerializable): EditorHistory {
  const newPast = [...history.past, history.getContent ? history.getContent() : history.content].filter((c): c is ContentEntrySerializable => c !== null && c !== undefined);
  if (newPast.length > history.maxSize) {
    newPast.shift();
  }
  return {
    past: newPast,
    future: [],
    maxSize: history.maxSize,
    content,
    getContent: () => content,
  };
}

export function undoFn(history: EditorHistory): EditorHistory | null {
  if (history.past.length === 0) return null;
  const previous = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);
  const currentContent = history.getContent ? history.getContent() : history.content;
  return {
    past: newPast,
    future: [currentContent, ...history.future].filter((c): c is ContentEntrySerializable => c !== null && c !== undefined),
    maxSize: history.maxSize,
    content: previous,
    getContent: () => previous,
  };
}

export function redoFn(history: EditorHistory): EditorHistory | null {
  if (history.future.length === 0) return null;
  const next = history.future[0];
  const newFuture = history.future.slice(1);
  const currentContent = history.getContent ? history.getContent() : history.content;
  return {
    past: [...history.past, currentContent].filter((c): c is ContentEntrySerializable => c !== null && c !== undefined),
    future: newFuture,
    maxSize: history.maxSize,
    content: next,
    getContent: () => next,
  };
}

/**
 * Real-time collaboration types
 */
export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
}

export interface CollaborationState {
  users: Map<string, CollaborationUser>;
  currentUser: CollaborationUser;
  presence: Map<string, { x: number; y: number }>;
}

/**
 * Editor configuration
 */
export interface EditorConfig {
  blocks: any[];
  allowedBlocks?: string[];
  maxDepth?: number;
  enableCollaboration?: boolean;
  autoSaveInterval?: number;
  placeholder?: string;
  readOnly?: boolean;
  rtl?: boolean;
  locale?: string;
}

export const defaultEditorConfig = {
  blocks: builtInBlocks,
  maxDepth: 10,
  enableCollaboration: false,
  autoSaveInterval: 30000,
  placeholder: "Start writing...",
  readOnly: false,
  rtl: false,
  locale: "en",
};

// ============================================================================
// EDITOR HOOKS
// ============================================================================

/**
 * Hook for editor state management
 */
export function useVisualEditor(config: Partial<EditorConfig> = {}) {
  const mergedConfig = { ...defaultEditorConfig, ...config };
  const [mode, setMode] = React.useState<EditorMode>("preview");
  const [selectedElement, setSelectedElement] = React.useState<string | null>(null);
  const [hoverElement, setHoverElement] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState<ContentEntrySerializable | null>(null);
  const [history] = React.useState(() => createEditorHistory());
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Actions
  const save = React.useCallback(async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const publish = React.useCallback(async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const undo = React.useCallback(() => {
    // Implementation
  }, []);

  const redo = React.useCallback(() => {
    // Implementation
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    mode,
    setMode,
    selectedElement,
    setSelectedElement,
    hoverElement,
    setHoverElement,
    isEditing,
    setIsEditing,
    content,
    setContent,
    collection: null,
    save,
    publish,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
    isSaving,
    blocks: mergedConfig.blocks,
    config: mergedConfig,
  };
}

/**
 * Visual Editor Provider Component
 */
export interface VisualEditorProviderProps {
  children: React.ReactNode;
  config?: Partial<EditorConfig>;
  initialContent?: ContentEntrySerializable;
  collection?: CollectionSerializable;
  onSave?: (content: ContentEntrySerializable) => Promise<void>;
  onPublish?: (content: ContentEntrySerializable) => Promise<void>;
  rtl?: boolean;
  locale?: string;
}

const VisualEditorContext = React.createContext<any>(null);

export function VisualEditorProvider({
  children,
  config,
  initialContent: _initialContent,
  collection,
  onSave,
  onPublish,
  rtl = false,
  locale = "en",
}: VisualEditorProviderProps) {
  const editor = useVisualEditor(config);

  return (
    React.createElement(VisualEditorContext.Provider, {
      value: {
        ...editor,
        collection: collection || null,
        save: onSave || editor.save,
        publish: onPublish || editor.publish,
        rtl,
        locale,
      }
    }, children)
  );
}

export function useVisualEditorContext(): VisualEditorContextValue {
  const context = React.useContext(VisualEditorContext);
  if (!context) {
    throw new Error("useVisualEditorContext must be used within VisualEditorProvider");
  }
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================
