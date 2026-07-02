"use client";

import { HelpCircle, LayoutGrid, X } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@repo/ui/components/command";
import { IconButton } from "@repo/ui/components/icon-button";
import { useState } from "react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setQuery("");
    onOpenChange(nextOpen);
  };

  const close = () => handleOpenChange(false);

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      label="Command palette"
      contentClassName="
        fixed left-1/2 top-20 -translate-x-1/2
        w-(--cmdk-modal-w) max-w-(--cmdk-modal-w)
        overflow-hidden rounded-xl
        bg-card text-foreground shadow-command border border-border
        p-0
        max-lg:w-[90vw] max-lg:max-w-[90vw]
        max-md:inset-0 max-md:left-0 max-md:top-0
        max-md:translate-x-0 max-md:translate-y-0
        max-md:h-screen max-md:w-screen max-md:max-w-none max-md:rounded-none
      "
    >
      <div className="relative">
        <CommandInput
          placeholder="Type a command or search…"
          value={query}
          onValueChange={setQuery}
          className="pr-10"
        />
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Close command palette"
          onClick={close}
          className="absolute top-1/2 right-2 -translate-y-1/2"
        >
          <X />
        </IconButton>
      </div>
      <CommandList>
        <CommandEmpty>
          <p className="px-4 py-8 text-center typography-body text-muted-foreground">
            No results for &ldquo;{query}&rdquo;.
          </p>
        </CommandEmpty>
        <CommandGroup heading="SUGGESTIONS">
          <CommandItem
            value="all-resources"
            onSelect={() => {
              close();
            }}
          >
            <LayoutGrid />
            All resources
            <CommandShortcut>⌘⇧A</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="how-to-get-started"
            onSelect={() => {
              close();
            }}
          >
            <HelpCircle />
            How to get started?
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
