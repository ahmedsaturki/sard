# Blockers

## InteractiveGuide.tsx Duplicate Interface Analysis

**Status:** RESOLVED - Two Different Components

**Finding:** There are **two different `InteractiveGuide` components** with **different interfaces** serving **different purposes**:

| File | Component Type | Interface | Lines | Purpose |
|------|---------------|-----------|-------|---------|
| `src/components/InteractiveGuide.tsx` | TypeScript/React + Material UI | `{ isOpen, onClose, currentTask? }` | 21-25 | Interactive step-by-step in-app guide |
| `src/components/HandoffUi.tsx` | Plain React + Tailwind CSS | `{ steps, onComplete?, onSkip? }` | 140-144 | Client handoff UI for design constraints |

**Key Differences:**

1. **`InteractiveGuide.tsx`** (Layer 3):
   - Uses Material UI components (`Box`, `Button`, `Paper`)
   - Has predefined guides (`edit-homepage`, `create-post`)
   - Manages progress state internally
   - Props: `isOpen`, `onClose`, `currentTask`

2. **`HandoffUi.tsx`** (Layers 2+3):
   - Uses Tailwind CSS + design-token classes
   - Accepts arbitrary `steps` array as prop
   - Props: `steps`, `onComplete`, `onSkip`
   - Exported as public API

**Conclusion:**
- **No duplicate exists in any single file**
- These are **two separate components** that happen to share the same name
- Both are intentionally different designs for different use cases
- The naming collision is unfortunate but the implementations are distinct

---

## Docs Directory Access

**Status:** RESOLVED

**Investigation:** `docs/` directory exists and contains files including `docs/AUDIT.md`, `docs/adr/`, `docs/research/`. Access confirmed via `agentgrep` file search.

---

## Bash Shell Limitations

**Status:** ONGOING

**Issue:** `bash` tool returns "'ls' is not recognized as an internal or external command" suggesting Windows cmd.exe environment without standard Unix tools.

**Workaround:** Using `agentgrep` for file discovery and `read`/`write` for file operations.

---

## Read Tool Parameter Type Issue

**Status:** ONGOING

**Issue:** `read` tool's `start_line`/`end_line` parameters appear to reject string input when passed as numbers like "130". The parameters require numeric types but the tool schema may have strict parsing issues.

**Workaround:** Reading entire files when possible. For large files, use `agentgrep` with `outline` mode to navigate.