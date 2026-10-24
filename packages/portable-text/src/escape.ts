/** Escape a string for safe embedding in HTML. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Collapse runs of spaces/tabs into a single space (newlines preserved). */
export function collapseWhitespace(input: string): string {
  return input.replace(/[ \t]+/g, " ");
}
