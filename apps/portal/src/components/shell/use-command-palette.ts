"use client";

import { useCallback, useEffect, useState } from "react";

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    const isEditable = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    };
    const handler = (e: KeyboardEvent) => {
      const isMeta =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash =
        !e.metaKey && !e.ctrlKey && !e.altKey && e.key === "/" && !isEditable(e.target);
      if (!isMeta && !isSlash) return;
      e.preventDefault();
      setOpen((prev) => !prev);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen, toggle };
}
