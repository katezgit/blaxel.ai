"use client";

import { useRef } from "react";
import Link from "next/link";
import { KeyboardIcon, LogOutIcon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/lib/cn";
import { signOut } from "@/lib/auth/actions";

const THEME_SEGMENTS = ["system", "light", "dark"] as const;
type ThemeChoice = (typeof THEME_SEGMENTS)[number];

interface AvatarMenuProps {
  user: { name: string; email: string; tier: string };
}

export default function AvatarMenu({ user }: AvatarMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className={cn(
          "flex size-8 items-center justify-center rounded-full focus-visible:shadow-focus-ring",
          "hover:ring-2 hover:ring-primary-border",
        )}
      >
        <Avatar size="sm">
          <AvatarFallback>{user.name.charAt(0) || "?"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 pt-2 pb-2.5 border-b border-border">
          <div className="text-label font-semibold text-foreground">{user.name}</div>
          <div className="mt-0.5 font-mono text-caption text-meta-foreground truncate">
            {user.email}
          </div>
          <div className="mt-2">
            <Badge variant="brand-soft">{user.tier}</Badge>
          </div>
        </div>

        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User aria-hidden="true" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <ThemeRow />

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile/billing">
            <span className="size-4" aria-hidden="true" />
            <span className="flex-1">Billing &amp; invoices</span>
            <span aria-hidden="true" className="text-meta-foreground">
              &rarr;
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => {
            /* TODO: help & shortcuts panel — see wireframe §15 */
          }}
        >
          <KeyboardIcon aria-hidden="true" />
          <span>Help &amp; shortcuts</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            void signOut();
          }}
        >
          <LogOutIcon aria-hidden="true" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeRow() {
  const { theme, setTheme } = useTheme();
  const current = (theme ?? "system") as ThemeChoice;
  const segmentRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusSegment = (index: number) => {
    const target = segmentRefs.current[(index + THEME_SEGMENTS.length) % THEME_SEGMENTS.length];
    target?.focus();
  };

  return (
    <DropdownMenuItem
      onSelect={(event) => event.preventDefault()}
      className="gap-3 data-[highlighted]:bg-transparent"
    >
      <Sun aria-hidden="true" />
      <span className="flex-1">Theme</span>
      <div
        role="group"
        aria-label="Theme"
        className="flex items-center rounded-md border border-border bg-background p-0.5"
        onKeyDown={(event) => {
          const focusedIndex = segmentRefs.current.findIndex(
            (node) => node === document.activeElement,
          );
          if (focusedIndex < 0) return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            focusSegment(focusedIndex + 1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            focusSegment(focusedIndex - 1);
          } else if (event.key === "Enter" || event.key === " ") {
            // Radix Menu.Item swallows Enter/Space to "select" the row; activate
            // the focused segment manually so the keyboard path matches click.
            const focusedValue = THEME_SEGMENTS[focusedIndex];
            if (!focusedValue) return;
            event.preventDefault();
            event.stopPropagation();
            setTheme(focusedValue);
          }
        }}
      >
        {THEME_SEGMENTS.map((value, index) => {
          const isActive = current === value;
          return (
            <button
              key={value}
              ref={(node) => {
                segmentRefs.current[index] = node;
              }}
              type="button"
              aria-pressed={isActive}
              onClick={() => setTheme(value)}
              className={cn(
                "rounded-sm px-2 py-0.5 text-caption capitalize transition-colors",
                "focus-visible:shadow-focus-ring focus-visible:outline-none",
                isActive
                  ? "bg-secondary-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </DropdownMenuItem>
  );
}
