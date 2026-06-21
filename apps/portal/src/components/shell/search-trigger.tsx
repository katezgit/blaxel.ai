"use client";

import { Search } from "lucide-react";

interface SearchTriggerProps {
  onClick: () => void;
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Search"
      aria-keyshortcuts="/"
      data-slot="search"
      className="flex h-8 w-full max-w-sm cursor-pointer items-center gap-2 rounded-lg border border-form-field-border bg-field-rest px-2.5 text-body text-muted-foreground transition-[color,background-color,border-color,box-shadow,outline] duration-fast ease-out-standard hover:bg-form-field-surface hover:text-foreground focus-visible:outline-hidden focus-visible:shadow-focus-ring focus-visible:bg-form-field-surface max-md:size-8 max-md:justify-center max-md:border-transparent max-md:bg-transparent max-md:px-0"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="flex flex-1 items-center gap-1 text-left max-md:hidden">
        Type
        <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted-surface px-1 font-mono text-meta text-muted-foreground">
          /
        </kbd>
        to search
      </span>
    </button>
  );
}
