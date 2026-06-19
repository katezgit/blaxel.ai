"use client";

import { useEffect } from "react";

// Cmd/Ctrl+B toggles the sidebar. preventDefault keeps Safari/Firefox from
// hijacking the chord for the bookmarks bar. Bail when focus is on an editable
// surface so typing "B" in an input, textarea, select, or contenteditable
// region (incl. the ⌘K palette's CommandInput) never flips the sidebar.
export function useSidebarShortcut(toggle: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "b") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);
}
