"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { IconButton } from "@repo/ui/components/icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/cn";
import {
  formatRelativeTime,
  getNotifications,
  type Notification,
  type NotificationCategory,
} from "@/lib/mock/notifications";

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  "async-outcome": Activity,
  threshold: AlertTriangle,
  collaboration: Users,
  security: ShieldCheck,
};

const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  "async-outcome": "Async outcome",
  threshold: "Threshold",
  collaboration: "Collaboration",
  security: "Security",
};

// Carries read-overrides across in-app navigation. Demo memory only — never
// persisted to a backend; sessionStorage clears on tab close.
const READ_STORAGE_KEY = "blaxel:notifications:read";

function loadReadOverrides(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

function persistReadOverrides(ids: ReadonlySet<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      READ_STORAGE_KEY,
      JSON.stringify(Array.from(ids)),
    );
  } catch {
    // Storage quota / private-mode — fall through silently; demo state degrades to in-memory only.
  }
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const baseNotifications = useMemo(() => getNotifications(), []);
  // First render (SSR + first client paint) starts empty so hydrated HTML
  // matches; the effect below pulls any prior in-session reads from
  // sessionStorage so the badge survives in-app navigation. Demo-only memory —
  // sessionStorage clears on tab close.
  const [readOverrides, setReadOverrides] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const stored = loadReadOverrides();
    if (stored.size > 0) setReadOverrides(stored);
  }, []);

  const notifications: ReadonlyArray<Notification> = useMemo(
    () =>
      baseNotifications.map((n) =>
        readOverrides.has(n.id) ? { ...n, read: true } : n,
      ),
    [baseNotifications, readOverrides],
  );

  const unreadCount = notifications.reduce((acc, n) => (n.read ? acc : acc + 1), 0);

  const markRead = (id: string) => {
    setReadOverrides((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistReadOverrides(next);
      return next;
    });
  };

  const handleSelect = (notification: Notification) => {
    markRead(notification.id);
    setOpen(false);
  };

  const hasUnread = unreadCount > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton
          variant="ghost"
          size="md"
          aria-label={
            hasUnread
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className={cn(
            "relative [&_svg]:size-5",
            hasUnread
              ? "[&_svg]:text-foreground"
              : "[&_svg]:text-muted-foreground hover:[&_svg]:text-foreground",
          )}
        >
          <Bell />
          {hasUnread ? (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-state-errored px-1 font-mono typography-meta font-semibold tracking-normal text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </IconButton>
      </PopoverTrigger>
      <PopoverContent
        variant="action"
        align="end"
        sideOffset={8}
        className="w-96 p-0"
        aria-labelledby="notification-panel-heading"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <h2
            id="notification-panel-heading"
            className="typography-label font-medium text-foreground"
          >
            Notifications
          </h2>
          <span className="font-mono typography-meta text-muted-foreground tabular-nums">
            {hasUnread ? `${unreadCount} unread` : "All read"}
          </span>
        </div>

        {notifications.length === 0 ? (
          <p className="px-3 py-6 typography-caption text-muted-foreground">
            No notifications.
          </p>
        ) : (
          // max-h-[28rem]: caps the scroll region at ~viewport-half on a 13" laptop so the popover never pushes past the topbar's reach; rows past this scroll.
          <ul role="list" className="max-h-[28rem] overflow-y-auto p-1">
            {notifications.map((n) => (
              <li key={n.id}>
                <NotificationRow
                  notification={n}
                  onSelect={() => handleSelect(n)}
                />
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface NotificationRowProps {
  notification: Notification;
  onSelect: () => void;
}

function NotificationRow({ notification, onSelect }: NotificationRowProps) {
  const categoryLabel = CATEGORY_LABEL[notification.category];
  const relative = formatRelativeTime(notification.timestamp);
  const ariaLabel = `${categoryLabel}: ${notification.title}. ${notification.body}. ${relative}.${notification.read ? "" : " Unread."}`;
  const rowClass = cn(
    "group flex w-full items-start gap-3 rounded-md px-2 py-2 text-left",
    "hover:bg-highlight-surface focus-visible:bg-highlight-surface",
    "transition-colors",
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        onClick={onSelect}
        aria-label={ariaLabel}
        className={rowClass}
      >
        <NotificationRowBody notification={notification} relative={relative} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={ariaLabel}
      className={rowClass}
    >
      <NotificationRowBody notification={notification} relative={relative} />
    </button>
  );
}

interface NotificationRowBodyProps {
  notification: Notification;
  relative: string;
}

function NotificationRowBody({ notification, relative }: NotificationRowBodyProps) {
  const Icon = CATEGORY_ICON[notification.category];
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center [&_svg]:size-4",
          notification.read ? "text-muted-foreground" : "text-foreground",
        )}
      >
        <Icon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate typography-body",
              notification.read
                ? "font-normal text-muted-foreground"
                : "font-medium text-foreground",
            )}
          >
            {notification.title}
          </span>
          <span className="shrink-0 font-mono typography-meta text-muted-foreground tabular-nums">
            {relative}
          </span>
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate typography-caption",
            notification.read ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {notification.body}
        </span>
      </span>
      {notification.read ? null : (
        <span
          aria-hidden="true"
          className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
        />
      )}
    </>
  );
}
