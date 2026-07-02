"use client";

import Link from "next/link";
import { useState } from "react";
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
  markNotificationRead,
  useEffectiveNotifications,
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

// Mobile-topbar wrapper — trigger IconButton + Popover that opens downward.
// Desktop sidebar utility row uses NotificationList directly, wired to its
// own trigger + right-side popover; this wrapper stays for the mobile chrome.
export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const notifications = useEffectiveNotifications();
  const unreadCount = notifications.reduce(
    (acc, n) => (n.read ? acc : acc + 1),
    0,
  );
  const hasUnread = unreadCount > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton
          variant="ghost"
          size="md"
          aria-label={
            hasUnread ? `Notifications, ${unreadCount} unread` : "Notifications"
          }
          className="relative [&_svg]:size-5 [&_svg]:text-muted-foreground hover:[&_svg]:text-foreground"
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
      >
        <NotificationList onDismiss={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

interface NotificationListProps {
  onDismiss?: () => void;
}

// Popover body renderer. The trigger (icon + badge) lives at the call site —
// this component only owns the panel body (header + scroll list) so it can
// mount inside the sidebar utility row's Popover or any other surface.
export function NotificationList({ onDismiss }: NotificationListProps) {
  const notifications = useEffectiveNotifications();
  const unreadCount = notifications.reduce(
    (acc, n) => (n.read ? acc : acc + 1),
    0,
  );
  const hasUnread = unreadCount > 0;

  const handleSelect = (notification: Notification) => {
    markNotificationRead(notification.id);
    onDismiss?.();
  };

  return (
    <div aria-labelledby="notification-panel-heading">
      <div className="flex items-center justify-between px-3 py-2">
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
        // max-h-[28rem]: caps the scroll region at ~viewport-half on a 13" laptop so the popover never pushes past the sidebar's reach; rows past this scroll.
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
    </div>
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
