"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  KeyboardIcon,
  LogOutIcon,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/lib/cn";
import { signOut } from "@/lib/auth/actions";
import { useAccountState } from "@/lib/mock/account-context";

const THEME_SEGMENTS = ["system", "light", "dark"] as const;
type ThemeChoice = (typeof THEME_SEGMENTS)[number];

interface AvatarMenuProps {
  user: { name: string; email: string; tier: string };
}

export default function AvatarMenu({ user }: AvatarMenuProps) {
  const { state } = useAccountState();
  const hasBalance = Number.isFinite(state.balanceUsd);
  const balanceLabel = hasBalance ? `$${state.balanceUsd.toFixed(2)}` : "$—";

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
        <div className="px-2 pt-2 pb-3 border-b border-border">
          <div className="text-label font-semibold text-foreground">{user.name}</div>
          <div className="mt-0.5 font-mono text-caption text-meta-foreground truncate">
            {user.email}
          </div>
        </div>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="items-start">
            <User aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="flex flex-1 flex-col gap-0.5 leading-tight">
              <span>Profile</span>
              <span className="text-caption text-meta-foreground">
                Personal settings
              </span>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account" className="items-start">
            <Building2 aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="flex flex-1 flex-col gap-0.5 leading-tight">
              <span>Account</span>
              <span className="text-caption text-meta-foreground">
                Company account settings
              </span>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/billing/credits" className="items-start">
            <CreditCard aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="flex flex-1 flex-col gap-0.5 leading-tight">
              <span>Billing &amp; credits</span>
              <span className="text-caption text-meta-foreground tabular-nums">
                Tier {state.tier} &middot; {balanceLabel} credits
              </span>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <ThemeRow />

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => undefined}>
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
