"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  ChevronsUpDown,
  CreditCard,
  LogOutIcon,
  Monitor,
  Moon,
  Palette,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { signOut } from "@/lib/auth/actions";
import { useIsSidebarRail } from "@/components/shell/use-is-sidebar-rail";
import { useAccountState } from "@/lib/mock/account-context";

interface SidebarUserChipProps {
  user: { name: string; email: string };
}

const THEMES = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

type ThemeValue = (typeof THEMES)[number]["value"];

// Zone D — bottom-pinned identity chip. Row is 2-line: avatar + name/tier+credits
// caption + chevron. Tier + balance sit on the chip caption so the primary
// billing signal is visible without opening the menu (no badge dot on the
// avatar — notifications badge lives on the Zone C bell so the two concerns
// don't compete on the same tile). Menu opens to the RIGHT. Navigation entries
// are 2-line (bold title + muted caption naming what the row covers) — Plan &
// billing's caption describes the destination since the tier/credits state is
// already on the chip. Theme is a single-row control: leading palette icon in
// the shared icon column, horizontal 3-icon picker inline on the same row,
// swaps theme in place without closing the menu. Anthropic Console piled
// notifications + orgs + help + billing + logout into one menu; splitting by
// concern (Zone C bell + Zone C help + Zone D identity) makes account-scoped
// rows easier to find.
export function SidebarUserChip({ user }: SidebarUserChipProps) {
  const isRail = useIsSidebarRail();
  const { state } = useAccountState();
  const initial = user.name.charAt(0) || "?";
  const hasBalance = Number.isFinite(state.balanceUsd);
  const balanceLabel = hasBalance ? `$${state.balanceUsd.toFixed(2)}` : "$—";

  const trigger = (
    <DropdownMenuTrigger
      aria-label={`Open account menu. ${user.name}, Tier ${state.tier}, ${balanceLabel} credits.`}
      className={cn(
        "sidebar-row-hover group relative flex items-center rounded-md",
        "outline-hidden focus-visible:shadow-focus-ring",
        "text-foreground",
        isRail
          ? "size-8 mx-auto justify-center p-0"
          : "w-full gap-2 px-2 py-1.5",
      )}
    >
      <Avatar size="sm">
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      {!isRail && (
        <>
          <span className="flex min-w-0 flex-1 flex-col text-left">
            <span className="truncate typography-label font-medium text-foreground">
              {user.name}
            </span>
            <span className="truncate font-mono typography-meta text-meta-foreground">
              Tier {state.tier} · {balanceLabel}
            </span>
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 text-meta-foreground"
          />
        </>
      )}
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {isRail ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{user.name}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={12}
        className="w-64"
      >
        <DropdownMenuItem asChild className="items-start py-2">
          <Link href="/profile">
            <User aria-hidden="true" className="mt-0.5" />
            <MenuRow title="Profile" caption="Personal settings" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="items-start py-2">
          <Link href="/account/admins">
            <Building2 aria-hidden="true" className="mt-0.5" />
            <MenuRow
              title="Account"
              caption="Team, workspaces, and access"
            />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="items-start py-2">
          <Link href="/account/billing/tier-quotas">
            <CreditCard aria-hidden="true" className="mt-0.5" />
            <MenuRow
              title="Plan & billing"
              caption="Manage tier & invoices"
            />
          </Link>
        </DropdownMenuItem>

        {/* Theme row — single-line: leading palette icon aligns with other
         * entries' icon column, the 3-icon segment control sits inline on the
         * same row. Rendered as a plain flex row (not DropdownMenuItem) so the
         * picker clicks don't trigger item-select-and-close. */}
        <ThemeMenuRow />

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="py-2"
          onSelect={() => {
            void signOut();
          }}
        >
          <LogOutIcon aria-hidden="true" />
          <span className="typography-label font-medium">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuRow({ title, caption }: { title: string; caption: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="typography-label font-medium text-foreground">
        {title}
      </span>
      <span className="typography-meta text-muted-foreground">{caption}</span>
    </div>
  );
}

function ThemeMenuRow() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  const current = (mounted ? (theme ?? "system") : "system") as ThemeValue;

  return (
    <div
      className="flex items-center gap-2 rounded-md px-2 py-1.5"
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Palette
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
      <div
        role="radiogroup"
        aria-label="Theme"
        className="flex items-center gap-1"
      >
        {THEMES.map(({ value, label, Icon }) => {
          const active = current === value;
          return (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`Switch to ${label} theme`}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md",
                    "outline-hidden focus-visible:shadow-focus-ring",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-hover-surface hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
