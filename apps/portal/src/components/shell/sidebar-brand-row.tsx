"use client";

import { PanelLeft, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { BrandMark } from "@/components/shell/brand-mark";
import { useCommandPaletteContext } from "@/components/shell/command-palette-provider";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";

interface SidebarBrandRowProps {
  onToggleCollapse: () => void;
  collapsed: boolean;
}

// Zone A row 1 per spec:
// - Expanded: [BrandMark] [Search icon-button] [PanelLeft ⌘B]. Search opens
//   the ⌘K command palette. PanelLeft is the sidebar-toggle convention
//   (VS Code / Cursor / Linear precedent — one glyph regardless of state).
// - Rail (collapsed): PanelLeft ⌘B only, no brand-ball. Rail width can't
//   hold the brand meaningfully alongside the toggle, and the toggle is
//   the only rail-exclusive affordance without a global keyboard fallback
//   (⌘K reopens search regardless).
//
// All rail affordances share the same size-8 hit-area square and 18px
// glyph so the vertical column reads as one aligned rhythm from Zone A
// through Zone D.
export function SidebarBrandRow({
  onToggleCollapse,
  collapsed,
}: SidebarBrandRowProps) {
  const isRail = useIsSidebarRail();
  const { setOpen: setPaletteOpen } = useCommandPaletteContext();

  const search = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="Search"
          aria-keyshortcuts="Meta+K"
          className={cn(
            "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md",
            "text-muted-foreground outline-hidden",
            "hover:bg-hover-surface hover:text-foreground",
            "focus-visible:shadow-focus-ring",
          )}
        >
          <Search className="size-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">Search (⌘K)</TooltipContent>
    </Tooltip>
  );

  const toggle = (
    <button
      type="button"
      onClick={onToggleCollapse}
      aria-label={collapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
      aria-pressed={collapsed}
      className={cn(
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md",
        "text-muted-foreground outline-hidden",
        "hover:bg-hover-surface hover:text-foreground",
        "focus-visible:shadow-focus-ring",
      )}
    >
      <PanelLeft className="size-[18px]" aria-hidden="true" />
    </button>
  );

  if (isRail) {
    return <div className="flex justify-center">{toggle}</div>;
  }

  return (
    <div className="flex h-8 items-center gap-1">
      <div className="flex min-w-0 flex-1 items-center">
        <BrandMark />
      </div>
      {search}
      {toggle}
    </div>
  );
}
