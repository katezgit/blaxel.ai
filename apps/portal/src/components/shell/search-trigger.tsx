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
      className="flex h-9 w-full max-w-sm cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-label text-muted-foreground transition hover:text-foreground focus-visible:shadow-focus-ring max-md:size-9 max-md:w-9 max-md:max-w-9 max-md:justify-center max-md:border-transparent max-md:bg-transparent max-md:px-0"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="flex flex-1 items-center gap-1 text-left max-md:hidden">
        Type
        <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted-surface px-1 font-mono text-meta text-foreground">
          /
        </kbd>
        to search
      </span>
    </button>
  );
}
