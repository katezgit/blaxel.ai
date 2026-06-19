"use client";

import { createContext, useContext, type ReactNode } from "react";
import { CommandPalette } from "@/components/shell/command-palette";
import { useCommandPalette } from "@/components/shell/use-command-palette";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const { open, setOpen, toggle } = useCommandPalette();

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPaletteContext() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPaletteContext must be used inside <CommandPaletteProvider>",
    );
  }
  return ctx;
}
