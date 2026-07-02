"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Code2,
  HelpCircle,
  KeyboardIcon,
  MessageCircle,
  PartyPopper,
  Users,
} from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { NotificationList } from "@/components/shell/notification-panel";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import { useEffectiveNotifications } from "@/lib/mock/notifications";

const POPOVER_GAP = 8;

interface Measurable {
  getBoundingClientRect(): DOMRect;
}

// Zone C — footer icon strip above the user chip. Three concern-scoped
// triggers, left → right: Resources, Help, Notifications. All three popovers
// share one anchor so they open at the same horizontal offset from the
// sidebar edge and the same vertical baseline just above the strip.
//
// Group-hover dim pattern: at rest all three icons render muted; hovering
// anywhere on the strip brightens all three. Individual button hover still
// paints the ghost hover pill. The bell's dim/bright state no longer forks
// on unread — unread is signaled by the badge alone (one signal per tile).
export function SidebarFooterIconStrip() {
  const isRail = useIsSidebarRail();
  // `useState` for the aside triggers a re-render once located — Radix
  // `PopperAnchor` reads `virtualRef.current` inside a dep-less effect that
  // only picks up new values on re-render.
  const stripRef = useRef<HTMLDivElement>(null);
  const [aside, setAside] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const found = stripRef.current?.closest("aside");
    if (found instanceof HTMLElement) setAside(found);
  }, []);
  const anchorRef = useRef<Measurable | null>(null);
  anchorRef.current =
    aside && stripRef.current
      ? {
          getBoundingClientRect: () => {
            const asideRect = aside.getBoundingClientRect();
            const stripRect = stripRef.current!.getBoundingClientRect();
            // Rect spanning the aside horizontally and ending 8px above the
            // strip. `side="right" align="end"` reads right = aside.right
            // (→ popover.left = aside.right + sideOffset) and
            // bottom = strip.top − 8 (→ popover.bottom = strip.top − 8, so
            // an 8px gap sits between the popover and the strip).
            const bottom = stripRect.top - POPOVER_GAP;
            return new DOMRect(
              asideRect.left,
              0,
              asideRect.width,
              Math.max(bottom, 0),
            );
          },
        }
      : null;
  const sharedAnchor = anchorRef as RefObject<Measurable>;

  // Rail state renders icon-only in a 64px column with no adjacent labels, so
  // 18px reads better. Expanded state sits alongside body copy — matching
  // `typography-body` at 14px keeps visual weight aligned with the sidebar text.
  const iconSizeClass = isRail ? "[&_svg]:size-[18px]" : "[&_svg]:size-[14px]";
  const triggerClass = cn(iconSizeClass, triggerIconColorClass);

  return (
    <div
      ref={stripRef}
      className={cn(
        "group flex items-center gap-1 border-b border-sidebar-border pb-2",
        isRail ? "flex-col" : "justify-around",
      )}
    >
      <ResourcesTrigger anchorRef={sharedAnchor} triggerClass={triggerClass} />
      <HelpTrigger anchorRef={sharedAnchor} triggerClass={triggerClass} />
      <NotificationsTrigger
        anchorRef={sharedAnchor}
        triggerClass={triggerClass}
      />
    </div>
  );
}

// Item wrapping style for Popover menu rows — mirrors the DropdownMenuItem
// look (rounded row, ghost hover pill, muted external arrow that brightens on
// hover) so switching to Popover for shared anchor positioning doesn't
// visually regress. The `group/item` scope keeps the arrow hover isolated to
// its row.
const menuItemClass =
  "group/item flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left typography-body text-foreground hover:bg-highlight-surface focus-visible:bg-highlight-surface focus-visible:outline-none";

function ExternalArrow() {
  return (
    <ArrowUpRight
      aria-hidden="true"
      className="ml-auto size-3.5 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-visible/item:opacity-100"
    />
  );
}

// Shared color/hover behavior for all three triggers. `group-hover` handles the
// strip-wide brighten; `hover:` keeps individual-button brightening intact. Icon
// size is applied per-state by the parent (rail vs expanded).
const triggerIconColorClass =
  "[&_svg]:text-muted-foreground group-hover:[&_svg]:text-foreground hover:[&_svg]:text-foreground";

interface AnchoredTriggerProps {
  // Radix `virtualRef` types the current as non-null Measurable, but ours is
  // populated post-mount — RefObject<Measurable> matches Radix's Prop shape and
  // Radix reads `.current` inside a dep-less effect that tolerates a null value.
  anchorRef: RefObject<Measurable>;
  triggerClass: string;
}

function ResourcesTrigger({ anchorRef, triggerClass }: AnchoredTriggerProps) {
  return (
    <Popover>
      <PopoverAnchor virtualRef={anchorRef} />
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <IconButton
              variant="ghost"
              size="md"
              aria-label="Resources"
              className={triggerClass}
            >
              <BookOpen />
            </IconButton>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Resources</TooltipContent>
      </Tooltip>
      <PopoverContent
        variant="action"
        side="right"
        align="end"
        sideOffset={12}
        className="w-64 border border-border"
      >
        <a
          href="https://docs.blaxel.ai"
          target="_blank"
          rel="noreferrer"
          className={menuItemClass}
        >
          <BookOpen aria-hidden="true" className="size-4" />
          <span>Documentation</span>
          <ExternalArrow />
        </a>
        <a
          href="https://docs.blaxel.ai/api-reference"
          target="_blank"
          rel="noreferrer"
          className={menuItemClass}
        >
          <Code2 aria-hidden="true" className="size-4" />
          <span>API Reference</span>
          <ExternalArrow />
        </a>
        <a
          href="https://docs.blaxel.ai/changelog"
          target="_blank"
          rel="noreferrer"
          className={menuItemClass}
        >
          <PartyPopper aria-hidden="true" className="size-4" />
          <span>What&apos;s new</span>
          <ExternalArrow />
        </a>
        <a
          href="https://status.blaxel.ai"
          target="_blank"
          rel="noreferrer"
          className={menuItemClass}
        >
          <span
            aria-hidden="true"
            className="flex size-4 items-center justify-center"
          >
            <span className="size-2 rounded-full bg-state-scored" />
          </span>
          <span>All systems operational</span>
          <ExternalArrow />
        </a>
      </PopoverContent>
    </Popover>
  );
}

function HelpTrigger({ anchorRef, triggerClass }: AnchoredTriggerProps) {
  return (
    <Popover>
      <PopoverAnchor virtualRef={anchorRef} />
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <IconButton
              variant="ghost"
              size="md"
              aria-label="Help"
              className={triggerClass}
            >
              <HelpCircle />
            </IconButton>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Help</TooltipContent>
      </Tooltip>
      <PopoverContent
        variant="action"
        side="right"
        align="end"
        sideOffset={12}
        className="w-64 border border-border"
      >
        <a
          href="https://discord.gg/blaxel"
          target="_blank"
          rel="noreferrer"
          className={menuItemClass}
        >
          <Users aria-hidden="true" className="size-4" />
          <span>Discord community</span>
          <ExternalArrow />
        </a>
        <button type="button" className={menuItemClass}>
          <MessageCircle aria-hidden="true" className="size-4" />
          <span>Contact support</span>
        </button>
        <button type="button" className={menuItemClass}>
          <KeyboardIcon aria-hidden="true" className="size-4" />
          <span>Keyboard shortcuts</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}

function NotificationsTrigger({
  anchorRef,
  triggerClass,
}: AnchoredTriggerProps) {
  const notifications = useEffectiveNotifications();
  const unreadCount = notifications.reduce(
    (acc, n) => (n.read ? acc : acc + 1),
    0,
  );
  const hasUnread = unreadCount > 0;
  const [open, setOpen] = useState(false);

  const ariaLabel = hasUnread
    ? `Notifications, ${unreadCount} unread`
    : "Notifications";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor virtualRef={anchorRef} />
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <IconButton
              variant="ghost"
              size="md"
              aria-label={ariaLabel}
              className={cn("relative", triggerClass)}
            >
              <Bell />
              {hasUnread ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full",
                    "bg-state-errored px-1 font-mono typography-meta font-semibold tracking-normal text-white",
                  )}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </IconButton>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">
          {hasUnread ? `Notifications · ${unreadCount} unread` : "Notifications"}
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        variant="action"
        side="right"
        align="end"
        sideOffset={12}
        className="w-96 p-0 border border-border"
      >
        <NotificationList onDismiss={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
